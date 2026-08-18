// @ts-nocheck
// Internal database queries and mutations used by the admin action and other
// back-end functions. They keep Convex types happy while exposing a simple
// generic surface by table name.

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { shape, shapeList, sortDocs, DEFAULT_SORTS } from "./lib/shared";

const TABLES = [
  "products", "product_variants", "categories", "assets", "orders",
  "discounts", "customers", "users", "notifications", "settings",
  "receipts", "returns", "webhook_events",
];
const tableValidator = v.string();

// Generic list, sorted in JS (tables are small for this store).
export const listAll = internalQuery({
  args: { table: tableValidator, sort: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query(args.table).collect();
    const sorted = sortDocs(shapeList(docs, args.table), args.sort || DEFAULT_SORTS[args.table]);
    return sorted.slice(0, args.limit || 1000);
  },
});

export const getById = internalQuery({
  args: { table: tableValidator, id: v.string() },
  handler: async (ctx, args) => {
    try {
      const cid = ctx.db.normalizeId(args.table, args.id);
      if (!cid) return null;
      const doc = await ctx.db.get(args.table, cid);
      return doc ? shape(doc, args.table) : null;
    } catch {
      return null;
    }
  },
});

export const createOne = internalMutation({
  args: { table: tableValidator, data: v.any() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert(args.table, args.data);
    return String(id);
  },
});

export const updateOne = internalMutation({
  args: { table: tableValidator, id: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.table, ctx.db.normalizeId(args.table, args.id), args.data);
    const doc = await ctx.db.get(args.table, ctx.db.normalizeId(args.table, args.id));
    return shape(doc, args.table);
  },
});

export const deleteOne = internalMutation({
  args: { table: tableValidator, id: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.table, ctx.db.normalizeId(args.table, args.id));
    return true;
  },
});

export const bulkCreate = internalMutation({
  args: { table: tableValidator, docs: v.array(v.any()) },
  handler: async (ctx, args) => {
    for (const d of args.docs) await ctx.db.insert(args.table, d);
    return args.docs.length;
  },
});

export const bulkUpdate = internalMutation({
  args: { table: tableValidator, docs: v.array(v.any()) },
  handler: async (ctx, args) => {
    for (const d of args.docs) {
      const { id, ...rest } = d;
      await ctx.db.patch(args.table, ctx.db.normalizeId(args.table, String(id)), rest);
    }
    return args.docs.length;
  },
});

export const bulkDelete = internalMutation({
  args: { table: tableValidator, ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      try { const cid = ctx.db.normalizeId(args.table, id); if (cid) await ctx.db.delete(args.table, cid); } catch { /* ignore */ }
    }
    return args.ids.length;
  },
});

// Admin catalogue snapshot (includes hidden products, unlike the public
// `catalog` query).
export const catalogSnapshot = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [p, v, c] = await Promise.all([
      ctx.db.query("products").order("desc").collect(),
      ctx.db.query("product_variants").collect(),
      ctx.db.query("categories").collect(),
    ]);
    return {
      products: shapeList(p, "products"),
      variants: shapeList(v, "product_variants"),
      categories: shapeList(c, "categories"),
    };
  },
});

// Specialized lookups.
export const variantsByProduct = internalQuery({
  args: { productId: v.string() },
  handler: async (ctx, args) => {
    const pid = ctx.db.normalizeId("products", args.productId);
    if (!pid) return [];
    const docs = await ctx.db.query("product_variants").withIndex("by_product", (q) => q.eq("product_id", pid)).collect();
    return shapeList(docs, "product_variants");
  },
});

export const productById = internalQuery({
  args: { id: v.string() }, handler: async (ctx, args) => {
    try { const d = await ctx.db.get("products", ctx.db.normalizeId("products", args.id)); return d ? shape(d, "products") : null; } catch { return null; }
  },
});
export const variantById = internalQuery({
  args: { id: v.string() }, handler: async (ctx, args) => {
    try { const d = await ctx.db.get("product_variants", ctx.db.normalizeId("product_variants", args.id)); return d ? shape(d, "product_variants") : null; } catch { return null; }
  },
});
export const categoryById = internalQuery({
  args: { id: v.string() }, handler: async (ctx, args) => {
    try { const d = await ctx.db.get("categories", ctx.db.normalizeId("categories", args.id)); return d ? shape(d, "categories") : null; } catch { return null; }
  },
});
export const allProducts = internalQuery({ args: {}, handler: async (ctx) => shapeList(await ctx.db.query("products").collect(), "products") });
export const allVariants = internalQuery({ args: {}, handler: async (ctx) => shapeList(await ctx.db.query("product_variants").collect(), "product_variants") });
export const allCategories = internalQuery({ args: {}, handler: async (ctx) => shapeList(await ctx.db.query("categories").collect(), "categories") });
export const productsByCategory = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("products").collect();
    return shapeList(docs.filter((p) => String(p.category_id) === args.id), "products");
  },
});
export const categoriesByParent = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("categories").collect();
    return shapeList(docs.filter((c) => String(c.parent_id) === args.id), "categories");
  },
});

export const unreadNotifications = internalQuery({
  args: {}, handler: async (ctx) => {
    const docs = await ctx.db.query("notifications").collect();
    return docs.filter((n) => !n.read);
  },
});
export const markNotificationsRead = internalMutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const cid = ctx.db.normalizeId("notifications", id);
      if (cid) await ctx.db.patch(cid, { read: true });
    }
    return args.ids.length;
  },
});

export const customersByEmail = internalQuery({
  args: { email: v.string() }, handler: async (ctx, args) => {
    const docs = await ctx.db.query("customers").collect();
    return shapeList(docs.filter((c) => String(c.email || "").toLowerCase() === args.email.toLowerCase()), "customers");
  },
});
export const discountsByCode = internalQuery({
  args: { code: v.string() }, handler: async (ctx, args) => {
    const docs = await ctx.db.query("discounts").collect();
    return shapeList(docs.filter((d) => String(d.code || "").toUpperCase() === args.code.toUpperCase()), "discounts");
  },
});
export const orderById = internalQuery({
  args: { id: v.string() }, handler: async (ctx, args) => {
    try { const d = await ctx.db.get("orders", ctx.db.normalizeId("orders", args.id)); return d ? shape(d, "orders") : null; } catch { return null; }
  },
});
export const webhookEventsByOrder = internalQuery({
  args: { orderId: v.string() }, handler: async (ctx, args) => {
    const docs = await ctx.db.query("webhook_events").collect();
    return shapeList(docs.filter((e) => String(e.order_id) === args.orderId), "webhook_events");
  },
});