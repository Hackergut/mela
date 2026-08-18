import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from 'base44:runtime';
import Stripe from 'npm:stripe@16.0.0';

const MAX_BULK_ITEMS = 500;
const MAX_VARIANTS_PER_PRODUCT = 100;
const MAIN_SETTING_KEYS = [
  'store_name',
  'store_email',
  'store_currency',
  'low_stock_threshold',
  'free_shipping_threshold',
  'shipping_flat_rate',
  'shipping_countries',
];
const SECRET_SETTING_KEYS = ['shopify_access_token'];

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function integer(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
}

function moneyLabel(cents) {
  const value = Math.max(0, integer(cents));
  const euros = Math.floor(value / 100).toLocaleString('it-IT');
  const decimal = String(value % 100).padStart(2, '0');
  return decimal === '00' ? `€${euros}` : `€${euros},${decimal}`;
}

function cleanOptions(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, option]) => [String(key).trim().slice(0, 40), String(option ?? '').trim().slice(0, 80)])
      .filter(([key, option]) => key && option),
  );
}

function normalizeSku(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '-').slice(0, 80);
}

function sanitizeVariant(raw, product, index) {
  const optionValues = cleanOptions(raw?.option_values);
  const title = String(raw?.title || Object.values(optionValues).join(' · ') || 'Standard').trim().slice(0, 160);
  const sku = normalizeSku(raw?.sku || product.sku || `TM-${slugify(product.name).slice(0, 24)}-${index + 1}`);
  const priceCents = integer(raw?.price_cents, integer(product.price_cents));
  const status = ['active', 'draft', 'archived'].includes(raw?.status) ? raw.status : 'active';

  if (!title || !sku) throw new Error(`La variante ${index + 1} richiede nome e SKU.`);
  if (status === 'active' && priceCents < 50) throw new Error(`La variante ${sku} richiede un prezzo di almeno 0,50 €.`);

  return {
    ...(raw?.id ? { id: String(raw.id) } : {}),
    title,
    sku,
    barcode: String(raw?.barcode || '').trim().slice(0, 80),
    option_values: optionValues,
    color_hex: /^#[0-9a-f]{6}$/i.test(String(raw?.color_hex || '')) ? String(raw.color_hex).toUpperCase() : '',
    price_cents: priceCents,
    compare_at_cents: Math.max(0, integer(raw?.compare_at_cents)),
    cost_cents: Math.max(0, integer(raw?.cost_cents)),
    stock: Math.max(0, integer(raw?.stock)),
    low_stock_threshold: Math.max(0, integer(raw?.low_stock_threshold, integer(product.low_stock_threshold, 5))),
    image: String(raw?.image || product.image || '').trim(),
    images: Array.isArray(raw?.images) ? raw.images.map(String).filter(Boolean).slice(0, 20) : [],
    status,
    is_default: Boolean(raw?.is_default),
    sort_order: integer(raw?.sort_order, index),
    shopify_product_id: String(raw?.shopify_product_id || '').trim(),
    shopify_variant_id: String(raw?.shopify_variant_id || '').trim(),
    ...(raw?.synced_at ? { synced_at: raw.synced_at } : {}),
  };
}

function aggregateProduct(rawProduct, variants) {
  const active = variants.filter(variant => variant.status === 'active');
  const selected = active.find(variant => variant.is_default) || active[0] || variants[0];
  const optionNames = [...new Set(variants.flatMap(variant => Object.keys(variant.option_values || {})))];
  const colors = [];
  for (const variant of variants) {
    const name = variant.option_values?.Finitura || variant.option_values?.Colore;
    if (name && !colors.some(color => color.name === name)) {
      colors.push({ name, hex: variant.color_hex || '#8e8e93', image: variant.image || rawProduct.image || '' });
    }
  }

  const priceCents = selected?.price_cents || integer(rawProduct.price_cents);
  return {
    name: String(rawProduct.name || '').trim().slice(0, 180),
    slug: slugify(rawProduct.slug || rawProduct.name),
    subtitle: String(rawProduct.subtitle || '').trim().slice(0, 220),
    brand: String(rawProduct.brand || 'Apple').trim().slice(0, 80),
    family: String(rawProduct.family || rawProduct.category || '').trim().slice(0, 100),
    sku: selected?.sku || normalizeSku(rawProduct.sku),
    price: moneyLabel(priceCents),
    price_cents: priceCents,
    cost_cents: selected?.cost_cents || Math.max(0, integer(rawProduct.cost_cents)),
    stock: active.reduce((sum, variant) => sum + Math.max(0, integer(variant.stock)), 0),
    low_stock_threshold: Math.max(0, integer(rawProduct.low_stock_threshold, 5)),
    status: ['active', 'withdrawn', 'discontinued'].includes(rawProduct.status) ? rawProduct.status : 'active',
    badge: rawProduct.badge ? String(rawProduct.badge).trim().slice(0, 40) : null,
    category: String(rawProduct.category || 'Generale').trim().slice(0, 100),
    category_id: String(rawProduct.category_id || '').trim(),
    option_names: optionNames,
    featured: Boolean(rawProduct.featured),
    compare_group: String(rawProduct.compare_group || rawProduct.family || rawProduct.category || '').trim().slice(0, 100),
    specs: cleanOptions(rawProduct.specs),
    image: selected?.image || String(rawProduct.image || '').trim(),
    images: Array.isArray(rawProduct.images) ? rawProduct.images.map(String).filter(Boolean).slice(0, 40) : [],
    colors,
    description: String(rawProduct.description || '').trim().slice(0, 5000),
    sort_order: integer(rawProduct.sort_order),
    is_mockup: Boolean(rawProduct.is_mockup),
    shopify_product_id: String(rawProduct.shopify_product_id || '').trim(),
    source: ['base44', 'shopify', 'legacy'].includes(rawProduct.source) ? rawProduct.source : 'base44',
    ...(rawProduct.synced_at ? { synced_at: rawProduct.synced_at } : {}),
  };
}

