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

const eurosToCents = (raw) => {
  if (raw && typeof raw === "object" && "amount" in raw) return eurosToCents(raw.amount);
  const n = Number.parseFloat(String(raw ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
};
const slugify = (value) => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);

const mapProductStatus = (status) => {
  const value = String(status || "").toUpperCase();
  if (value === "ACTIVE") return "active";
  if (value === "DRAFT") return "withdrawn";
  return "discontinued";
};

const PRODUCTS_Q = `query Sync($first:Int!,$after:String,$query:String){products(first:$first,after:$after,query:$query){pageInfo{hasNextPage endCursor}nodes{id title handle description status productType vendor tags updatedAt featuredImage{url} images(first:12){nodes{url}} variants(first:100){nodes{id title sku price compareAtPrice inventoryQuantity selectedOptions{name value} image{url}}}}}}`;

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
  const [domainSetting, tokenSetting, storefrontSetting] = await Promise.all([
    getSetting(ctx, "shopify_shop_domain"),
    getSetting(ctx, "shopify_access_token"),
    getSetting(ctx, "shopify_storefront_access_token"),
  ]);
  return {
    domain: normalizeDomain(payload?.shop_domain || process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP_DOMAIN || domainSetting),
    token: String(payload?.access_token || process.env.SHOPIFY_ACCESS_TOKEN || tokenSetting || "").trim(),
    storefrontToken: String(payload?.storefront_access_token || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || storefrontSetting || "").trim(),
  };
}

