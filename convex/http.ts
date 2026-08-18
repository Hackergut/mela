// @ts-nocheck
// Convex HTTP router: Stripe webhook (signed) and health check. Stripe
// delivers raw bodies, so this must be an httpAction — Convex mutations can
// then be called from within.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const integer = (value) => { const n = Number(value); return Number.isSafeInteger(n) ? n : 0; };

async function recordEvent(ctx, entry) {
  try {
    await ctx.runMutation(internal._crud.createOne, {
      table: "webhook_events",
      data: { processed_at: new Date().toISOString(), created_date: new Date().toISOString(), ...entry },
    });
  } catch (e) { console.error("webhook event record failed", e); }
}

const stripeWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeKey) {
    return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  try {
    const Stripe = (await import("npm:stripe@16.0.0")).default;
    const stripe = new Stripe(stripeKey);
    const signature = request.headers.get("stripe-signature") || "";
    const raw = await request.text();
    const event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret);

    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.expired") {
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(event.data?.object?.id || ""), status: "ignored" });
      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id || ""), status: "ignored" });
      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    const order = await ctx.runQuery(internal._crud.getById, { table: "orders", id: String(orderId) }).catch(() => null);
    if (!order) {
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id || ""), order_id: String(orderId), status: "ignored" });
      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    if (event.type === "checkout.session.expired") {
      if (order.status === "pending" && order.stripe_session_id === session.id) {
        await ctx.runMutation(internal._crud.updateOne, { table: "orders", id: order.id, data: { status: "cancelled", stripe_event_id: event.id, updated_date: new Date().toISOString() } });
      }
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id), order_id: order.id, status: "processed" });
      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (session.payment_status !== "paid") {
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id), order_id: order.id, status: "ignored" });
      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (order.status === "paid") {
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id), order_id: order.id, status: "duplicate" });
      return new Response(JSON.stringify({ received: true, duplicate: true }), { headers: { "Content-Type": "application/json" } });
    }

    const totalCents = session.amount_total || 0;
    if (order.status !== "pending" || order.stripe_session_id !== session.id || session.currency !== "eur" || totalCents !== order.total_cents) {
      await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id), order_id: order.id, status: "mismatch" });
      return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
    }

    const discountCode = session.metadata?.discount_code;
    const email = String(session.customer_details?.email || "").trim().toLowerCase();
    const name = String(session.customer_details?.name || "").trim();
    const shippingDetails = session.shipping_details || session.customer_details;
    const shippingAddress = shippingDetails?.address ? {
      line1: String(shippingDetails.address.line1 || ""),
      line2: String(shippingDetails.address.line2 || ""),
      city: String(shippingDetails.address.city || ""),
      state: String(shippingDetails.address.state || ""),
      postal_code: String(shippingDetails.address.postal_code || ""),
      country: String(shippingDetails.address.country || ""),
    } : {};
    const now = new Date().toISOString();

    // Commit idempotency guard first.
    await ctx.runMutation(internal._crud.updateOne, {
      table: "orders", id: order.id,
      data: {
        status: "paid", customer_email: email, customer_name: name,
        shipping_name: String(shippingDetails?.name || name), shipping_phone: String(session.customer_details?.phone || ""),
        shipping_address: shippingAddress, stripe_event_id: event.id, paid_at: now, updated_date: now,
      },
    });

    const failedEffects = [];
    const run = async (label, fn) => { try { await fn(); } catch (e) { console.error(label, e); failedEffects.push(`${label}: ${e.message}`); } };

    await run("customer sync", async () => {
      if (!email) return;
      const existing = await ctx.runQuery(internal._crud.customersByEmail, { email });
      if (existing[0]) {
        await ctx.runMutation(internal._crud.updateOne, { table: "customers", id: existing[0].id, data: { orders_count: (existing[0].orders_count || 0) + 1, total_spent: (existing[0].total_spent || 0) + totalCents, name: existing[0].name || name || email.split("@")[0], updated_date: now } });
      } else {
        await ctx.runMutation(internal._crud.createOne, { table: "customers", data: { name: name || email.split("@")[0], email, orders_count: 1, total_spent: totalCents, created_date: now, updated_date: now } });
      }
    });

    await run("discount usage", async () => {
      if (!discountCode) return;
      const code = String(discountCode).toUpperCase();
      const found = await ctx.runQuery(internal._crud.discountsByCode, { code });
      if (found[0]) await ctx.runMutation(internal._crud.updateOne, { table: "discounts", id: found[0].id, data: { usage_count: (found[0].usage_count || 0) + 1, updated_date: now } });
    });

    await run("stock decrement", async () => {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const productId = String(item.product_id || "").trim();
        if (!productId) continue;
        const product = await ctx.runQuery(internal._crud.productById, { id: productId });
        if (!product) continue;
        const qty = Math.max(1, Number.isSafeInteger(Number(item.qty)) ? Number(item.qty) : 1);
        const variantId = String(item.variant_id || "").trim();
        let newStock, threshold, label = product.name;
        if (variantId) {
          const v = await ctx.runQuery(internal._crud.variantById, { id: variantId });
          if (!v || String(v.product_id) !== productId) continue;
          newStock = Math.max(0, integer(v.stock) - qty);
          threshold = integer(v.low_stock_threshold ?? product.low_stock_threshold, 5);
          label = `${product.name} — ${v.title || v.sku}`;
          await ctx.runMutation(internal._crud.updateOne, { table: "product_variants", id: variantId, data: { stock: newStock, updated_date: now } });
          const siblings = await ctx.runQuery(internal._crud.variantsByProduct, { productId });
          const stock = siblings.filter((s) => s.status === "active").reduce((s, x) => s + Math.max(0, integer(x.stock)), 0);
          await ctx.runMutation(internal._crud.updateOne, { table: "products", id: productId, data: { stock, updated_date: now } });
        } else {
          if (typeof product.stock !== "number") continue;
          newStock = Math.max(0, integer(product.stock) - qty);
          threshold = integer(product.low_stock_threshold, 5);
          await ctx.runMutation(internal._crud.updateOne, { table: "products", id: productId, data: { stock: newStock, updated_date: now } });
        }
        if (newStock <= threshold) {
          await ctx.runMutation(internal._crud.createOne, { table: "notifications", data: { type: "stock", title: `Stock basso: ${label}`, message: `Rimangono ${newStock} unità (soglia: ${threshold}).`, severity: newStock === 0 ? "error" : "warning", read: false, link: "inventory", ref_id: variantId || productId, created_date: now } });
        }
      }
    });

    await run("order notification", async () => {
      await ctx.runMutation(internal._crud.createOne, { table: "notifications", data: { type: "order", title: `Nuovo ordine pagato ${order.order_number || order.id}`, message: `${name || email || "Cliente"} · ${(totalCents / 100).toFixed(2)} €${discountCode ? ` · sconto ${discountCode}` : ""}`, severity: "success", read: false, link: "orders", ref_id: order.id, created_date: now } });
    });

    await run("automation webhooks", async () => {
      const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
      const byKey = new Map(all.map((s) => [s.key, s.value]));
      const get = (id, field) => byKey.get(`integration_${id}_${field}`) || "";
      const payload = {
        event: "order.paid", timestamp: now,
        order: { id: order.id, number: order.order_number, total_cents: integer(order.total_cents), subtotal_cents: integer(order.subtotal_cents), discount_cents: integer(order.discount_amount_cents), items: (order.items || []).map((i) => ({ name: i.name, qty: i.qty, price_cents: i.price_cents, sku: i.sku })) },
        customer: { email, name, phone: String(order.shipping_phone || "") },
      };
      for (const id of ["zapier", "make", "n8n", "custom_webhook"]) {
        const url = String(get(id, "webhook_url") || "").trim();
        if (!url) continue;
        if (String(get(id, "event_order_paid") || "true").toLowerCase() === "false") continue;
        const secret = String(get(id, "secret") || "").trim();
        const headers = { "Content-Type": "application/json", "User-Agent": "TechMania-IntegrationHub/1.0" };
        if (secret) headers["X-TM-Signature"] = secret.slice(0, 64);
        try {
          const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
          if (!r.ok) console.warn(`webhook ${id} responded ${r.status}`);
        } catch (e) { console.error(`webhook ${id} failed`, e); }
      }
    });

    await recordEvent(ctx, { event_id: event.id, event_type: event.type, session_id: String(session.id), order_id: order.id, status: "processed", effects_pending: failedEffects.length > 0, effects_errors: failedEffects.join(" | ") });
    console.log("Payment completed:", { eventId: event.id, orderId: order.id });
    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("stripe webhook error:", error);
    return new Response(JSON.stringify({ error: "Invalid webhook" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});

const health = httpAction(async () => new Response(JSON.stringify({ ok: true, service: "techmania-convex" }), { headers: { "Content-Type": "application/json" } }));

const http = httpRouter();
http.route({ path: "/stripe-webhook", method: "POST", handler: stripeWebhook });
http.route({ path: "/health", method: "GET", handler: health });
export default http;