import { flattenStripeParams } from "./http.js";

export function stripeSecret() {
  return String(process.env.STRIPE_SECRET_KEY || "").trim();
}

export function stripeMode(key = stripeSecret()) {
  if (!key) return null;
  return key.startsWith("sk_test") || key.startsWith("rk_test") ? "test" : "live";
}

export async function stripeRequest(path, { method = "GET", body } = {}) {
  const key = stripeSecret();
  if (!key) {
    const error = new Error("Stripe non è configurato. Imposta STRIPE_SECRET_KEY su Vercel.");
    error.status = 503;
    throw error;
  }
  const headers = { Authorization: `Bearer ${key}` };
  let payload;
  if (body && method !== "GET") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    payload = new URLSearchParams(flattenStripeParams(body)).toString();
  }
  const response = await fetch(`https://api.stripe.com/v1${path}`, { method, headers, body: payload });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(json?.error?.message || `Stripe ${response.status}`);
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
}

export function mapStripeSession(session) {
  if (!session) return null;
  const paid = session.payment_status === "paid" || session.status === "complete";
  const details = session.customer_details || {};
  const shipping = session.shipping_details || session.collected_information?.shipping_details || {};
  const address = shipping.address || details.address || {};
  const items = Array.isArray(session.metadata?.items_json)
    ? session.metadata.items_json
    : (() => {
      try { return JSON.parse(session.metadata?.items_json || "[]"); } catch { return []; }
    })();
  const email = String(details.email || session.customer_email || "").trim().toLowerCase();
  return {
    id: session.metadata?.order_id || session.id,
    order_number: session.metadata?.order_number || session.client_reference_id || session.id,
    stripe_session_id: session.id,
    status: session.status === "expired" ? "cancelled" : paid ? "paid" : "pending",
    customer_name: details.name || shipping.name || "",
    customer_email: email,
    customer_email_masked: email ? `${email[0]}•••@${email.split("@")[1] || ""}` : "",
    shipping_name: shipping.name || details.name || "",
    shipping_address: {
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "",
    },
    items,
    subtotal_cents: Number(session.metadata?.subtotal_cents) || session.amount_subtotal || 0,
    shipping_cents: Number(session.metadata?.shipping_cents) || 0,
    discount_amount_cents: Number(session.metadata?.discount_cents) || 0,
    total_cents: session.amount_total || Number(session.metadata?.total_cents) || 0,
    created_date: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
    paid_at: paid ? new Date((session.created || Date.now() / 1000) * 1000).toISOString() : null,
  };
}
