// Shared order presentation helpers used by the storefront confirmation and
// tracking pages. Pure functions only: they are unit tested in
// tests/orders.test.js and must never import app state or the SDK.

export const ORDER_FLOW = ['pending', 'paid', 'shipped', 'delivered'];

export const ORDER_STATUS_LABELS = {
  pending: 'In attesa di pagamento',
  paid: 'Pagato',
  shipped: 'Spedito',
  delivered: 'Consegnato',
  cancelled: 'Annullato',
  refunded: 'Rimborsato',
};

export const ORDER_STATUS_TONES = {
  pending: 'text-[#b45309] bg-[#fff4e5]',
  paid: 'text-[#248a3d] bg-[#eaf7ed]',
  shipped: 'text-[#0066cc] bg-[#e8f2ff]',
  delivered: 'text-[#248a3d] bg-[#eaf7ed]',
  cancelled: 'text-[#d70015] bg-[#ffebe8]',
  refunded: 'text-[#6e6e73] bg-[#f5f5f7]',
};

const FLOW_DATES = {
  pending: 'created_date',
  paid: 'paid_at',
  shipped: 'shipped_date',
  delivered: 'delivered_date',
};

/**
 * Build a presentation timeline from an order. Steps keep the catalog flow
 * order regardless of which timestamps are present; terminal states
 * (cancelled/refunded) collapse the timeline into a single marker.
 */
export function buildOrderTimeline(order) {
  if (!order) return [];
  const status = String(order.status || 'pending');
  if (status === 'cancelled' || status === 'refunded') {
    return [{
      key: status,
      label: ORDER_STATUS_LABELS[status] || status,
      state: 'current',
      date: order.cancelled_at || order.updated_date || order.created_date || null,
      terminal: true,
    }];
  }
  const currentIndex = Math.max(0, ORDER_FLOW.indexOf(status));
  return ORDER_FLOW.map((step, index) => {
    const rawDate = order[FLOW_DATES[step]] || (step === 'pending' ? order.created_date : null);
    let state = 'todo';
    if (index < currentIndex) state = 'done';
    else if (index === currentIndex) state = 'current';
    return {
      key: step,
      label: ORDER_STATUS_LABELS[step] || step,
      state,
      date: rawDate || null,
      terminal: false,
    };
  });
}

/** Mask an email for display: `marco.rossi@gmail.com` → `m*******@gmail.com`. */
export function maskEmail(email) {
  const value = String(email || '').trim();
  const at = value.indexOf('@');
  if (!value || at <= 0) return '';
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const head = local.slice(0, 1);
  return `${head}${local.length > 1 ? '*******' : ''}@${domain}`;
}

export const CARRIER_LINKS = {
  DHL: (code) => `https://www.dhl.com/it-it/home/tracking.html?tracking-id=${encodeURIComponent(code)}`,
  UPS: (code) => `https://www.ups.com/track?tracknum=${encodeURIComponent(code)}`,
  FedEx: (code) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(code)}`,
  BRT: (code) => `https://www.brt.it/it/tracking-spedizione?codice=${encodeURIComponent(code)}`,
  'Poste Italiane': (code) => `https://www.poste.it/cerca/invii?codice=${encodeURIComponent(code)}`,
  SDA: (code) => `https://www.sda.it/wps/portal/SDA_IT/ricerca-spedizioni?locale=it&cercaSpedizioni.idSpedizione=${encodeURIComponent(code)}`,
};

export function carrierTrackingUrl(carrier, trackingNumber) {
  const builder = CARRIER_LINKS[String(carrier || '').trim()];
  const code = String(trackingNumber || '').trim();
  return builder && code ? builder(code) : '';
}

/** Human readable line for an order item snapshot, e.g. `iPhone 17 Pro · 256 GB · Nero`. */
export function orderItemLabel(item) {
  const name = String(item?.name || 'Prodotto');
  const options = Object.values(item?.option_values || {}).filter(Boolean).join(' · ');
  return options ? `${name} · ${options}` : name;
}

/**
 * Pick related products for a product page: same category first, then the
 * same family/brand, excluding the current product, preferring in-stock and
 * featured items, capped at `limit`.
 */
export function relatedProducts(products, current, { limit = 4 } = {}) {
  if (!current || !Array.isArray(products)) return [];
  const id = String(current.id);
  const category = String(current.category || '').trim().toLowerCase();
  const family = String(current.family || '').trim().toLowerCase();
  const brand = String(current.brand || '').trim().toLowerCase();

  const score = (product) => {
    if (String(product.id) === id) return -1;
    let points = 0;
    if (category && String(product.category || '').trim().toLowerCase() === category) points += 4;
    if (family && String(product.family || '').trim().toLowerCase() === family) points += 2;
    if (brand && String(product.brand || '').trim().toLowerCase() === brand) points += 1;
    if (product.in_stock) points += 1;
    if (product.featured) points += 1;
    return points;
  };

  return products
    .map(product => ({ product, points: score(product) }))
    .filter(entry => entry.points > 0)
    .sort((a, b) => b.points - a.points || String(a.product.name).localeCompare(String(b.product.name)))
    .slice(0, limit)
    .map(entry => entry.product);
}

/** Format an ISO date in Italian without timezone surprises (dd/mm/yyyy, hh:mm). */
export function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
