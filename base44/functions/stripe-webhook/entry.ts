import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";

async function runSideEffect(label, operation) {
  try {
    await operation();
  } catch (error) {
    // The paid order remains the source of truth and can be reconciled by an
    // administrator; a secondary CRM/notification failure must not make
    // Stripe retry and apply stock or counters twice.
    console.error(`stripe-webhook ${label} failed:`, error);
  }
}

export default async function(req) {
  const webhookSecret = secrets.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = secrets.get("STRIPE_SECRET_KEY");
  if (!webhookSecret || !stripeKey) {
    console.error("stripe-webhook: Stripe secrets not configured");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const signature = req.headers.get("stripe-signature") || "";
    const rawBody = await req.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);

    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") {
      return Response.json({ received: true });
    }

    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      console.warn(`stripe-webhook: ${event.type} without order_id`, session.id);
      return Response.json({ received: true });
    }

    const base44 = createClientFromRequest(req);
    const order = await base44.asServiceRole.entities.Order.get(orderId).catch(() => null);
    if (!order) {
      console.error("stripe-webhook: order not found", orderId);
      return Response.json({ received: true });
    }

    if (event.type === "checkout.session.expired") {
      if (order.status === "pending" && order.stripe_session_id === session.id) {
        await base44.asServiceRole.entities.Order.update(orderId, {
          status: "cancelled",
          stripe_event_id: event.id,
        });
      }
      return Response.json({ received: true });
    }

    if (session.payment_status !== "paid") {
      console.warn("stripe-webhook: completed checkout is not paid", session.id, session.payment_status);
      return Response.json({ received: true });
    }

    // Stripe may deliver the same signed event more than once. The order state
    // is the idempotency guard, preventing duplicate customer totals, discount
    // usage, stock decrements and notifications on sequential deliveries.
    if (order.status === "paid") {
      console.log("stripe-webhook: duplicate completed event ignored", event.id, orderId);
      return Response.json({ received: true, duplicate: true });
    }

    const totalCents = session.amount_total || 0;
    if (
      order.status !== "pending" ||
      order.stripe_session_id !== session.id ||
      session.currency !== "eur" ||
      totalCents !== order.total_cents
    ) {
      console.error("stripe-webhook: checkout/order mismatch", {
        eventId: event.id,
        sessionId: session.id,
        orderId,
      });
      // A validly signed but mismatched event must never mutate inventory.
      return Response.json({ received: true });
    }

    const discountCode = session.metadata?.discount_code;
    const email = String(session.customer_details?.email || "").trim().toLowerCase();
    const name = String(session.customer_details?.name || "").trim();
    const shippingDetails = session.shipping_details || session.customer_details;
    const shippingAddress = shippingDetails?.address;

    // Commit the idempotency guard before secondary effects. If updating the
    // order fails Stripe gets a 400 and retries without any partial mutation.
    await base44.asServiceRole.entities.Order.update(orderId, {
      status: "paid",
      customer_email: email,
      customer_name: name,
      shipping_name: String(shippingDetails?.name || name),
      shipping_phone: String(session.customer_details?.phone || ''),
      shipping_address: shippingAddress ? {
        line1: String(shippingAddress.line1 || ''),
        line2: String(shippingAddress.line2 || ''),
        city: String(shippingAddress.city || ''),
        state: String(shippingAddress.state || ''),
        postal_code: String(shippingAddress.postal_code || ''),
        country: String(shippingAddress.country || ''),
      } : {},
      stripe_event_id: event.id,
      paid_at: new Date().toISOString(),
    });

    await runSideEffect("customer sync", async () => {
      if (!email) return;
      const existing = await base44.asServiceRole.entities.Customer.filter({ email });
      if (existing.length > 0) {
        const customer = existing[0];
        await base44.asServiceRole.entities.Customer.update(customer.id, {
          orders_count: (customer.orders_count || 0) + 1,
          total_spent: (customer.total_spent || 0) + totalCents,
          name: customer.name || name || email.split('@')[0],
        });
      } else {
        await base44.asServiceRole.entities.Customer.create({
          name: name || email.split('@')[0],
          email,
          orders_count: 1,
          total_spent: totalCents,
        });
      }
    });

    await runSideEffect("discount usage", async () => {
      if (!discountCode) return;
      const code = String(discountCode).toUpperCase();
      const discounts = await base44.asServiceRole.entities.Discount.filter({ code });
      if (discounts[0]) {
        await base44.asServiceRole.entities.Discount.update(discounts[0].id, {
          usage_count: (discounts[0].usage_count || 0) + 1,
        });
      }
    });

    await runSideEffect("stock decrement", async () => {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const productId = String(item.product_id || '').trim();
        if (!productId) continue;
        const product = await base44.asServiceRole.entities.Product.get(productId).catch(() => null);
        if (!product) continue;
        const quantity = Math.max(1, Number.isSafeInteger(Number(item.qty)) ? Number(item.qty) : 1);
        const variantId = String(item.variant_id || '').trim();
        let newStock;
        let threshold;
        let stockLabel = product.name;

        if (variantId) {
          const variant = await base44.asServiceRole.entities.ProductVariant.get(variantId).catch(() => null);
          if (!variant || String(variant.product_id) !== productId) {
            console.error('stripe-webhook: order variant mismatch', { orderId, productId, variantId });
            continue;
          }
          newStock = Math.max(0, Number(variant.stock || 0) - quantity);
          threshold = variant.low_stock_threshold ?? product.low_stock_threshold ?? 5;
          stockLabel = `${product.name} — ${variant.title || variant.sku}`;
          await base44.asServiceRole.entities.ProductVariant.update(variantId, { stock: newStock });

          const siblings = await base44.asServiceRole.entities.ProductVariant.filter({ product_id: productId });
          const aggregateStock = siblings
            .filter(sibling => sibling.status === 'active')
            .reduce((sum, sibling) => sum + (String(sibling.id) === variantId ? newStock : Math.max(0, Number(sibling.stock || 0))), 0);
          await base44.asServiceRole.entities.Product.update(productId, { stock: aggregateStock });
        } else {
          if (typeof product.stock !== 'number') continue;
          newStock = Math.max(0, product.stock - quantity);
          threshold = product.low_stock_threshold ?? 5;
          await base44.asServiceRole.entities.Product.update(productId, { stock: newStock });
        }

        if (newStock <= threshold) {
          await base44.asServiceRole.entities.Notification.create({
            type: "stock",
            title: `Stock basso: ${stockLabel}`,
            message: `Rimangono ${newStock} unità (soglia: ${threshold}). Rifornire l'inventario.`,
            severity: newStock === 0 ? "error" : "warning",
            read: false,
            link: "inventory",
            ref_id: variantId || productId,
          });
        }
      }
    });

    await runSideEffect("order notification", async () => {
      await base44.asServiceRole.entities.Notification.create({
        type: "order",
        title: `Nuovo ordine pagato ${order.order_number || orderId}`,
        message: `${name || email || 'Cliente'} · ${(totalCents / 100).toFixed(2)} €${discountCode ? ` · sconto ${discountCode}` : ''}`,
        severity: "success",
        read: false,
        link: "orders",
        ref_id: orderId,
      });
    });

    console.log("Payment completed:", { eventId: event.id, sessionId: session.id, orderId });
    return Response.json({ received: true });
  } catch (error) {
    console.error("stripe-webhook error:", error);
    return Response.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
