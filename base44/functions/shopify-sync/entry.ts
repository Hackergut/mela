import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from 'base44:runtime';

const API_VERSION = '2025-10';
const GRAPHQL_PAGE_SIZE = 100;
const GRAPHQL_MAX_PAGES = 40;

function normalizeShopDomain(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (parsed.protocol !== 'https:' || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(parsed.hostname)) return '';
    return parsed.hostname;
  } catch {
    return '';
  }
}

// Single fixed GraphQL endpoint per shop — no remote pagination URLs to
// validate any more (the REST Link-header SSRF guard is obsolete here).
async function shopifyGraphQL(domain, token, query, variables = {}) {
  const normalizedDomain = normalizeShopDomain(domain);
  if (!normalizedDomain) throw new Error('Invalid Shopify domain');
  const res = await fetch(`https://${normalizedDomain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    console.error(`Shopify GraphQL ${res.status}:`, detail);
    throw new Error(`Richiesta Shopify non riuscita (${res.status})`);
  }
  const body = await res.json();
  if (body.errors?.length) {
    // Surface only the message: response bodies may embed internal details.
    console.error('Shopify GraphQL errors:', JSON.stringify(body.errors).slice(0, 500));
    throw new Error(body.errors[0]?.message || 'Errore GraphQL Shopify');
  }
  return body.data;
}

function mapOrderStatus(order) {
  if (order.canceledAt) return 'cancelled';
  if (order.financialStatus === 'REFUNDED') return 'refunded';
  if (order.fulfillmentStatus === 'FULFILLED') return 'delivered';
  if (order.fulfillmentStatus === 'PARTIAL') return 'shipped';
  if (order.financialStatus === 'PAID' || order.financialStatus === 'PARTIALLY_PAID') return 'paid';
  return 'pending';
}

const money = (set) => Math.round(parseFloat(set?.shopMoney?.amount || 0) * 100);

function mapShopifyOrder(order) {
  const items = (order.lineItems?.nodes || []).map(line => ({
    name: line.name || line.title || 'Articolo',
    price_cents: money(line.originalUnitPriceSet),
    qty: line.quantity || 1,
  }));
  return {
    order_number: order.name || '',
    customer_name: [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || order.customer?.displayName || '',
    customer_email: order.email || order.customer?.email || '',
    items,
    subtotal_cents: money(order.subtotalPriceSet),
    discount_amount_cents: money(order.totalDiscountsSet),
    total_cents: money(order.totalPriceSet),
    status: mapOrderStatus(order),
    discount_code: order.discountCode || '',
    shipped_date: order.fulfillmentStatus === 'FULFILLED' && order.processedAt ? order.processedAt : null,
  };
}

function mapShopifyCustomer(customer) {
  return {
    name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email || '',
    email: customer.email || '',
    phone: customer.phone || '',
    notes: customer.note || '',
    total_spent: Math.round(parseFloat(customer.totalSpent || 0) * 100),
    orders_count: customer.ordersCount || 0,
    tags: (customer.tags || []).map(tag => String(tag).trim()).filter(Boolean),
  };
}

const ORDERS_QUERY = `
  query SyncOrders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: UPDATED_AT, reverse: false) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id name email canceledAt processedAt updatedAt
        financialStatus fulfillmentStatus discountCode
        totalPriceSet { shopMoney { amount } }
        subtotalPriceSet { shopMoney { amount } }
        totalDiscountsSet { shopMoney { amount } }
        customer { firstName lastName displayName email }
        lineItems(first: 50) {
          nodes { name title quantity originalUnitPriceSet { shopMoney { amount } } }
        }
      }
    }
  }
`;

const CUSTOMERS_QUERY = `
  query SyncCustomers($first: Int!, $after: String, $query: String) {
    customers(first: $first, after: $after, query: $query, sortKey: UPDATED_AT, reverse: false) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id firstName lastName email phone note updatedAt totalSpent ordersCount tags
      }
    }
  }
