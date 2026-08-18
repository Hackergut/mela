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

// Public order lookup rate limiting: the endpoint accepts a high-entropy
// checkout session id or an order number + email pair, so brute-force
// enumeration is throttled per client (20 lookups / 10 minutes).
const LOOKUP_MAX_REQUESTS = 20;
const LOOKUP_WINDOW_MS = 10 * 60 * 1000;
/** @type {Map<string, number[]>} */
const lookupHits = new Map();

function lookupRateLimited(key) {
  const now = Date.now();
  const hits = (lookupHits.get(key) || []).filter(time => now - time < LOOKUP_WINDOW_MS);
  if (hits.length >= LOOKUP_MAX_REQUESTS) {
    lookupHits.set(key, hits);
    return true;
  }
  hits.push(now);
  lookupHits.set(key, hits);
  if (lookupHits.size > 5000) lookupHits.clear();
  return false;
}

function clientKey(req) {
  const forwarded = String(req.headers?.get?.('x-forwarded-for') || '');
  const ip = forwarded.split(',')[0].trim() || String(req.headers?.get?.('cf-connecting-ip') || '').trim();
  return ip || 'unknown';
}

function maskEmail(email) {
  const value = String(email || '').trim();
  const at = value.indexOf('@');
  if (!value || at <= 0) return '';
  const local = value.slice(0, at);
  return `${local.slice(0, 1)}${local.length > 1 ? '*******' : ''}@${value.slice(at + 1)}`;
}

// Only fields a customer may see about their own order. Stripe identifiers,
// receipt internals and the raw email are never returned.
function publicOrder(order) {
  const items = (Array.isArray(order.items) ? order.items : []).map(item => ({
    name: String(item?.name || ''),
    sku: String(item?.sku || ''),
    image: String(item?.image || ''),
    option_values: item?.option_values && typeof item.option_values === 'object' ? item.option_values : {},
    price_cents: Math.max(0, Number(item?.price_cents) || 0),
    qty: Math.max(1, Number(item?.qty) || 1),
  }));
  return {
    order_number: String(order.order_number || ''),
    status: String(order.status || 'pending'),
    customer_name: String(order.customer_name || ''),
    customer_email_masked: maskEmail(order.customer_email),
    items,
    subtotal_cents: Math.max(0, Number(order.subtotal_cents) || 0),
    discount_amount_cents: Math.max(0, Number(order.discount_amount_cents) || 0),
    discount_code: order.discount_code ? String(order.discount_code) : null,
    shipping_cents: Math.max(0, Number(order.shipping_cents) || 0),
    total_cents: Math.max(0, Number(order.total_cents) || 0),
    shipping_name: String(order.shipping_name || ''),
    shipping_address: order.shipping_address && typeof order.shipping_address === 'object' ? order.shipping_address : {},
    tracking_number: order.tracking_number ? String(order.tracking_number) : '',
    carrier: order.carrier ? String(order.carrier) : '',
    paid_at: order.paid_at || null,
    shipped_date: order.shipped_date || null,
    delivered_date: order.delivered_date || null,
    created_date: order.created_date || null,
  };
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

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Public order lookup: confirmation page (high-entropy checkout session id)
    // and guest tracking (order number + email). Generic errors avoid leaking
    // whether an order exists.
    if (body?.operation === 'order_lookup') {
      if (lookupRateLimited(clientKey(req))) {
        return Response.json({ error: 'Troppe ricerche. Riprova più tardi.' }, { status: 429 });
      }
      const sessionId = String(body.session_id || '').trim().slice(0, 255);
      const orderNumber = String(body.order_number || '').trim().toUpperCase().slice(0, 64);
      const email = String(body.email || '').trim().toLowerCase().slice(0, 254);

      const Orders = base44.asServiceRole.entities.Order;
      let order = null;
      if (/^cs_(test|live)_/.test(sessionId)) {
        const matches = await Orders.filter({ stripe_session_id: sessionId });
        order = matches[0] || null;
      } else if (/^TM-[A-Z0-9-]{2,40}$/.test(orderNumber) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const matches = await Orders.filter({ order_number: orderNumber });
        order = matches.find(candidate => String(candidate.customer_email || '').trim().toLowerCase() === email) || null;
      }
      if (!order) {
        return Response.json({ error: 'Ordine non trovato. Controlla il numero ordine e l’email usata al checkout.' }, { status: 404 });
      }
      return Response.json({ order: publicOrder(order) }, { headers: { 'Cache-Control': 'no-store' } });
    }

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
