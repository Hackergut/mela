import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";

export default async function(req) {
  try {
    const body = await req.json();
    const { productId, name, image, description, successUrl, cancelUrl, discountCode } = body;

    if (!productId || !successUrl || !cancelUrl) {
      return Response.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));

    let unitAmount = 0;
    let productName = name;
    let productImage = image;
    let productDescription = description;

    try {
      const product = await base44.asServiceRole.entities.Product.get(productId);
      if (product && product.price_cents) {
        unitAmount = product.price_cents;
        productName = product.name;
        productImage = product.image;
        productDescription = product.description;
      }
    } catch (e) {
      console.log("Product not found in entity:", e.message);
    }

    if (!unitAmount) {
      return Response.json({ error: "Prezzo non disponibile per questo prodotto" }, { status: 400 });
    }

    // Validate discount code
    let discountAmountCents = 0;
    let appliedCode = "";
    if (discountCode) {
      const code = String(discountCode).trim().toUpperCase();
      const discounts = await base44.asServiceRole.entities.Discount.filter({ code });
      const d = discounts[0];
      if (!d || !d.active) {
        return Response.json({ error: "Codice sconto non valido o inattivo" }, { status: 400 });
      }
      if (d.expires_at && new Date(d.expires_at) < new Date()) {
        return Response.json({ error: "Codice sconto scaduto" }, { status: 400 });
      }
      if (d.max_uses && (d.usage_count || 0) >= d.max_uses) {
        return Response.json({ error: "Codice sconto esaurito" }, { status: 400 });
      }
      if (d.type === 'percent') {
        discountAmountCents = Math.round(unitAmount * d.value / 100);
      } else {
        discountAmountCents = Math.min(d.value, unitAmount);
      }
      appliedCode = code;
    }

    const finalAmount = unitAmount - discountAmountCents;

    // Create order record (pending)
    const orderNum = `TM-${Date.now().toString().slice(-6)}`;
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNum,
      customer_name: "",
      customer_email: "",
      items: [{ name: productName, price_cents: unitAmount, qty: 1 }],
      subtotal_cents: unitAmount,
      discount_amount_cents: discountAmountCents,
      total_cents: finalAmount,
      status: "pending",
      discount_code: appliedCode || null,
      stripe_session_id: "",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: finalAmount,
          product_data: {
            name: productName || "Prodotto",
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
        order_id: order.id,
        discount_code: appliedCode || "",
      },
    });

    await base44.asServiceRole.entities.Order.update(order.id, { stripe_session_id: session.id });

    console.log("Checkout session created:", session.id, "order:", orderNum, "amount:", finalAmount, "discount:", appliedCode);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}