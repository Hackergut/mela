// @ts-nocheck
// Admin CMS action. Mirrors the legacy Base44 admin-cms operation contract so
// existing React admin components work through the compatibility adapter.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  authenticateAdmin,
  TABLE_MAP,
  MAIN_SETTING_KEYS,
  SECRET_SETTING_KEYS,
  isIntegrationKey,
  findSetting,
  upsertSetting,
  shape,
  shapeList,
  MAX_BULK,
} from "./lib/shared";

const nowIso = () => new Date().toISOString();

const slugify = (value) =>
  String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
const integer = (value, fallback = 0) => { const n = Number(value); return Number.isSafeInteger(n) ? n : fallback; };
const moneyLabel = (cents) => {
  const value = Math.max(0, integer(cents));
  const euros = Math.floor(value / 100).toLocaleString("it-IT");
  const decimal = String(value % 100).padStart(2, "0");
  return decimal === "00" ? `€${euros}` : `€${euros},${decimal}`;
};
const cleanOptions = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([k, o]) => [String(k).trim().slice(0, 40), String(o ?? "").trim().slice(0, 80)]).filter(([k, o]) => k && o));
};
const normalizeSku = (value) => String(value || "").trim().toUpperCase().replace(/\s+/g, "-").slice(0, 80);

const sanitizeVariant = (raw, product, index) => {
  const optionValues = cleanOptions(raw?.option_values);
  const title = String(raw?.title || Object.values(optionValues).join(" · ") || "Standard").trim().slice(0, 160);
  const sku = normalizeSku(raw?.sku || product.sku || `TM-${slugify(product.name).slice(0, 24)}-${index + 1}`);
  const priceCents = integer(raw?.price_cents, integer(product.price_cents));
  const status = ["active", "draft", "archived"].includes(raw?.status) ? raw.status : "active";
  if (!title || !sku) throw new Error(`La variante ${index + 1} richiede nome e SKU.`);
  if (status === "active" && priceCents < 50) throw new Error(`La variante ${sku} richiede un prezzo di almeno 0,50 €.`);
  return {
    ...(raw?.id ? { id: String(raw.id) } : {}),
    title, sku, barcode: String(raw?.barcode || "").trim().slice(0, 80),
    option_values: optionValues,
    color_hex: /^#[0-9a-f]{6}$/i.test(String(raw?.color_hex || "")) ? String(raw.color_hex).toUpperCase() : "",
    price_cents: priceCents,
    compare_at_cents: Math.max(0, integer(raw?.compare_at_cents)),
    cost_cents: Math.max(0, integer(raw?.cost_cents)),
    stock: Math.max(0, integer(raw?.stock)),
    low_stock_threshold: Math.max(0, integer(raw?.low_stock_threshold, integer(product.low_stock_threshold, 5))),
    image: String(raw?.image || product.image || "").trim(),
    images: Array.isArray(raw?.images) ? raw.images.map(String).filter(Boolean).slice(0, 20) : [],
    status, is_default: Boolean(raw?.is_default), sort_order: integer(raw?.sort_order, index),
    shopify_product_id: String(raw?.shopify_product_id || "").trim(),
    shopify_variant_id: String(raw?.shopify_variant_id || "").trim(),
    ...(raw?.synced_at ? { synced_at: raw.synced_at } : {}),
  };
};

