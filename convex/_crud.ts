// Internal CRUD queries and mutations. These wrap the generic
// table-name + JSON-payload pattern used by the admin action, while still
// using proper Convex argument validators (v.record / v.string / v.id).

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { shape, shapeList, sortDocs, DEFAULT_SORTS } from "./lib/shared";

const TABLES = [
  "products",
  "product_variants",
  "categories",
  "assets",
  "orders",
  "discounts",
  "customers",
  "users",
  "notifications",
  "settings",
  "receipts",
  "returns",
  "webhook_events",
] as const;

const tableValidator = v.string();
// Generic JSON object payload for creates/updates.
const recordValidator = v.record(v.string(), v.any());

export const listAll = internalQuery({
  args: { table: tableValidator, sort: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) return [];
    const docs = await ctx.db.query(args.table).collect();
    const sorted = sortDocs(shapeList(docs, args.table), args.sort || DEFAULT_SORTS[args.table]);
    return sorted.slice(0, args.limit || 1000);
  },
});

export const getById = internalQuery({
  args: { table: tableValidator, id: v.string() },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) return null;
    const cid = ctx.db.normalizeId(args.table, args.id);
    if (!cid) return null;
    const doc = await ctx.db.get(cid);
    return doc ? shape(doc, args.table) : null;
  },
});

export const createOne = internalMutation({
  args: { table: tableValidator, data: recordValidator },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) throw new Error("Tabella non valida");
    const id = await ctx.db.insert(args.table, args.data);
    return String(id);
  },
});

export const updateOne = internalMutation({
  args: { table: tableValidator, id: v.string(), data: recordValidator },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) throw new Error("Tabella non valida");
    const cid = ctx.db.normalizeId(args.table, args.id);
    if (!cid) throw new Error("ID non valido");
    await ctx.db.patch(cid, args.data);
    const doc = await ctx.db.get(cid);
    return shape(doc, args.table);
  },
});

export const deleteOne = internalMutation({
  args: { table: tableValidator, id: v.string() },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) return false;
    const cid = ctx.db.normalizeId(args.table, args.id);
    if (cid) await ctx.db.delete(cid);
    return true;
  },
});

const bulkRecordValidator = v.array(recordValidator);

export const bulkCreate = internalMutation({
  args: { table: tableValidator, docs: bulkRecordValidator },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) return 0;
    for (const d of args.docs) await ctx.db.insert(args.table, d);
    return args.docs.length;
  },
});

export const bulkUpdate = internalMutation({
  args: { table: tableValidator, docs: bulkRecordValidator },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) return 0;
    for (const d of args.docs) {
      const { id, ...rest } = d;
      if (!id) continue;
      const cid = ctx.db.normalizeId(args.table, String(id));
      if (cid) await ctx.db.patch(cid, rest);
    }
    return args.docs.length;
  },
});

export const bulkDelete = internalMutation({
  args: { table: tableValidator, ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (!(TABLES as readonly string[]).includes(args.table)) return 0;
    for (const id of args.ids) {
      const cid = ctx.db.normalizeId(args.table, id);
      if (cid) await ctx.db.delete(cid);
    }
    return args.ids.length;
  },
});

// Public/admin catalogue snapshot used by the admin "list_catalog" operation
// and by seed/verification.
export const catalogSnapshot = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [p, vr, c] = await Promise.all([
      ctx.db.query("products").order("desc").collect(),
      ctx.db.query("product_variants").collect(),
      ctx.db.query("categories").collect(),
    ]);
    return {
      products: shapeList(p, "products"),
      variants: shapeList(vr, "product_variants"),
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
    const docs = await ctx.db
      .query("product_variants")
      .withIndex("by_product", (q) => q.eq("product_id", pid))
      .collect();
    return shapeList(docs, "product_variants");
  },
});

const byStringId = (table) =>
  internalQuery({
    args: { id: v.string() },
    handler: async (ctx, args) => {
      const cid = ctx.db.normalizeId(table, args.id);
      if (!cid) return null;
      const d = await ctx.db.get(cid);
      return d ? shape(d, table) : null;
    },
  });

export const productById = byStringId("products");
export const variantById = byStringId("product_variants");
export const categoryById = byStringId("categories");
export const orderById = byStringId("orders");

export const allProducts = internalQuery({
  args: {},
  handler: async (ctx) => shapeList(await ctx.db.query("products").collect(), "products"),
});
export const allVariants = internalQuery({
  args: {},
  handler: async (ctx) => shapeList(await ctx.db.query("product_variants").collect(), "product_variants"),
});
export const allCategories = internalQuery({
  args: {},
  handler: async (ctx) => shapeList(await ctx.db.query("categories").collect(), "categories"),
});

export const productsByCategory = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("products").collect();
    return shapeList(
      docs.filter((p) => String(p.category_id) === args.id),
      "products",
    );
  },
});

export const categoriesByParent = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("categories").collect();
    return shapeList(
      docs.filter((c) => String(c.parent_id) === args.id),
      "categories",
    );
  },
});

export const unreadNotifications = internalQuery({
  args: {},
  handler: async (ctx) => {
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
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("customers").collect();
    return shapeList(
      docs.filter((c) => String(c.email || "").toLowerCase() === args.email.toLowerCase()),
      "customers",
    );
  },
});

export const discountsByCode = internalQuery({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("discounts").collect();
    return shapeList(
      docs.filter((d) => String(d.code || "").toUpperCase() === args.code.toUpperCase()),
      "discounts",
    );
  },
});

export const webhookEventsByOrder = internalQuery({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("webhook_events").collect();
    return shapeList(
      docs.filter((e) => String(e.order_id) === args.orderId),
      "webhook_events",
    );
  },
});
