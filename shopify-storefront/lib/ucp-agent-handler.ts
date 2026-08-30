/**
 * Shopify Universal Commerce Protocol (UCP) / MCP Agent Handler
 * Handles JSON-RPC 2.0 requests such as "search_catalog", "get_product", "add_to_cart".
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
  result?: any;
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

  const { name, arguments: args } = params;

  switch (name) {
    case "search_catalog": {
      const query = args?.catalog?.query || "";
      const catalogId = args?.catalog?.catalog_id;

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

        const data = await shopifyFetch<{ products: { nodes: any[] } }>(graphqlQuery, { query });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            catalog_id: catalogId,
            query,
            total_matches: data?.products?.nodes?.length || 0,
            products: data?.products?.nodes || []
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