`;

/**
 * Cursor-paginated GraphQL fetch. `since` filters by updated_at so repeated
 * syncs only read what changed since the previous checkpoint; `onNode`
 * receives every raw node. Returns the newest updatedAt seen (ISO string) or
 * null when nothing was fetched.
 */
async function fetchSince(domain, token, query, resourceName, since, onNode) {
  let after = null;
  let newest = since || null;
  for (let page = 0; page < GRAPHQL_MAX_PAGES; page++) {
    const data = await shopifyGraphQL(domain, token, query, {
      first: GRAPHQL_PAGE_SIZE,
      after,
      query: since ? `updated_at:>${since}` : null,
    });
    const connection = data?.[resourceName];
    if (!connection) throw new Error('Risposta Shopify inattesa');
    for (const node of connection.nodes || []) {
      onNode(node);
      if (node.updatedAt && (!newest || node.updatedAt > newest)) newest = node.updatedAt;
    }
    if (!connection.pageInfo?.hasNextPage) break;
    after = connection.pageInfo.endCursor;
  }
  return newest;
}

// Rate limiting for the shared admin password (mirrors admin-cms).
const AUTH_MAX_FAILURES = 5;
const AUTH_LOCKOUT_MS = 10 * 60 * 1000;
/** @type {Map<string, { count: number, lockedUntil: number, firstFailure: number }>} */
const authFailures = new Map();

function getClientKey(req) {
  const forwarded = String(req.headers?.get?.('x-forwarded-for') || '');
  const ip = forwarded.split(',')[0].trim() || String(req.headers?.get?.('cf-connecting-ip') || '').trim();
  return ip || 'unknown';
}

function timingSafeEquals(actual, expected) {
  const encoder = new TextEncoder();
  const a = encoder.encode(String(actual ?? ''));
  const b = encoder.encode(String(expected ?? ''));
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a[i] || 0) ^ (b[i] || 0);
  }
  return diff === 0;
}

function checkAuthRateLimit(key) {
  const now = Date.now();
  const entry = authFailures.get(key);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (now - entry.firstFailure > AUTH_LOCKOUT_MS) authFailures.delete(key);
  return { allowed: true };
}

function recordAuthFailure(key) {
  const now = Date.now();
  const entry = authFailures.get(key);
  if (!entry || now - entry.firstFailure > AUTH_LOCKOUT_MS) {
    authFailures.set(key, { count: 1, lockedUntil: 0, firstFailure: now });
    return;
  }
  entry.count += 1;
  if (entry.count >= AUTH_MAX_FAILURES) entry.lockedUntil = now + AUTH_LOCKOUT_MS;
}

export default async function(req) {
  try {
    const body = await req.json();
    const { password, operation, payload } = body;

    const clientKey = getClientKey(req);
    const rateLimit = checkAuthRateLimit(clientKey);
    if (!rateLimit.allowed) {
      const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterSec / 60));
      return Response.json(
        { error: `Troppi tentativi falliti. Riprova tra ${minutes} minuti.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } },
      );
    }

    const adminPassword = secrets.get("ADMIN_PASSWORD");
    const superPassword = secrets.get("SUPER_ADMIN_PASSWORD");
    if (!adminPassword && !superPassword) {
      return Response.json(
        { error: "Accesso admin non configurato: imposta i secret ADMIN_PASSWORD e SUPER_ADMIN_PASSWORD in Base44 (Impostazioni → Secrets, oppure `base44 secrets set ADMIN_PASSWORD=…`) e riprova." },
        { status: 503 },
      );
    }
    const isSuperAdmin = !!superPassword && timingSafeEquals(password, superPassword);
    const isAdmin = !!adminPassword && timingSafeEquals(password, adminPassword);
    if (!password || (!isAdmin && !isSuperAdmin)) {
      recordAuthFailure(clientKey);
      return Response.json({ error: "Password non valida" }, { status: 401 });
    }
    authFailures.delete(clientKey);

    const base44 = createClientFromRequest(req);
    const Setting = base44.asServiceRole.entities.Setting;

    const allSettings = await Setting.filter({}, 'key', 500);
    const getSetting = (k) => allSettings.find(s => s.key === k)?.value || '';

    async function upsertSetting(key, value, label) {
      const existing = allSettings.find(s => s.key === key);
      if (existing) await Setting.update(existing.id, { value: String(value ?? ''), label });
      else { const created = await Setting.create({ key, value: String(value ?? ''), label }); allSettings.push(created); }
    }

    const resolveCreds = () => ({
      domain: normalizeShopDomain(
        payload?.shop_domain || secrets.get('SHOPIFY_SHOP_DOMAIN') || getSetting('shopify_shop_domain'),
      ),
      token: String(
        payload?.access_token || secrets.get('SHOPIFY_ACCESS_TOKEN') || getSetting('shopify_access_token') || '',
      ).trim(),
    });

    // Incremental checkpoint helpers: the setting stores the newest Shopify
    // updatedAt already processed, so each sync only fetches what changed.
    // `payload.full === true` forces a complete backfill and resets it.
    const readCheckpoint = (name) => (!payload?.full ? (getSetting(name) || null) : null);
    const writeCheckpoint = async (name, value, label) => {
      if (value) await upsertSetting(name, value, label);
    };

    const syncOrders = async (domain, token) => {
      const since = readCheckpoint('shopify_orders_checkpoint');
      const sOrders = [];
      const newest = await fetchSince(domain, token, ORDERS_QUERY, 'orders', since, node => sOrders.push(node));
      const existing = await base44.asServiceRole.entities.Order.filter({}, '-created_date', 500);
      const map = {};
      existing.forEach(o => { if (o.order_number) map[o.order_number] = o; });
      const toCreate = [];
      const toUpdate = [];
      sOrders.forEach(so => {
        const mapped = mapShopifyOrder(so);
        if (!mapped.order_number) return;
        if (map[mapped.order_number]) toUpdate.push({ id: map[mapped.order_number].id, ...mapped });
        else toCreate.push(mapped);
      });
      if (toCreate.length) await base44.asServiceRole.entities.Order.bulkCreate(toCreate);
      if (toUpdate.length) await base44.asServiceRole.entities.Order.bulkUpdate(toUpdate);
      await writeCheckpoint('shopify_orders_checkpoint', newest, 'Shopify Checkpoint Ordini');
      return { fetched: sOrders.length, created: toCreate.length, updated: toUpdate.length, checkpoint: newest, incremental: !!since };
    };

    const syncCustomers = async (domain, token) => {
      const since = readCheckpoint('shopify_customers_checkpoint');
      const sCustomers = [];
      const newest = await fetchSince(domain, token, CUSTOMERS_QUERY, 'customers', since, node => sCustomers.push(node));
      const existing = await base44.asServiceRole.entities.Customer.filter({}, '-created_date', 500);
      const map = {};
      existing.forEach(c => { if (c.email) map[c.email.toLowerCase()] = c; });
      const toCreate = [];
      const toUpdate = [];
      sCustomers.forEach(sc => {
        const mapped = mapShopifyCustomer(sc);
        if (!mapped.email) return;
        if (map[mapped.email.toLowerCase()]) toUpdate.push({ id: map[mapped.email.toLowerCase()].id, ...mapped });
        else toCreate.push(mapped);
      });
      if (toCreate.length) await base44.asServiceRole.entities.Customer.bulkCreate(toCreate);
      if (toUpdate.length) await base44.asServiceRole.entities.Customer.bulkUpdate(toUpdate);
      await writeCheckpoint('shopify_customers_checkpoint', newest, 'Shopify Checkpoint Clienti');
      return { fetched: sCustomers.length, created: toCreate.length, updated: toUpdate.length, checkpoint: newest, incremental: !!since };
    };

    switch (operation) {
      case "status": {
        const { domain, token } = resolveCreds();
        return Response.json({
          configured: !!domain && !!token,
          domain,
          has_token: !!token,
          orders_checkpoint: getSetting('shopify_orders_checkpoint') || null,
          customers_checkpoint: getSetting('shopify_customers_checkpoint') || null,
        });
      }
      case "save_creds": {
        const { shop_domain, access_token } = payload || {};
        const domain = normalizeShopDomain(shop_domain);
        const token = String(access_token || '').trim();
        if (!domain || !token || token.length > 512) return Response.json({ error: "Dominio Shopify o token non validi" }, { status: 400 });
        await upsertSetting('shopify_shop_domain', domain, 'Shopify Dominio');
        await upsertSetting('shopify_access_token', token, 'Shopify Token');
        return Response.json({ ok: true });
      }
      case "test": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        const data = await shopifyGraphQL(domain, token, 'query { shop { name domain countryCode } }');
        return Response.json({ shop: { name: data.shop?.name, domain: data.shop?.domain, country: data.shop?.countryCode } });
      }
      case "sync_orders": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        return Response.json(await syncOrders(domain, token));
      }
      case "sync_customers": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        return Response.json(await syncCustomers(domain, token));
      }
      case "sync_all": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        const orders = await syncOrders(domain, token);
        const customers = await syncCustomers(domain, token);
        return Response.json({ orders, customers });
      }
      default:
        return Response.json({ error: "Operazione non valida" }, { status: 400 });
    }
  } catch (error) {
    console.error("shopify-sync error:", error);
    return Response.json({ error: "Operazione Shopify non riuscita" }, { status: 500 });
  }
}
