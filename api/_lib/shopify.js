// Shared Shopify Storefront helpers for Vercel serverless functions.
// These run on the server so the Storefront token never enters the browser.

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

export function resolveStorefrontConfig() {
  const domain = normalizeStoreDomain(
    process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP_DOMAIN || "",
  );
  const token = String(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "").trim();
  return { domain, token, configured: Boolean(domain && token) };
}

export async function storefrontFetch(domain, token, query, variables = {}) {
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
    const error = new Error(json?.errors?.[0]?.message || `Shopify Storefront ${response.status}`);
    error.status = response.status;
    throw error;
  }
  if (json.errors?.length) throw new Error(json.errors.map((error) => error.message).join("\n"));
  return json.data;
}

export const CART_FRAGMENT = `
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

export const CREATE_CART = `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;
