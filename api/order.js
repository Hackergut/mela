import { send } from "./_lib/http.js";
import { mapStripeSession, stripeRequest } from "./_lib/stripe.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return send(res, 405, { error: "Metodo non consentito" });
  try {
    const url = new URL(req.url, "http://localhost");
    const sessionId = String(url.searchParams.get("session_id") || url.searchParams.get("sessionId") || "").trim();
    const orderNumber = String(url.searchParams.get("order_number") || "").trim();
    const email = String(url.searchParams.get("email") || "").trim().toLowerCase();

    let session = null;
    if (sessionId.startsWith("cs_")) {
      session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
    } else if (orderNumber) {
      const query = `metadata["order_number"]:"${orderNumber.replace(/"/g, "")}"`;
      const found = await stripeRequest(`/checkout/sessions/search?${new URLSearchParams({ query, limit: "1" })}`);
      session = found.data?.[0] || null;
    }
    if (!session) return send(res, 404, { error: "Ordine non trovato." });
    const order = mapStripeSession(session);
    if (email && order.customer_email && order.customer_email !== email) {
      return send(res, 404, { error: "Ordine non trovato." });
    }
    return send(res, 200, { order });
  } catch (error) {
    console.error("order lookup", error);
    return send(res, error.status || 500, { error: error.message || "Ordine non trovato." });
  }
}
