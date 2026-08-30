import { base44 } from "../../api/base44Client.js";
import {
  addShopifyCartLines,
  applyShopifyDiscount,
  createShopifyCart,
  fetchShopifyProductByHandle,
  fetchShopifyProducts,
  getShopifyCart,
  readViteShopifyConfig,
  removeShopifyCartLines,
  updateShopifyCartLines,
} from "./client.js";
import { mapShopifyCart, shapeShopifyCatalog } from "./mapProduct.js";

const CART_ID_KEY = "tm_shopify_cart_id";

function readStoredCartId() {
  try {
    return localStorage.getItem(CART_ID_KEY) || "";
  } catch {
    return "";
  }
}

function writeStoredCartId(cartId) {
  try {
    if (cartId) localStorage.setItem(CART_ID_KEY, cartId);
    else localStorage.removeItem(CART_ID_KEY);
  } catch { /* storage unavailable */ }
}

let cachedServerConfig = null;
let cachedServerConfigAt = 0;
const CONFIG_TTL_MS = 5 * 60 * 1000;

/**
 * Resolve Storefront credentials. Vite env wins (local/dev). Otherwise we
 * ask Convex for the public storefront config (domain + storefront token).
 * The Storefront token is designed to be used from the browser.
 */
export async function resolveShopifyConfig() {
  const vite = readViteShopifyConfig();
  if (vite.configured) return vite;
  if (cachedServerConfig && Date.now() - cachedServerConfigAt < CONFIG_TTL_MS) {
    return cachedServerConfig;
  }
  if (!base44.isConfigured) {
    cachedServerConfig = { domain: "", token: "", configured: false, proxied: false };
    cachedServerConfigAt = Date.now();
    return cachedServerConfig;
  }
  try {
    const response = await base44.functions.invoke("shopify-storefront", { operation: "config" });
    const domain = String(response?.data?.domain || "").trim();
    // In the server-proxied path we intentionally do NOT return the token to
    // the browser; GraphQL calls run through /api or Convex instead.
    const token = String(response?.data?.token || "").trim();
    const proxied = Boolean(response?.data?.proxied) || Boolean(domain && !token);
    cachedServerConfig = { domain, token, configured: Boolean(domain && (token || proxied)), proxied };
  } catch {
    cachedServerConfig = { domain: "", token: "", configured: false, proxied: false };
  }
  cachedServerConfigAt = Date.now();
  return cachedServerConfig;
}

export function peekShopifyConfigured() {
  if (readViteShopifyConfig().configured) return true;
  return Boolean(cachedServerConfig?.configured);
}

export async function isShopifyStorefrontEnabled() {
  const config = await resolveShopifyConfig();
  return config.configured;
}

/**
 * @param {{ first?: number, query?: string }} [options]
 */
export async function loadShopifyCatalog(options = {}) {
  const first = options.first ?? 50;
  const query = options.query;
  const config = await resolveShopifyConfig();
  if (!config.configured) return null;
  const nodes = await fetchShopifyProducts(first, query, config);
  return shapeShopifyCatalog({ products: { nodes } }, { store_name: "TechMania" });
}

export async function loadShopifyProduct(handle) {
  const config = await resolveShopifyConfig();
  if (!config.configured || !handle) return null;
  const product = await fetchShopifyProductByHandle(handle, config);
  if (!product) return null;
  return shapeShopifyCatalog({ product }, { store_name: "TechMania" });
}

async function persistCart(cart) {
  if (cart?.id) writeStoredCartId(cart.id);
  return mapShopifyCart(cart);
}

export async function ensureShopifyCart(lines = [], discountCodes = []) {
  const config = await resolveShopifyConfig();
  if (!config.configured) throw new Error("Shopify Storefront non configurato");
  const cartId = readStoredCartId();
  if (!cartId) {
    const created = await createShopifyCart(lines, discountCodes, config);
    return persistCart(created);
  }
  if (lines.length) {
    const updated = await addShopifyCartLines(cartId, lines, config);
    if (!updated) {
      writeStoredCartId("");
      const created = await createShopifyCart(lines, discountCodes, config);
      return persistCart(created);
    }
    if (discountCodes?.length) {
      const discounted = await applyShopifyDiscount(cartId, discountCodes, config);
      return persistCart(discounted);
    }
    return persistCart(updated);
  }
  const existing = await getShopifyCart(cartId, config);
  if (!existing) {
    writeStoredCartId("");
    const created = await createShopifyCart([], discountCodes, config);
    return persistCart(created);
  }
  return persistCart(existing);
}

export async function shopifyAddToCart(variantId, quantity = 1) {
  return ensureShopifyCart([{ merchandiseId: variantId, quantity }]);
}

export async function shopifyUpdateLine(lineId, quantity) {
  const config = await resolveShopifyConfig();
  const cartId = readStoredCartId();
  if (!cartId) throw new Error("Nessun carrello Shopify");
  if (quantity <= 0) {
    const cart = await removeShopifyCartLines(cartId, [lineId], config);
    return persistCart(cart);
  }
  const cart = await updateShopifyCartLines(cartId, [{ id: lineId, quantity }], config);
  return persistCart(cart);
}

export async function shopifyRemoveLine(lineId) {
  const config = await resolveShopifyConfig();
  const cartId = readStoredCartId();
  if (!cartId) throw new Error("Nessun carrello Shopify");
  const cart = await removeShopifyCartLines(cartId, [lineId], config);
  return persistCart(cart);
}

export async function shopifyClearCart() {
  const config = await resolveShopifyConfig();
  const cartId = readStoredCartId();
  if (!cartId) return persistCart(null);
  const existing = await getShopifyCart(cartId, config);
  const ids = (existing?.lines?.nodes || []).map((line) => line.id).filter(Boolean);
  if (!ids.length) return persistCart(existing);
  const cart = await removeShopifyCartLines(cartId, ids, config);
  return persistCart(cart);
}

export async function shopifyApplyDiscount(code) {
  const config = await resolveShopifyConfig();
  const cartId = readStoredCartId();
  if (!cartId) throw new Error("Nessun carrello Shopify");
  const cart = await applyShopifyDiscount(cartId, code ? [code] : [], config);
  return persistCart(cart);
}

export async function shopifyCheckoutUrl(lines, discountCode) {
  const config = await resolveShopifyConfig();
  if (!config.configured) throw new Error("Shopify Storefront non configurato");
  const cart = await createShopifyCart(lines, discountCode ? [discountCode] : [], config);
  if (!cart?.checkoutUrl) throw new Error("Checkout Shopify non disponibile");
  return cart.checkoutUrl;
}

export { readStoredCartId, writeStoredCartId };
