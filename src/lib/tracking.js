// @ts-nocheck
// Unified e-commerce tracking layer. It translates standard events
// (view_item, add_to_cart, begin_checkout, purchase) into the vendor-specific
// calls for every integration that is configured and has injected its tag
// (GA4, Google Ads, Meta, TikTok, Bing, GTM).
//
// The IntegrationBoot component exposes the resolved public config on
// window.__TM_INTEGRATIONS__. Every function is a safe no-op when a vendor is
// not configured or its SDK has not loaded, so call sites never need guards.

const CURRENCY = 'EUR';

function config() {
  if (typeof window === 'undefined') return {};
  return window.__TM_INTEGRATIONS__ || {};
}

function gtag() {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...arguments);
  }
}

function pushDataLayer(event, data) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ecommerce: data, ...data });
}

function valueCents(item) {
  const cents = Number(item.price_cents);
  return Number.isFinite(cents) ? cents / 100 : 0;
}

function normalizeItem(input, index = 0) {
  const item = input || {};
  const product = item.product || item;
  const variant = item.variant || null;
  const qty = Number(item.qty || 1);
  const price = valueCents(variant && variant.price_cents != null ? variant : product);
  return {
    item_id: String(variant?.sku || product?.sku || product?.id || ''),
    item_name: String(product?.name || 'Prodotto'),
    affiliation: 'TechMania Store',
    coupon: '',
    discount: 0,
    index,
    item_brand: String(product?.brand || ''),
    item_category: String(product?.category || ''),
    item_variant: String(variant?.title || item?.variant_title || ''),
    price,
    quantity: qty,
  };
}

function normalizeItems(cartItems) {
  return (Array.isArray(cartItems) ? cartItems : []).map((item, i) => normalizeItem(item, i));
}

function valueOf(items) {
  return Math.round((items || []).reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0) * 100) / 100;
}

// Generic event dispatch to every configured analytics vendor.
function ecommerceEvent(eventName, params) {
  const c = config();
  const items = params.items || [];
  const value = params.value != null ? params.value : valueOf(items);
  const base = { currency: CURRENCY, value, ...params, items };

  // Google Analytics 4 + Google Ads share the gtag() queue.
  if (c.google_analytics?.measurement_id) {
    gtag('event', eventName, { ...base, send_to: c.google_analytics.measurement_id });
  }
  if (c.google_ads?.conversion_id) {
    gtag('event', eventName, { ...base, send_to: c.google_ads.conversion_id });
  }

  // Meta Pixel.
  if (c.meta_pixel?.pixel_id && typeof window.fbq === 'function') {
    const fbEvent = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      view_item_list: 'ViewContent',
    }[eventName];
    if (fbEvent) {
      window.fbq('track', fbEvent, {
        content_ids: items.map((it) => it.item_id).filter(Boolean),
        content_name: items.length === 1 ? items[0].item_name : undefined,
        content_type: 'product',
        value,
        currency: CURRENCY,
        num_items: items.reduce((s, it) => s + (it.quantity || 1), 0),
      });
    }
  }

  // TikTok Pixel.
  if (c.tiktok_pixel?.pixel_id && typeof window.ttq === 'object') {
    const ttEvent = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'CompletePayment',
    }[eventName];
    if (ttEvent) {
      window.ttq.track(ttEvent, {
        contents: items.map((it) => ({ content_id: it.item_id, content_name: it.item_name, content_category: it.item_category, content_type: 'product', price: it.price, quantity: it.quantity })),
        value,
        currency: CURRENCY,
      });
    }
  }

  // Microsoft Advertising UET.
  if (c.bing_ads?.tag_id && typeof window.uetq === 'object') {
    const bingEvent = {
      view_item: 'product_view',
      add_to_cart: 'add_to_cart',
      begin_checkout: 'begin_checkout',
      purchase: 'purchase',
    }[eventName];
    if (bingEvent) {
      window.uetq.push('event', bingEvent, {
        event_category: 'ecommerce',
        event_value: value,
        event_label: items.length === 1 ? items[0].item_name : eventName,
        currency: CURRENCY,
        ...(params.transaction_id ? { transaction_id: params.transaction_id } : {}),
      });
    }
  }

  // GTM always receives the normalized GA4-style event so marketers can route
  // it to any tag from the GTM UI.
  pushDataLayer(eventName, base);
}

export const tracking = {
  /** View a product detail page. Pass the hydrated product + selected variant. */
  viewItem(product, variant) {
    const item = normalizeItem({ product, variant, qty: 1 });
    ecommerceEvent('view_item', { items: [item], value: item.price });
  },
  /** Add one (or more) units to the cart. */
  addToCart(product, variant, quantity = 1) {
    const item = normalizeItem({ product, variant, qty: quantity });
    ecommerceEvent('add_to_cart', { items: [item], value: item.price * quantity });
  },
  /** Remove a line from the cart. */
  removeFromCart(product, variant, quantity = 1) {
    const item = normalizeItem({ product, variant, qty: quantity });
    ecommerceEvent('remove_from_cart', { items: [item], value: item.price * quantity });
  },
  /** Begin the Stripe checkout flow. */
  beginCheckout(cartItems, opts = {}) {
    const items = normalizeItems(cartItems);
    ecommerceEvent('begin_checkout', { items, value: valueOf(items), coupon: opts.coupon || '' });
  },
  /** Completed purchase. `cartItems` should be the snapshot taken before redirect. */
  purchase(cartItems, opts = {}) {
    const items = normalizeItems(cartItems);
    ecommerceEvent('purchase', {
      items,
      value: opts.value != null ? opts.value : valueOf(items),
      transaction_id: opts.transaction_id || '',
      coupon: opts.coupon || '',
      shipping: opts.shipping || 0,
      tax: opts.tax || 0,
    });
  },
  /** Generic product list impression (e.g. catalog grid). */
  viewItemList(products, listName = 'Catalogo') {
    const items = (products || []).map((p, i) => normalizeItem({ product: p, qty: 1 }, i));
    ecommerceEvent('view_item_list', { item_list_name: listName, items, value: valueOf(items) });
  },
};

export default tracking;