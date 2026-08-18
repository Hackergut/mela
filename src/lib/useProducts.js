// @ts-nocheck
import { useQuery as useConvexQuery } from "convex/react";
import { useQuery } from "@tanstack/react-query";
import { base44, convexConfigured, api } from "@/api/base44Client";
import { hydrateProducts } from "@/lib/catalog";
import { buildFallbackCatalog } from "@/lib/fallbackCatalog";

export const CATALOG_QUERY_KEY = ["catalog", "public"];
const EMPTY = { products: [], variants: [], categories: [], settings: {} };

function shapeCatalog(raw) {
  const rawProducts = raw?.products;
  const rawVariants = raw?.variants;
  const rawCategories = raw?.categories;
  const settings = raw?.settings && typeof raw.settings === "object" ? raw.settings : {};
  const products = hydrateProducts(
    Array.isArray(rawProducts) ? rawProducts : [],
    Array.isArray(rawVariants) ? rawVariants : [],
  );
  const counts = products.reduce((map, product) => {
    const key = product.category_id || product.category;
    if (key) map.set(String(key), (map.get(String(key)) || 0) + 1);
    return map;
  }, new Map());
  const categories = (Array.isArray(rawCategories) ? rawCategories : [])
    .filter((category) => category.status == null || category.status === "active")
    .map((category) => ({
      ...category,
      product_count: counts.get(String(category.id)) || counts.get(String(category.name)) || 0,
    }))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  return { products, variants: Array.isArray(rawVariants) ? rawVariants : [], categories, settings };
}

async function fetchCatalogViaAction() {
  const response = await base44.functions.invoke("catalog", {});
  return shapeCatalog(response.data);
}

/**
 * Catalogue hook. With a configured Convex deployment it uses the native
 * reactive `catalog` query (instant admin→storefront updates). When Convex is
 * not configured it falls back to the built-in demo catalogue so the storefront
 * is never empty on a fresh Vercel deploy.
 */
export function useCatalog() {
  // Native reactive Convex query (preferred).
  const convexData = useConvexQuery(api.catalog, {});

  // TanStack query used only when Convex is unconfigured.
  const fallback = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: async () => {
      // Try the action once; if it fails/unconfigured, use the built-in catalog.
      if (!convexConfigured) return shapeCatalog(buildFallbackCatalog());
      try {
        const data = await fetchCatalogViaAction();
        if (data.products?.length) return data;
        return shapeCatalog(buildFallbackCatalog());
      } catch (e) {
        console.warn("Catalogo Convex non disponibile, uso catalogo integrato:", e?.message);
        return shapeCatalog(buildFallbackCatalog());
      }
    },
    enabled: !convexConfigured,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  if (convexConfigured) {
    // Reactive path. If the deployment has no products yet (no seed), fall back
    // to the demo catalogue so the site still renders.
    if (convexData && Array.isArray(convexData.products) && convexData.products.length > 0) {
      const shaped = shapeCatalog(convexData);
      return {
        ...shaped,
        loading: false,
        refreshing: false,
        error: null,
        reload: async () => shaped,
        configured: true,
        ready: true,
      };
    }
    if (convexData === undefined) {
      return { ...EMPTY, loading: true, refreshing: false, error: null, reload: async () => {}, configured: true, ready: false };
    }
    // Convex reachable but empty → demo fallback.
    const fb = shapeCatalog(buildFallbackCatalog());
    return { ...fb, loading: false, refreshing: false, error: null, reload: async () => fb, configured: true, ready: true, source: "fallback" };
  }

  return {
    products: fallback.data?.products ?? [],
    variants: fallback.data?.variants ?? [],
    categories: fallback.data?.categories ?? [],
    settings: fallback.data?.settings ?? {},
    loading: fallback.isPending,
    refreshing: fallback.isFetching && !fallback.isPending,
    error: fallback.error,
    reload: fallback.refetch,
    configured: false,
    ready: fallback.isSuccess,
  };
}

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
