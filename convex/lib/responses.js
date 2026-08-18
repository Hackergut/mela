// @ts-nocheck
// Helpers to return plain JSON-serialisable results from Convex actions.
// Regular Convex actions CANNOT return a Web Response (only httpActions can),
// so we return { __ok, status, ...data } and the frontend adapter unwraps it.

export function ok(data = {}, status = 200) {
  return { __ok: true, status, ...data };
}

export function fail(error, status = 400, extra = {}) {
  return { __ok: false, status, error, ...extra };
}

// Unwrap a result returned by an action into the legacy { data, status } shape
// and throw when the action reported an error.
export function unwrap(result) {
  if (result && typeof result === "object" && "__ok" in result) {
    if (!result.__ok) {
      const err = new Error(result.error || "Richiesta non riuscita");
      err.status = result.status;
      err.response = { data: result };
      throw err;
    }
    const { __ok, status, ...data } = result;
    return { data, status: status || 200 };
  }
  // Legacy/raw value.
  return { data: result, status: 200 };
}
