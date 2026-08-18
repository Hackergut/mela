// @ts-nocheck
// Backend client. The project has migrated off Base44 to Convex; this module
// keeps the legacy `base44.functions.invoke(...)` / `base44.auth.*` surface
// that the existing components use, and routes every call to Convex.
//
//   base44.functions.invoke("admin-cms", { password, operation, ... })
//
// resolves to { data, status } exactly like the old Base44 SDK.

import { invoke, convexConfigured } from "./functions";

const noop = () => {};
const unavailable = () => {
  throw Object.assign(
    new Error("Convex non è configurato per questa anteprima. Imposta VITE_CONVEX_URL."),
    { status: 503 },
  );
};

// Minimal auth surface used by the storefront account pages. Customer auth
// (OTP/OAuth/password reset) is not active after the Base44 detachment; these
// permissive stubs keep the import surface intact so the account pages render
// and can show a "non disponibile" state. Wire Convex Auth here when needed.
/** @type {any} */
const auth = {
  me: async () => null,
  logout: noop,
  redirectToLogin(returnTo) {
    if (typeof window !== "undefined") {
      window.location.href = `/login${returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : ""}`;
    }
  },
  async loginViaEmailPassword() { throw unavailable(); },
  async register() { throw unavailable(); },
  async verifyOtp() { throw unavailable(); },
  async resendOtp() { throw unavailable(); },
  setToken: noop,
  async resetPassword() { throw unavailable(); },
  async resetPasswordRequest() { throw unavailable(); },
  async loginWithProvider() { throw unavailable(); },
  isAuthenticated: async () => false,
};

export const base44 = {
  isConfigured: convexConfigured,
  functions: { invoke },
  auth,
  // Convex handles file storage directly; legacy image helpers that referenced
  // base44.com are no-ops here (images are stored as absolute URLs).
  com: {
    media: {
      getImageUrl: (url) => url || "",
      getVideoUrl: (url) => url || "",
    },
    identity: {
      getCurrentUser: async () => null,
    },
  },
};

export { convexConfigured };