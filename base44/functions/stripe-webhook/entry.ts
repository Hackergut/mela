import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";

export default async function(req) {
  const webhookSecret = secrets.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET not set");
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const signature = req.headers.get("stripe-signature") || "";
    const rawBody = await req.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const base44 = createClientFromRequest(req);
      const orderId = session.metadata?.order_id;
      const discountCode = session.metadata?.discount_code;
      const productId = session.metadata?.product_id;
      const email = session.customer_details?.email || "";
      const name = session.customer_details?.name || "";
      const totalCents = session.amount_total || 0;

      console.log("Payment completed:", { sessionId: session.id, orderId, email, amount: totalCents });

      if (orderId) {
        // Fetch order for order_number
        const order = await base44.asServiceRole.entities.Order.get(orderId).catch(() => null);
        const orderNumber = order?.order_number || orderId;

        // Mark order paid
        await base44.asServiceRole.entities.Order.update(orderId, {
          status: "paid",
          customer_email: email,
          customer_name: name,
        });

        // Upsert customer (CRM)
        if (email) {
          const existing = await base44.asServiceRole.entities.Customer.filter({ email });
          if (existing.length > 0) {
            const c = existing[0];
            await base44.asServiceRole.entities.Customer.update(c.id, {
              orders_count: (c.orders_count || 0) + 1,
              total_spent: (c.total_spent || 0) + totalCents,
              name: c.name || name || email.split('@')[0],
            });
          } else {
            await base44.asServiceRole.entities.Customer.create({
              name: name || email.split('@')[0],
              email,
              orders_count: 1,
              total_spent: totalCents,
            });
          }
        }

        // Increment discount usage
        if (discountCode) {
          const code = String(discountCode).toUpperCase();
          const d = await base44.asServiceRole.entities.Discount.filter({ code });
          if (d[0]) {
            await base44.asServiceRole.entities.Discount.update(d[0].id, {
              usage_count: (d[0].usage_count || 0) + 1,
            });
          }
        }

        // Decrement stock + low-stock notification
        if (productId) {
          try {
            const p = await base44.asServiceRole.entities.Product.get(productId);
            if (p && typeof p.stock === 'number') {
              const newStock = Math.max(0, p.stock - 1);
              const threshold = p.low_stock_threshold ?? 5;
              await base44.asServiceRole.entities.Product.update(productId, { stock: newStock });
              if (newStock <= threshold) {
                await base44.asServiceRole.entities.Notification.create({
                  type: "stock",
                  title: `Stock basso: ${p.name}`,
                  message: `Rimangono ${newStock} unità (soglia: ${threshold}). Rifornire l'inventario.`,
                  severity: newStock === 0 ? "error" : "warning",
                  read: false,
                  link: "inventory",
                  ref_id: productId,
                });
              }
            }
          } catch (e) {
            console.log("stock decrement skipped:", e.message);
          }
        }

        // Order notification
        await base44.asServiceRole.entities.Notification.create({
          type: "order",
          title: `Nuovo ordine pagato ${orderNumber}`,
          message: `${name || email || 'Cliente'} · ${(totalCents / 100).toFixed(2)} €${discountCode ? ` · sconto ${discountCode}` : ''}`,
          severity: "success",
          read: false,
          link: "orders",
          ref_id: orderId,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("stripe-webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}