const aggregateProduct = (rawProduct, variants) => {
  const active = variants.filter((v) => v.status === "active");
  const selected = active.find((v) => v.is_default) || active[0] || variants[0];
  const optionNames = [...new Set(variants.flatMap((v) => Object.keys(v.option_values || {})))];
  const colors = [];
  for (const v of variants) {
    const name = v.option_values?.Finitura || v.option_values?.Colore;
    if (name && !colors.some((c) => c.name === name)) colors.push({ name, hex: v.color_hex || "#8e8e93", image: v.image || rawProduct.image || "" });
  }
  const priceCents = selected?.price_cents || integer(rawProduct.price_cents);
  return {
    name: String(rawProduct.name || "").trim().slice(0, 180),
    slug: slugify(rawProduct.slug || rawProduct.name),
    subtitle: String(rawProduct.subtitle || "").trim().slice(0, 220),
    brand: String(rawProduct.brand || "Apple").trim().slice(0, 80),
    family: String(rawProduct.family || rawProduct.category || "").trim().slice(0, 100),
    sku: selected?.sku || normalizeSku(rawProduct.sku),
    price: moneyLabel(priceCents), price_cents: priceCents,
    cost_cents: selected?.cost_cents || Math.max(0, integer(rawProduct.cost_cents)),
    stock: active.reduce((s, v) => s + Math.max(0, integer(v.stock)), 0),
    low_stock_threshold: Math.max(0, integer(rawProduct.low_stock_threshold, 5)),
    status: ["active", "withdrawn", "discontinued"].includes(rawProduct.status) ? rawProduct.status : "active",
    badge: rawProduct.badge ? String(rawProduct.badge).trim().slice(0, 40) : null,
    category: String(rawProduct.category || "Generale").trim().slice(0, 100),
    category_id: String(rawProduct.category_id || "").trim(),
    option_names: optionNames, featured: Boolean(rawProduct.featured),
    compare_group: String(rawProduct.compare_group || rawProduct.family || rawProduct.category || "").trim().slice(0, 100),
    specs: cleanOptions(rawProduct.specs),
    image: selected?.image || String(rawProduct.image || "").trim(),
    images: Array.isArray(rawProduct.images) ? rawProduct.images.map(String).filter(Boolean).slice(0, 40) : [],
    colors, description: String(rawProduct.description || "").trim().slice(0, 5000),
    sort_order: integer(rawProduct.sort_order), is_mockup: Boolean(rawProduct.is_mockup),
    shopify_product_id: String(rawProduct.shopify_product_id || "").trim(),
    source: ["base44", "shopify", "legacy"].includes(rawProduct.source) ? rawProduct.source : "base44",
    ...(rawProduct.synced_at ? { synced_at: rawProduct.synced_at } : {}),
  };
};

const normalizeDiscount = (input) => {
  const code = String(input?.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{1,63}$/.test(code)) throw new Error("Il codice deve contenere da 2 a 64 caratteri");
  const type = input?.type === "fixed" ? "fixed" : input?.type === "percent" ? "percent" : "";
  if (!type) throw new Error("Tipo di sconto non valido");
  const value = Number(input?.value);
  if (!Number.isFinite(value) || value <= 0 || (type === "percent" && value > 100) || (type === "fixed" && !Number.isSafeInteger(value))) throw new Error("Valore sconto non valido");
  const maxUses = input?.max_uses == null || input.max_uses === "" ? null : integer(input.max_uses);
  if (maxUses != null && maxUses < 1) throw new Error("Utilizzi massimi non validi");
  const expiresAt = String(input?.expires_at || "").trim();
  if (expiresAt && !Number.isFinite(new Date(expiresAt).getTime())) throw new Error("Data di scadenza non valida");
  return { code, type, value, active: input?.active !== false, usage_count: Math.max(0, integer(input?.usage_count)), max_uses: maxUses, expires_at: expiresAt || null, description: String(input?.description || "").trim().slice(0, 500) };
};

const normalizeCategory = (input) => {
  const name = String(input?.name || "").trim().slice(0, 100);
  if (!name) throw new Error("Nome categoria obbligatorio");
  return {
    ...input, name, slug: slugify(input?.slug || name),
    parent_id: String(input?.parent_id || "").trim() || undefined,
    description: String(input?.description || "").trim().slice(0, 1000),
    image: String(input?.image || "").trim(),
    status: input?.status === "hidden" ? "hidden" : "active",
    featured: Boolean(input?.featured), sort_order: integer(input?.sort_order),
  };
};

const jsonResp = (data, status = 200) => ({ __ok: true, status, ...data });
const jsonFail = (error, status = 400) => ({ __ok: false, status, error });

