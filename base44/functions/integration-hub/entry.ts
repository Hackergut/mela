import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';
import { secrets } from 'base44:runtime';
// Central integration catalogue. Add a service there to make it appear in the
// admin Integrazioni panel (no other code needed).
import {
  INTEGRATIONS,
  CATEGORY_LABELS,
  MATURITY_LABELS,
  findIntegration,
  settingKey,
  maskSecret,
} from '../../shared/integrations.js';

const MAX_SETTINGS = 1000;

// ───────────────────────── auth (same model as admin-cms / shopify-sync) ──
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
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] || 0) ^ (b[i] || 0);
  return diff === 0;
}
function checkAuthRateLimit(key) {
  const now = Date.now();
  const entry = authFailures.get(key);
  if (!entry) return { allowed: true };
  if (entry.lockedUntil > now) return { allowed: false, retryAfterSec: Math.ceil((entry.lockedUntil - now) / 1000) };
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
function authenticate(req, password) {
  const clientKey = getClientKey(req);
  const rateLimit = checkAuthRateLimit(clientKey);
  if (!rateLimit.allowed) {
    const minutes = Math.max(1, Math.ceil(rateLimit.retryAfterSec / 60));
    return { error: Response.json({ error: `Troppi tentativi falliti. Riprova tra ${minutes} minuti.` }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } }) };
  }
  const adminPassword = secrets.get('ADMIN_PASSWORD');
  const superPassword = secrets.get('SUPER_ADMIN_PASSWORD');
  if (!adminPassword && !superPassword) {
    return { error: Response.json({ error: 'Accesso admin non configurato: imposta ADMIN_PASSWORD / SUPER_ADMIN_PASSWORD tra i secret Base44.' }, { status: 503 }) };
  }
  const isSuperAdmin = Boolean(superPassword) && timingSafeEquals(password, superPassword);
  const isAdmin = Boolean(adminPassword) && timingSafeEquals(password, adminPassword);
  if (!password || (!isAdmin && !isSuperAdmin)) {
    recordAuthFailure(clientKey);
    return { error: Response.json({ error: 'Password non valida' }, { status: 401 }) };
  }
  authFailures.delete(clientKey);
  return { isSuperAdmin, canManageSettings: isSuperAdmin || !superPassword };
}

// ───────────────────────── helpers ────────────────────────────────────────
function asBool(value) {
  if (value === true) return true;
  if (value === false) return false;
  return String(value || '').toLowerCase() === 'true' || String(value) === '1';
}

function cleanFieldValue(field, value) {
  if (field.type === 'switch') return asBool(value) ? 'true' : 'false';
  if (field.type === 'number') {
    if (value === '' || value == null) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(`Il campo "${field.label}" deve essere un numero`);
    return String(n);
  }
  if (field.type === 'email' && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) {
      throw new Error(`"${field.label}" non è un'email valida`);
    }
  }
  if (field.type === 'url' && value) {
    try {
      const u = new URL(String(value).trim());
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('protocollo non valido');
    } catch {
      throw new Error(`"${field.label}" non è un URL valido`);
    }
  }
  if (field.pattern && value) {
    try {
      if (!new RegExp(field.pattern).test(String(value).trim())) {
        throw new Error(`"${field.label}" non rispetta il formato atteso`);
      }
    } catch (e) {
      if (e.message.includes('formato')) throw e;
    }
  }
  return String(value ?? '').trim().slice(0, 4000);
}

function buildCatalog(Setting) {
  return {
    categories: CATEGORY_LABELS,
    maturity: MATURITY_LABELS,
    integrations: INTEGRATIONS.map((def) => ({
      id: def.id,
      name: def.name,
      tagline: def.tagline,
      description: def.description,
      category: def.category,
      color: def.color,
      initials: def.initials,
      website: def.website || '',
      maturity: def.maturity,
      requiresSuperAdmin: Boolean(def.requiresSuperAdmin),
      setup: def.setup || [],
      fields: def.fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: Boolean(field.required),
        secret: Boolean(field.secret),
        public: Boolean(field.public),
        placeholder: field.placeholder || '',
        help: field.help || '',
        options: field.options || [],
        pattern: field.pattern || '',
        hasDefault: field.default !== undefined,
      })),
    })),
  };
}

