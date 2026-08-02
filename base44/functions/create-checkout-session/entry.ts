import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";
import { PRICE_MAP } from "../../shared/prices.ts";

export default async function(req) {
  try {
    const body = await req.json();
    const { productId, name, image, description, successUrl, cancelUrl } = body;

    if (!productId || !PRICE_MAP[productId]) {
      return Response.json({ error: "Prodotto non valido" }, { status: 400 });
    }
    if (!successUrl || !cancelUrl) {
      return Response.json({ error: "URL di redirect mancanti" }, { status: 400 });
    }

    const unitAmount = PRICE_MAP[productId];
    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          product_data: {
            name: name || "Pezzo artigianale Terra-Mater",
            description: description ? description.slice(0, 350) : undefined,
            images: image ? [image] : undefined,
          },
        },
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: "auto",
      metadata: {
        base44_app_id: secrets.get("BASE44_APP_ID"),
        product_id: String(productId),
        product_name: name || "",
      },
    });

    console.log("Checkout session created:", session.id, "product:", productId, "amount:", unitAmount);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}