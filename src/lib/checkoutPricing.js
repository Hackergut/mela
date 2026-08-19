import { buildFallbackCatalog } from "./fallbackCatalog.js";
import { hydrateProducts } from "./catalog.js";

export const MIN_CENTS = 50;
export const MAX_LINES = 25;
export const MAX_QTY = 10;
export const MAX_ACCESSORIES = 3;

export function loadPricedCatalog() {
  const raw = buildFallbackCatalog();
  return {
    products: hydrateProducts(raw.products, raw.variants),
    settings: raw.settings || {},
  };
}

export function normalizeCheckoutInput(payload = {}) {
  const rawLines = Array.isArray(payload.items) && payload.items.length
    ? payload.items
    : [{ productId: payload.productId, variantId: payload.variantId, quantity: payload.quantity || 1 }];
  if (!rawLines.length || rawLines.length > MAX_LINES) {
    throw Object.assign(new Error("Parametri non validi"), { status: 400 });
  }
  const merged = new Map();
  for (const line of rawLines) {
    const productId = String(line?.productId || "").trim();
    const variantId = String(line?.variantId || "").trim();
    const qty = Number(line?.quantity || 1);
    if (!productId || productId.length > 128 || variantId.length > 160 || !Number.isSafeInteger(qty) || qty < 1) {
      throw Object.assign(new Error("Parametri non validi"), { status: 400 });
    }
    const key = `${productId}::${variantId || "default"}`;
    const next = (merged.get(key)?.quantity || 0) + qty;
    if (next > MAX_QTY) throw Object.assign(new Error("Quantità non valida"), { status: 400 });
    merged.set(key, { productId, variantId, quantity: next });
  }
  const accessories = Array.isArray(payload.bundle_accessories)
    ? payload.bundle_accessories.slice(0, MAX_ACCESSORIES).map((item) => ({
      productId: String(item.productId || "").trim(),
      variantId: String(item.variantId || "").trim(),
    })).filter((item) => item.productId)
    : [];
  return { lines: [...merged.values()], accessories, discountCode: String(payload.discountCode || "").trim().toUpperCase() };
}

function resolveProductLine(requested, products, { isAccessory = false } = {}) {
  const product = products.find((item) => String(item.id) === String(requested.productId));
  if (!product) throw Object.assign(new Error("Un prodotto non è più disponibile"), { status: 404 });
  const variants = Array.isArray(product.variants) ? product.variants : [];
  let variant = null;
  if (variants.length) {
    variant = requested.variantId
      ? variants.find((item) => String(item.id) === String(requested.variantId))
      : product.default_variant || variants.find((item) => item.status === "active");
    if (!variant) throw Object.assign(new Error(`Seleziona una variante per ${product.name}`), { status: 409 });
    if (Number(variant.stock) < (isAccessory ? 1 : requested.quantity)) {
      throw Object.assign(new Error(`Stock insufficiente per ${product.name}`), { status: 409 });
    }
  }
  const unit = Number(variant?.price_cents ?? product.price_cents);
  if (!Number.isSafeInteger(unit) || unit < MIN_CENTS) {
    throw Object.assign(new Error(`Prezzo non disponibile per ${product.name}`), { status: 400 });
  }
  const optionValues = variant?.option_values && typeof variant.option_values === "object" ? variant.option_values : {};
  const label = Object.values(optionValues).filter(Boolean).join(" · ");
  return {
    product,
    variant,
    unit,
    line: {
      product_id: String(product.id),
      variant_id: variant ? String(variant.id) : "",
      name: `${product.name}${label ? ` — ${label}` : ""}`,
      sku: String(variant?.sku || product.sku || ""),
      option_values: optionValues,
      image: variant?.image || product.image || "",
      price_cents: unit,
      qty: isAccessory ? 1 : requested.quantity,
    },
  };
}

export function quoteCheckout(payload, catalog = loadPricedCatalog()) {
  const { lines, accessories } = normalizeCheckoutInput(payload);
  const products = catalog.products || [];
  const settings = catalog.settings || {};
  const orderItems = [];
  let mainUnit = 0;
  for (const requested of lines) {
    const resolved = resolveProductLine(requested, products);
    orderItems.push(resolved.line);
    mainUnit = resolved.unit;
  }
  const bundlePercent = Math.min(15, Math.max(0, Math.trunc(Number(settings.bundle_discount_percent) || 0)));
  let bundleDiscount = 0;
  if (accessories.length) {
    if (lines.length !== 1) throw Object.assign(new Error("Il bundle è disponibile solo con un prodotto principale"), { status: 400 });
    for (const accessory of accessories) {
      if (accessory.productId === lines[0].productId) continue;
      const resolved = resolveProductLine(accessory, products, { isAccessory: true });
      if (resolved.unit > mainUnit) {
        throw Object.assign(new Error(`${resolved.product.name} non è eleggibile come accessorio del bundle`), { status: 400 });
      }
      const discounted = bundlePercent > 0 ? Math.max(MIN_CENTS, Math.round(resolved.unit * (100 - bundlePercent) / 100)) : resolved.unit;
      bundleDiscount += resolved.unit - discounted;
      orderItems.push({ ...resolved.line, price_cents: discounted, bundle_accessory: true });
    }
  }
  const subtotal = orderItems.reduce((sum, item) => sum + item.price_cents * item.qty, 0);
  const shippingCents = Math.max(0, Number(settings.shipping_flat_rate_cents) || 0);
  const freeThreshold = Math.max(0, Number(settings.free_shipping_threshold_cents) || 0);
  const shipping = shippingCents > 0 && (freeThreshold <= 0 || subtotal < freeThreshold) ? shippingCents : 0;
  const orderNumber = `TM-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  return {
    orderItems,
    subtotal,
    shippingCents: shipping,
    discountCents: 0,
    bundleDiscount,
    finalAmount: subtotal + shipping,
    orderNumber,
    appliedCode: "",
    storeName: settings.store_name || "TechMania",
  };
}
