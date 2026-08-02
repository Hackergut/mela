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
      console.log("Payment completed:", {
        sessionId: session.id,
        productId: session.metadata?.product_id,
        productName: session.metadata?.product_name,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("stripe-webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}