import {
  ADD_TO_CART_MUTATION,
  APPLY_DISCOUNT_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  REMOVE_FROM_CART_MUTATION,
  UPDATE_CART_MUTATION,
} from "./queries.js";

const API_VERSION = "2025-01";

export function normalizeStoreDomain(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname;
  } catch {
    return raw.replace(/^https?:\/\//, "").split("/")[0];
  }
}

/** @returns {Record<string, string | undefined>} */
function viteEnv() {
  try {
    return /** @type {Record<string, string | undefined>} */ (import.meta.env || {});
  } catch {
    return {};
  }
}

export function readViteShopifyConfig() {
  const env = viteEnv();
  const domain = normalizeStoreDomain(env.VITE_SHOPIFY_STORE_DOMAIN);
  const token = String(env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "").trim();
  return { domain, token, configured: Boolean(domain && token), proxied: false };
}

/**
 * Thin Storefront API client. The token is a *Storefront* access token
 * (public by design — it cannot write admin data). Prefer calling this
 * through `shopifyStorefrontRequest`, which can also proxy via Convex so
 * credentials live in server env (`SHOPIFY_STORE_DOMAIN` /
 * `SHOPIFY_STOREFRONT_ACCESS_TOKEN`).
 */
export async function shopifyFetch(query, variables = {}, config = readViteShopifyConfig()) {
  // Server-proxied mode: credentials live in Vercel/Convex secrets and are
  // never sent to the browser. The frontend only carries query + variables.
  if (config?.proxied) {
    const { base44 } = await import("@/api/base44Client");
    const response = await base44.functions.invoke("shopify-storefront", {
      operation: "graphql",
      payload: { query, variables },
    });
    if (!response?.data) throw new Error("Shopify Storefront non configurato");
    if (response.data && typeof response.data === "object" && "__ok" in response.data) {
      if (!response.data.__ok) throw new Error(response.data.error || "Richiesta Shopify non riuscita");
      return response.data.data;
    }
    return response.data.data;
  }

  const domain = normalizeStoreDomain(config.domain);
  const token = String(config.token || "").trim();
  if (!domain || !token) throw new Error("Shopify Storefront non configurato");

  const response = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json?.errors?.[0]?.message || `Richiesta Shopify non riuscita (${response.status})`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join("\n"));
  }
  return json.data;
}

function firstUserError(...payloads) {
  for (const payload of payloads) {
    const error = payload?.userErrors?.[0]?.message;
    if (error) return error;
  }
  return "";
}

export async function fetchShopifyProducts(first = 50, query, config) {
  const data = await shopifyFetch(PRODUCTS_QUERY, { first, query: query || null }, config);
  return data?.products?.nodes || [];
}

export async function fetchShopifyProductByHandle(handle, config) {
  const data = await shopifyFetch(PRODUCT_BY_HANDLE_QUERY, { handle }, config);
  return data?.product || null;
}

export async function createShopifyCart(lines = [], discountCodes = [], config) {
  const input = {
    lines: lines.map((line) => ({
      merchandiseId: line.merchandiseId || line.variantId,
      quantity: Math.max(1, Number(line.quantity) || 1),
    })),
  };
  const codes = (Array.isArray(discountCodes) ? discountCodes : [discountCodes]).map((code) => String(code || "").trim()).filter(Boolean);
  if (codes.length) input.discountCodes = codes;
  const data = await shopifyFetch(CREATE_CART_MUTATION, { input }, config);
  const error = firstUserError(data?.cartCreate);
  if (error) throw new Error(error);
  return data?.cartCreate?.cart || null;
}

export async function addShopifyCartLines(cartId, lines, config) {
  const data = await shopifyFetch(ADD_TO_CART_MUTATION, {
    cartId,
    lines: lines.map((line) => ({
      merchandiseId: line.merchandiseId || line.variantId,
      quantity: Math.max(1, Number(line.quantity) || 1),
    })),
  }, config);
  const error = firstUserError(data?.cartLinesAdd);
  if (error) throw new Error(error);
  return data?.cartLinesAdd?.cart || null;
}

export async function updateShopifyCartLines(cartId, lines, config) {
  const data = await shopifyFetch(UPDATE_CART_MUTATION, { cartId, lines }, config);
  const error = firstUserError(data?.cartLinesUpdate);
  if (error) throw new Error(error);
  return data?.cartLinesUpdate?.cart || null;
}

export async function removeShopifyCartLines(cartId, lineIds, config) {
  const data = await shopifyFetch(REMOVE_FROM_CART_MUTATION, { cartId, lineIds }, config);
  const error = firstUserError(data?.cartLinesRemove);
  if (error) throw new Error(error);
  return data?.cartLinesRemove?.cart || null;
}

export async function getShopifyCart(cartId, config) {
  const data = await shopifyFetch(GET_CART_QUERY, { cartId }, config);
  return data?.cart || null;
}

export async function applyShopifyDiscount(cartId, discountCodes, config) {
  const codes = (Array.isArray(discountCodes) ? discountCodes : [discountCodes])
    .map((code) => String(code || "").trim())
    .filter(Boolean);
  const data = await shopifyFetch(APPLY_DISCOUNT_MUTATION, { cartId, discountCodes: codes }, config);
  const error = firstUserError(data?.cartDiscountCodesUpdate);
  if (error) throw new Error(error);
  return data?.cartDiscountCodesUpdate?.cart || null;
}