// Best-effort, in-memory rate limiting for the shared admin password.
// Serverless isolates can reset at any moment, so this blunts brute force
// rather than guaranteeing a global budget; strong passwords remain a must.
const AUTH_MAX_FAILURES = 5;
const AUTH_LOCKOUT_MS = 10 * 60 * 1000;
const AUTH_MAX_TRACKED_CLIENTS = 5000;
/** @type {Map<string, { count: number, lockedUntil: number, firstFailure: number }>} */
const authFailures = new Map();

function getClientKey(req) {
  const forwarded = String(req.headers?.get?.('x-forwarded-for') || '');
  const ip = forwarded.split(',')[0].trim() || String(req.headers?.get?.('cf-connecting-ip') || '').trim();
  return ip || 'unknown';
}

// Constant-time comparison so response latency does not leak how many
// characters of the password an attacker guessed correctly.
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
  if (authFailures.size >= AUTH_MAX_TRACKED_CLIENTS) {
    for (const [k, entry] of authFailures) {
      if (entry.lockedUntil <= now) authFailures.delete(k);
    }
    if (authFailures.size >= AUTH_MAX_TRACKED_CLIENTS) authFailures.clear();
  }
  const entry = authFailures.get(key);
  if (!entry || now - entry.firstFailure > AUTH_LOCKOUT_MS) {
    authFailures.set(key, { count: 1, lockedUntil: 0, firstFailure: now });
    return;
  }
  entry.count += 1;
  if (entry.count >= AUTH_MAX_FAILURES) entry.lockedUntil = now + AUTH_LOCKOUT_MS;
}

function clearAuthFailures(key) {
  authFailures.delete(key);
}

