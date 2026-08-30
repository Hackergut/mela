/**
 * Shopify Universal Commerce Protocol (UCP) / MCP Agent Handler
 * Handles JSON-RPC 2.0 tool requests such as "search_catalog" following the 2026 UCP / MCP standard.
 */

import { shopifyFetch } from "./shopify";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: {
    content?: Array<{ type: string; text: string }>;
    structuredContent?: Record<string, any>;
    [key: string]: any;
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export async function handleUcpAgentCall(req: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { id, method, params } = req;

  if (method !== "tools/call") {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: "Method not found" }
    };
  }

  const { name, arguments: args } = params || {};

  switch (name) {
    case "search_catalog": {
      const query = args?.catalog?.query || "";
      const catalogId = args?.catalog?.catalog_id || "default";

      try {
        const graphqlQuery = `
          query SearchCatalog($query: String!) {
            products(first: 10, query: $query) {
              nodes {
                id
                title
                handle
                description
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        `;

        let productsNodes = [];
        try {
          const data = await shopifyFetch<{ products: { nodes: any[] } }>(graphqlQuery, { query });
          productsNodes = data?.products?.nodes || [];
        } catch {
          // Fallback if Shopify Storefront API isn't populated or available
          productsNodes = [
            {
              id: "iphone-15-pro-max",
              title: "iPhone 15 Pro Max",
              handle: "iphone-15-pro-max",
              description: "Fotocamera di livello professionale, chip A17 Pro ultraveloce e design in titanio.",
              priceRange: { minVariantPrice: { amount: "1299.00", currencyCode: "EUR" } },
              featuredImage: { url: "/assets/iphone-image-2619-2264.png", altText: "iPhone 15 Pro Max" }
            },
            {
              id: "playstation-5-slim",
              title: "PlayStation 5 Slim",
              handle: "playstation-5-slim",
              description: "Esperienza di gioco Next-Gen in design ultrasottile con grafica 4K.",
              priceRange: { minVariantPrice: { amount: "499.00", currencyCode: "EUR" } },
              featuredImage: { url: "/assets/playstation-2619-2204.png", altText: "PlayStation 5 Slim" }
            }
          ].filter(p => !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));
        }

        const formattedProducts = productsNodes.map((p: any) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          description: p.description,
          price: p.priceRange?.minVariantPrice?.amount || "0.00",
          currency: p.priceRange?.minVariantPrice?.currencyCode || "EUR",
          image_url: p.featuredImage?.url || ""
        }));

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: `Found ${formattedProducts.length} product(s) for query '${query}'`
              }
            ],
            structuredContent: {
              catalog_id: catalogId,
              query,
              total_matches: formattedProducts.length,
              products: formattedProducts
            }
          }
        };
      } catch (err: any) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: err.message || "Failed to search catalog" }
        };
      }
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool '${name}' not recognized` }
      };
  }
}
