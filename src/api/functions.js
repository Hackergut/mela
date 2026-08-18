// @ts-nocheck
// Convex function invoker used by the compatibility adapter
// (base44Client.js). It routes the legacy `base44.functions.invoke(name, args)`
// calls to real Convex actions. When the generated `convex/_generated/api`
// module is available (it is committed as stubs and replaced by `npx convex
// dev`/`convex deploy`), those references are used directly so the client
// validates argument/return types.

import { convex, convexConfigured } from "./convexClient";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// One-off HTTP client for imperative action calls outside React (admin
// screens, event handlers, effects).
const httpClient = convexConfigured
  ? new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)
  : null;

// Legacy function name → { type, udf path }.
// `catalog` is a public Convex QUERY (not an action); everything else is an
// action. Calling a query through httpClient.action() produces a server error.
const FUNCTIONS = {
  catalog: { type: "query", path: "catalog:default" },
  "admin-cms": { type: "action", path: "adminCms:default" },
  "create-checkout-session": { type: "action", path: "createCheckout:default" },
  "shopify-sync": { type: "action", path: "shopifySync:default" },
  "integration-hub": { type: "action", path: "integrationHub:default" },
  "order-lookup": { type: "action", path: "orderLookup:default" },
};

function refFor(functionName) {
  const entry = FUNCTIONS[functionName];
  if (!entry) {
    throw Object.assign(new Error(`Funzione "${functionName}" non trovata su Convex`), { status: 404 });
  }
  const moduleName = entry.path.split(":")[0];
  // Prefer the generated function reference when available (typed), otherwise
  // fall back to the path string accepted by ConvexHttpClient.
  const generated = api?.[moduleName]?.default;
  return { ...entry, ref: generated || entry.path };
}

/**
 * Invoke a Convex action. Resolves to { data, status } just like the old
 * Base44 SDK. Actions that return a serialized Response are unwrapped.
 */
export async function invoke(functionName, args = {}) {
  if (!convexConfigured || !httpClient) {
    throw Object.assign(
      new Error("Convex non è configurato. Imposta VITE_CONVEX_URL."),
      { status: 503 },
    );
  }
  const { ref, type } = refFor(functionName);
  let result;
  try {
    result = type === "query"
      ? await httpClient.query(ref, args)
      : await httpClient.action(ref, args);
  } catch (error) {
    const data = error?.data || { error: error?.message || "Richiesta non riuscita" };
    throw Object.assign(new Error(data.error || error?.message || "Richiesta non riuscita"), {
      status: error?.code === "ConvexError" ? 400 : 500,
      response: { data },
    });
  }
  // New-style action result: { __ok, status, ...data }
  if (result && typeof result === "object" && "__ok" in result) {
    const { __ok, status, ...data } = result;
    if (!__ok) {
      throw Object.assign(new Error(data.error || "Richiesta non riuscita"), {
        status: status || 400,
        response: { data },
      });
    }
    return { data, status: status || 200 };
  }
  // Some actions may still return a serialized Response (legacy http shapes).
  if (result && typeof result === "object" && "body" in result && "status" in result && typeof result.body === "string") {
    let data = {};
    try { data = JSON.parse(result.body); } catch { data = result.body; }
    return { data, status: result.status };
  }
  if (result && typeof result === "object" && "error" in result && !("ok" in result)) {
    throw Object.assign(new Error(result.error), { response: { data: result }, status: result.status || 400 });
  }
  return { data: result };
}

export { convex, convexConfigured, api };
