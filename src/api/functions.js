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

// Legacy function name → Convex UDF path. All backend files export a default
// function, which Convex names "<file>:default" (e.g. "adminCms:default").
// The _generated api stubs mirror that.
const ACTIONS = {
  catalog: "catalog:default",
  "admin-cms": "adminCms:default",
  "create-checkout-session": "createCheckout:default",
  "shopify-sync": "shopifySync:default",
  "integration-hub": "integrationHub:default",
  "order-lookup": "orderLookup:default",
};

function refFor(functionName) {
  const path = ACTIONS[functionName];
  if (!path) {
    throw Object.assign(new Error(`Funzione "${functionName}" non trovata su Convex`), { status: 404 });
  }
  // Prefer the generated function reference when available (typed), otherwise
  // fall back to the path string accepted by ConvexHttpClient.
  const moduleName = path.split(":")[0];
  return api?.[moduleName]?.default || path;
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
  const ref = refFor(functionName);
  let result;
  try {
    result = await httpClient.action(ref, args);
  } catch (error) {
    const data = error?.data || { error: error?.message || "Richiesta non riuscita" };
    throw Object.assign(new Error(data.error || error?.message || "Richiesta non riuscita"), {
      status: error?.code === "ConvexError" ? 400 : 500,
      response: { data },
    });
  }
  // Some actions return a serialized Response (webhook/order lookups).
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