export default async function(req) {
  try {
    const body = await req.json();
    const { password, operation, resource, payload } = body;

    const clientKey = getClientKey(req);
    const rateLimit = checkAuthRateLimit(clientKey);
    if (!rateLimit.allowed) {
      const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterSec / 60));
      return Response.json(
        { error: `Troppi tentativi falliti. Riprova tra ${minutes} minuti.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } },
      );
    }

    const adminPassword = secrets.get('ADMIN_PASSWORD');
    const superPassword = secrets.get('SUPER_ADMIN_PASSWORD');
    if (!adminPassword && !superPassword) {
      return Response.json(
        {
          error:
            'Accesso admin non configurato: imposta i secret ADMIN_PASSWORD e SUPER_ADMIN_PASSWORD in Base44 (Impostazioni → Secrets, oppure `base44 secrets set ADMIN_PASSWORD=…`) e riprova.',
        },
        { status: 503 },
      );
    }
    const isSuperAdmin = Boolean(superPassword) && timingSafeEquals(password, superPassword);
    const isAdmin = Boolean(adminPassword) && timingSafeEquals(password, adminPassword);
    if (!password || (!isAdmin && !isSuperAdmin)) {
      recordAuthFailure(clientKey);
      return Response.json({ error: 'Password non valida' }, { status: 401 });
    }
    clearAuthFailures(clientKey);
    const canManageSettings = isSuperAdmin || !superPassword;

    const base44 = createClientFromRequest(req);
    const dbMap = {
      product: base44.asServiceRole.entities.Product,
      product_variant: base44.asServiceRole.entities.ProductVariant,
      category: base44.asServiceRole.entities.Category,
      asset: base44.asServiceRole.entities.Asset,
      order: base44.asServiceRole.entities.Order,
      discount: base44.asServiceRole.entities.Discount,
      customer: base44.asServiceRole.entities.Customer,
      user: base44.asServiceRole.entities.User,
      notification: base44.asServiceRole.entities.Notification,
      setting: base44.asServiceRole.entities.Setting,
      receipt: base44.asServiceRole.entities.Receipt,
      return: base44.asServiceRole.entities.Return,
      webhook_event: base44.asServiceRole.entities.WebhookEvent,
    };
    const res = resource || 'product';
    const db = dbMap[res];
    if (!db) return Response.json({ error: 'Risorsa non valida' }, { status: 400 });

    const sortMap = {
      product: '-sort_order', product_variant: 'sort_order', category: 'sort_order', asset: '-created_date',
      order: '-created_date', discount: '-created_date', customer: '-created_date', user: '-created_date',
      notification: '-created_date', setting: 'key', receipt: '-created_date', return: '-created_date',
      webhook_event: '-created_date',
    };

    const normalizeDiscountData = async (input, currentId = '') => {
      const code = String(input?.code || '').trim().toUpperCase();
      if (!/^[A-Z0-9][A-Z0-9_-]{1,63}$/.test(code)) {
        throw new Error('Il codice deve contenere da 2 a 64 caratteri: lettere, numeri, trattino o underscore');
      }
      const type = input?.type === 'fixed' ? 'fixed' : input?.type === 'percent' ? 'percent' : '';
      if (!type) throw new Error('Tipo di sconto non valido');
      const value = Number(input?.value);
      if (!Number.isFinite(value) || value <= 0 || (type === 'percent' && value > 100) || (type === 'fixed' && !Number.isSafeInteger(value))) {
        throw new Error(type === 'fixed' ? 'L’importo fisso deve essere espresso in centesimi interi' : 'La percentuale deve essere compresa tra 1 e 100');
      }
      const maxUses = input?.max_uses == null || input.max_uses === '' ? null : integer(input.max_uses);
      if (maxUses != null && maxUses < 1) throw new Error('Gli utilizzi massimi devono essere almeno 1');
      const usageCount = Math.max(0, integer(input?.usage_count));
      const expiresAt = String(input?.expires_at || '').trim();
      if (expiresAt && !Number.isFinite(new Date(expiresAt).getTime())) throw new Error('Data di scadenza non valida');
      const existing = await dbMap.discount.list('-created_date', MAX_BULK_ITEMS);
      if (existing.some(item => String(item.id) !== String(currentId) && String(item.code || '').trim().toUpperCase() === code)) {
        throw new Error('Esiste già un codice sconto con questo nome');
      }
      return {
        code,
        type,
        value,
        active: input?.active !== false,
        usage_count: usageCount,
        max_uses: maxUses,
        expires_at: expiresAt || null,
        description: String(input?.description || '').trim().slice(0, 500),
      };
    };

    const normalizeCategoryData = async (input, currentId = '') => {
      const name = String(input?.name || '').trim().slice(0, 100);
      if (!name) throw new Error('Nome categoria obbligatorio');
      const slug = slugify(input?.slug || name);
      const parentId = String(input?.parent_id || '').trim();
      const allCategories = await dbMap.category.list('sort_order', 200);
      const duplicate = allCategories.find(category => String(category.id) !== String(currentId) && (
        String(category.slug || '').toLowerCase() === slug || String(category.name || '').trim().toLowerCase() === name.toLowerCase()
      ));
      if (duplicate) throw new Error('Esiste già una categoria con questo nome o slug');
      if (parentId) {
        if (parentId === String(currentId)) throw new Error('Una categoria non può essere il proprio genitore');
        const byId = new Map(allCategories.map(category => [String(category.id), category]));
        if (!byId.has(parentId)) throw new Error('La categoria principale selezionata non esiste');
        let cursor = parentId;
        const visited = new Set();
        while (cursor && !visited.has(cursor)) {
          if (cursor === String(currentId)) throw new Error('La gerarchia selezionata creerebbe un ciclo');
          visited.add(cursor);
          cursor = String(byId.get(cursor)?.parent_id || '');
        }
      }
      return {
        ...input,
        name,
        slug,
        parent_id: parentId,
        description: String(input?.description || '').trim().slice(0, 1000),
        image: String(input?.image || '').trim(),
        status: input?.status === 'hidden' ? 'hidden' : 'active',
        featured: Boolean(input?.featured),
        sort_order: integer(input?.sort_order),
      };
    };

    switch (operation) {
      case 'list': {
        let items = await db.list(sortMap[res] || '-created_date', MAX_BULK_ITEMS);
        if (res === 'setting') items = items.filter(item => !SECRET_SETTING_KEYS.includes(item.key));
        return Response.json({ items, role: isSuperAdmin ? 'super_admin' : 'admin', canManageSettings });
      }
      case 'list_catalog': {
        const [products, variants, categories] = await Promise.all([
          dbMap.product.list('-sort_order', MAX_BULK_ITEMS),
          dbMap.product_variant.list('sort_order', 1000),
          dbMap.category.list('sort_order', 200),
        ]);
        return Response.json({ products, variants, categories, role: isSuperAdmin ? 'super_admin' : 'admin' });
      }
      case 'save_product': {
        try {
          const submittedProduct = payload?.product || {};
          const rawVariants = Array.isArray(payload?.variants) ? payload.variants : [];
          if (!String(submittedProduct.name || '').trim()) return Response.json({ error: 'Nome prodotto obbligatorio' }, { status: 400 });
          if (!String(submittedProduct.category_id || '').trim()) return Response.json({ error: 'Seleziona una categoria valida' }, { status: 400 });
          if (!String(submittedProduct.image || '').trim()) return Response.json({ error: 'Immagine principale obbligatoria' }, { status: 400 });
          const category = await dbMap.category.get(String(submittedProduct.category_id)).catch(() => null);
          if (!category) return Response.json({ error: 'La categoria selezionata non esiste' }, { status: 400 });
          const rawProduct = { ...submittedProduct, category_id: String(category.id), category: category.name };
          if (rawVariants.length === 0 || rawVariants.length > MAX_VARIANTS_PER_PRODUCT) {
            return Response.json({ error: 'Ogni prodotto deve avere da 1 a 100 varianti.' }, { status: 400 });
          }

          const variants = rawVariants.map((variant, index) => sanitizeVariant(variant, rawProduct, index));
          const skus = variants.map(variant => variant.sku);
          if (new Set(skus).size !== skus.length) return Response.json({ error: 'Gli SKU delle varianti devono essere univoci.' }, { status: 400 });
          const skuMatches = await Promise.all(skus.map(sku => dbMap.product_variant.filter({ sku }, 'sort_order', 10)));
          const duplicateSku = variants.find((variant, index) => skuMatches[index].some(existing => String(existing.id) !== String(variant.id || '')))?.sku;
          if (duplicateSku) return Response.json({ error: `Lo SKU ${duplicateSku} è già assegnato a un'altra variante.` }, { status: 409 });
          if (!variants.some(variant => variant.is_default)) variants[0].is_default = true;
          let defaultSeen = false;
          variants.forEach((variant) => {
            if (variant.is_default && !defaultSeen) defaultSeen = true;
            else if (variant.is_default) variant.is_default = false;
          });

          const productData = aggregateProduct(rawProduct, variants);
          const product = rawProduct.id
            ? await dbMap.product.update(rawProduct.id, productData)
            : await dbMap.product.create(productData);
          const existing = await dbMap.product_variant.filter({ product_id: product.id }, 'sort_order', MAX_VARIANTS_PER_PRODUCT);
          const existingIds = new Set(existing.map(variant => String(variant.id)));
          const keptIds = new Set();
          const toCreate = [];
          const toUpdate = [];

          for (const variant of variants) {
            const { id, ...variantData } = variant;
            const data = { ...variantData, product_id: String(product.id) };
            if (id && existingIds.has(String(id))) {
              keptIds.add(String(id));
              toUpdate.push({ id, ...data });
            } else {
              toCreate.push(data);
            }
          }

          if (toCreate.length) await dbMap.product_variant.bulkCreate(toCreate);
          if (toUpdate.length) await dbMap.product_variant.bulkUpdate(toUpdate);
          const removedIds = existing.map(variant => String(variant.id)).filter(id => !keptIds.has(id));
          if (removedIds.length) await dbMap.product_variant.deleteMany({ id: { $in: removedIds } });
          const savedVariants = await dbMap.product_variant.filter({ product_id: product.id }, 'sort_order', MAX_VARIANTS_PER_PRODUCT);
          return Response.json({ product, variants: savedVariants });
        } catch (error) {
          console.warn('save_product validation failed:', error);
          return Response.json({ error: error instanceof Error ? error.message : 'Dati prodotto non validi' }, { status: 400 });
        }
      }
      case 'normalize_catalog': {
        const apply = payload?.apply === true;
        const [products, variants, categories] = await Promise.all([
          dbMap.product.list('-sort_order', MAX_BULK_ITEMS),
          dbMap.product_variant.list('sort_order', 1000),
          dbMap.category.list('sort_order', 200),
        ]);
        const categoryByName = new Map(categories.map(category => [String(category.name || '').trim().toLowerCase(), category]));
        const missingCategoryNames = [...new Set(products.map(product => String(product.category || 'Generale').trim()).filter(Boolean))]
          .filter(name => !categoryByName.has(name.toLowerCase()));
        const variantsByProduct = new Map();
        variants.forEach((variant) => {
          const list = variantsByProduct.get(String(variant.product_id)) || [];
          list.push(variant);
          variantsByProduct.set(String(variant.product_id), list);
        });

        const report = {
          products: products.length,
          product_updates: 0,
          default_variants: 0,
          missing_categories: missingCategoryNames.length,
        };
        if (!apply) return Response.json({ report, categories: missingCategoryNames });

        for (const name of missingCategoryNames) {
          const created = await dbMap.category.create({
            name,
            slug: slugify(name),
            description: `Scopri tutti i prodotti ${name}.`,
            status: 'active',
            featured: false,
            sort_order: categoryByName.size,
          });
          categoryByName.set(name.toLowerCase(), created);
        }

        const productUpdates = [];
        const defaultVariants = [];
        for (const product of products) {
          const categoryName = String(product.category || 'Generale').trim();
          const category = categoryByName.get(categoryName.toLowerCase());
          const updates = {
            id: product.id,
            slug: product.slug || `${slugify(product.name)}-${String(product.id).slice(-6).toLowerCase()}`,
            brand: product.brand || 'Apple',
            family: product.family || categoryName,
            category: categoryName,
            category_id: product.category_id || category?.id || '',
            compare_group: product.compare_group || product.family || categoryName,
            source: product.source || 'legacy',
          };
          productUpdates.push(updates);
          report.product_updates++;

          if (!(variantsByProduct.get(String(product.id)) || []).length) {
            const priceCents = integer(product.price_cents, 0);
            defaultVariants.push({
              product_id: String(product.id),
              title: 'Standard',
              sku: normalizeSku(product.sku || `TM-${slugify(product.name).slice(0, 24)}-${String(product.id).slice(-6)}`),
              option_values: {},
              price_cents: priceCents,
              cost_cents: Math.max(0, integer(product.cost_cents)),
              stock: Math.max(0, integer(product.stock)),
              low_stock_threshold: Math.max(0, integer(product.low_stock_threshold, 5)),
              image: product.image,
              images: [],
              status: priceCents >= 50 ? 'active' : 'draft',
              is_default: true,
              sort_order: 0,
            });
            report.default_variants++;
          }
        }
        if (productUpdates.length) await dbMap.product.bulkUpdate(productUpdates);
        if (defaultVariants.length) await dbMap.product_variant.bulkCreate(defaultVariants);
        return Response.json({ report });
      }
      case 'complete_return': {
        const returnId = String(payload?.id || '').trim();
        if (!returnId) return Response.json({ error: 'ID reso mancante' }, { status: 400 });
        const returnItem = await dbMap.return.get(returnId).catch(() => null);
        if (!returnItem) return Response.json({ error: 'Reso non trovato' }, { status: 404 });
        if (returnItem.status === 'completed') return Response.json({ item: returnItem, duplicate: true });
        if (returnItem.status !== 'approved') return Response.json({ error: 'Il reso deve essere approvato prima del completamento' }, { status: 409 });
        const productId = String(returnItem.product_id || '').trim();
        if (!productId) return Response.json({ error: 'Il reso non contiene un prodotto valido' }, { status: 409 });
        const quantity = Math.max(1, integer(returnItem.quantity, 1));
        const product = await dbMap.product.get(productId).catch(() => null);
        if (!product) return Response.json({ error: 'Prodotto del reso non trovato' }, { status: 404 });
        const variantId = String(returnItem.variant_id || '').trim();
        if (variantId) {
          const variant = await dbMap.product_variant.get(variantId).catch(() => null);
          if (!variant || String(variant.product_id) !== productId) return Response.json({ error: 'Variante del reso non valida' }, { status: 409 });
          await dbMap.product_variant.update(variantId, { stock: Math.max(0, integer(variant.stock)) + quantity });
          const siblings = await dbMap.product_variant.filter({ product_id: productId }, 'sort_order', MAX_VARIANTS_PER_PRODUCT);
          const aggregateStock = siblings.filter(item => item.status === 'active').reduce((sum, item) => sum + Math.max(0, integer(item.stock)), 0);
          await dbMap.product.update(productId, { stock: aggregateStock });
        } else {
          await dbMap.product.update(productId, { stock: Math.max(0, integer(product.stock)) + quantity });
        }
        const item = await dbMap.return.update(returnId, { status: 'completed' });
        return Response.json({ item });
      }
      case 'create': {
        let data = { ...(payload || {}) };
        if (res === 'setting' && (MAIN_SETTING_KEYS.includes(data.key) || SECRET_SETTING_KEYS.includes(data.key)) && !canManageSettings) {
          return Response.json({ error: 'Solo il super admin può creare questo settaggio' }, { status: 403 });
        }
        if (res === 'discount') {
          try { data = await normalizeDiscountData(data); }
          catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Codice sconto non valido' }, { status: 400 }); }
        }
        if (res === 'product') {
          ['price_cents', 'cost_cents', 'stock', 'low_stock_threshold', 'sort_order'].forEach(key => {
            if (data[key] !== undefined) data[key] = Number(data[key]);
          });
          data.slug = data.slug || slugify(data.name);
        }
        if (res === 'product_variant') {
          ['price_cents', 'compare_at_cents', 'cost_cents', 'stock', 'low_stock_threshold', 'sort_order'].forEach(key => {
            if (data[key] !== undefined) data[key] = Number(data[key]);
          });
          data.sku = normalizeSku(data.sku);
        }
        if (res === 'category') {
          try { data = await normalizeCategoryData(data); }
          catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Categoria non valida' }, { status: 400 }); }
        }
        if (res === 'notification' && !data.severity) data.severity = 'info';
        if (res === 'receipt' && !data.receipt_number) data.receipt_number = `R-${data.type === 'purchase' ? 'ACQ' : 'VEN'}-${Date.now().toString().slice(-6)}`;
        if (res === 'return' && !data.return_number) data.return_number = `RES-${Date.now().toString().slice(-6)}`;
        const item = await db.create(data);
        return Response.json({ item });
      }
      case 'update': {
        let { id, ...data } = payload || {};
        if (!id) return Response.json({ error: 'ID mancante' }, { status: 400 });
        if (res === 'setting' && !canManageSettings) {
          const target = await db.get(id).catch(() => null);
          if ((target && (MAIN_SETTING_KEYS.includes(target.key) || SECRET_SETTING_KEYS.includes(target.key))) || MAIN_SETTING_KEYS.includes(data.key) || SECRET_SETTING_KEYS.includes(data.key)) {
            return Response.json({ error: 'Solo il super admin può modificare questo settaggio' }, { status: 403 });
          }
        }
        if (res === 'discount') {
          const current = await db.get(id).catch(() => null);
          if (!current) return Response.json({ error: 'Codice sconto non trovato' }, { status: 404 });
          try { data = await normalizeDiscountData({ ...current, ...data }, id); }
          catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Codice sconto non valido' }, { status: 400 }); }
        }
        if (res === 'product' || res === 'product_variant') {
          ['price_cents', 'compare_at_cents', 'cost_cents', 'stock', 'low_stock_threshold', 'sort_order'].forEach(key => {
            if (data[key] !== undefined) data[key] = Number(data[key]);
          });
        }
        if (res === 'product' && data.name && !data.slug) data.slug = slugify(data.name);
        if (res === 'category') {
          const current = await db.get(id).catch(() => null);
          if (!current) return Response.json({ error: 'Categoria non trovata' }, { status: 404 });
          try { data = await normalizeCategoryData({ ...current, ...data }, id); }
          catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Categoria non valida' }, { status: 400 }); }
          delete data.id;
          delete data.created_date;
          delete data.updated_date;
          delete data.created_by;
        }
        const item = await db.update(id, data);
        if (res === 'product_variant' && item.product_id) {
          const siblings = await dbMap.product_variant.filter({ product_id: item.product_id }, 'sort_order', MAX_VARIANTS_PER_PRODUCT);
          const active = siblings.filter(variant => variant.status === 'active');
          const selected = active.find(variant => variant.is_default) || active[0];
          const stock = active.reduce((sum, variant) => sum + Math.max(0, integer(variant.stock)), 0);
          if (selected) {
            await dbMap.product.update(item.product_id, {
              stock,
              sku: selected.sku,
              price_cents: selected.price_cents,
              price: moneyLabel(selected.price_cents),
              cost_cents: selected.cost_cents || 0,
              image: selected.image || undefined,
            });
          }
        }
        return Response.json({ item });
      }
      case 'bulk_update': {
        const items = Array.isArray(payload?.items) ? payload.items : [];
        if (!items.length || items.length > MAX_BULK_ITEMS || items.some(item => !item?.id)) {
          return Response.json({ error: 'Elenco aggiornamenti non valido' }, { status: 400 });
        }
        await db.bulkUpdate(items);
        return Response.json({ ok: true, updated: items.length });
      }
      case 'delete': {
        const { id } = payload || {};
        if (!id) return Response.json({ error: 'ID mancante' }, { status: 400 });
        if (res === 'setting') {
          const items = await db.list('-created_date', MAX_BULK_ITEMS);
          const target = items.find(setting => setting.id === id);
          if (target && (MAIN_SETTING_KEYS.includes(target.key) || SECRET_SETTING_KEYS.includes(target.key)) && !canManageSettings) {
            return Response.json({ error: 'Solo il super admin può modificare i settaggi CMS principali' }, { status: 403 });
          }
        }
        if (res === 'category') {
          const [assignedProducts, childCategories] = await Promise.all([
            dbMap.product.filter({ category_id: id }, '-sort_order', 1),
            dbMap.category.filter({ parent_id: id }, 'sort_order', 1),
          ]);
          if (assignedProducts.length || childCategories.length) {
            return Response.json({ error: 'Riassegna prima i prodotti e le sottocategorie collegate.' }, { status: 409 });
          }
        }
        if (res === 'product') {
          const childVariants = await dbMap.product_variant.filter({ product_id: id }, 'sort_order', MAX_VARIANTS_PER_PRODUCT);
          if (childVariants.length) await dbMap.product_variant.deleteMany({ id: { $in: childVariants.map(variant => variant.id) } });
        }
        await db.delete(id);
        return Response.json({ ok: true });
      }
      case 'bulk_delete': {
        const ids = Array.isArray(payload?.ids) ? payload.ids : [];
        if (ids.length === 0 || ids.length > MAX_BULK_ITEMS) return Response.json({ error: 'Numero di ID non valido' }, { status: 400 });
        if (res === 'setting') {
          const items = await db.list('-created_date', MAX_BULK_ITEMS);
          const blocked = items.find(setting => ids.includes(setting.id) && (MAIN_SETTING_KEYS.includes(setting.key) || SECRET_SETTING_KEYS.includes(setting.key)) && !canManageSettings);
          if (blocked) return Response.json({ error: 'Solo il super admin può eliminare i settaggi CMS principali' }, { status: 403 });
        }
        if (res === 'category') {
          const dependencies = await Promise.all(ids.map(async id => {
            const [products, children] = await Promise.all([
              dbMap.product.filter({ category_id: id }, '-sort_order', 1),
              dbMap.category.filter({ parent_id: id }, 'sort_order', 1),
            ]);
            return products.length > 0 || children.some(category => !ids.includes(category.id));
          }));
          if (dependencies.some(Boolean)) {
            return Response.json({ error: 'Riassegna prima i prodotti e le sottocategorie collegate.' }, { status: 409 });
          }
        }
        if (res === 'product') {
          const childVariants = await dbMap.product_variant.list('sort_order', 1000);
          const childIds = childVariants.filter(variant => ids.includes(variant.product_id)).map(variant => variant.id);
          if (childIds.length) await dbMap.product_variant.deleteMany({ id: { $in: childIds } });
        }
        await db.deleteMany({ id: { $in: ids } });
        return Response.json({ ok: true, deleted: ids.length });
      }
      case 'invite_user': {
        const { email, role } = payload || {};
        if (!email) return Response.json({ error: 'Email mancante' }, { status: 400 });
        await base44.asServiceRole.users.inviteUser(email, role || 'user');
        return Response.json({ ok: true });
      }
      case 'upsert_setting': {
        const { key, value, label } = payload || {};
        if (!key) return Response.json({ error: 'Key mancante' }, { status: 400 });
        if ((MAIN_SETTING_KEYS.includes(key) || SECRET_SETTING_KEYS.includes(key)) && !canManageSettings) {
          return Response.json({ error: 'Solo il super admin può modificare i settaggi CMS principali' }, { status: 403 });
        }
        const existing = await dbMap.setting.filter({ key });
        const item = existing.length > 0
          ? await dbMap.setting.update(existing[0].id, { value: String(value ?? ''), label })
          : await dbMap.setting.create({ key, value: String(value ?? ''), label });
        return Response.json({ item });
      }
      case 'mark_all_read': {
        const unread = await dbMap.notification.filter({ read: false });
        if (unread.length === 0) return Response.json({ updated: 0 });
        await dbMap.notification.bulkUpdate(unread.map(notification => ({ id: notification.id, read: true })));
        return Response.json({ updated: unread.length });
      }
      case 'payment_status': {
        const stripeKey = secrets.get('STRIPE_SECRET_KEY');
        const webhookSecret = secrets.get('STRIPE_WEBHOOK_SECRET');
        const publishable = secrets.get('STRIPE_PUBLISHABLE_KEY');
        const keySet = Boolean(stripeKey);
        const isTest = stripeKey ? stripeKey.startsWith('sk_test') || stripeKey.startsWith('rk_test') : false;
        // Checkout redirects require PUBLIC_APP_URL in production: without it
        // create-checkout-session refuses non-localhost origins (503).
        let publicAppUrl = null;
        try {
          const parsed = new URL(String(secrets.get('PUBLIC_APP_URL') || ''));
          const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
          if (parsed.protocol === 'https:' || (isLocal && parsed.protocol === 'http:')) publicAppUrl = parsed.origin;
        } catch { /* invalid or missing PUBLIC_APP_URL */ }
        let account = null;
        if (stripeKey) {
          try {
            const stripe = new Stripe(stripeKey);
            // Identify which Stripe account the keys belong to: essential when
            // rotating or switching accounts, since the dashboard may show a
            // different one than the deployed functions actually use.
            const accountApi = /** @type {any} */ (stripe.accounts);
            const accountInfo = typeof accountApi.retrieveSelf === 'function'
              ? await accountApi.retrieveSelf()
              : await accountApi.retrieve();
            const balance = await stripe.balance.retrieve();
            account = {
              id: String(accountInfo?.id || ''),
              business_name: String(accountInfo?.settings?.dashboard?.display_name || accountInfo?.business_profile?.name || ''),
              country: String(accountInfo?.country || ''),
              payouts_enabled: Boolean(accountInfo?.payouts_enabled),
              available_eur: balance.available.find(item => item.currency === 'eur')?.amount ?? null,
              pending_eur: balance.pending.find(item => item.currency === 'eur')?.amount ?? null,
            };
          } catch (error) {
            console.error('Stripe account/balance check failed:', error);
            account = { error: 'Impossibile leggere l’account Stripe: chiave non valida o insufficiente' };
          }
        }
        return Response.json({
          stripeKeySet: keySet,
          publishableKeySet: Boolean(publishable),
          webhookSecretSet: Boolean(webhookSecret),
          publicAppUrl,
          mode: keySet ? (isTest ? 'test' : 'live') : null,
          currency: 'eur',
          account,
        });
      }
      case 'reconcile_order': {
        // Reconciliation for paid orders whose webhook side effects failed
        // (ledger `effects_pending`). Recomputable aggregates are recalculated
        // from the orders table, which makes the operation idempotent; stock
        // is intentionally not touched because the initial stock is unknown.
        const orderId = String(payload?.id || '').trim();
        if (!orderId) return Response.json({ error: 'ID ordine mancante' }, { status: 400 });
        const order = await dbMap.order.get(orderId).catch(() => null);
        if (!order) return Response.json({ error: 'Ordine non trovato' }, { status: 404 });
        if (order.status !== 'paid') {
          return Response.json({ error: 'La riconciliazione è disponibile solo per ordini pagati' }, { status: 409 });
        }
        const paidOrders = (await dbMap.order.list('-created_date', MAX_BULK_ITEMS))
          .filter(candidate => candidate.status === 'paid' || candidate.status === 'shipped' || candidate.status === 'delivered');
        const report = { customer_synced: false, discount_synced: false, ledger_cleared: 0, stock_check_required: false };

        const email = String(order.customer_email || '').trim().toLowerCase();
        if (email) {
          const mine = paidOrders.filter(candidate => String(candidate.customer_email || '').trim().toLowerCase() === email);
          const totalSpent = mine.reduce((sum, candidate) => sum + Math.max(0, integer(candidate.total_cents)), 0);
          const existing = await dbMap.customer.filter({ email });
          if (existing[0]) {
            await dbMap.customer.update(existing[0].id, {
              orders_count: mine.length,
              total_spent: totalSpent,
              name: existing[0].name || order.customer_name || email.split('@')[0],
            });
          } else {
            await dbMap.customer.create({
              name: order.customer_name || email.split('@')[0],
              email,
              orders_count: mine.length,
              total_spent: totalSpent,
            });
          }
          report.customer_synced = true;
        }

        const code = String(order.discount_code || '').trim().toUpperCase();
        if (code) {
          const usedBy = paidOrders.filter(candidate => String(candidate.discount_code || '').trim().toUpperCase() === code);
          const discounts = await dbMap.discount.filter({ code });
          if (discounts[0]) {
            await dbMap.discount.update(discounts[0].id, { usage_count: usedBy.length });
            report.discount_synced = true;
          }
        }

        const ledger = dbMap.webhook_event;
        const events = await ledger.filter({ order_id: orderId }).catch(() => []);
        for (const item of events) {
          if (!item.effects_pending) continue;
          report.stock_check_required = report.stock_check_required || /stock/i.test(String(item.effects_errors || ''));
          await ledger.update(item.id, { effects_pending: false, reconciled_at: new Date().toISOString() }).catch(() => {});
          report.ledger_cleared++;
        }

        return Response.json({ report });
      }
      default:
        return Response.json({ error: 'Operazione non valida' }, { status: 400 });
    }
  } catch (error) {
    console.error('admin-cms error:', error);
    return Response.json({ error: 'Errore interno del CMS' }, { status: 500 });
  }
}
