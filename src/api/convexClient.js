// @ts-nocheck
// Convex is invoked via its public HTTP endpoint (see ./functions.js), so the
// React client isn't needed. This module only exposes whether a Convex URL
// is configured, keeping the legacy import surface intact.

const url = import.meta.env.VITE_CONVEX_URL || "";

export let convexConfigured = Boolean(url);

// Kept for backwards compatibility — no consumers currently use it, but the
// named export is part of the module's public surface.
export const convex = url ? { url } : null;