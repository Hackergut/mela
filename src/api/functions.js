// @ts-nocheck
// Compatibility adapter: exposes the legacy `base44.functions.invoke(name, args)`
// and `base44.auth.*` surface used across the app, but routes everything to
// Convex. This lets us detach from Base44 without rewriting the ~40 components
// that already call base44.functions.invoke.

import { convex, convexConfigured } from "./convexClient";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// A one-shot HTTP client for actions. The React hook uses the reactive client;
// imperative call sites (event handlers, effects, admin screens) use this.
const httpClient = convexConfigured ? new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL) : null;

function actionName(functionName) {
  const map = {
    catalog: api.catalog,
    "admin-cms": api.adminCms,
    "create-checkout-session": api.createCheckout,
    "shopify-sync": api.shopifySync,
    "integration-hub": api.integrationHub,
    "order-lookup": api.orderLookup,
  };
  const fn = map[functionName];
  if (!fn) throw Object.assign(new Error(`Funzione "${functionName}" non trovata su Convex`), { status: 404 });
  return fn;
}

/**
 * Invoke a Convex backend action. Resolves to an object shaped like the old
 * Base44 response: `{ data, ... }`. Actions that return a Web Response
 * (Stripe webhook-style helpers) are unwrapped into JSON.
 */
export async function invoke(functionName, args = {}) {
  if (!convexConfigured || !httpClient) {
    throw Object.assign(new Error("Convex non è configurato. Imposta VITE_CONVEX_URL."), { status: 503 });
  }
  const fn = actionName(functionName);
  let result;
  try {
    result = await httpClient.action(fn, args);
  } catch (error) {
    // Convex throws ConvexError with a data payload; surface it like axios did.
    const message = error?.data?.message || error?.message || "Richiesta non riuscita";
    throw Object.assign(new Error(message), { response: { data: error?.data || { error: message } }, status: error?.data?.status || 500 });
  }
  // Some actions return a serialized Response (webhook/order lookups).
  if (result && typeof result === "object" && "body" in result && "status" in result && typeof result.body === "string") {
    let data = {};
    try { data = JSON.parse(result.body); } catch { data = result.body; }
    return { data, status: result.status };
  }
  // If the action returned { error, status } directly, mimic an error.
  if (result && typeof result === "object" && "error" in result && !("ok" in result)) {
    throw Object.assign(new Error(result.error), { response: { data: result }, status: result.status || 400 });
  }
  return { data: result };
}

// Reactive query hook for the public catalog. Usage in useProducts.js:
//   const { data, isPending } = useConvexQuery(api.catalog, {});
export { convex, convexConfigured, api };