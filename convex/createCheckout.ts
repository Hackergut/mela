// @ts-nocheck
// Stripe checkout action. Validates cart lines server-side, reads shipping
// settings, applies discount codes, creates a pending order and a Stripe
// Checkout Session. Mirrors the legacy create-checkout-session function.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const MIN = 50;
const MAX_LINES = 25;
const MAX_QTY = 10;
const MAX_ACCESSORIES = 3;
const COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK","GB","CH","NO","IS","LI","SM","VA","AE","US","CA",
]);

const eurosToCents = (raw, fb = 0) => {
  const n = Number(String(raw ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : fb;
};

const parseOrigin = (raw, localOnly = false) => {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (localOnly && !local) return null;
    if (u.protocol === "https:" || (local && u.protocol === "http:")) return u.origin;
  } catch { /* invalid */ }
  return null;
};

const json = (data, status = 200) => ({ __ok: true, status, ...data });
const jfail = (error, status = 400) => ({ __ok: false, status, error });

export default action({
  args: {
    items: v.optional(v.array(v.object({
      productId: v.string(),
      variantId: v.optional(v.string()),
      quantity: v.optional(v.number()),
    }))),
    productId: v.optional(v.string()),
    variantId: v.optional(v.string()),
    quantity: v.optional(v.number()),
    bundle_accessories: v.optional(v.array(v.object({
      productId: v.string(),
      variantId: v.optional(v.string()),
    }))),
    discountCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const requestOrigin = parseOrigin(process.env.PUBLIC_APP_URL);

      const shopifyDomain = String(process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP_DOMAIN || "").trim();
      const shopifyStorefront = String(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "").trim();
      const shopifyEnabled = Boolean(shopifyDomain && shopifyStorefront);

      // Normalise lines.
      const rawLines = Array.isArray(args.items) && args.items.length
        ? args.items
        : [{ productId: args.productId, variantId: args.variantId, quantity: args.quantity || 1 }];
      if (!rawLines.length || rawLines.length > MAX_LINES) return jfail("Parametri non validi", 400);

      const merged = new Map();
      for (const l of rawLines) {
        const productId = String(l?.productId || "").trim();
        const variantId = String(l?.variantId || "").trim();
        const qty = Number(l?.quantity || 1);
        if (!productId || productId.length > 128 || variantId.length > 128 || !Number.isSafeInteger(qty) || qty < 1) return jfail("Parametri non validi", 400);
        const key = `${productId}::${variantId || "default"}`;
        const next = (merged.get(key)?.quantity || 0) + qty;
        if (next > MAX_QTY) return jfail("Parametri non validi", 400);
        merged.set(key, { productId, variantId, quantity: next });
      }
      const lines = [...merged.values()];

      const accessories = Array.isArray(args.bundle_accessories)
        ? args.bundle_accessories.slice(0, MAX_ACCESSORIES).map((a) => ({ productId: String(a.productId || "").trim(), variantId: String(a.variantId || "").trim() })).filter((a) => a.productId)
        : [];

      const shopifyLines = [
        ...lines.filter((line) => String(line.variantId || "").startsWith("gid://shopify/ProductVariant/")),
        ...accessories
          .filter((line) => String(line.variantId || "").startsWith("gid://shopify/ProductVariant/"))
          .map((line) => ({ productId: line.productId, variantId: line.variantId, quantity: 1 })),
      ];

      if (shopifyEnabled && shopifyLines.length) {
        const domain = shopifyDomain.replace(/^https?:\/\//, "").split("/")[0];
        const input = {
          lines: shopifyLines.map((line) => ({
            merchandiseId: line.variantId,
            quantity: Math.max(1, Number(line.quantity) || 1),
          })),
        };
        const code = String(args.discountCode || "").trim();
        if (code) input.discountCodes = [code];
        const response = await fetch(`https://${domain}/api/2025-01/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": shopifyStorefront,
          },
          body: JSON.stringify({
            query: `mutation CartCreate($input: CartInput) { cartCreate(input: $input) { cart { id checkoutUrl } userErrors { message } } }`,
            variables: { input },
          }),
        });
        const body = await response.json().catch(() => ({}));
        const error = body?.errors?.[0]?.message || body?.data?.cartCreate?.userErrors?.[0]?.message;
        if (error) return jfail(error, 400);
        const checkoutUrl = body?.data?.cartCreate?.cart?.checkoutUrl;
        if (!checkoutUrl) return jfail("Checkout Shopify non disponibile", 502);
        return json({ url: checkoutUrl, provider: "shopify" });
      }

      if (!requestOrigin) return jfail("Checkout non configurato", 503);
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return jfail("Checkout non configurato", 503);

      // Load shipping config.
      const settingsList = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
      const values = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));
      const shipCountries = String(values.shipping_countries || "IT").split(",").map((c) => c.trim().toUpperCase()).filter((c) => COUNTRIES.has(c));
      const bundlePercent = Math.min(15, Math.max(0, Math.trunc(Number(values.bundle_discount_percent) || 0)));
      const flatRate = eurosToCents(values.shipping_flat_rate);
      const freeThreshold = eurosToCents(values.free_shipping_threshold);
      const storeName = String(values.store_name || "Store").trim().slice(0, 80) || "Store";

      const resolveLine = async (requested, isAccessory = false) => {
        const product = await ctx.runQuery(internal._crud.productById, { id: requested.productId });
        if (!product) return { error: "Un prodotto non è più disponibile", status: 404 };
        if (product.status && product.status !== "active") return { error: `${product.name} non è disponibile`, status: 409 };
        const variants = await ctx.runQuery(internal._crud.variantsByProduct, { productId: requested.productId });
        let variant = null;
        if (variants.length) {
          variant = requested.variantId
            ? variants.find((v) => String(v.id) === requested.variantId)
            : variants.find((v) => v.is_default && v.status === "active") || variants.find((v) => v.status === "active");
          if (!variant || variant.status !== "active") return { error: `Seleziona una variante per ${product.name}`, status: 409 };
          if (Number(variant.stock) < (isAccessory ? 1 : requested.quantity)) return { error: `Stock insufficiente per ${product.name}`, status: 409 };
        } else if (typeof product.stock === "number" && product.stock < (isAccessory ? 1 : requested.quantity)) {
          return { error: `Stock insufficiente per ${product.name}`, status: 409 };
        }
        const unit = Number(variant?.price_cents ?? product.price_cents);
        if (!Number.isSafeInteger(unit) || unit < MIN) return { error: `Prezzo non disponibile per ${product.name}`, status: 400 };
        const ov = variant?.option_values && typeof variant.option_values === "object" ? variant.option_values : {};
        const label = Object.values(ov).filter(Boolean).join(" · ");
        return {
          line: {
            product_id: String(product.id), variant_id: variant ? String(variant.id) : "",
            name: `${product.name}${label ? ` — ${label}` : ""}`,
            sku: String(variant?.sku || product.sku || ""), option_values: ov,
            image: variant?.image || product.image || "", price_cents: unit, qty: isAccessory ? 1 : requested.quantity,
            ...(isAccessory ? { bundle_accessory: true } : { bundle_main: !isAccessory && accessories.length > 0 }),
            ...(isAccessory ? { original_price_cents: unit } : {}),
          },
          product, variant, unit,
        };
      };

      const orderItems = [];
      let bundleDiscount = 0;
      let mainUnit = 0;
      for (const requested of lines) {
        const r = await resolveLine(requested);
        if (r.error) return jfail(r.error, r.status);
        orderItems.push(r.line);
        mainUnit = r.unit;
      }
      if (accessories.length) {
        if (lines.length !== 1) return jfail("Il bundle è disponibile solo con un prodotto principale", 400);
        for (const acc of accessories) {
          if (acc.productId === lines[0].productId) continue;
          const r = await resolveLine(acc, true);
          if (r.error) return jfail(r.error, r.status);
          if (r.unit > mainUnit) return jfail(`${r.product.name} non è eleggibile come accessorio del bundle`, 400);
          const discounted = bundlePercent > 0 ? Math.max(MIN, Math.round(r.unit * (100 - bundlePercent) / 100)) : r.unit;
          bundleDiscount += r.unit - discounted;
          orderItems.push({ ...r.line, price_cents: discounted });
        }
      }

      const subtotal = orderItems.reduce((s, i) => s + i.price_cents * i.qty, 0);
      const shippingCents = flatRate > 0 && (freeThreshold <= 0 || subtotal < freeThreshold) ? flatRate : 0;
      let discountCents = 0;
      let appliedCode = "";
      const code = String(args.discountCode || "").trim().toUpperCase();
      if (code) {
        if (code.length > 64) return jfail("Codice non valido", 400);
        const all = await ctx.runQuery(internal._crud.discountsByCode, { code });
        const discount = all[0];
        const value = Number(discount?.value);
        if (!discount || !discount.active || !Number.isFinite(value) || value <= 0) return jfail("Codice sconto non valido o inattivo", 400);
        if (discount.expires_at && new Date(discount.expires_at).getTime() <= Date.now()) return jfail("Codice scaduto", 400);
        if (discount.max_uses != null && (discount.usage_count || 0) >= discount.max_uses) return jfail("Codice esaurito", 400);
        discountCents = discount.type === "percent" && value <= 100 ? Math.round(subtotal * value / 100)
          : discount.type === "fixed" ? Math.round(value) : 0;
        if (!discountCents) return jfail("Codice non valido", 400);
        discountCents = Math.min(discountCents, subtotal - MIN);
        appliedCode = code;
      }

      const finalAmount = subtotal - discountCents + shippingCents;
      const orderNumber = `TM-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
      const orderId = await ctx.runMutation(internal._crud.createOne, {
        table: "orders",
        data: {
          order_number: orderNumber, customer_name: "", customer_email: "", items: orderItems,
          subtotal_cents: subtotal, discount_amount_cents: discountCents, shipping_cents: shippingCents,
          total_cents: finalAmount, status: "pending", discount_code: appliedCode || null, stripe_session_id: "",
          ...(bundleDiscount > 0 ? { bundle_discount_cents: bundleDiscount } : {}),
          created_date: new Date().toISOString(), updated_date: new Date().toISOString(),
        },
      });

      try {
        const Stripe = (await import("npm:stripe@16.0.0")).default;
        const stripe = new Stripe(stripeKey);
        const successUrl = new URL("/ordine", requestOrigin);
        successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
        const returnUrl = new URL(orderItems.length === 1 ? "/scheda-prodotto" : "/carrello", requestOrigin);
        if (orderItems.length === 1) returnUrl.searchParams.set("id", orderItems[0].product_id);
        const summary = orderItems.length === 1 ? orderItems[0].name : `${orderItems.length} prodotti · ${storeName}`;
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: finalAmount, product_data: { name: summary.slice(0, 127), description: appliedCode ? `Ordine ${orderNumber} · sconto ${appliedCode}` : `Ordine ${orderNumber}`, images: orderItems[0]?.image ? [orderItems[0].image] : undefined } } }],
          success_url: successUrl.toString(),
          cancel_url: `${returnUrl.toString()}${returnUrl.search ? "&" : "?"}payment=cancelled`,
          billing_address_collection: "auto",
          shipping_address_collection: { allowed_countries: shipCountries.length ? [...new Set(shipCountries)] : ["IT"] },
          phone_number_collection: { enabled: true },
          metadata: { order_id: orderId, discount_code: appliedCode, line_count: String(orderItems.length), convex_app: process.env.CONVEX_APP_ID || "" },
        });
        await ctx.runMutation(internal._crud.updateOne, { table: "orders", id: orderId, data: { stripe_session_id: session.id, updated_date: new Date().toISOString() } });
        return json({ url: session.url });
      } catch (error) {
        await ctx.runMutation(internal._crud.updateOne, { table: "orders", id: orderId, data: { status: "cancelled", updated_date: new Date().toISOString() } }).catch(() => {});
        console.error("checkout stripe error:", error);
        return jfail("Impossibile avviare il checkout", 500);
      }
    } catch (error) {
      console.error("create-checkout error:", error);
      return jfail("Impossibile avviare il checkout", 500);
    }
  },
});