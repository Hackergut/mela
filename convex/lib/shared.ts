// @ts-nocheck
// Shared Convex helpers: document shaping, admin auth, list/sort utilities
// and public settings. These keep the function files small and consistent.

import { v } from "convex/values";

export const MAX_BULK = 500;
export const MAX_VARIANTS = 100;

export const HIDDEN_SECRET = "••••••••";
export const INTEGRATION_PREFIX = "integration_";

export const MAIN_SETTING_KEYS = [
  "store_name",
  "store_email",
  "store_currency",
  "low_stock_threshold",
  "free_shipping_threshold",
  "shipping_flat_rate",
  "shipping_countries",
  "bundle_discount_percent",
];
export const SECRET_SETTING_KEYS = ["shopify_access_token"];

export const SORT_DESC_PREFIX = "-";

// Convert a Convex doc into the shape the legacy Base44 SDK exposed:
// `id` (string), `created_date` and `updated_date` (ISO strings).
export function shape(doc, tableName) {
  if (!doc) return doc;
  const { _id, _creationTime, ...rest } = doc;
  const id = String(_id);
  const iso = new Date(_creationTime).toISOString();
  const base = {
    ...rest,
    id,
    created_date: rest.created_date || iso,
    updated_date: rest.updated_date || iso,
  };
  // Relations stored as v.id are Id objects; normalise to strings so the
  // frontend (which compares ids as strings) works unchanged.
  if (tableName) return { ...base, __table: tableName };
  return base;
}

export function shapeList(docs, tableName) {
  return docs.map((d) => shape(d, tableName));
}

// Incoming ids from the browser may be strings (the old SDK) or Convex ids.
export function idString(value) {
  return value ? String(value) : "";
}

const TIMING_SAFE = (a, b) => {
  const enc = new TextEncoder();
  const x = enc.encode(String(a ?? ""));
  const y = enc.encode(String(b ?? ""));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
};

const rateMap = new Map();
const RATE_MAX = 5;
const RATE_WINDOW = 10 * 60 * 1000;

export function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (now - entry.first > RATE_WINDOW) rateMap.delete(key);
  return { allowed: true };
}

export function recordFailure(key) {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now - entry.first > RATE_WINDOW) {
    rateMap.set(key, { count: 1, lockedUntil: 0, first: now });
    return;
  }
  entry.count += 1;
  if (entry.count >= RATE_MAX) entry.lockedUntil = now + RATE_WINDOW;
}

export function clearFailures(key) {
  rateMap.delete(key);
}

// Admin authentication used by the CMS actions. Returns either an error
// response shape or the resolved role/capabilities. Mirrors the legacy
// ADMIN_PASSWORD / SUPER_ADMIN_PASSWORD model.
export function authenticateAdmin(ctx, { password, clientKey }) {
  if (clientKey) {
    const limit = checkRateLimit(clientKey);
    if (!limit.allowed) {
      return { error: { error: `Troppi tentativi falliti. Riprova tra ${Math.max(1, Math.ceil(limit.retryAfter / 60))} minuti.`, status: 429, headers: { "Retry-After": String(limit.retryAfter) } } };
    }
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  const superPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!adminPassword && !superPassword) {
    return { error: { error: "Accesso admin non configurato: imposta ADMIN_PASSWORD e SUPER_ADMIN_PASSWORD tra i secret Convex.", status: 503 } };
  }
  const isSuper = Boolean(superPassword) && TIMING_SAFE(password, superPassword);
  const isAdmin = Boolean(adminPassword) && TIMING_SAFE(password, adminPassword);
  if (!password || (!isAdmin && !isSuper)) {
    if (clientKey) recordFailure(clientKey);
    return { error: { error: "Password non valida", status: 401 } };
  }
  if (clientKey) clearFailures(clientKey);
  return {
    isSuperAdmin: isSuper,
    canManageSettings: isSuper || !superPassword,
    role: isSuper ? "super_admin" : "admin",
  };
}

