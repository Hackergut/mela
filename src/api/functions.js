// @ts-nocheck
// Convex function invoker. Routes the legacy `base44.functions.invoke(name, args)`
// calls used throughout the app to Convex actions.
//
// To avoid a hard dependency on `convex/_generated` (which is only created once
// a deployment is linked), requests go directly to Convex's public sync HTTP
// endpoint: POST <convex-url>/api/query | /api/actions with
// { path: "moduleName:exportName", args }.
//
// The map below keeps the legacy function names ("admin-cms", "catalog", …)
// and maps them to the Convex module/action they belong to.

import { convexConfigured } from "./convexClient";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "";

// Legacy function name → Convex path (file: export).
const PATHS = {
  catalog: { kind: "query", path: "catalog:default" },
  "admin-cms": { kind: "action", path: "adminCms:default" },
  "create-checkout-session": { kind: "action", path: "createCheckout:default" },
  "shopify-sync": { kind: "action", path: "shopifySync:default" },
  "integration-hub": { kind: "action", path: "integrationHub:default" },
  "order-lookup": { kind: "action", path: "orderLookup:default" },
};

function detectKind(pathValue) {
  // Queries live in convex/catalog.ts; everything else is an action.
  if (pathValue.startsWith("catalog:")) return "query";
  return "action";
}

/**
 * Invoke a Convex backend action/query.
 * Resolves to { data, status } exactly like the old Base44 SDK.
 */
export async function invoke(functionName, args = {}) {
  if (!convexConfigured) {
    throw Object.assign(
      new Error("Convex non è configurato. Imposta VITE_CONVEX_URL."),
      { status: 503 },
    );
  }
  const mapping = PATHS[functionName];
  if (!mapping) {
    throw Object.assign(new Error(`Funzione "${functionName}" non trovata su Convex`), { status: 404 });
  }
  const kind = mapping.kind || detectKind(mapping.path);
  const endpoint = `${CONVEX_URL.replace(/\/$/, "")}/api/${kind}`;

  let result;
  let status = 200;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: mapping.path, args, format: "json" }),
    });
    status = res.status;
    const text = await res.text();
    try {
      result = text ? JSON.parse(text) : null;
    } catch {
      result = text;
    }
    if (!res.ok) {
      const message = result?.message || (typeof result === "string" ? result : `Richiesta non riuscita (${res.status})`);
      throw Object.assign(new Error(message), {
        status: res.status,
        response: { data: { error: message, ...(result && typeof result === "object" ? result : {}) } },
      });
    }
  } catch (error) {
    if (error.response) throw error;
    throw Object.assign(new Error(error.message || "Errore di rete verso Convex"), {
      status: 502,
      response: { data: { error: error.message || "Errore di rete" } },
    });
  }

  // Some actions return a serialized Response (webhook/order lookups).
  if (result && typeof result === "object" && "body" in result && "status" in result && typeof result.body === "string") {
    let data = {};
    try { data = JSON.parse(result.body); } catch { data = result.body; }
    return { data, status: result.status };
  }
  // Action returned { error, status } without throwing — mimic legacy error shape.
  if (result && typeof result === "object" && "error" in result && !("ok" in result)) {
    throw Object.assign(new Error(result.error), { response: { data: result }, status: result.status || 400 });
  }
  return { data: result, status };
}

export { convexConfigured };
