import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from 'base44:runtime';

const API_VERSION = '2025-10';

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

async function shopifyFetch(domain, token, path) {
  const normalizedDomain = normalizeShopDomain(domain);
  if (!normalizedDomain) throw new Error('Invalid Shopify domain');

  const baseUrl = new URL(`https://${normalizedDomain}`);
  const url = new URL(
    path.startsWith('http') ? path : `/admin/api/${API_VERSION}/${path}`,
    baseUrl,
  );
  // Shopify pagination links are remote input too: never follow a Link header
  // that leaves the configured shop origin.
  if (url.origin !== baseUrl.origin) throw new Error('Invalid Shopify pagination URL');

  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    console.error(`Shopify API ${res.status}:`, detail);
    throw new Error(`Shopify API request failed (${res.status})`);
  }
  const data = await res.json();
  const linkHeader = res.headers.get('link') || '';
  let nextUrl = null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  if (match) nextUrl = match[1];
  return { data, nextUrl };
}

async function shopifyPaginate(domain, token, resource, extra = '') {
  const all = [];
  let path = `${resource}.json?limit=250${extra}`;
  let guard = 0;
  while (path && guard < 60) {
    const { data, nextUrl } = await shopifyFetch(domain, token, path);
    all.push(...(data[resource] || []));
    path = nextUrl;
    guard++;
  }
  return all;
}

function mapOrderStatus(o) {
  if (o.cancelled_at) return 'cancelled';
  if (o.financial_status === 'refunded') return 'refunded';
  if (o.fulfillment_status === 'fulfilled') return 'delivered';
  if (o.fulfillment_status === 'partial') return 'shipped';
  if (o.financial_status === 'paid' || o.financial_status === 'partially_paid') return 'paid';
  return 'pending';
}

function mapShopifyOrder(o) {
  const items = (o.line_items || []).map(li => ({
    name: li.name || li.title || 'Articolo',
    price_cents: Math.round(parseFloat(li.price || 0) * 100),
    qty: li.quantity || 1,
  }));
  return {
    order_number: o.name || `#${o.order_number}`,
    customer_name: [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || o.customer?.name || '',
    customer_email: o.email || o.customer?.email || '',
    items,
    subtotal_cents: Math.round(parseFloat(o.subtotal_price || 0) * 100),
    discount_amount_cents: Math.round(parseFloat(o.total_discounts || 0) * 100),
    total_cents: Math.round(parseFloat(o.total_price || 0) * 100),
    status: mapOrderStatus(o),
    discount_code: (o.discount_codes && o.discount_codes[0]?.code) || '',
    shipped_date: o.fulfillment_status === 'fulfilled' && o.processed_at ? o.processed_at : null,
  };
}

function mapShopifyCustomer(c) {
  return {
    name: [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || '',
    email: c.email || '',
    phone: c.phone || '',
    notes: c.note || '',
    total_spent: Math.round(parseFloat(c.total_spent || 0) * 100),
    orders_count: c.orders_count || 0,
    tags: (c.tags || '').split(',').map(t => t.trim()).filter(Boolean),
  };
}

export default async function(req) {
  try {
    const body = await req.json();
    const { password, operation, payload } = body;

    const adminPassword = secrets.get("ADMIN_PASSWORD");
    const superPassword = secrets.get("SUPER_ADMIN_PASSWORD");
    const isSuperAdmin = !!superPassword && password === superPassword;
    const isAdmin = password === adminPassword;
    if (!password || (!isAdmin && !isSuperAdmin)) {
      return Response.json({ error: "Password non valida" }, { status: 401 });
    }

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

    switch (operation) {
      case "status": {
        const { domain, token } = resolveCreds();
        return Response.json({
          configured: !!domain && !!token,
          domain,
          has_token: !!token,
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
        const { data } = await shopifyFetch(domain, token, 'shop.json');
        return Response.json({ shop: { name: data.shop?.name, domain: data.shop?.domain, plan: data.shop?.plan_name, country: data.shop?.country_code } });
      }
      case "sync_orders": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        const sOrders = await shopifyPaginate(domain, token, 'orders', '&status=any');
        const existing = await base44.asServiceRole.entities.Order.filter({}, '-created_date', 500);
        const map = {};
        existing.forEach(o => { if (o.order_number) map[o.order_number] = o; });
        const toCreate = [];
        const toUpdate = [];
        sOrders.forEach(so => {
          const mapped = mapShopifyOrder(so);
          if (map[mapped.order_number]) toUpdate.push({ id: map[mapped.order_number].id, ...mapped });
          else toCreate.push(mapped);
        });
        if (toCreate.length) await base44.asServiceRole.entities.Order.bulkCreate(toCreate);
        if (toUpdate.length) await base44.asServiceRole.entities.Order.bulkUpdate(toUpdate);
        return Response.json({ fetched: sOrders.length, created: toCreate.length, updated: toUpdate.length });
      }
      case "sync_customers": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        const sCustomers = await shopifyPaginate(domain, token, 'customers');
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
        return Response.json({ fetched: sCustomers.length, created: toCreate.length, updated: toUpdate.length });
      }
      case "sync_all": {
        const { domain, token } = resolveCreds();
        if (!domain || !token) return Response.json({ error: "Credenziali Shopify non configurate" }, { status: 400 });
        const sOrders = await shopifyPaginate(domain, token, 'orders', '&status=any');
        const sCustomers = await shopifyPaginate(domain, token, 'customers');
        const exOrders = await base44.asServiceRole.entities.Order.filter({}, '-created_date', 500);
        const exCust = await base44.asServiceRole.entities.Customer.filter({}, '-created_date', 500);
        const oMap = {}; exOrders.forEach(o => { if (o.order_number) oMap[o.order_number] = o; });
        const cMap = {}; exCust.forEach(c => { if (c.email) cMap[c.email.toLowerCase()] = c; });
        const oc = [], ou = [], cc = [], cu = [];
        sOrders.forEach(so => {
          const m = mapShopifyOrder(so);
          if (oMap[m.order_number]) ou.push({ id: oMap[m.order_number].id, ...m });
          else oc.push(m);
        });
        sCustomers.forEach(sc => {
          const m = mapShopifyCustomer(sc);
          if (!m.email) return;
          if (cMap[m.email.toLowerCase()]) cu.push({ id: cMap[m.email.toLowerCase()].id, ...m });
          else cc.push(m);
        });
        if (oc.length) await base44.asServiceRole.entities.Order.bulkCreate(oc);
        if (ou.length) await base44.asServiceRole.entities.Order.bulkUpdate(ou);
        if (cc.length) await base44.asServiceRole.entities.Customer.bulkCreate(cc);
        if (cu.length) await base44.asServiceRole.entities.Customer.bulkUpdate(cu);
        return Response.json({
          orders: { fetched: sOrders.length, created: oc.length, updated: ou.length },
          customers: { fetched: sCustomers.length, created: cc.length, updated: cu.length },
        });
      }
      default:
        return Response.json({ error: "Operazione non valida" }, { status: 400 });
    }
  } catch (error) {
    console.error("shopify-sync error:", error);
    return Response.json({ error: "Operazione Shopify non riuscita" }, { status: 500 });
  }
}
