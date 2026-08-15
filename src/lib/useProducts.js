import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { hydrateProducts } from '@/lib/catalog';
import { appParams } from '@/lib/app-params';

export const CATALOG_QUERY_KEY = ['catalog', 'public'];
const EMPTY_CATALOG = { products: [], variants: [], categories: [], settings: {} };

export const fetchCatalog = async () => {
  const response = await base44.functions.invoke('catalog', {});
  const rawProducts = response.data?.products;
  const rawVariants = response.data?.variants;
  const rawCategories = response.data?.categories;
  const settings = response.data?.settings && typeof response.data.settings === 'object'
    ? response.data.settings
    : {};
  const products = hydrateProducts(
    /** @type {any[]} */ (Array.isArray(rawProducts) ? rawProducts : []),
    /** @type {any[]} */ (Array.isArray(rawVariants) ? rawVariants : []),
  );
  const categoryRecords = /** @type {any[]} */ (Array.isArray(rawCategories) ? rawCategories : []);
  const counts = products.reduce((map, product) => {
    const key = product.category_id || product.category;
    if (key) map.set(String(key), (map.get(String(key)) || 0) + 1);
    return map;
  }, new Map());
  const categories = categoryRecords
    .filter((category) => category.status == null || category.status === 'active')
    .map((category) => ({
      ...category,
      product_count: counts.get(String(category.id)) || counts.get(String(category.name)) || 0,
    }))
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

  return { products, variants: Array.isArray(rawVariants) ? rawVariants : [], categories, settings };
};

/** Shared catalogue query used by storefront pages and homepage sections. */
export function useCatalog() {
  const hasCatalogConfiguration = Boolean(appParams.appId);
  const query = useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: fetchCatalog,
    enabled: hasCatalogConfiguration,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  return {
    products: query.data?.products ?? [],
    variants: query.data?.variants ?? [],
    categories: query.data?.categories ?? [],
    settings: query.data?.settings ?? {},
    loading: hasCatalogConfiguration && query.isPending,
    refreshing: hasCatalogConfiguration && query.isFetching && !query.isPending,
    error: hasCatalogConfiguration ? query.error : null,
    reload: hasCatalogConfiguration ? query.refetch : async () => ({ data: EMPTY_CATALOG }),
    configured: hasCatalogConfiguration,
    ready: hasCatalogConfiguration && query.isSuccess,
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