export default action({
  args: {
    password: v.string(),
    operation: v.string(),
    resource: v.optional(v.string()),
    payload: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const auth = authenticateAdmin(ctx, { password: args.password, clientKey: args.password.slice(0, 8) });
    if (auth.error) return { __ok: false, ...auth.error };
    const { canManageSettings, role } = auth;
    const { operation, payload } = args;
    const res = args.resource || "product";
    const table = TABLE_MAP[res];
    if (!table) return jsonFail("Risorsa non valida");

    try {
      switch (operation) {
        case "list": {
          let items = await ctx.runQuery(internal._crud.listAll, { table });
          if (res === "setting") items = items.filter((s) => !SECRET_SETTING_KEYS.includes(s.key) && !isIntegrationKey(s.key));
          return jsonResp({ items, role, canManageSettings });
        }
        case "list_catalog": {
          const data = await ctx.runQuery(internal._crud.catalogSnapshot, {});
          return jsonResp({ ...data, role });
        }
        case "save_product": {
          const submitted = payload?.product || {};
          const rawVariants = Array.isArray(payload?.variants) ? payload.variants : [];
          if (!String(submitted.name || "").trim()) return jsonFail("Nome prodotto obbligatorio", 400);
          if (!String(submitted.category_id || "").trim()) return jsonFail("Seleziona una categoria valida", 400);
          if (!String(submitted.image || "").trim()) return jsonFail("Immagine principale obbligatoria", 400);
          const category = await ctx.runQuery(internal._crud.categoryById, { id: String(submitted.category_id) });
          if (!category) return jsonFail("La categoria selezionata non esiste", 400);
          const rawProduct = { ...submitted, category_id: String(category.id), category: category.name };
          if (rawVariants.length === 0 || rawVariants.length > 100) return jsonFail("Ogni prodotto deve avere da 1 a 100 varianti.", 400);
          const variants = rawVariants.map((v, i) => sanitizeVariant(v, rawProduct, i));
          if (new Set(variants.map((v) => v.sku)).size !== variants.length) return jsonFail("SKU varianti non univoci", 400);
          if (!variants.some((v) => v.is_default)) variants[0].is_default = true;
          let seen = false;
          variants.forEach((v) => { if (v.is_default && !seen) seen = true; else if (v.is_default) v.is_default = false; });

          const productData = aggregateProduct(rawProduct, variants);
          const now = nowIso();
          let productId;
          if (rawProduct.id) {
            await ctx.runMutation(internal._crud.updateOne, { table: "products", id: String(rawProduct.id), data: { ...productData, updated_date: now } });
            productId = String(rawProduct.id);
          } else {
            productId = await ctx.runMutation(internal._crud.createOne, { table: "products", data: { ...productData, created_date: now, updated_date: now } });
          }
          const existing = await ctx.runQuery(internal._crud.variantsByProduct, { productId });
          const existingIds = new Set(existing.map((v) => String(v.id)));
          const kept = new Set();
          const toCreate = [], toUpdate = [];
          for (const v of variants) {
            const { id, ...data } = v;
            const record = { ...data, product_id: productId, updated_date: now, created_date: now };
            if (id && existingIds.has(String(id))) { kept.add(String(id)); toUpdate.push({ id, ...record }); }
            else toCreate.push(record);
          }
          if (toCreate.length) await ctx.runMutation(internal._crud.bulkCreate, { table: "product_variants", docs: toCreate });
          if (toUpdate.length) await ctx.runMutation(internal._crud.bulkUpdate, { table: "product_variants", docs: toUpdate });
          const removed = existing.map((v) => String(v.id)).filter((id) => !kept.has(id));
          if (removed.length) await ctx.runMutation(internal._crud.bulkDelete, { table: "product_variants", ids: removed });
          const saved = await ctx.runQuery(internal._crud.variantsByProduct, { productId });
          return jsonResp({ product: { id: productId, ...productData }, variants: saved });
        }
        case "normalize_catalog": {
          const apply = payload?.apply === true;
          const [products, variants, categories] = await Promise.all([
            ctx.runQuery(internal._crud.allProducts, {}),
            ctx.runQuery(internal._crud.allVariants, {}),
            ctx.runQuery(internal._crud.allCategories, {}),
          ]);
          const byName = new Map(categories.map((c) => [String(c.name || "").trim().toLowerCase(), c]));
          const missing = [...new Set(products.map((p) => String(p.category || "Generale").trim()).filter(Boolean))].filter((n) => !byName.has(n.toLowerCase()));
          const byProduct = new Map(); variants.forEach((v) => { const l = byProduct.get(String(v.product_id)) || []; l.push(v); byProduct.set(String(v.product_id), l); });
          const report = { products: products.length, product_updates: 0, default_variants: 0, missing_categories: missing.length };
          if (!apply) return jsonResp({ report, categories: missing });
          const now = nowIso();
          for (const name of missing) {
            const id = await ctx.runMutation(internal._crud.createOne, { table: "categories", data: { name, slug: slugify(name), description: `Scopri tutti i prodotti ${name}.`, status: "active", featured: false, sort_order: byName.size, created_date: now, updated_date: now } });
            byName.set(name.toLowerCase(), { id, name });
          }
          const updates = [], defaults = [];
          for (const p of products) {
            const catName = String(p.category || "Generale").trim();
            const cat = byName.get(catName.toLowerCase());
            updates.push({ id: p.id, data: { slug: p.slug || `${slugify(p.name)}-${String(p.id).slice(-6)}`, brand: p.brand || "Apple", family: p.family || catName, category: catName, category_id: p.category_id || cat?.id || "", compare_group: p.compare_group || p.family || catName, source: p.source || "legacy", updated_date: now } });
            report.product_updates++;
            if (!(byProduct.get(String(p.id)) || []).length) {
              const pc = integer(p.price_cents);
              defaults.push({ product_id: p.id, title: "Standard", sku: normalizeSku(p.sku || `TM-${slugify(p.name).slice(0, 24)}-${String(p.id).slice(-6)}`), option_values: {}, price_cents: pc, cost_cents: Math.max(0, integer(p.cost_cents)), stock: Math.max(0, integer(p.stock)), low_stock_threshold: Math.max(0, integer(p.low_stock_threshold, 5)), image: p.image, images: [], status: pc >= 50 ? "active" : "draft", is_default: true, sort_order: 0, created_date: now, updated_date: now });
              report.default_variants++;
            }
          }
          if (updates.length) await ctx.runMutation(internal._crud.bulkUpdate, { table: "products", docs: updates });
          if (defaults.length) await ctx.runMutation(internal._crud.bulkCreate, { table: "product_variants", docs: defaults });
          return jsonResp({ report });
        }
        case "complete_return": {
          const returnId = String(payload?.id || "").trim();
          if (!returnId) return jsonFail("ID reso mancante", 400);
          const item = await ctx.runQuery(internal._crud.getById, { table: "returns", id: returnId });
          if (!item) return jsonFail("Reso non trovato", 404);
          if (item.status === "completed") return jsonResp({ item, duplicate: true });
          if (item.status !== "approved") return jsonFail("Il reso deve essere approvato", 409);
          const productId = String(item.product_id || "");
          if (!productId) return jsonFail("Reso senza prodotto", 409);
          const qty = Math.max(1, integer(item.quantity, 1));
          const product = await ctx.runQuery(internal._crud.productById, { id: productId });
          if (!product) return jsonFail("Prodotto non trovato", 404);
          const now = nowIso();
          const variantId = String(item.variant_id || "");
          if (variantId) {
            const v = await ctx.runQuery(internal._crud.variantById, { id: variantId });
            if (!v || String(v.product_id) !== productId) return jsonFail("Variante non valida", 409);
            await ctx.runMutation(internal._crud.updateOne, { table: "product_variants", id: variantId, data: { stock: Math.max(0, integer(v.stock)) + qty, updated_date: now } });
            const sib = await ctx.runQuery(internal._crud.variantsByProduct, { productId });
            const stock = sib.filter((s) => s.status === "active").reduce((sum, s) => sum + Math.max(0, integer(s.stock)), 0);
            await ctx.runMutation(internal._crud.updateOne, { table: "products", id: productId, data: { stock, updated_date: now } });
          } else {
            await ctx.runMutation(internal._crud.updateOne, { table: "products", id: productId, data: { stock: Math.max(0, integer(product.stock)) + qty, updated_date: now } });
          }
          const updated = await ctx.runMutation(internal._crud.updateOne, { table: "returns", id: returnId, data: { status: "completed", updated_date: now } });
          return jsonResp({ item: updated });
        }
        case "create": {
          let data = { ...(payload || {}) };
          if (res === "setting" && isIntegrationKey(data.key)) return jsonFail("I settaggi delle integrazioni si gestiscono dal pannello Integrazioni.", 403);
          if (res === "setting" && (MAIN_SETTING_KEYS.includes(data.key) || SECRET_SETTING_KEYS.includes(data.key)) && !canManageSettings) return jsonFail("Solo il super admin può creare questo settaggio", 403);
          if (res === "discount") data = normalizeDiscount(data);
          if (res === "category") data = normalizeCategory(data);
          if (res === "notification" && !data.severity) data.severity = "info";
          if (res === "receipt" && !data.receipt_number) data.receipt_number = `R-${data.type === "purchase" ? "ACQ" : "VEN"}-${Date.now().toString().slice(-6)}`;
          if (res === "return" && !data.return_number) data.return_number = `RES-${Date.now().toString().slice(-6)}`;
          const now = nowIso();
          const id = await ctx.runMutation(internal._crud.createOne, { table, data: { ...data, created_date: now, updated_date: now } });
          const item = await ctx.runQuery(internal._crud.getById, { table, id });
          return jsonResp({ item });
        }
        case "update": {
          const { id, ...data } = payload || {};
          if (!id) return jsonFail("ID mancante", 400);
          if (res === "setting") {
            const target = await ctx.runQuery(internal._crud.getById, { table, id });
            if (target && isIntegrationKey(target.key)) return jsonFail("I settaggi delle integrazioni si gestiscono dal pannello Integrazioni.", 403);
            if (isIntegrationKey(data.key)) return jsonFail("I settaggi delle integrazioni si gestiscono dal pannello Integrazioni.", 403);
            if (!canManageSettings) {
              if ((target && (MAIN_SETTING_KEYS.includes(target.key) || SECRET_SETTING_KEYS.includes(target.key))) || MAIN_SETTING_KEYS.includes(data.key) || SECRET_SETTING_KEYS.includes(data.key)) return jsonFail("Solo il super admin può modificare questo settaggio", 403);
            }
          }
          if (res === "discount") {
            const current = await ctx.runQuery(internal._crud.getById, { table, id });
            if (!current) return jsonFail("Codice non trovato", 404);
            Object.assign(data, normalizeDiscount({ ...current, ...data }));
          }
          if (res === "category") {
            const current = await ctx.runQuery(internal._crud.getById, { table, id });
            if (!current) return jsonFail("Categoria non trovata", 404);
            Object.assign(data, normalizeCategory({ ...current, ...data }));
          }
          const now = nowIso();
          await ctx.runMutation(internal._crud.updateOne, { table, id, data: { ...data, updated_date: now } });
          const item = await ctx.runQuery(internal._crud.getById, { table, id });
          if (res === "product_variant" && item?.product_id) {
            const siblings = await ctx.runQuery(internal._crud.variantsByProduct, { productId: item.product_id });
            const active = siblings.filter((s) => s.status === "active");
            const selected = active.find((s) => s.is_default) || active[0];
            if (selected) {
              await ctx.runMutation(internal._crud.updateOne, { table: "products", id: item.product_id, data: { stock: active.reduce((s, x) => s + Math.max(0, integer(x.stock)), 0), sku: selected.sku, price_cents: selected.price_cents, price: moneyLabel(selected.price_cents), cost_cents: selected.cost_cents || 0, image: selected.image || undefined, updated_date: now } });
            }
          }
          return jsonResp({ item });
        }
        case "bulk_update": {
          const items = Array.isArray(payload?.items) ? payload.items : [];
          if (!items.length || items.length > MAX_BULK || items.some((i) => !i?.id)) return jsonFail("Elenco non valido", 400);
          await ctx.runMutation(internal._crud.bulkUpdate, { table, docs: items });
          return jsonResp({ ok: true, updated: items.length });
        }
        case "delete": {
          const { id } = payload || {};
          if (!id) return jsonFail("ID mancante", 400);
          if (res === "setting") {
            const items = await ctx.runQuery(internal._crud.listAll, { table });
            const target = items.find((s) => s.id === id);
            if (target && isIntegrationKey(target.key)) return jsonFail("Gestito dal pannello Integrazioni.", 403);
            if (target && (MAIN_SETTING_KEYS.includes(target.key) || SECRET_SETTING_KEYS.includes(target.key)) && !canManageSettings) return jsonFail("Solo super admin", 403);
          }
          if (res === "category") {
            const assigned = await ctx.runQuery(internal._crud.productsByCategory, { id });
            const children = await ctx.runQuery(internal._crud.categoriesByParent, { id });
            if (assigned.length || children.length) return jsonFail("Riassegna prima prodotti e sottocategorie.", 409);
          }
          if (res === "product") {
            const children = await ctx.runQuery(internal._crud.variantsByProduct, { productId: id });
            if (children.length) await ctx.runMutation(internal._crud.bulkDelete, { table: "product_variants", ids: children.map((c) => c.id) });
          }
          await ctx.runMutation(internal._crud.deleteOne, { table, id });
          return jsonResp({ ok: true });
        }
        case "bulk_delete": {
          const ids = Array.isArray(payload?.ids) ? payload.ids : [];
          if (!ids.length || ids.length > MAX_BULK) return jsonFail("Numero ID non valido", 400);
          if (res === "setting") {
            const items = await ctx.runQuery(internal._crud.listAll, { table });
            if (items.find((s) => ids.includes(s.id) && isIntegrationKey(s.key))) return jsonFail("Gestito dal pannello Integrazioni.", 403);
            if (items.find((s) => ids.includes(s.id) && (MAIN_SETTING_KEYS.includes(s.key) || SECRET_SETTING_KEYS.includes(s.key)) && !canManageSettings)) return jsonFail("Solo super admin", 403);
          }
          if (res === "category") {
            const deps = await Promise.all(ids.map(async (cid) => {
              const p = await ctx.runQuery(internal._crud.productsByCategory, { id: cid });
              const ch = await ctx.runQuery(internal._crud.categoriesByParent, { id: cid });
              return p.length > 0 || ch.some((c) => !ids.includes(c.id));
            }));
            if (deps.some(Boolean)) return jsonFail("Riassegna prima prodotti e sottocategorie.", 409);
          }
          if (res === "product") {
            const allV = await ctx.runQuery(internal._crud.allVariants, {});
            const childIds = allV.filter((v) => ids.includes(v.product_id)).map((v) => v.id);
            if (childIds.length) await ctx.runMutation(internal._crud.bulkDelete, { table: "product_variants", ids: childIds });
          }
          await ctx.runMutation(internal._crud.bulkDelete, { table, ids });
          return jsonResp({ ok: true, deleted: ids.length });
        }
        case "invite_user": {
          const { email, role: r } = payload || {};
          if (!email) return jsonFail("Email mancante", 400);
          await ctx.runMutation(internal._crud.createOne, { table: "users", data: { email, role: r || "user", created_date: nowIso() } });
          return jsonResp({ ok: true });
        }
        case "upsert_setting": {
          const { key, value, label } = payload || {};
          if (!key) return jsonFail("Key mancante", 400);
          if (isIntegrationKey(key)) return jsonFail("Gestito dal pannello Integrazioni.", 403);
          if ((MAIN_SETTING_KEYS.includes(key) || SECRET_SETTING_KEYS.includes(key)) && !canManageSettings) return jsonFail("Solo super admin", 403);
          await upsertSetting(ctx, key, value, label);
          const existing = await findSetting(ctx, key);
          return jsonResp({ item: shape(existing, "settings") });
        }
        case "mark_all_read": {
          const unread = await ctx.runQuery(internal._crud.unreadNotifications, {});
          if (!unread.length) return jsonResp({ updated: 0 });
          await ctx.runMutation(internal._crud.markNotificationsRead, { ids: unread.map((n) => n._id) });
          return jsonResp({ updated: unread.length });
        }
        case "payment_status": {
          const stripeKey = process.env.STRIPE_SECRET_KEY;
          const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
          const publishable = process.env.STRIPE_PUBLISHABLE_KEY;
          const keySet = Boolean(stripeKey);
          const isTest = stripeKey ? stripeKey.startsWith("sk_test") || stripeKey.startsWith("rk_test") : false;
          let publicAppUrl = null;
          try {
            const p = new URL(String(process.env.PUBLIC_APP_URL || ""));
            const local = p.hostname === "localhost" || p.hostname === "127.0.0.1";
            if (p.protocol === "https:" || (local && p.protocol === "http:")) publicAppUrl = p.origin;
          } catch { /* noop */ }
          let account = null;
          if (stripeKey) {
            try {
              const Stripe = (await import("npm:stripe@16.0.0")).default;
              const stripe = new Stripe(stripeKey);
              const info = await stripe.accounts.retrieve();
              const balance = await stripe.balance.retrieve();
              account = { id: String(info?.id || ""), business_name: String(info?.settings?.dashboard?.display_name || info?.business_profile?.name || ""), country: String(info?.country || ""), payouts_enabled: Boolean(info?.payouts_enabled), available_eur: balance.available.find((b) => b.currency === "eur")?.amount ?? null, pending_eur: balance.pending.find((b) => b.currency === "eur")?.amount ?? null };
            } catch { account = { error: "Impossibile leggere l'account Stripe" }; }
          }
          return jsonResp({ stripeKeySet: keySet, publishableKeySet: Boolean(publishable), webhookSecretSet: Boolean(webhookSecret), publicAppUrl, mode: keySet ? (isTest ? "test" : "live") : null, currency: "eur", account });
        }
        case "reconcile_order": {
          const orderId = String(payload?.id || "").trim();
          if (!orderId) return jsonFail("ID ordine mancante", 400);
          const order = await ctx.runQuery(internal._crud.orderById, { id: orderId });
          if (!order) return jsonFail("Ordine non trovato", 404);
          if (order.status !== "paid") return jsonFail("Solo ordini pagati", 409);
          const paidOrders = (await ctx.runQuery(internal._crud.listAll, { table: "orders" })).filter((o) => ["paid", "shipped", "delivered"].includes(o.status));
          const report = { customer_synced: false, discount_synced: false, ledger_cleared: 0, stock_check_required: false };
          const email = String(order.customer_email || "").trim().toLowerCase();
          if (email) {
            const mine = paidOrders.filter((o) => String(o.customer_email || "").trim().toLowerCase() === email);
            const totalSpent = mine.reduce((s, o) => s + Math.max(0, integer(o.total_cents)), 0);
            const existing = await ctx.runQuery(internal._crud.customersByEmail, { email });
            if (existing[0]) await ctx.runMutation(internal._crud.updateOne, { table: "customers", id: existing[0].id, data: { orders_count: mine.length, total_spent: totalSpent, name: existing[0].name || order.customer_name || email.split("@")[0] } });
            else await ctx.runMutation(internal._crud.createOne, { table: "customers", data: { name: order.customer_name || email.split("@")[0], email, orders_count: mine.length, total_spent: totalSpent } });
            report.customer_synced = true;
          }
          const code = String(order.discount_code || "").trim().toUpperCase();
          if (code) {
            const usedBy = paidOrders.filter((o) => String(o.discount_code || "").trim().toUpperCase() === code);
            const discounts = await ctx.runQuery(internal._crud.discountsByCode, { code });
            if (discounts[0]) { await ctx.runMutation(internal._crud.updateOne, { table: "discounts", id: discounts[0].id, data: { usage_count: usedBy.length } }); report.discount_synced = true; }
          }
          const events = await ctx.runQuery(internal._crud.webhookEventsByOrder, { orderId });
          for (const e of events) {
            if (!e.effects_pending) continue;
            report.stock_check_required = report.stock_check_required || /stock/i.test(String(e.effects_errors || ""));
            await ctx.runMutation(internal._crud.updateOne, { table: "webhook_events", id: e.id, data: { effects_pending: false, reconciled_at: nowIso() } }).catch(() => {});
            report.ledger_cleared++;
          }
          return jsonResp({ report });
        }
        case "list_more": {
          const limit = Math.min(Math.max(integer(payload?.limit, 50), 1), 250);
          const before = String(payload?.before || "").trim();
          if (before && Number.isNaN(new Date(before).getTime())) return jsonFail("Cursore non valido", 400);
          let items = await ctx.runQuery(internal._crud.listAll, { table, sort: "-created_date" });
          if (before) items = items.filter((i) => new Date(i.created_date).getTime() < new Date(before).getTime());
          items = items.slice(0, limit);
          return jsonResp({ items, nextBefore: items.length === limit ? String(items[items.length - 1]?.created_date || "") : null });
        }
        default:
          return jsonFail("Operazione non valida", 400);
      }
    } catch (error) {
      console.error("admin-cms error:", error);
      return jsonFail(error instanceof Error ? error.message : "Errore interno del CMS", 500);
    }
  },
});