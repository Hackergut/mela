import { formatPriceCents, hydrateProducts, slugifyCatalogValue } from "../catalog.js";

/** Convert a Shopify MoneyV2 (or a numeric string) to integer cents. */
export function moneyToCents(money) {
  if (money == null) return 0;
  const raw = typeof money === "object" ? money.amount : money;
  const amount = Number.parseFloat(String(raw ?? ""));
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

export function shopifyGidId(gid) {
  const value = String(gid || "");
  const parts = value.split("/");
  return parts[parts.length - 1] || value;
}

function uniqueUrls(urls) {
  return [...new Set((urls || []).filter(Boolean))];
}

function variantStock(node) {
  const qty = Number(node?.quantityAvailable);
  if (Number.isFinite(qty)) return Math.max(0, Math.trunc(qty));
  return node?.availableForSale ? 99 : 0;
}

/**
 * Map a Storefront API ProductVariant node to the TechMania variant shape.
 * `id` stays the Shopify GID so cart mutations can use it directly.
 */
export function mapShopifyVariant(node, productId) {
  const optionValues = Object.fromEntries(
    (node?.selectedOptions || [])
      .map((option) => [String(option?.name || "").trim(), String(option?.value || "").trim()])
      .filter(([name, value]) => name && value && value !== "Default Title"),
  );
  const title = node?.title && node.title !== "Default Title" ? node.title : "Standard";
  const image = node?.image?.url || "";
  return {
    id: String(node?.id || ""),
    product_id: String(productId || ""),
    title,
    sku: String(node?.sku || "").trim(),
    option_values: optionValues,
    price_cents: moneyToCents(node?.price),
    compare_at_cents: moneyToCents(node?.compareAtPrice),
    cost_cents: 0,
    stock: variantStock(node),
    low_stock_threshold: 0,
    image,
    images: image ? [image] : [],
    status: "active",
    is_default: false,
    sort_order: 0,
    shopify_variant_id: String(node?.id || ""),
    availableForSale: Boolean(node?.availableForSale),
  };
}

/**
 * Map a Storefront API Product node to a raw product + its variants.
 * Product `id` is the handle so storefront URLs stay readable.
 */
export function mapShopifyProduct(node) {
  const handle = String(node?.handle || slugifyCatalogValue(node?.title) || shopifyGidId(node?.id));
  const collection = node?.collections?.nodes?.[0];
  const category = String(node?.productType || collection?.title || "Store").trim() || "Store";
  const featured = node?.featuredImage?.url || "";
  const gallery = uniqueUrls([
    featured,
    ...(node?.images?.nodes || []).map((image) => image?.url),
    ...(node?.variants?.nodes || []).map((variant) => variant?.image?.url),
  ]);
  const tags = Array.isArray(node?.tags) ? node.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  const product = {
    id: handle,
    shopify_id: String(node?.id || ""),
    name: String(node?.title || "Prodotto"),
    slug: handle,
    subtitle: String(node?.vendor || "").trim(),
    brand: String(node?.vendor || "").trim(),
    family: category,
    sku: "",
    description: String(node?.description || "").trim(),
    status: "active",
    badge: tags.includes("new") || tags.includes("nuovo") ? "Nuovo" : (tags[0] || null),
    category,
    category_id: collection?.id || `cat-${slugifyCatalogValue(category)}`,
    option_names: [],
    featured: tags.includes("featured") || tags.includes("in evidenza"),
    compare_group: category,
    specs: {},
    image: featured || gallery[0] || "",
    images: gallery,
    colors: [],
    source: "shopify",
    handle,
    availableForSale: Boolean(node?.availableForSale),
    tags,
  };

  const variants = (node?.variants?.nodes || []).map((variant, index) => ({
    ...mapShopifyVariant(variant, handle),
    is_default: index === 0,
    sort_order: index,
    image: variant?.image?.url || product.image,
    images: uniqueUrls([variant?.image?.url, product.image, ...gallery]),
  }));

  if (variants[0]?.sku) product.sku = variants[0].sku;
  return { product, variants };
}

export function categoriesFromProducts(products) {
  const seen = new Map();
  for (const product of products) {
    const name = String(product.category || "").trim();
    if (!name) continue;
    const id = String(product.category_id || `cat-${slugifyCatalogValue(name)}`);
    if (seen.has(id) || [...seen.values()].some((category) => category.name === name)) {
      const existing = seen.get(id) || [...seen.values()].find((category) => category.name === name);
      if (existing) existing.product_count = (existing.product_count || 0) + 1;
      continue;
    }
    seen.set(id, {
      id,
      name,
      slug: slugifyCatalogValue(name),
      description: `Scopri tutti i prodotti ${name}.`,
      status: "active",
      featured: false,
      image: product.image || "",
      sort_order: seen.size * 10,
      product_count: 1,
    });
  }
  return [...seen.values()];
}

/**
 * Turn a Storefront `products.nodes` payload into the catalogue shape used
 * by `useCatalog` / `hydrateProducts`.
 */
export function shapeShopifyCatalog(payload, extraSettings = {}) {
  const nodes = Array.isArray(payload)
    ? payload
    : (payload?.products?.nodes || (payload?.product ? [payload.product] : []));
  const products = [];
  const variants = [];
  for (const node of nodes) {
    if (!node) continue;
    const mapped = mapShopifyProduct(node);
    products.push(mapped.product);
    variants.push(...mapped.variants);
  }
  const hydrated = hydrateProducts(products, variants);
  const currency = nodes[0]?.priceRange?.minVariantPrice?.currencyCode
    || extraSettings.currency
    || "EUR";
  return {
    products: hydrated,
    variants,
    categories: categoriesFromProducts(hydrated),
    settings: {
      store_name: extraSettings.store_name || "Store",
      currency,
      free_shipping_threshold_cents: extraSettings.free_shipping_threshold_cents ?? 0,
      shipping_flat_rate_cents: extraSettings.shipping_flat_rate_cents ?? 0,
      bundle_discount_percent: extraSettings.bundle_discount_percent ?? 0,
      commerce_provider: "shopify",
      shopify_enabled: true,
    },
    source: "shopify",
  };
}

export function mapShopifyCartLine(line) {
  const merchandise = line?.merchandise || {};
  const product = merchandise.product || {};
  const handle = product.handle || shopifyGidId(product.id);
  const priceCents = moneyToCents(merchandise.price);
  const optionValues = Object.fromEntries(
    (merchandise.selectedOptions || [])
      .map((option) => [String(option?.name || "").trim(), String(option?.value || "").trim()])
      .filter(([name, value]) => name && value && value !== "Default Title"),
  );
  const stock = variantStock(merchandise);
  return {
    id: handle,
    line_id: String(line?.id || ""),
    product_id: handle,
    variant_id: String(merchandise.id || ""),
    sku: String(merchandise.sku || ""),
    name: String(product.title || "Prodotto"),
    variant_title: merchandise.title && merchandise.title !== "Default Title" ? merchandise.title : "",
    option_values: optionValues,
    options: optionValues,
    price_cents: priceCents,
    price: formatPriceCents(priceCents, { compact: true }),
    image: merchandise.image?.url || "",
    stock,
    qty: Math.max(1, Number(line?.quantity) || 1),
    unavailable: !merchandise.availableForSale && stock <= 0,
    shopify_line_id: String(line?.id || ""),
  };
}

export function mapShopifyCart(cart) {
  if (!cart) return { items: [], checkoutUrl: "", totalQuantity: 0, id: "" };
  return {
    id: cart.id || "",
    checkoutUrl: cart.checkoutUrl || "",
    totalQuantity: Number(cart.totalQuantity) || 0,
    subtotalCents: moneyToCents(cart.cost?.subtotalAmount),
    totalCents: moneyToCents(cart.cost?.totalAmount),
    items: (cart.lines?.nodes || []).map(mapShopifyCartLine),
  };
}
