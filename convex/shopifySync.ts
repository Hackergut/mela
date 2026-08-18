// @ts-nocheck
// Shopify sync action. Mirrors the legacy shopify-sync function: stores
// credentials as (masked) settings, tests the Admin GraphQL connection and
// incrementally syncs orders and customers.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { authenticateAdmin } from "./lib/shared";

const API_VERSION = "2025-10";
const PAGE_SIZE = 100;
const MAX_PAGES = 40;

function normalizeDomain(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.protocol !== "https:" || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(u.hostname)) return "";
    return u.hostname;
  } catch { return ""; }
}

async function graphql(domain, token, query, variables = {}) {
  const norm = normalizeDomain(domain);
  if (!norm) throw new Error("Dominio Shopify non valido");
  const res = await fetch(`https://${norm}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST", headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Richiesta Shopify non riuscita (${res.status})`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors[0]?.message || "Errore GraphQL Shopify");
  return body.data;
}

const mapStatus = (o) => {
  if (o.canceledAt) return "cancelled";
  if (o.financialStatus === "REFUNDED") return "refunded";
  if (o.fulfillmentStatus === "FULFILLED") return "delivered";
  if (o.fulfillmentStatus === "PARTIAL") return "shipped";
  if (o.financialStatus === "PAID" || o.financialStatus === "PARTIALLY_PAID") return "paid";
  return "pending";
};
const money = (set) => Math.round(parseFloat(set?.shopMoney?.amount || 0) * 100);
const mapOrder = (o) => ({
  order_number: o.name || "",
  customer_name: [o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(" ") || o.customer?.displayName || "",
  customer_email: o.email || o.customer?.email || "",
  items: (o.lineItems?.nodes || []).map((l) => ({ name: l.name || l.title || "Articolo", price_cents: money(l.originalUnitPriceSet), qty: l.quantity || 1 })),
  subtotal_cents: money(o.subtotalPriceSet), discount_amount_cents: money(o.totalDiscountsSet), total_cents: money(o.totalPriceSet),
  status: mapStatus(o), discount_code: o.discountCode || "",
  shipped_date: o.fulfillmentStatus === "FULFILLED" && o.processedAt ? o.processedAt : null,
});
const mapCustomer = (c) => ({
  name: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || "",
  email: c.email || "", phone: c.phone || "", notes: c.note || "",
  total_spent: Math.round(parseFloat(c.totalSpent || 0) * 100), orders_count: c.ordersCount || 0,
  tags: (c.tags || []).map((t) => String(t).trim()).filter(Boolean),
});

const ORDERS_Q = `query Sync($first:Int!,$after:String,$query:String){orders(first:$first,after:$after,query:$query,sortKey:UPDATED_AT,reverse:false){pageInfo{hasNextPage endCursor}nodes{id name email canceledAt processedAt updatedAt financialStatus fulfillmentStatus discountCode totalPriceSet{shopMoney{amount}} subtotalPriceSet{shopMoney{amount}} totalDiscountsSet{shopMoney{amount}} customer{firstName lastName displayName email} lineItems(first:50){nodes{name title quantity originalUnitPriceSet{shopMoney{amount}}}}}}}}`;
const CUSTOMERS_Q = `query Sync($first:Int!,$after:String,$query:String){customers(first:$first,after:$after,query:$query,sortKey:UPDATED_AT,reverse:false){pageInfo{hasNextPage endCursor}nodes{id firstName lastName email phone note updatedAt totalSpent ordersCount tags}}}`;

async function fetchSince(domain, token, query, name, since, onNode) {
  let after = null, newest = since || null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await graphql(domain, token, query, { first: PAGE_SIZE, after, query: since ? `updated_at:>${since}` : null });
    const conn = data?.[name];
    if (!conn) throw new Error("Risposta Shopify inattesa");
    for (const node of conn.nodes || []) { onNode(node); if (node.updatedAt && (!newest || node.updatedAt > newest)) newest = node.updatedAt; }
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return newest;
}

async function getSetting(ctx, key) {
  const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
  return all.find((s) => s.key === key)?.value || "";
}
async function setSetting(ctx, key, value, label) {
  const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
  const existing = all.find((s) => s.key === key);
  const now = new Date().toISOString();
  if (existing) await ctx.runMutation(internal._crud.updateOne, { table: "settings", id: existing.id, data: { value, label, updated_date: now } });
  else await ctx.runMutation(internal._crud.createOne, { table: "settings", data: { key, value, label, is_mockup: false, created_date: now, updated_date: now } });
}

async function resolve(ctx, payload) {
  const [domainSetting, tokenSetting] = await Promise.all([
    getSetting(ctx, "shopify_shop_domain"),
    getSetting(ctx, "shopify_access_token"),
  ]);
  return {
    domain: normalizeDomain(payload?.shop_domain || process.env.SHOPIFY_SHOP_DOMAIN || domainSetting),
    token: String(payload?.access_token || process.env.SHOPIFY_ACCESS_TOKEN || tokenSetting || "").trim(),
  };
}

async function syncOrders(ctx, domain, token) {
  const since = (await getSetting(ctx, "shopify_orders_checkpoint")) || null;
  const fetched = [];
  const newest = await fetchSince(domain, token, ORDERS_Q, "orders", since, (n) => fetched.push(n));
  const existing = await ctx.runQuery(internal._crud.listAll, { table: "orders" });
  const byNumber = new Map(existing.map((o) => [o.order_number, o]));
  const toCreate = [], toUpdate = [];
  for (const so of fetched) {
    const m = mapOrder(so);
    if (!m.order_number) continue;
    const cur = byNumber.get(m.order_number);
    if (cur) toUpdate.push({ id: cur.id, ...m }); else toCreate.push(m);
  }
  if (toCreate.length) await ctx.runMutation(internal._crud.bulkCreate, { table: "orders", docs: toCreate.map((d) => ({ ...d, created_date: new Date().toISOString(), updated_date: new Date().toISOString() })) });
  if (toUpdate.length) await ctx.runMutation(internal._crud.bulkUpdate, { table: "orders", docs: toUpdate.map((d) => ({ ...d, updated_date: new Date().toISOString() })) });
  if (newest) await setSetting(ctx, "shopify_orders_checkpoint", newest, "Shopify Checkpoint Ordini");
  return { fetched: fetched.length, created: toCreate.length, updated: toUpdate.length, checkpoint: newest, incremental: !!since };
}

async function syncCustomers(ctx, domain, token) {
  const since = (await getSetting(ctx, "shopify_customers_checkpoint")) || null;
  const fetched = [];
  const newest = await fetchSince(domain, token, CUSTOMERS_Q, "customers", since, (n) => fetched.push(n));
  const existing = await ctx.runQuery(internal._crud.listAll, { table: "customers" });
  const byEmail = new Map(existing.map((c) => [String(c.email || "").toLowerCase(), c]));
  const toCreate = [], toUpdate = [];
  for (const sc of fetched) {
    const m = mapCustomer(sc);
    if (!m.email) continue;
    const cur = byEmail.get(m.email.toLowerCase());
    if (cur) toUpdate.push({ id: cur.id, ...m }); else toCreate.push(m);
  }
  if (toCreate.length) await ctx.runMutation(internal._crud.bulkCreate, { table: "customers", docs: toCreate.map((d) => ({ ...d, created_date: new Date().toISOString(), updated_date: new Date().toISOString() })) });
  if (toUpdate.length) await ctx.runMutation(internal._crud.bulkUpdate, { table: "customers", docs: toUpdate.map((d) => ({ ...d, updated_date: new Date().toISOString() })) });
  if (newest) await setSetting(ctx, "shopify_customers_checkpoint", newest, "Shopify Checkpoint Clienti");
  return { fetched: fetched.length, created: toCreate.length, updated: toUpdate.length, checkpoint: newest, incremental: !!since };
}

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export default action({
  args: {
    password: v.string(),
    operation: v.string(),
    payload: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const auth = authenticateAdmin(ctx, { password: args.password, clientKey: args.password.slice(0, 8) });
    if (auth.error) return new Response(JSON.stringify(auth.error), { status: auth.error.status, headers: { "Content-Type": "application/json" } });
    const payload = args.payload || {};
    try {
      switch (args.operation) {
        case "status": {
          const { domain, token } = await resolve(ctx, payload);
          return json({ configured: !!domain && !!token, domain, has_token: !!token, orders_checkpoint: await getSetting(ctx, "shopify_orders_checkpoint"), customers_checkpoint: await getSetting(ctx, "shopify_customers_checkpoint") });
        }
        case "save_creds": {
          const domain = normalizeDomain(payload.shop_domain);
          const token = String(payload.access_token || "").trim();
          if (!domain || !token || token.length > 512) return json({ error: "Dominio o token non validi" }, 400);
          await setSetting(ctx, "shopify_shop_domain", domain, "Shopify Dominio");
          await setSetting(ctx, "shopify_access_token", token, "Shopify Token");
          return json({ ok: true });
        }
        case "test": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return json({ error: "Credenziali non configurate" }, 400);
          const data = await graphql(domain, token, "query { shop { name domain countryCode } }");
          return json({ shop: { name: data.shop?.name, domain: data.shop?.domain, country: data.shop?.countryCode } });
        }
        case "sync_orders": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return json({ error: "Credenziali non configurate" }, 400);
          return json(await syncOrders(ctx, domain, token));
        }
        case "sync_customers": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return json({ error: "Credenziali non configurate" }, 400);
          return json(await syncCustomers(ctx, domain, token));
        }
        case "sync_all": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return json({ error: "Credenziali non configurate" }, 400);
          const orders = await syncOrders(ctx, domain, token);
          const customers = await syncCustomers(ctx, domain, token);
          return json({ orders, customers });
        }
        default: return json({ error: "Operazione non valida" }, 400);
      }
    } catch (e) {
      console.error("shopify error:", e);
      return json({ error: e.message || "Operazione Shopify non riuscita" }, 500);
    }
  },
});