import { quoteCheckout } from "../src/lib/checkoutPricing.js";
import { readJson, requestOrigin, send } from "./_lib/http.js";
import { stripeRequest } from "./_lib/stripe.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Metodo non consentito" });
  try {
    const payload = await readJson(req);
    const origin = requestOrigin(req);
    if (!origin) return send(res, 503, { error: "Checkout non configurato: manca l'origine del sito." });
    const quote = quoteCheckout(payload);
    const success = new URL("/ordine", origin);
    success.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    const cancel = new URL(quote.orderItems.length === 1 ? "/scheda-prodotto" : "/carrello", origin);
    if (quote.orderItems.length === 1) cancel.searchParams.set("id", quote.orderItems[0].product_id);
    cancel.searchParams.set("payment", "cancelled");

    const lineItems = quote.orderItems.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "eur",
        unit_amount: item.price_cents,
        product_data: {
          name: String(item.name).slice(0, 127),
          images: item.image ? [item.image] : undefined,
        },
      },
    }));
    if (quote.shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: quote.shippingCents,
          product_data: { name: "Spedizione" },
        },
      });
    }

    const session = await stripeRequest("/checkout/sessions", {
      method: "POST",
      body: {
        mode: "payment",
        success_url: success.toString(),
        cancel_url: cancel.toString(),
        billing_address_collection: "auto",
        phone_number_collection: { enabled: "true" },
        shipping_address_collection: { allowed_countries: ["IT", "AT", "DE", "FR", "ES", "CH"] },
        client_reference_id: quote.orderNumber,
        metadata: {
          order_number: quote.orderNumber,
          subtotal_cents: String(quote.subtotal),
          shipping_cents: String(quote.shippingCents),
          total_cents: String(quote.finalAmount),
          items_json: JSON.stringify(quote.orderItems).slice(0, 450),
        },
        line_items: lineItems,
      },
    });
    if (!session.url) return send(res, 502, { error: "Stripe non ha restituito un URL di checkout" });
    return send(res, 200, { url: session.url, provider: "stripe", order_number: quote.orderNumber });
  } catch (error) {
    console.error("create-checkout-session", error);
    return send(res, error.status || 500, { error: error.message || "Impossibile avviare il checkout" });
  }
}
