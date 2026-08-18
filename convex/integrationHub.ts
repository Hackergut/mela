// @ts-nocheck
// Integration Hub action. Stores per-integration field values as settings
// (`integration_<id>_<field>`), masks secrets, tests webhooks, and exposes
// only public fields to the storefront.

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { INTEGRATIONS, settingKey, maskSecret } from "./shared/integrations";
import { authenticateAdmin } from "./lib/shared";

const HIDDEN = "••••••••";

const asBool = (v) => v === true || String(v || "").toLowerCase() === "true" || v === "1";

function cleanField(field, value) {
  if (field.type === "switch") return asBool(value) ? "true" : "false";
  if (field.type === "number") {
    if (value === "" || value == null) return "";
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error(`"${field.label}" deve essere un numero`);
    return String(n);
  }
  if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())) throw new Error(`"${field.label}" email non valida`);
  if (field.type === "url" && value) {
    try { const u = new URL(String(value).trim()); if (!["http:", "https:"].includes(u.protocol)) throw new Error("proto"); }
    catch { throw new Error(`"${field.label}" URL non valido`); }
  }
  if (field.pattern && value) {
    try { if (!new RegExp(field.pattern).test(String(value).trim())) throw new Error("fmt"); }
    catch (e) { if (e.message === "fmt") throw new Error(`"${field.label}" formato non valido`); }
  }
  return String(value ?? "").trim().slice(0, 4000);
}

function buildCatalog() {
  return {
    categories: {
      payments: "Pagamenti", shipping: "Spedizioni", analytics: "Analytics", marketing: "Marketing",
      communication: "Comunicazione", crm: "CRM / ERP", automation: "Automazione", reviews: "Recensioni", security: "Sicurezza",
    },
    maturity: { live: "Attivo", beta: "Beta", coming_soon: "Prossimamente" },
    integrations: INTEGRATIONS.map((d) => ({
      id: d.id, name: d.name, tagline: d.tagline, description: d.description, category: d.category,
      color: d.color, initials: d.initials, website: d.website || "", maturity: d.maturity,
      requiresSuperAdmin: Boolean(d.requiresSuperAdmin), setup: d.setup || [],
      fields: d.fields.map((f) => ({ key: f.key, label: f.label, type: f.type, required: Boolean(f.required), secret: Boolean(f.secret), public: Boolean(f.public), placeholder: f.placeholder || "", help: f.help || "", options: f.options || [], pattern: f.pattern || "", hasDefault: f.default !== undefined })),
    })),
  };
}

async function loadValues(ctx, def) {
  const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
  const values = {}, filled = {};
  for (const f of def.fields) {
    const rec = all.find((s) => s.key === settingKey(def.id, f.key));
    const raw = rec?.value ?? "";
    if (f.secret) { values[f.key] = raw ? maskSecret(raw) : ""; filled[f.key] = Boolean(raw); }
    else { values[f.key] = f.type === "switch" ? asBool(raw) : raw; filled[f.key] = raw !== "" && raw != null; }
  }
  return { values, filled };
}

async function webhookTest(def, values) {
  const urlField = def.fields.find((f) => f.type === "url" || f.key === "webhook_url");
  const url = urlField ? String(values[urlField.key] || "").trim() : "";
  if (!url) return { ok: false, message: "URL webhook mancante" };
  const headers = { "Content-Type": "application/json", "User-Agent": "TechMania-IntegrationHub/1.0" };
  const secretField = def.fields.find((f) => f.key === "secret" && f.secret);
  const secret = secretField ? String(values[secretField.key] || "") : "";
  if (secret) headers["X-TM-Signature"] = secret.slice(0, 32);
  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ event: "test", integration: def.id, timestamp: new Date().toISOString(), order: { order_number: "TEST-0001", total_cents: 12900, currency: "EUR" } }) });
    return { ok: res.ok, status: res.status, message: res.ok ? `Webhook risposto ${res.status}` : `Risposta ${res.status}` };
  } catch (e) { return { ok: false, message: e.message }; }
}

