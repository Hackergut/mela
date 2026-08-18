import { ConvexReactClient } from "convex/react";

// The VITE_CONVEX_URL looks like:
//   https://your-name-123.convex.cloud
// It is set:
//   - locally in .env.local  (after `npx convex dev`)
//   - on Vercel as a public environment variable
// When absent the app runs in "offline/demo" mode using the built-in
// fallback catalogue; set the variable to enable the live Convex backend.
const convexUrl = import.meta.env.VITE_CONVEX_URL || "";

/** @type {ConvexReactClient | null} */
let client = null;
export let convexConfigured = false;

if (convexUrl) {
  try {
    client = new ConvexReactClient(convexUrl);
    convexConfigured = true;
  } catch (e) {
    console.error("Convex client init failed:", e);
  }
}

export const convex = client;
