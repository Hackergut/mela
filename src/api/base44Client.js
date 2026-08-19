// @ts-nocheck
// Backend client. Commerce and auth no longer require Convex: Stripe goes
// through /api/* and accounts through the local/Google session. Convex remains
// an optional CMS when VITE_CONVEX_URL is set.

import { invoke, convexConfigured, api, convex } from "./functions";
import {
  clearSession,
  loginAccount,
  loginGoogleProfile,
  readSession,
  registerAccount,
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/lib/auth/accounts";
import { requestGoogleProfile } from "@/lib/auth/google";

/** @type {any} */
const auth = {
  me: async () => readSession(),
  logout(redirectTo) {
    clearSession();
    if (redirectTo && typeof window !== "undefined") window.location.href = redirectTo === true ? "/" : redirectTo;
  },
  redirectToLogin(returnTo) {
    if (typeof window === "undefined") return;
    const raw = returnTo || window.location.href;
    let path = "/";
    try {
      const url = new URL(raw, window.location.origin);
      path = url.origin === window.location.origin ? url.pathname + url.search : "/";
    } catch { /* keep / */ }
    window.location.href = `/login?returnTo=${encodeURIComponent(path)}`;
  },
  async loginViaEmailPassword(email, password) {
    return loginAccount({ email, password });
  },
  async register({ email, password, name } = {}) {
    return registerAccount({ email, password, name });
  },
  async verifyOtp() {
    return { access_token: "local" };
  },
  async resendOtp() {
    return { ok: true };
  },
  setToken() {},
  async resetPassword({ resetToken, newPassword } = {}) {
    return resetPasswordWithToken(resetToken, newPassword);
  },
  async resetPasswordRequest(email) {
    return requestPasswordReset(email);
  },
  async loginWithProvider(provider) {
    if (provider !== "google") throw new Error("Provider non supportato");
    const profile = await requestGoogleProfile();
    return loginGoogleProfile(profile);
  },
  isAuthenticated: async () => Boolean(readSession()),
};

export const base44 = {
  isConfigured: true,
  functions: { invoke },
  auth,
  com: {
    media: {
      getImageUrl: (url) => url || "",
      getVideoUrl: (url) => url || "",
    },
    identity: {
      getCurrentUser: async () => readSession(),
    },
  },
};

export { convexConfigured, api, convex };
