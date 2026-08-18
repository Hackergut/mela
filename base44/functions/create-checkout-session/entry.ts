import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from "base44:runtime";
import Stripe from "npm:stripe@16.0.0";

const MINIMUM_CHARGE_CENTS = 50;
const MAX_CART_LINES = 25;
const MAX_LINE_QUANTITY = 10;
const MAX_SETTINGS = 100;
const STRIPE_SHIPPING_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
  'GR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO',
  'SE', 'SI', 'SK', 'GB', 'CH', 'NO', 'IS', 'LI', 'SM', 'VA', 'AE', 'US', 'CA',
]);

function eurosToCents(value, fallback = 0) {
  const amount = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : fallback;
}

async function shippingConfig(base44) {
  const records = await base44.asServiceRole.entities.Setting.list('key', MAX_SETTINGS).catch(() => []);
  const values = Object.fromEntries(records.map(setting => [setting.key, setting.value]));
  const countries = String(values.shipping_countries || 'IT')
    .split(',')
    .map(country => country.trim().toUpperCase())
    .filter(country => STRIPE_SHIPPING_COUNTRIES.has(country));
  return {
    flatRateCents: eurosToCents(values.shipping_flat_rate),
    freeThresholdCents: eurosToCents(values.free_shipping_threshold),
    countries: countries.length ? [...new Set(countries)] : ['IT'],
    storeName: String(values.store_name || 'Store').trim().slice(0, 80) || 'Store',
  };
}

function parseStorefrontOrigin(candidate, { localOnly = false } = {}) {
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (localOnly && !isLocal) return null;
    if (url.protocol === "https:" || (isLocal && url.protocol === "http:")) return url.origin;
  } catch {
    // Invalid URL.
  }
  return null;
}

function trustedStorefrontOrigin(req) {
  const configuredOrigin = parseStorefrontOrigin(secrets.get("PUBLIC_APP_URL"));
  if (configuredOrigin) return configuredOrigin;
  return parseStorefrontOrigin(req.headers.get("origin"), { localOnly: true })
    || parseStorefrontOrigin(req.headers.get("referer"), { localOnly: true });
}

function normalizeRequestLines(body) {
  const rawLines = Array.isArray(body.items) && body.items.length
    ? body.items
    : [{ productId: body.productId, variantId: body.variantId, quantity: body.quantity || 1 }];
  if (!rawLines.length || rawLines.length > MAX_CART_LINES) return null;

  const merged = new Map();
  for (const rawLine of rawLines) {
    const productId = String(rawLine?.productId || rawLine?.product_id || '').trim();
    const variantId = String(rawLine?.variantId || rawLine?.variant_id || '').trim();
    const quantity = Number(rawLine?.quantity || rawLine?.qty || 1);
    if (!productId || productId.length > 128 || variantId.length > 128 || !Number.isSafeInteger(quantity) || quantity < 1) return null;
    const key = `${productId}::${variantId || 'default'}`;
    const current = merged.get(key);
    const nextQuantity = (current?.quantity || 0) + quantity;
    if (nextQuantity > MAX_LINE_QUANTITY) return null;
    merged.set(key, { productId, variantId, quantity: nextQuantity });
  }
  return [...merged.values()];
}

