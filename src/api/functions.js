// @ts-nocheck
// Routes legacy `base44.functions.invoke(name, args)` calls.
// Checkout, order lookup and Stripe status hit local Vercel `/api` routes
// first so the store works without Convex. Convex remains optional for CMS.

import { convex, convexConfigured } from "./convexClient";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const httpClient = convexConfigured
  ? new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)
  : null;

const FUNCTIONS = {
  catalog: { type: "query", path: "catalog:default" },
  "admin-cms": { type: "action", path: "adminCms:default" },
  "create-checkout-session": { type: "action", path: "createCheckout:default" },
  "shopify-sync": { type: "action", path: "shopifySync:default" },
  "shopify-storefront": { type: "action", path: "shopifyStorefront:default" },
  "integration-hub": { type: "action", path: "integrationHub:default" },
  "order-lookup": { type: "action", path: "orderLookup:default" },
};

function refFor(functionName) {
  const entry = FUNCTIONS[functionName];
  if (!entry) {
    throw Object.assign(new Error(`Funzione "${functionName}" non trovata`), { status: 404 });
  }
  const moduleName = entry.path.split(":")[0];
  const generated = api?.[moduleName]?.default;
  return { ...entry, ref: generated || entry.path };
}

function fail(message, status = 500, data = {}) {
  throw Object.assign(new Error(message), { status, response: { data: { error: message, ...data } } });
}

function localSpec(functionName, args = {}) {
  if (functionName === "create-checkout-session") {
    return { url: "/api/create-checkout-session", init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) } };
  }
  if (functionName === "shopify-storefront") {
    return { url: "/api/shopify-storefront", init: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) } };
  }
  if (functionName === "catalog" && args.operation === "order_lookup") {
    const params = new URLSearchParams();
    if (args.session_id) params.set("session_id", args.session_id);
    if (args.order_number) params.set("order_number", args.order_number);
    if (args.email) params.set("email", args.email);
    return { url: `/api/order?${params}`, init: { method: "GET" } };
  }
  if (functionName === "order-lookup") {
    const params = new URLSearchParams();
    if (args.session_id) params.set("session_id", args.session_id);
    if (args.order_number) params.set("order_number", args.order_number);
    if (args.email) params.set("email", args.email);
    return { url: `/api/order?${params}`, init: { method: "GET" } };
  }
  if (functionName === "admin-cms" && args.operation === "payment_status") {
    return { url: "/api/stripe-status", init: { method: "GET" } };
  }
  return null;
}

async function invokeLocal(functionName, args) {
  const spec = localSpec(functionName, args);
  if (!spec) return null;
  let response;
  try {
    response = await fetch(spec.url, spec.init);
  } catch {
    return null;
  }
  const data = await response.json().catch(() => ({}));
  if (response.status === 404 && data.error && /Cannot find|not found/i.test(String(data.error))) return null;
  if (!response.ok) fail(data.error || "Richiesta non riuscita", response.status, data);
  return { data, status: response.status };
}

async function invokeConvex(functionName, args) {
  if (!convexConfigured || !httpClient) return null;
  const { ref, type } = refFor(functionName);
  let result;
  try {
    result = type === "query"
      ? await httpClient.query(ref, args)
      : await httpClient.action(ref, args);
  } catch (error) {
    const data = error?.data || { error: error?.message || "Richiesta non riuscita" };
    fail(data.error || error?.message || "Richiesta non riuscita", error?.code === "ConvexError" ? 400 : 500, data);
  }
  if (result && typeof result === "object" && "__ok" in result) {
    const { __ok, status, ...data } = result;
    if (!__ok) fail(data.error || "Richiesta non riuscita", status || 400, data);
    return { data, status: status || 200 };
  }
  if (result && typeof result === "object" && "body" in result && "status" in result && typeof result.body === "string") {
    let data = {};
    try { data = JSON.parse(result.body); } catch { data = result.body; }
    return { data, status: result.status };
  }
  if (result && typeof result === "object" && "error" in result && !("ok" in result)) {
    fail(result.error, result.status || 400, result);
  }
  return { data: result };
}

export async function invoke(functionName, args = {}) {
  const localFirst = Boolean(localSpec(functionName, args));
  if (localFirst) {
    try {
      const local = await invokeLocal(functionName, args);
      if (local) return local;
    } catch (error) {
      if (convexConfigured && (error.status === 503 || error.status >= 500)) {
        const convex = await invokeConvex(functionName, args);
        if (convex) return convex;
      }
      throw error;
    }
  }
  const convex = await invokeConvex(functionName, args);
  if (convex) return convex;
  if (!localFirst) {
    fail(
      convexConfigured
        ? "Richiesta Convex non riuscita"
        : "Questa funzione richiede Convex. Per pagamenti usa Stripe su Vercel (STRIPE_SECRET_KEY).",
      503,
    );
  }
  fail("Checkout non disponibile. Imposta STRIPE_SECRET_KEY su Vercel oppure VITE_CONVEX_URL.", 503);
}

export { convex, convexConfigured, api };
