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

        // Decrement stock
        if (productId) {
          try {
            const p = await base44.asServiceRole.entities.Product.get(productId);
            if (p && typeof p.stock === 'number') {
              await base44.asServiceRole.entities.Product.update(productId, {
                stock: Math.max(0, p.stock - 1),
              });
            }
          } catch (e) {
            console.log("stock decrement skipped:", e.message);
          }
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("stripe-webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}