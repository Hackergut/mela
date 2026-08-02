import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";
import { PRICE_MAP } from "../../shared/prices.ts";

export default async function(req) {
  try {
    const body = await req.json();
    const { productId, name, image, description, successUrl, cancelUrl } = body;

    if (!productId || !successUrl || !cancelUrl) {
      return Response.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    let unitAmount = PRICE_MAP[productId] || 0;
    let productName = name;
    let productImage = image;
    let productDescription = description;

    // Look up the product in the entity (source of truth for CMS-managed prices)
    try {
      const base44 = createClientFromRequest(req);
      const product = await base44.asServiceRole.entities.Product.get(productId);
      if (product && product.price_cents) {
        unitAmount = product.price_cents;
        productName = product.name;
        productImage = product.image;
        productDescription = product.description;
      }
    } catch (e) {
      console.log("Product not found in entity, using PRICE_MAP fallback:", e.message);
    }

    if (!unitAmount) {
      return Response.json({ error: "Prezzo non disponibile per questo prodotto" }, { status: 400 });
    }

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: unitAmount,
          product_data: {
            name: productName || "Prodotto Apple",
            description: productDescription ? productDescription.slice(0, 350) : undefined,
            images: productImage ? [productImage] : undefined,
          },
        },
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: "auto",
      metadata: {
        base44_app_id: secrets.get("BASE44_APP_ID"),
        product_id: String(productId),
        product_name: productName || "",
      },
    });

    console.log("Checkout session created:", session.id, "product:", productId, "amount:", unitAmount);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}