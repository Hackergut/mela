import { useQuery as useConvexQuery } from "convex/react";
import { useQuery } from "@tanstack/react-query";
import { base44, convex, convexConfigured, api } from "@/api/base44Client";
import { hydrateProducts } from "@/lib/catalog";

export const CATALOG_QUERY_KEY = ["catalog", "public"];
const EMPTY_CATALOG = { products: [], variants: [], categories: [], settings: {} };

async function fetchCatalogViaAction() {
  const response = await base44.functions.invoke("catalog", {});
  const rawProducts = response.data?.products;
  const rawVariants = response.data?.variants;
  const rawCategories = response.data?.categories;
  const settings = response.data?.settings && typeof response.data.settings === "object" ? response.data.settings : {};
  const products = hydrateProducts(
    Array.isArray(rawProducts) ? rawProducts : [],
    Array.isArray(rawVariants) ? rawVariants : [],
  );
  const counts = products.reduce((map, product) => {
    const key = product.category_id || product.category;
    if (key) map.set(String(key), (map.get(String(key)) || 0) + 1);
    return map;
  }, new Map());
  const categoryRecords = Array.isArray(rawCategories) ? rawCategories : [];
  const categories = categoryRecords
    .filter((category) => category.status == null || category.status === "active")
    .map((category) => ({
      ...category,
      product_count: counts.get(String(category.id)) || counts.get(String(category.name)) || 0,
    }))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  return { products, variants: Array.isArray(rawVariants) ? rawVariants : [], categories, settings };
}

function shapeCatalog(data) {
  if (!data) return EMPTY_CATALOG;
  const products = hydrateProducts(data.products || [], data.variants || []);
  const counts = products.reduce((map, product) => {
    const key = product.category_id || product.category;
    if (key) map.set(String(key), (map.get(String(key)) || 0) + 1);
    return map;
  }, new Map());
  const categories = (data.categories || [])
    .filter((category) => category.status == null || category.status === "active")
    .map((category) => ({
      ...category,
      product_count: counts.get(String(category.id)) || counts.get(String(category.name)) || 0,
    }))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  return { products, variants: data.variants || [], categories, settings: data.settings || {} };
}

/** Shared catalogue query. Reactive against Convex when configured, otherwise
 *  falls back to a one-shot action call (standalone previews). */
export function useCatalog() {
  // Reactive Convex subscription (preferred). The api import is an any-typed
  // stub before codegen links a deployment, so cast to keep typecheck happy.
  const convexData = /** @type {any} */ (useConvexQuery)(/** @type {any} */ (api).catalog, {});

  // TanStack query as a compatibility path / fallback.
  const query = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalogViaAction,
    enabled: !convexConfigured,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (convexConfigured && convex) {
    const shaped = shapeCatalog(convexData);
    return {
      ...shaped,
      loading: convexData === undefined,
      refreshing: false,
      error: null,
      reload: async () => shaped,
      configured: true,
      ready: convexData !== undefined,
    };
  }

  return {
    products: query.data?.products ?? [],
    variants: query.data?.variants ?? [],
    categories: query.data?.categories ?? [],
    settings: query.data?.settings ?? {},
    loading: query.isPending,
    refreshing: query.isFetching && !query.isPending,
    error: query.error,
    reload: query.refetch,
    configured: true,
    ready: query.isSuccess,
  };
}

/** Compatibility hook for existing product-only consumers. */
export function useProducts() {
  const catalog = useCatalog();
  return {
    products: catalog.products,
    loading: catalog.loading,
    refreshing: catalog.refreshing,
    error: catalog.error,
    reload: catalog.reload,
    configured: catalog.configured,
    ready: catalog.ready,
  };
}
