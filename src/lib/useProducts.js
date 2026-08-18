import { useQuery } from "@tanstack/react-query";
import { base44, convexConfigured } from "@/api/base44Client";
import { hydrateProducts } from "@/lib/catalog";
import { buildFallbackCatalog } from "@/lib/fallbackCatalog";

export const CATALOG_QUERY_KEY = ["catalog", "public"];

const EMPTY = { products: [], variants: [], categories: [], settings: {} };

// Shape a raw Convex/fallback payload (products, variants, categories, settings)
// into the hydrated catalogue the storefront expects.
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

// Query the live Convex catalogue. On any error (not configured, network,
// empty deployment) it falls back to the built-in demo catalogue so the
// storefront is never empty (e.g. a Vercel deploy without VITE_CONVEX_URL).
export async function fetchCatalog() {
  if (!convexConfigured) {
    return shapeCatalog(buildFallbackCatalog());
  }
  try {
    const response = await base44.functions.invoke("catalog", {});
    const raw = response.data;
    // If the deployment exists but has no products yet (seed not run), use the
    // fallback so the site still renders until the team seeds Convex.
    if (!raw || !Array.isArray(raw.products) || raw.products.length === 0) {
      return shapeCatalog(buildFallbackCatalog());
    }
    return shapeCatalog(raw);
  } catch (error) {
    console.warn("Catalogo Convex non disponibile, uso catalogo integrato:", error?.message);
    return shapeCatalog(buildFallbackCatalog());
  }
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
    configured: convexConfigured,
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
