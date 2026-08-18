import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { hydrateProducts } from "@/lib/catalog";

export const CATALOG_QUERY_KEY = ["catalog", "public"];

// Fetches the public catalogue through the legacy invoke() surface, which the
// Convex adapter routes to the `catalog` action. This avoids a compile-time
// dependency on convex/_generated (created only once a deployment is linked)
// so the storefront works on Vercel as soon as VITE_CONVEX_URL is set.
export async function fetchCatalog() {
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
  const categories = (Array.isArray(rawCategories) ? rawCategories : [])
    .filter((category) => category.status == null || category.status === "active")
    .map((category) => ({
      ...category,
      product_count: counts.get(String(category.id)) || counts.get(String(category.name)) || 0,
    }))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
  return { products, variants: Array.isArray(rawVariants) ? rawVariants : [], categories, settings };
}

export function useCatalog() {
  const query = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalog,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
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