export default action({
  args: {
    password: v.optional(v.string()),
    operation: v.string(),
    integration_id: v.optional(v.string()),
    values: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const json = (data, status = 200) => ({ __ok: true, status, ...data });
const jfail = (error, status = 400) => ({ __ok: false, status, error });

    if (args.operation === "public_config") {
      const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
      const byKey = new Map(all.map((s) => [s.key, s.value]));
      const config = {};
      for (const def of INTEGRATIONS) {
        const entry = {}; let has = false;
        for (const f of def.fields) {
          if (!f.public) continue;
          const raw = byKey.get(settingKey(def.id, f.key));
          if (raw == null || raw === "") continue;
          entry[f.key] = f.type === "switch" ? asBool(raw) : raw; has = true;
        }
        if (has) config[def.id] = entry;
      }
      return json({ config });
    }

    const auth = authenticateAdmin(ctx, { password: args.password || "", clientKey: (args.password || "").slice(0, 8) });
    if (auth.error) return { __ok: false, ...auth.error };
    const { canManageSettings } = auth;

    if (args.operation === "catalog") return json(buildCatalog());

    const def = INTEGRATIONS.find((d) => d.id === args.integration_id);
    if (!def) return jfail("Integrazione non trovata", 404);

    if (args.operation === "get" || args.operation === "status") {
      const { values, filled } = await loadValues(ctx, def);
      return json({ id: def.id, connected: def.fields.some((f) => f.required && filled[f.key]), values, requiresSuperAdmin: Boolean(def.requiresSuperAdmin), canManage: !def.requiresSuperAdmin || canManageSettings });
    }

    if (args.operation === "save") {
      if (def.requiresSuperAdmin && !canManageSettings) return jfail("Solo il super admin può configurare questa integrazione", 403);
      const incoming = args.values && typeof args.values === "object" ? args.values : {};
      const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
      const clean = {};
      try {
        for (const f of def.fields) {
          const inv = incoming[f.key];
          const rec = all.find((s) => s.key === settingKey(def.id, f.key));
          const existing = rec?.value ?? "";
          if (f.secret) {
            const raw = String(inv ?? "").trim();
            clean[f.key] = (!raw || raw === maskSecret(existing)) ? existing : cleanField(f, raw);
          } else {
            clean[f.key] = inv === undefined || inv === null ? (f.type === "switch" ? "false" : "") : cleanField(f, inv);
          }
        }
      } catch (e) { return jfail(e.message, 400); }
      for (const f of def.fields) {
        if (f.required) { const v = clean[f.key]; if (v === "" || v == null || v === false) return jfail(`Il campo "${f.label}" è obbligatorio`, 400); }
      }
      const now = new Date().toISOString();
      for (const f of def.fields) {
        const key = settingKey(def.id, f.key);
        const value = clean[f.key];
        const existing = all.find((s) => s.key === key);
        if (existing) {
          if (String(existing.value ?? "") !== String(value ?? "")) await ctx.runMutation(internal._crud.updateOne, { table: "settings", id: existing.id, data: { value: String(value ?? ""), label: `${def.name} · ${f.label}`, updated_date: now } });
        } else await ctx.runMutation(internal._crud.createOne, { table: "settings", data: { key, value: String(value ?? ""), label: `${def.name} · ${f.label}`, is_mockup: false, created_date: now, updated_date: now } });
      }
      const loaded = await loadValues(ctx, def);
      return json({ ok: true, connected: def.fields.some((f) => f.required && loaded.filled[f.key]), values: loaded.values });
    }

    if (args.operation === "disconnect") {
      if (def.requiresSuperAdmin && !canManageSettings) return jfail("Solo il super admin", 403);
      const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
      const keys = def.fields.map((f) => settingKey(def.id, f.key));
      const targets = all.filter((s) => keys.includes(s.key));
      for (const t of targets) await ctx.runMutation(internal._crud.deleteOne, { table: "settings", id: t.id });
      return json({ ok: true, deleted: targets.length });
    }

    if (args.operation === "test") {
      const { values } = await loadValues(ctx, def);
      const all = await ctx.runQuery(internal._crud.listAll, { table: "settings" });
      const raw = {};
      for (const f of def.fields) {
        const rec = all.find((s) => s.key === settingKey(def.id, f.key));
        raw[f.key] = f.secret ? (rec?.value ?? "") : values[f.key];
      }
      if (def.testHook === "webhook") return json({ result: await webhookTest(def, raw) });
      const missing = def.fields.filter((f) => f.required && !raw[f.key]).map((f) => f.label);
      if (missing.length) return json({ result: { ok: false, message: `Mancano: ${missing.join(", ")}` } });
      return json({ result: { ok: true, message: "Configurazione valida" } });
    }

    return jfail("Operazione non valida", 400);
  },
});