async function loadIntegrationValues(Setting, integrationId) {
  const def = findIntegration(integrationId);
  if (!def) return null;
  const all = await Setting.list('key', MAX_SETTINGS);
  const values = {};
  const filled = {};
  for (const field of def.fields) {
    const key = settingKey(integrationId, field.key);
    const record = all.find((s) => s.key === key);
    const raw = record?.value ?? '';
    if (field.secret) {
      values[field.key] = raw ? maskSecret(raw) : '';
      filled[field.key] = Boolean(raw);
    } else {
      values[field.key] = field.type === 'switch' ? asBool(raw) : raw;
      filled[field.key] = raw !== '' && raw != null;
    }
  }
  return { definition: def, values, filled };
}

async function webhookTest(def, values) {
  const urlField = def.fields.find((f) => f.type === 'url' || f.key === 'webhook_url');
  const url = urlField ? String(values[urlField.key] || '').trim() : '';
  if (!url) return { ok: false, message: 'URL webhook mancante' };
  const body = {
    event: 'test',
    integration: def.id,
    timestamp: new Date().toISOString(),
    order: { order_number: 'TEST-0001', total_cents: 12900, currency: 'EUR' },
  };
  const headers = { 'Content-Type': 'application/json', 'User-Agent': 'TechMania-IntegrationHub/1.0' };
  const secretField = def.fields.find((f) => f.key === 'secret' && f.secret);
  const secretValue = secretField ? String(values[secretField.key] || '') : '';
  if (secretValue) headers['X-TM-Signature'] = secretValue.slice(0, 32);
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    return {
      ok: res.ok,
      status: res.status,
      message: res.ok ? `Webhook risposto ${res.status}` : `Il webhook ha risposto ${res.status}`,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Richiesta fallita' };
  }
}

