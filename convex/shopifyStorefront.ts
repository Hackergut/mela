// @ts-nocheck
// Public Shopify Storefront proxy. Exposes the storefront domain + token
// (the Storefront token is designed to be used from the browser) and can
// also run GraphQL on the server so checkout works without Vite env vars.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const API_VERSION = "2026-07";

function normalizeDomain(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname;
  } catch {
    return raw.replace(/^https?:\/\//, "").split("/")[0];
  }
}

async function getSetting(ctx, key) {
  const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
  return all.find((setting) => setting.key === key)?.value || "";
}

async function resolveConfig(ctx) {
  const domain = normalizeDomain(
    process.env.SHOPIFY_STORE_DOMAIN
      || process.env.SHOPIFY_SHOP_DOMAIN
      || await getSetting(ctx, "shopify_shop_domain"),
  );
  const token = String(
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
      || await getSetting(ctx, "shopify_storefront_access_token")
      || "",
  ).trim();
  return { domain, token, configured: Boolean(domain && token) };
}

async function storefrontFetch(domain, token, query, variables = {}) {
  const response = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json?.errors?.[0]?.message || `Shopify Storefront ${response.status}`);
  if (json.errors?.length) throw new Error(json.errors.map((error) => error.message).join("\n"));
  return json.data;
}

const json = (data, status = 200) => ({ __ok: true, status, ...data });
const jfail = (error, status = 400) => ({ __ok: false, status, error });

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            sku
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
            product { id title handle productType }
            image { url altText }
          }
        }
        cost { totalAmount { amount currencyCode } }
      }
    }
  }
`;

const CREATE_CART = `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export default action({
  args: {
    operation: v.string(),
    payload: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const payload = args.payload || {};
    try {
      const config = await resolveConfig(ctx);
      switch (args.operation) {
        case "config":
          return json({
            configured: config.configured,
            domain: config.domain,
            token: config.token,
          });
        case "checkout": {
          if (!config.configured) return jfail("Shopify Storefront non configurato", 503);
          const lines = Array.isArray(payload.lines) ? payload.lines : [];
          if (!lines.length) return jfail("Carrello vuoto", 400);
          const input = {
            lines: lines.map((line) => ({
              merchandiseId: String(line.merchandiseId || line.variantId || ""),
              quantity: Math.max(1, Number(line.quantity) || 1),
            })),
          };
          const code = String(payload.discountCode || "").trim();
          if (code) input.discountCodes = [code];
          const data = await storefrontFetch(config.domain, config.token, CREATE_CART, { input });
          const error = data?.cartCreate?.userErrors?.[0]?.message;
          if (error) return jfail(error, 400);
          const cart = data?.cartCreate?.cart;
          if (!cart?.checkoutUrl) return jfail("Checkout Shopify non disponibile", 502);
          return json({ url: cart.checkoutUrl, provider: "shopify", cartId: cart.id });
        }
        default:
          return jfail("Operazione non valida", 400);
      }
    } catch (error) {
      console.error("shopify storefront error:", error);
      return jfail(error.message || "Operazione Shopify non riuscita", 500);
    }
  },
});