async function syncProducts(ctx, domain, token, full = false) {
  const checkpoint = (await getSetting(ctx, "shopify_products_checkpoint")) || null;
  const since = full ? null : checkpoint;
  const fetched = [];
  let after = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await graphql(domain, token, PRODUCTS_Q, {
      first: PAGE_SIZE,
      after,
      query: since ? `updated_at:>${since}` : null,
    });
    const conn = data?.products;
    if (!conn) throw new Error("Risposta Shopify prodotti inattesa");
    fetched.push(...(conn.nodes || []));
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }

  const existingProducts = await ctx.runQuery(internal._crud.listAll, { table: "products" });
  const existingVariants = await ctx.runQuery(internal._crud.listAll, { table: "product_variants" });
  const existingCategories = await ctx.runQuery(internal._crud.listAll, { table: "categories" });
  const productByShopify = new Map(existingProducts.map((product) => [String(product.shopify_product_id || ""), product]));
  const variantByShopify = new Map(existingVariants.map((variant) => [String(variant.shopify_variant_id || ""), variant]));
  const categoryByName = new Map(existingCategories.map((category) => [String(category.name || "").toLowerCase(), category]));

  let created = 0;
  let updated = 0;
  let variantsCreated = 0;
  let variantsUpdated = 0;
  const now = new Date().toISOString();
  const syncedProductIds = new Set();
  const syncedVariantIds = new Set();
  let newest = checkpoint || null;

  for (const node of fetched) {
    if (node.updatedAt && (!newest || String(node.updatedAt) > String(newest))) newest = node.updatedAt;
    syncedProductIds.add(String(node.id || ""));
    const productStatus = mapProductStatus(node.status);

    const typeName = String(node.productType || "Store").trim() || "Store";
    let category = categoryByName.get(typeName.toLowerCase());
    if (!category) {
      const categoryId = await ctx.runMutation(internal._crud.createOne, {
        table: "categories",
        data: {
          name: typeName,
          slug: slugify(typeName),
          description: `Prodotti ${typeName}`,
          status: "active",
          featured: false,
          image: node.featuredImage?.url || "",
          sort_order: categoryByName.size * 10,
          created_date: now,
          updated_date: now,
        },
      });
      category = { id: categoryId, name: typeName };
      categoryByName.set(typeName.toLowerCase(), category);
    }

    const images = [...new Set([node.featuredImage?.url, ...(node.images?.nodes || []).map((image) => image.url)].filter(Boolean))];
    const firstVariant = node.variants?.nodes?.[0];
    const priceCents = eurosToCents(firstVariant?.price);
    const payload = {
      name: node.title || "Prodotto",
      slug: node.handle || slugify(node.title),
      subtitle: node.vendor || "",
      brand: node.vendor || "",
      family: typeName,
      sku: firstVariant?.sku || "",
      price: firstVariant?.price ? `€${firstVariant.price}` : "",
      price_cents: priceCents,
      stock: (node.variants?.nodes || []).reduce((sum, variant) => sum + Math.max(0, Number(variant.inventoryQuantity) || 0), 0),
      status: productStatus,
      category: typeName,
      category_id: category.id,
      description: node.description || "",
      image: images[0] || "",
      images,
      featured: Array.isArray(node.tags) && node.tags.some((tag) => String(tag).toLowerCase() === "featured"),
      source: "shopify",
      shopify_product_id: node.id,
      synced_at: now,
      updated_date: now,
    };

    const current = productByShopify.get(node.id);
    let productId = current?.id;
    if (current) {
      await ctx.runMutation(internal._crud.updateOne, { table: "products", id: current.id, data: payload });
      updated += 1;
    } else {
      productId = await ctx.runMutation(internal._crud.createOne, {
        table: "products",
        data: { ...payload, created_date: now },
      });
      created += 1;
    }

    (node.variants?.nodes || []).forEach((variant, index) => {
      variant.__index = index;
    });
    for (const variant of node.variants?.nodes || []) {
      const optionValues = Object.fromEntries(
        (variant.selectedOptions || [])
          .map((option) => [String(option.name || "").trim(), String(option.value || "").trim()])
          .filter(([name, value]) => name && value && value !== "Default Title"),
      );
      const variantPayload = {
        product_id: productId,
        title: variant.title && variant.title !== "Default Title" ? variant.title : "Standard",
        sku: String(variant.sku || "").trim() || `${node.handle || "sku"}-${variant.__index + 1}`,
        option_values: optionValues,
        price_cents: eurosToCents(variant.price),
        compare_at_cents: eurosToCents(variant.compareAtPrice),
        stock: Math.max(0, Number(variant.inventoryQuantity) || 0),
        image: variant.image?.url || images[0] || "",
        images: [variant.image?.url, images[0]].filter(Boolean),
        status: productStatus,
        is_default: variant.__index === 0,
        sort_order: variant.__index,
        shopify_product_id: node.id,
        shopify_variant_id: variant.id,
        synced_at: now,
        updated_date: now,
      };
      syncedVariantIds.add(String(variant.id || ""));
      const existingVariant = variantByShopify.get(variant.id);
      if (existingVariant) {
        await ctx.runMutation(internal._crud.updateOne, { table: "product_variants", id: existingVariant.id, data: variantPayload });
        variantsUpdated += 1;
      } else {
        await ctx.runMutation(internal._crud.createOne, {
          table: "product_variants",
          data: { ...variantPayload, created_date: now },
        });
        variantsCreated += 1;
      }
    }
  }

  // In a full sync, products/variants no longer present in Shopify should not
  // stay active in the local catalogue. We mark them withdrawn instead of
  // deleting so historical data is preserved.
  let staleProducts = 0;
  let staleVariants = 0;
  if (full && fetched.length) {
    for (const product of existingProducts) {
      if (String(product.source || "") !== "shopify") continue;
      if (syncedProductIds.has(String(product.shopify_product_id || ""))) continue;
      await ctx.runMutation(internal._crud.updateOne, {
        table: "products",
        id: product.id,
        data: { status: "withdrawn", updated_date: now },
      });
      staleProducts += 1;
    }
    for (const variant of existingVariants) {
      if (syncedVariantIds.has(String(variant.shopify_variant_id || ""))) continue;
      if (variant.status === "withdrawn") continue;
      const product = existingProducts.find((item) => String(item.id) === String(variant.product_id));
      if (product && String(product.source || "") !== "shopify") continue;
      await ctx.runMutation(internal._crud.updateOne, {
        table: "product_variants",
        id: variant.id,
        data: { status: "withdrawn", updated_date: now },
      });
      staleVariants += 1;
    }
  }
  if (newest) await setSetting(ctx, "shopify_products_checkpoint", newest, "Shopify Checkpoint Prodotti");

  return {
    fetched: fetched.length,
    created,
    updated,
    variants_created: variantsCreated,
    variants_updated: variantsUpdated,
    stale_products: staleProducts,
    stale_variants: staleVariants,
    checkpoint: newest,
    incremental: !!checkpoint && !full,
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

const json = (data, status = 200) => ({ __ok: true, status, ...data });
const jfail = (error, status = 400) => ({ __ok: false, status, error });

export default action({
  args: {
    password: v.string(),
    operation: v.string(),
    payload: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const auth = authenticateAdmin(ctx, { password: args.password, clientKey: args.password.slice(0, 8) });
    if (auth.error) return { __ok: false, ...auth.error };
    const payload = args.payload || {};
    try {
      switch (args.operation) {
        case "status": {
          const { domain, token, storefrontToken } = await resolve(ctx, payload);
          return json({
            configured: !!domain && !!token,
            storefront_configured: !!domain && !!storefrontToken,
            domain,
            has_token: !!token,
            has_storefront_token: !!storefrontToken,
            products_checkpoint: await getSetting(ctx, "shopify_products_checkpoint"),
            orders_checkpoint: await getSetting(ctx, "shopify_orders_checkpoint"),
            customers_checkpoint: await getSetting(ctx, "shopify_customers_checkpoint"),
          });
        }
        case "save_creds": {
          const domain = normalizeDomain(payload.shop_domain);
          const token = String(payload.access_token || "").trim();
          const storefrontToken = String(payload.storefront_access_token || "").trim();
          if (!domain || domain.length > 128) return jfail("Dominio non valido", 400);
          await setSetting(ctx, "shopify_shop_domain", domain, "Shopify Dominio");
          if (token) {
            if (token.length > 512) return jfail("Token Admin non valido", 400);
            await setSetting(ctx, "shopify_access_token", token, "Shopify Token");
          }
          if (storefrontToken) {
            if (storefrontToken.length > 512) return jfail("Token Storefront non valido", 400);
            await setSetting(ctx, "shopify_storefront_access_token", storefrontToken, "Shopify Storefront Token");
          }
          if (!token && !storefrontToken && !(await getSetting(ctx, "shopify_access_token")) && !(await getSetting(ctx, "shopify_storefront_access_token"))) {
            return jfail("Inserisci almeno un token", 400);
          }
          return json({ ok: true });
        }
        case "test": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return jfail("Credenziali non configurate", 400);
          const data = await graphql(domain, token, "query { shop { name domain countryCode } }");
          return json({ shop: { name: data.shop?.name, domain: data.shop?.domain, country: data.shop?.countryCode } });
        }
        case "sync_products": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return jfail("Credenziali non configurate", 400);
          return json(await syncProducts(ctx, domain, token, Boolean(payload.full)));
        }
        case "sync_orders": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return jfail("Credenziali non configurate", 400);
          return json(await syncOrders(ctx, domain, token));
        }
        case "sync_customers": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return jfail("Credenziali non configurate", 400);
          return json(await syncCustomers(ctx, domain, token));
        }
        case "sync_all": {
          const { domain, token } = await resolve(ctx, payload);
          if (!domain || !token) return jfail("Credenziali non configurate", 400);
          const products = await syncProducts(ctx, domain, token, Boolean(payload.full));
          const orders = await syncOrders(ctx, domain, token);
          const customers = await syncCustomers(ctx, domain, token);
          return json({ products, orders, customers });
        }
        default: return jfail("Operazione non valida", 400);
      }
    } catch (e) {
      console.error("shopify error:", e);
      return jfail(e.message || "Operazione Shopify non riuscita", 500);
    }
  },
});