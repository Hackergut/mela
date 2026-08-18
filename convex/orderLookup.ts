// @ts-nocheck
// Public order lookup, mirroring the legacy catalog `order_lookup` operation.
// Accepts a Stripe checkout session id, or an order number + email pair.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

function maskEmail(email) {
  const value = String(email || "").trim();
  const at = value.indexOf("@");
  if (!value || at <= 0) return "";
  const local = value.slice(0, at);
  return `${local.slice(0, 1)}${local.length > 1 ? "*******" : ""}@${value.slice(at + 1)}`;
}

function publicOrder(order) {
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    name: String(item?.name || ""),
    sku: String(item?.sku || ""),
    image: String(item?.image || ""),
    option_values: item?.option_values && typeof item.option_values === "object" ? item.option_values : {},
    price_cents: Math.max(0, Number(item?.price_cents) || 0),
    qty: Math.max(1, Number(item?.qty) || 1),
  }));
  return {
    order_number: String(order.order_number || ""),
    status: String(order.status || "pending"),
    customer_name: String(order.customer_name || ""),
    customer_email_masked: maskEmail(order.customer_email),
    items,
    subtotal_cents: Math.max(0, Number(order.subtotal_cents) || 0),
    discount_amount_cents: Math.max(0, Number(order.discount_amount_cents) || 0),
    discount_code: order.discount_code ? String(order.discount_code) : null,
    shipping_cents: Math.max(0, Number(order.shipping_cents) || 0),
    bundle_discount_cents: Math.max(0, Number(order.bundle_discount_cents) || 0),
    total_cents: Math.max(0, Number(order.total_cents) || 0),
    shipping_name: String(order.shipping_name || ""),
    shipping_address: order.shipping_address && typeof order.shipping_address === "object" ? order.shipping_address : {},
    tracking_number: order.tracking_number ? String(order.tracking_number) : "",
    carrier: order.carrier ? String(order.carrier) : "",
    paid_at: order.paid_at || null,
    shipped_date: order.shipped_date || null,
    delivered_date: order.delivered_date || null,
    created_date: order.created_date || null,
  };
}

export default action({
  args: {
    session_id: v.optional(v.string()),
    order_number: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = String(args.session_id || "").trim();
    const orderNumber = String(args.order_number || "").trim().toUpperCase();
    const email = String(args.email || "").trim().toLowerCase();

    let order = null;
    if (/^cs_(test|live)_/.test(sessionId)) {
      const all = await ctx.runQuery(internal._crud.listAll, { table: "orders" });
      order = all.find((o) => o.stripe_session_id === sessionId) || null;
    } else if (/^TM-[A-Z0-9-]{2,40}$/.test(orderNumber) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const all = await ctx.runQuery(internal._crud.listAll, { table: "orders" });
      order = all.find((o) => String(o.order_number) === orderNumber && String(o.customer_email || "").trim().toLowerCase() === email) || null;
    }
    if (!order) return { __ok: false, status: 404, error: "Ordine non trovato. Controlla il numero ordine e l’email usata al checkout." };
    return { __ok: true, order: publicOrder(order) };
  },
});