// ───────────────────────── main handler ──────────────────────────────────
export default async function (req) {
  try {
    const body = await req.json();
    const { operation } = body;

    const base44 = createClientFromRequest(req);
    const Setting = base44.asServiceRole.entities.Setting;

    // Public configuration (storefront): no password. Exposes only fields
    // explicitly marked `public: true`, never secrets.
    if (operation === 'public_config') {
      const all = await Setting.list('key', MAX_SETTINGS);
      const byKey = new Map(all.map((s) => [s.key, s.value]));
      const config = {};
      for (const def of INTEGRATIONS) {
        const entry = {};
        let hasAny = false;
        for (const field of def.fields) {
          if (!field.public) continue;
          const raw = byKey.get(settingKey(def.id, field.key));
          if (raw == null || raw === '') continue;
          entry[field.key] = field.type === 'switch' ? asBool(raw) : raw;
          hasAny = true;
        }
        if (hasAny) config[def.id] = entry;
      }
      return Response.json({ config }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
    }

    const auth = authenticate(req, body.password);
    if (auth.error) return auth.error;
    const { isSuperAdmin, canManageSettings } = auth;

    if (operation === 'catalog') {
      return Response.json(buildCatalog(Setting));
    }

    if (operation === 'status' || operation === 'get') {
      const integrationId = String(body.integration_id || '').trim();
      const def = findIntegration(integrationId);
      if (!def) return Response.json({ error: 'Integrazione non trovata' }, { status: 404 });
      const loaded = await loadIntegrationValues(Setting, integrationId);
      return Response.json({
        id: def.id,
        connected: def.fields.some((f) => f.required && loaded.filled[f.key]),
        values: loaded.values,
        requiresSuperAdmin: Boolean(def.requiresSuperAdmin),
        canManage: !def.requiresSuperAdmin || canManageSettings,
      });
    }

    if (operation === 'save') {
      const integrationId = String(body.integration_id || '').trim();
      const def = findIntegration(integrationId);
      if (!def) return Response.json({ error: 'Integrazione non trovata' }, { status: 404 });
      if (def.requiresSuperAdmin && !canManageSettings) {
        return Response.json({ error: 'Solo il super admin può configurare questa integrazione' }, { status: 403 });
      }
      const incoming = body.values && typeof body.values === 'object' ? body.values : {};
      const all = await Setting.list('key', MAX_SETTINGS);

      const cleanValues = {};
      try {
        for (const field of def.fields) {
          const incomingValue = incoming[field.key];
          const existingKey = settingKey(integrationId, field.key);
          const existingRecord = all.find((s) => s.key === existingKey);
          const existingValue = existingRecord?.value ?? '';
          if (field.secret) {
            const raw = String(incomingValue ?? '').trim();
            if (raw === '' || raw === maskSecret(existingValue)) {
              cleanValues[field.key] = existingValue; // keep existing secret
            } else {
              cleanValues[field.key] = cleanFieldValue(field, raw);
            }
          } else {
            cleanValues[field.key] = incomingValue === undefined || incomingValue === null
              ? (field.type === 'switch' ? 'false' : '')
              : cleanFieldValue(field, incomingValue);
          }
        }
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : 'Valore non valido' }, { status: 400 });
      }

      // Validate required fields (use the resolved/cleaned values).
      for (const field of def.fields) {
        if (!field.required) continue;
        const value = cleanValues[field.key];
        if (value === '' || value == null || value === false) {
          return Response.json({ error: `Il campo "${field.label}" è obbligatorio` }, { status: 400 });
        }
      }

      for (const field of def.fields) {
        const key = settingKey(integrationId, field.key);
        const value = cleanValues[field.key];
        const label = `${def.name} · ${field.label}`;
        const existing = all.find((s) => s.key === key);
        if (existing) {
          if (String(existing.value ?? '') !== String(value ?? '')) {
            await Setting.update(existing.id, { value: String(value ?? ''), label });
          }
        } else {
          await Setting.create({ key, value: String(value ?? ''), label });
        }
      }

      const loaded = await loadIntegrationValues(Setting, integrationId);
      return Response.json({
        ok: true,
        connected: def.fields.some((f) => f.required && loaded.filled[f.key]),
        values: loaded.values,
      });
    }

    if (operation === 'disconnect') {
      const integrationId = String(body.integration_id || '').trim();
      const def = findIntegration(integrationId);
      if (!def) return Response.json({ error: 'Integrazione non trovata' }, { status: 404 });
      if (def.requiresSuperAdmin && !canManageSettings) {
        return Response.json({ error: 'Solo il super admin può disconnettere questa integrazione' }, { status: 403 });
      }
      const all = await Setting.list('key', MAX_SETTINGS);
      const keys = def.fields.map((f) => settingKey(integrationId, f.key));
      const targets = all.filter((s) => keys.includes(s.key));
      for (const record of targets) {
        await Setting.delete(record.id);
      }
      return Response.json({ ok: true, deleted: targets.length });
    }

    if (operation === 'test') {
      const integrationId = String(body.integration_id || '').trim();
      const def = findIntegration(integrationId);
      if (!def) return Response.json({ error: 'Integrazione non trovata' }, { status: 404 });
      const loaded = await loadIntegrationValues(Setting, integrationId);
      // For secret fields, loadIntegrationValues returns a masked value. For
      // tests we need the real value, so reload raw from the Setting list.
      const all = await Setting.list('key', MAX_SETTINGS);
      const rawValues = {};
      for (const field of def.fields) {
        const key = settingKey(integrationId, field.key);
        const record = all.find((s) => s.key === key);
        rawValues[field.key] = field.secret ? (record?.value ?? '') : loaded.values[field.key];
      }

      if (def.testHook === 'webhook') {
        const result = await webhookTest(def, rawValues);
        return Response.json({ result });
      }
      // Generic "configured" check.
      const missing = def.fields.filter((f) => f.required && !rawValues[f.key]).map((f) => f.label);
      if (missing.length) return Response.json({ result: { ok: false, message: `Mancano: ${missing.join(', ')}` } });
      return Response.json({ result: { ok: true, message: 'Configurazione valida' } });
    }

    return Response.json({ error: 'Operazione non valida' }, { status: 400 });
  } catch (error) {
    console.error('integration-hub error:', error);
    return Response.json({ error: "Errore interno dell'hub integrazioni" }, { status: 500 });
  }
}