// Convenience arg validators reused by the admin action.
export const adminArgs = {
  password: v.string(),
  operation: v.string(),
  resource: v.optional(v.string()),
  payload: v.optional(v.any()),
};

export function err(message, status = 400, extra = {}) {
  return { __error: true, error: message, status, ...extra };
}

export function ok(data, extra = {}) {
  return { ok: true, ...data, ...extra };
}

// Sort a list of plain docs by a "-field" or "field" sort key. Supports the
// keys used by the old Base44 list calls.
export function sortDocs(docs, sort) {
  if (!sort) return docs;
  const desc = sort.startsWith(SORT_DESC_PREFIX);
  const key = desc ? sort.slice(1) : sort;
  const sorted = [...docs].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv));
  });
  return desc ? sorted.reverse() : sorted;
}

// Map the legacy resource names to Convex table names.
export const TABLE_MAP = {
  product: "products",
  product_variant: "product_variants",
  category: "categories",
  asset: "assets",
  order: "orders",
  discount: "discounts",
  customer: "customers",
  user: "users",
  notification: "notifications",
  setting: "settings",
  receipt: "receipts",
  return: "returns",
  webhook_event: "webhook_events",
};

export const DEFAULT_SORTS = {
  products: "sort_order",
  product_variants: "sort_order",
  categories: "sort_order",
  assets: "created_date",
  orders: "created_date",
  discounts: "created_date",
  customers: "created_date",
  users: "created_date",
  notifications: "created_date",
  settings: "key",
  receipts: "created_date",
  returns: "created_date",
  webhook_events: "created_date",
};

export async function listResource(ctx, tableName, sortKey, limit = MAX_BULK) {
  const docs = await ctx.db.query(tableName).collect();
  return sortDocs(shapeList(docs, tableName), sortKey || DEFAULT_SORTS[tableName]).slice(0, limit);
}

// Public store settings (mirrors catalog/publicSettings).
export async function publicSettings(ctx) {
  const docs = await ctx.db.query("settings").collect();
  const values = Object.fromEntries(docs.map((d) => [d.key, d.value]));
  const toCents = (raw) => {
    const amount = Number(String(raw ?? "").trim().replace(",", "."));
    return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : 0;
  };
  return {
    store_name: String(values.store_name || ""),
    currency: String(values.store_currency || "EUR").toUpperCase(),
    free_shipping_threshold_cents: toCents(values.free_shipping_threshold),
    shipping_flat_rate_cents: toCents(values.shipping_flat_rate),
    bundle_discount_percent: Math.min(15, Math.max(0, Math.trunc(Number(values.bundle_discount_percent) || 0))),
  };
}

export function isIntegrationKey(key) {
  return typeof key === "string" && key.startsWith(INTEGRATION_PREFIX);
}

export function maskSecretValue(value) {
  const v = String(value || "");
  if (!v) return "";
  if (v.length <= 4) return HIDDEN_SECRET;
  return `${HIDDEN_SECRET}${v.slice(-4)}`;
}

export async function getByKey(ctx, tableName, key) {
  const doc = await ctx.db
    .query(tableName)
    .withIndex(key === "key" ? "by_key" : key === "code" ? "by_code" : "by_key", (q) => q.eq(key, key))
    .first();
  return doc;
}

export async function findSetting(ctx, key) {
  return ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", key)).first();
}

export async function upsertSetting(ctx, key, value, label) {
  const existing = await findSetting(ctx, key);
  const now = new Date().toISOString();
  if (existing) return ctx.db.patch(existing._id, { value: String(value ?? ""), label, updated_date: now });
  return ctx.db.insert("settings", { key, value: String(value ?? ""), label, is_mockup: false, created_date: now, updated_date: now });
}

export async function getAllSettings(ctx) {
  return ctx.db.query("settings").collect();
}

// Resolve the numeric Convex user id for the current caller when present.
export async function currentUserId(ctx) {
  try {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject || null;
  } catch {
    return null;
  }
}