export default async function(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Richiesta non valida" }, { status: 400 });
    }

    const requestedLines = normalizeRequestLines(body);
    const discountCode = String(body.discountCode || "").trim().toUpperCase();
    if (!requestedLines || discountCode.length > 64) {
      return Response.json({ error: "Parametri non validi" }, { status: 400 });
    }

    const storefrontOrigin = trustedStorefrontOrigin(req);
    if (!storefrontOrigin) {
      console.error("create-checkout-session: no trusted storefront origin");
      return Response.json({ error: "Checkout non configurato" }, { status: 503 });
    }

    const stripeKey = secrets.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("create-checkout-session: STRIPE_SECRET_KEY not set");
      return Response.json({ error: "Checkout non configurato" }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(stripeKey);
    const orderItems = [];

    for (const requested of requestedLines) {
      const product = await base44.asServiceRole.entities.Product.get(requested.productId).catch(() => null);
      if (!product) return Response.json({ error: "Un prodotto non è più disponibile" }, { status: 404 });
      if (product.status && product.status !== "active") return Response.json({ error: `${product.name} non è disponibile` }, { status: 409 });

      const variants = await base44.asServiceRole.entities.ProductVariant.filter({ product_id: product.id }, 'sort_order', 100);
      let variant = null;
      if (variants.length) {
        variant = requested.variantId
          ? variants.find(item => String(item.id) === requested.variantId)
          : variants.find(item => item.is_default && item.status === 'active') || variants.find(item => item.status === 'active');
        if (!variant || variant.status !== 'active') return Response.json({ error: `Seleziona una variante disponibile per ${product.name}` }, { status: 409 });
        if (Number(variant.stock) < requested.quantity) return Response.json({ error: `Stock insufficiente per ${product.name} — ${variant.title}` }, { status: 409 });
      } else if (typeof product.stock === "number" && product.stock < requested.quantity) {
        return Response.json({ error: `Stock insufficiente per ${product.name}` }, { status: 409 });
      }

      const unitAmount = Number(variant?.price_cents ?? product.price_cents);
      if (!Number.isSafeInteger(unitAmount) || unitAmount < MINIMUM_CHARGE_CENTS) {
        return Response.json({ error: `Prezzo non disponibile per ${product.name}` }, { status: 400 });
      }
      const optionValues = variant?.option_values && typeof variant.option_values === 'object' ? variant.option_values : {};
      const optionLabel = Object.values(optionValues).filter(Boolean).join(' · ');
      orderItems.push({
        product_id: String(product.id),
        variant_id: variant ? String(variant.id) : '',
        name: `${product.name}${optionLabel ? ` — ${optionLabel}` : ''}`,
        sku: String(variant?.sku || product.sku || ''),
        option_values: optionValues,
        image: variant?.image || product.image || '',
        price_cents: unitAmount,
        qty: requested.quantity,
      });
    }

    const subtotalCents = orderItems.reduce((sum, item) => sum + item.price_cents * item.qty, 0);
    const shipping = await shippingConfig(base44);
    const shippingCents = shipping.flatRateCents > 0
      && (shipping.freeThresholdCents <= 0 || subtotalCents < shipping.freeThresholdCents)
      ? shipping.flatRateCents
      : 0;
    let discountAmountCents = 0;
    let appliedCode = "";
    if (discountCode) {
      const discounts = await base44.asServiceRole.entities.Discount.filter({ code: discountCode });
      const discount = discounts[0];
      const value = Number(discount?.value);

      if (!discount || !discount.active || !Number.isFinite(value) || value <= 0) {
        return Response.json({ error: "Codice sconto non valido o inattivo" }, { status: 400 });
      }
      if (discount.expires_at && new Date(discount.expires_at).getTime() <= Date.now()) {
        return Response.json({ error: "Codice sconto scaduto" }, { status: 400 });
      }
      if (discount.max_uses != null && (discount.usage_count || 0) >= discount.max_uses) {
        return Response.json({ error: "Codice sconto esaurito" }, { status: 400 });
      }
      if (discount.type === "percent" && value <= 100) discountAmountCents = Math.round(subtotalCents * value / 100);
      else if (discount.type === "fixed") discountAmountCents = Math.round(value);
      else return Response.json({ error: "Codice sconto non valido" }, { status: 400 });
      discountAmountCents = Math.min(discountAmountCents, subtotalCents - MINIMUM_CHARGE_CENTS);
      appliedCode = discountCode;
    }

    const finalAmount = subtotalCents - discountAmountCents + shippingCents;
    const orderNum = `TM-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNum,
      customer_name: "",
      customer_email: "",
      items: orderItems,
      subtotal_cents: subtotalCents,
      discount_amount_cents: discountAmountCents,
      shipping_cents: shippingCents,
      total_cents: finalAmount,
      status: "pending",
      discount_code: appliedCode || null,
      stripe_session_id: "",
    });

    try {
      // The confirmation page receives the checkout session id: high-entropy
      // value that lets the public order_lookup reveal only that order.
      const successUrl = new URL('/ordine', storefrontOrigin);
      successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
      const returnUrl = new URL(orderItems.length === 1 ? "/scheda-prodotto" : "/carrello", storefrontOrigin);
      if (orderItems.length === 1) returnUrl.searchParams.set("id", orderItems[0].product_id);
      const summary = orderItems.length === 1
        ? orderItems[0].name
        : `${orderItems.length} prodotti · ${shipping.storeName}`;
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: finalAmount,
            product_data: {
              name: summary.slice(0, 127),
              description: appliedCode ? `Ordine ${orderNum} · sconto ${appliedCode}` : `Ordine ${orderNum}`,
              images: orderItems[0]?.image ? [orderItems[0].image] : undefined,
            },
          },
        }],
        success_url: successUrl.toString(),
        cancel_url: `${returnUrl.toString()}${returnUrl.search ? '&' : '?'}payment=cancelled`,
        billing_address_collection: "auto",
        shipping_address_collection: { allowed_countries: shipping.countries },
        phone_number_collection: { enabled: true },
        metadata: {
          base44_app_id: secrets.get("BASE44_APP_ID"),
          order_id: order.id,
          discount_code: appliedCode,
          line_count: String(orderItems.length),
        },
      });

      await base44.asServiceRole.entities.Order.update(order.id, { stripe_session_id: session.id });
      console.log("Checkout session created:", session.id, "order:", orderNum);
      return Response.json({ url: session.url });
    } catch (error) {
      await base44.asServiceRole.entities.Order.update(order.id, { status: "cancelled" }).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error("create-checkout-session error:", error);
    return Response.json({ error: "Impossibile avviare il checkout" }, { status: 500 });
  }
}
