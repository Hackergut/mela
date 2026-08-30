import { MOCK_PRODUCTS } from "./mock-data";

const domain = process.env.SHOPIFY_STORE_DOMAIN || "";
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const endpoint = `https://${domain}/api/2025-01/graphql.json`;

type ShopifyResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!domain || !storefrontAccessToken) {
    // Return mock data if credentials are not configured
    if (query.includes("query Products")) {
      return { products: { nodes: MOCK_PRODUCTS } } as unknown as T;
    }
    if (query.includes("query ProductByHandle")) {
      const handle = variables.handle as string;
      const found = MOCK_PRODUCTS.find((p) => p.handle === handle) || MOCK_PRODUCTS[0];
      return { product: found } as unknown as T;
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }
    });

    const json: ShopifyResponse<T> = await response.json();

    if (json.errors) {
      console.warn("Shopify GraphQL errors:", json.errors);
      if (query.includes("query Products")) {
        return { products: { nodes: MOCK_PRODUCTS } } as unknown as T;
      }
    }

    return json.data;
  } catch (error) {
    console.warn("Shopify fetch failed, falling back to mock data:", error);
    if (query.includes("query Products")) {
      return { products: { nodes: MOCK_PRODUCTS } } as unknown as T;
    }
    if (query.includes("query ProductByHandle")) {
      const handle = variables.handle as string;
      const found = MOCK_PRODUCTS.find((p) => p.handle === handle) || MOCK_PRODUCTS[0];
      return { product: found } as unknown as T;
    }
    throw error;
  }
}
