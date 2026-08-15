import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

const MAX_PRODUCTS = 500;
const MAX_VARIANTS = 2000;
const MAX_CATEGORIES = 200;
const MAX_SETTINGS = 100;
const PUBLIC_SETTING_KEYS = new Set([
  'store_name',
  'store_currency',
  'free_shipping_threshold',
  'shipping_flat_rate',
]);

function eurosToCents(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
}

function publicSettings(records) {
  const values = Object.fromEntries(
    records
      .filter(setting => PUBLIC_SETTING_KEYS.has(setting.key))
      .map(setting => [setting.key, setting.value]),
  );
  return {
    store_name: String(values.store_name || ''),
    currency: String(values.store_currency || 'EUR').toUpperCase(),
    free_shipping_threshold_cents: eurosToCents(values.free_shipping_threshold),
    shipping_flat_rate_cents: eurosToCents(values.shipping_flat_rate),
  };
}

function publicProduct(product) {
  const {
    cost_cents: _costCents,
    low_stock_threshold: _lowStockThreshold,
    shopify_product_id: _shopifyProductId,
    synced_at: _syncedAt,
    ...safe
  } = product;
  return safe;
}

function publicVariant(variant) {
  const {
    cost_cents: _costCents,
    low_stock_threshold: _lowStockThreshold,
    barcode: _barcode,
    shopify_product_id: _shopifyProductId,
    shopify_variant_id: _shopifyVariantId,
    synced_at: _syncedAt,
    ...safe
  } = variant;
  return safe;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const [products, variants, categories, settings] = await Promise.all([
      base44.asServiceRole.entities.Product.list('-sort_order', MAX_PRODUCTS),
      base44.asServiceRole.entities.ProductVariant.list('sort_order', MAX_VARIANTS),
      base44.asServiceRole.entities.Category.list('sort_order', MAX_CATEGORIES),
      base44.asServiceRole.entities.Setting.list('key', MAX_SETTINGS),
    ]);

    const visibleProducts = products.filter(product => product.status == null || product.status === 'active');
    const visibleProductIds = new Set(visibleProducts.map(product => String(product.id)));
    const visibleVariants = variants.filter(variant => (
      visibleProductIds.has(String(variant.product_id))
      && (variant.status == null || variant.status === 'active')
    ));
    const visibleCategories = categories.filter(category => category.status == null || category.status === 'active');

    return Response.json({
      products: visibleProducts.map(publicProduct),
      variants: visibleVariants.map(publicVariant),
      categories: visibleCategories,
      settings: publicSettings(settings),
    }, {
      headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('catalog error:', error);
    return Response.json({ error: 'Catalogo temporaneamente non disponibile' }, { status: 500 });
  }
}
