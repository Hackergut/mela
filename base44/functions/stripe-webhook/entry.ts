import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";

// The WebhookEvent ledger persists which Stripe events have been processed.
// Sequential duplicate deliveries are rejected before any mutation; the
// remaining perfectly-simultaneous window is documented in AUDIT_REPORT.md
// (a platform-level unique constraint would close it completely). Ledger
// failures never block payment processing: they degrade to the previous
// order-status guard, which stays in place.
function ledgerFor(base44) {
  try {
    return base44.asServiceRole.entities.WebhookEvent;
  } catch {
    return null;
  }
}

async function isEventKnown(ledger, eventId) {
  if (!ledger) return false;
  try {
    const seen = await ledger.filter({ event_id: eventId });
    return Array.isArray(seen) && seen.length > 0;
  } catch (error) {
    console.error("stripe-webhook: ledger read failed (dedupe skipped):", error);
    return false;
  }
}

// Automation webhooks configured via the Integrazioni panel. When an order is
// paid, a best-effort JSON POST is sent to every enabled integration
// (Zapier/Make/n8n/custom). Failures never block payment processing.
const AUTOMATION_INTEGRATIONS = ['zapier', 'make', 'n8n', 'custom_webhook'];
async function dispatchAutomationWebhooks(base44, order, customer) {
  try {
    const all = await base44.asServiceRole.entities.Setting.list('key', 1000);
    const byKey = new Map(all.map((s) => [s.key, s.value]));
    const get = (id, field) => byKey.get(`integration_${id}_${field}`) || '';

    const payload = {
      event: 'order.paid',
      timestamp: new Date().toISOString(),
      order: {
        id: String(order.id || ''),
        number: String(order.order_number || ''),
        total_cents: Number(order.total_cents || 0),
        currency: 'EUR',
        subtotal_cents: Number(order.subtotal_cents || 0),
        discount_cents: Number(order.discount_amount_cents || 0),
        items: (Array.isArray(order.items) ? order.items : []).map((item) => ({
          name: String(item.name || ''),
          qty: Number(item.qty || 1),
          price_cents: Number(item.price_cents || 0),
          sku: String(item.sku || ''),
        })),
      },
      customer: {
        email: String(customer?.email || order.customer_email || ''),
        name: String(customer?.name || order.customer_name || ''),
        phone: String(order.shipping_phone || ''),
      },
    };

    await Promise.all(AUTOMATION_INTEGRATIONS.map(async (id) => {
      const url = String(get(id, 'webhook_url') || '').trim();
      if (!url) return;
      const enabled = String(get(id, 'event_order_paid') || 'true').toLowerCase() !== 'false';
      if (!enabled) return;
      const secret = String(get(id, 'secret') || '').trim();
      const headers = { 'Content-Type': 'application/json', 'User-Agent': 'TechMania-IntegrationHub/1.0' };
      if (secret) headers['X-TM-Signature'] = secret.slice(0, 64);
      try {
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (!res.ok) console.warn(`automation webhook ${id} responded ${res.status}`);
      } catch (error) {
        console.error(`automation webhook ${id} failed:`, error);
      }
    }));
  } catch (error) {
    console.error('automation webhook dispatch failed:', error);
  }
}

async function recordEvent(ledger, entry) {
  if (!ledger) return;
  try {
    await ledger.create({
      event_id: entry.event_id,
      event_type: entry.event_type,
      session_id: entry.session_id || '',
      order_id: entry.order_id || '',
      status: entry.status,
      effects_pending: Boolean(entry.effects_pending),
      effects_errors: String(entry.effects_errors || '').slice(0, 2000),
      ...(entry.reconciled_at ? { reconciled_at: entry.reconciled_at } : {}),
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("stripe-webhook: ledger write failed:", error);
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

    const base44 = createClientFromRequest(req);
    const ledger = ledgerFor(base44);

    if (await isEventKnown(ledger, event.id)) {
      console.log("stripe-webhook: duplicate signed event skipped by ledger", event.id);
      return Response.json({ received: true, duplicate: true });
    }

    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") {
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(event.data?.object?.id || ''),
        status: "ignored",
      });
      return Response.json({ received: true });
    }

    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      console.warn(`stripe-webhook: ${event.type} without order_id`, session.id);
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(session.id || ''),
        status: "ignored",
      });
      return Response.json({ received: true });
    }

    const order = await base44.asServiceRole.entities.Order.get(orderId).catch(() => null);
    if (!order) {
      console.error("stripe-webhook: order not found", orderId);
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(session.id || ''),
        order_id: orderId,
        status: "ignored",
      });
      return Response.json({ received: true });
    }

    if (event.type === "checkout.session.expired") {
      if (order.status === "pending" && order.stripe_session_id === session.id) {
        await base44.asServiceRole.entities.Order.update(orderId, {
          status: "cancelled",
          stripe_event_id: event.id,
        });
      }
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(session.id || ''),
        order_id: orderId,
        status: "processed",
      });
      return Response.json({ received: true });
    }

    if (session.payment_status !== "paid") {
      console.warn("stripe-webhook: completed checkout is not paid", session.id, session.payment_status);
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(session.id || ''),
        order_id: orderId,
        status: "ignored",
      });
      return Response.json({ received: true });
    }

    // Stripe may deliver the same signed event more than once. The order state
    // is the idempotency guard, preventing duplicate customer totals, discount
    // usage, stock decrements and notifications on sequential deliveries.
    if (order.status === "paid") {
      console.log("stripe-webhook: duplicate completed event ignored", event.id, orderId);
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(session.id || ''),
        order_id: orderId,
        status: "duplicate",
      });
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
      await recordEvent(ledger, {
        event_id: event.id,
        event_type: event.type,
        session_id: String(session.id || ''),
        order_id: orderId,
        status: "mismatch",
      });
      return Response.json({ received: true });
    }

    const discountCode = session.metadata?.discount_code;
    const email = String(session.customer_details?.email || "").trim().toLowerCase();
    const name = String(session.customer_details?.name || "").trim();
    const shippingDetails = session.shipping_details || session.customer_details;
    const shippingAddress = shippingDetails?.address;

    // Commit the idempotency guard before secondary effects. If updating the
    // order fails Stripe gets a 400 and retries without any partial mutation
    // and without any ledger entry, so the retry processes the event fully.
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

    // Secondary effects are best-effort but tracked: failures are recorded in
    // the ledger as `effects_pending` so an administrator can reconcile them
    // (admin-cms operation `reconcile_order`) without Stripe retries.
    const failedEffects = [];
    const runSideEffect = async (label, operation) => {
      try {
        await operation();
      } catch (error) {
        console.error(`stripe-webhook ${label} failed:`, error);
        failedEffects.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

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

    await runSideEffect("automation webhooks", async () => {
      await dispatchAutomationWebhooks(base44, order, { email, name });
    });

    await recordEvent(ledger, {
      event_id: event.id,
      event_type: event.type,
      session_id: String(session.id || ''),
      order_id: orderId,
      status: "processed",
      effects_pending: failedEffects.length > 0,
      effects_errors: failedEffects.join(' | '),
    });

    console.log("Payment completed:", { eventId: event.id, sessionId: session.id, orderId, failedEffects: failedEffects.length });
    return Response.json({ received: true });
  } catch (error) {
    console.error("stripe-webhook error:", error);
    return Response.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
