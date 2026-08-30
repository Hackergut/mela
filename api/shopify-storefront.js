import { readJson, send } from "./_lib/http.js";
import { resolveStorefrontConfig, storefrontFetch, CREATE_CART } from "./_lib/shopify.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Metodo non consentito" });
  try {
    const payload = await readJson(req);
    const config = resolveStorefrontConfig();
    if (!config.configured) {
      return send(res, 503, { error: "Shopify Storefront non configurato" });
    }
    const operation = String(payload?.operation || "").trim();
    const body = payload?.payload || {};
    switch (operation) {
      case "config": {
        // The token is server-side only: the browser receives the domain and
        // knows the store is available, but never the credential.
        return send(res, 200, {
          configured: true,
          domain: config.domain,
          token: "",
          proxied: true,
        });
      }
      case "graphql": {
        const query = String(body?.query || "").trim();
        if (!query) return send(res, 400, { error: "Query GraphQL mancante" });
        const data = await storefrontFetch(config.domain, config.token, query, body?.variables || {});
        return send(res, 200, { data });
      }
      case "checkout": {
        const lines = Array.isArray(body?.lines) ? body.lines : [];
        if (!lines.length) return send(res, 400, { error: "Carrello vuoto" });
        const input = {
          lines: lines.map((line) => ({
            merchandiseId: String(line.merchandiseId || line.variantId || ""),
            quantity: Math.max(1, Number(line.quantity) || 1),
          })),
        };
        const code = String(body?.discountCode || "").trim();
        if (code) input.discountCodes = [code];
        const data = await storefrontFetch(config.domain, config.token, CREATE_CART, { input });
        const error = data?.cartCreate?.userErrors?.[0]?.message;
        if (error) return send(res, 400, { error });
        const cart = data?.cartCreate?.cart;
        if (!cart?.checkoutUrl) return send(res, 502, { error: "Checkout Shopify non disponibile" });
        return send(res, 200, { url: cart.checkoutUrl, provider: "shopify", cartId: cart.id });
      }
      default:
        return send(res, 400, { error: "Operazione non valida" });
    }
  } catch (error) {
    console.error("shopify-storefront", error);
    return send(res, error.status || 500, { error: error.message || "Operazione Shopify non riuscita" });
  }
}
