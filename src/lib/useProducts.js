// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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

// Catalogue loader. Calls the Convex `catalog` action through the adapter.
// Any failure (unconfigured URL, empty deployment, network error) falls back to
// the built-in demo catalogue, so the storefront never shows an error page.
export async function fetchCatalog() {
  try {
    const response = await base44.functions.invoke("catalog", {});
    const data = response?.data;
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      return shapeCatalog(data);
    }
  } catch (e) {
    console.warn("Catalogo Convex non disponibile, uso catalogo integrato:", e?.message);
  }
  return shapeCatalog(buildFallbackCatalog());
}

export function useCatalog() {
  const query = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalog,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
  const data = query.data || EMPTY;
  return {
    products: data.products ?? [],
    variants: data.variants ?? [],
    categories: data.categories ?? [],
    settings: data.settings ?? {},
    loading: query.isPending,
    refreshing: query.isFetching && !query.isPending,
    error: query.error,
    reload: query.refetch,
    configured: true,
    ready: query.isSuccess,
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
