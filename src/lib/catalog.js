export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  WITHDRAWN: 'withdrawn',
  DISCONTINUED: 'discontinued',
};

export const VARIANT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

export const isPublicProduct = (product) => (
  Boolean(product) && (product.status == null || product.status === PRODUCT_STATUS.ACTIVE)
);

export const filterPublicProducts = (products) => (
  Array.isArray(products) ? products.filter(isPublicProduct) : []
);

/** Convert common Italian and international display prices to integer cents. */
export function parsePriceCents(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value * 100) : 0;
  const input = String(value || '').replace(/[€\s]/g, '');
  if (!input) return 0;

  let normalized;
  if (input.includes(',')) {
    normalized = input.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(input)) {
    normalized = input.replace(/\./g, '');
  } else {
    normalized = input;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

export function formatPriceCents(value, { compact = false } = {}) {
  const cents = Number(value);
  if (!Number.isFinite(cents)) return '—';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: compact && cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function slugifyCatalogValue(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export function normalizeOptionValues(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, option]) => [String(key).trim(), String(option ?? '').trim()])
      .filter(([key, option]) => key && option),
  );
}

export function variantTitle(optionValues, fallback = 'Standard') {
  const values = Object.values(normalizeOptionValues(optionValues));
  return values.length > 0 ? values.join(' · ') : fallback;
}

export function variantOptionGroups(variants) {
  const groups = {};
  for (const variant of Array.isArray(variants) ? variants : []) {
    for (const [name, value] of Object.entries(normalizeOptionValues(variant?.option_values))) {
      if (!groups[name]) groups[name] = [];
      if (!groups[name].includes(value)) groups[name].push(value);
    }
  }
  return groups;
}

export function isActiveVariant(variant) {
  return Boolean(variant) && (variant.status == null || variant.status === VARIANT_STATUS.ACTIVE);
}

export function normalizeVariant(variant, product = {}) {
  const optionValues = normalizeOptionValues(variant?.option_values);
  const priceCents = Number.isSafeInteger(Number(variant?.price_cents))
    ? Number(variant.price_cents)
    : (Number(product.price_cents) || parsePriceCents(product.price));
  const stock = Math.max(0, Number(variant?.stock) || 0);

  return {
    ...variant,
    product_id: String(variant?.product_id || product.id || ''),
    title: String(variant?.title || variantTitle(optionValues)),
    sku: String(variant?.sku || product.sku || '').trim(),
    option_values: optionValues,
    price_cents: priceCents,
    compare_at_cents: Math.max(0, Number(variant?.compare_at_cents) || 0),
    cost_cents: Math.max(0, Number(variant?.cost_cents) || 0),
    stock,
    low_stock_threshold: Math.max(0, Number(variant?.low_stock_threshold ?? product.low_stock_threshold) || 0),
    image: variant?.image || product.image || '',
    images: Array.isArray(variant?.images) ? variant.images.filter(Boolean) : [],
    status: variant?.status || VARIANT_STATUS.ACTIVE,
    is_default: Boolean(variant?.is_default),
    sort_order: Number(variant?.sort_order) || 0,
  };
}

export function hydrateProducts(products, variants = []) {
  const byProduct = new Map();
  for (const rawVariant of Array.isArray(variants) ? variants : []) {
    const productId = String(rawVariant?.product_id || '');
    if (!productId) continue;
    const list = byProduct.get(productId) || [];
    list.push(rawVariant);
    byProduct.set(productId, list);
  }

  return filterPublicProducts(products).map((product) => {
    const relationalVariants = (byProduct.get(String(product.id)) || [])
      .map((variant) => normalizeVariant(variant, product))
      .filter(isActiveVariant)
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || a.sort_order - b.sort_order);
    const legacyPrice = Number(product.price_cents) || parsePriceCents(product.price);
    const legacyStock = Math.max(0, Number(product.stock) || 0);
    const syntheticVariant = normalizeVariant({
      id: '',
      product_id: product.id,
      title: 'Standard',
      sku: product.sku,
      price_cents: legacyPrice,
      stock: legacyStock,
      image: product.image,
      is_default: true,
      legacy: true,
    }, product);
    const normalizedVariants = relationalVariants.length > 0 ? relationalVariants : [syntheticVariant];
    const purchasableVariants = normalizedVariants.filter((variant) => variant.price_cents >= 50);
    const defaultVariant = purchasableVariants.find((variant) => variant.is_default)
      || purchasableVariants.find((variant) => variant.stock > 0)
      || purchasableVariants[0]
      || normalizedVariants[0]
      || null;
    const prices = purchasableVariants.map((variant) => variant.price_cents);
    const minPriceCents = prices.length > 0 ? Math.min(...prices) : legacyPrice;
    const maxPriceCents = prices.length > 0 ? Math.max(...prices) : legacyPrice;
    const aggregateStock = relationalVariants.length > 0
      ? relationalVariants.reduce((sum, variant) => sum + variant.stock, 0)
      : legacyStock;
    const inStock = relationalVariants.length > 0 ? aggregateStock > 0 : (product.stock == null || aggregateStock > 0);

    return {
      ...product,
      slug: product.slug || slugifyCatalogValue(product.name),
      variants: normalizedVariants,
      default_variant: defaultVariant,
      has_variants: relationalVariants.length > 0,
      min_price_cents: minPriceCents,
      max_price_cents: maxPriceCents,
      price_min_cents: minPriceCents,
      price_max_cents: maxPriceCents,
      price_cents: defaultVariant?.price_cents || legacyPrice,
      price: minPriceCents > 0
        ? `${minPriceCents !== maxPriceCents ? 'Da ' : ''}${formatPriceCents(minPriceCents, { compact: true })}`
        : product.price,
      stock: aggregateStock,
      available: inStock,
      in_stock: inStock,
      image: defaultVariant?.image || product.image,
    };
  });
}

export function getCartLineId(productId, variantId = '') {
  return `${String(productId)}::${String(variantId || 'default')}`;
}

export function buildCartLine(product, variant = null, quantity = 1) {
  if (!product?.id) return null;
  const selectedVariant = variant ? normalizeVariant(variant, product) : product.default_variant;
  const variantId = selectedVariant?.id && !selectedVariant?.legacy ? String(selectedVariant.id) : '';
  const stock = Math.max(0, Number(selectedVariant ? selectedVariant.stock : product.stock) || 0);
  const requestedQuantity = Math.max(1, Math.trunc(Number(quantity) || 1));
  const priceCents = selectedVariant?.price_cents || Number(product.price_cents) || parsePriceCents(product.price);
  const optionValues = selectedVariant?.option_values || {};

  return {
    id: String(product.id),
    line_id: getCartLineId(product.id, variantId),
    product_id: String(product.id),
    variant_id: variantId,
    sku: selectedVariant?.sku || product.sku || '',
    name: product.name,
    variant_title: selectedVariant?.title || '',
    option_values: optionValues,
    options: optionValues,
    price_cents: priceCents,
    price: formatPriceCents(priceCents, { compact: true }),
    image: selectedVariant?.image || product.image,
    stock,
    qty: stock > 0 ? Math.min(requestedQuantity, stock) : requestedQuantity,
  };
}
