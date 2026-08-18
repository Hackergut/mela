// @ts-nocheck
import { ConvexReactClient } from "convex/react";

// The deploy URL is provided at build/runtime via VITE_CONVEX_URL. On Vercel
// set it in Project → Environment Variables (e.g.
// https://your-deployment.convex.cloud). When missing, the storefront still
// renders with empty data instead of crashing.
const url = import.meta.env.VITE_CONVEX_URL || "";

/** @type {ConvexReactClient | null} */
let client = null;
export let convexConfigured = false;

if (url) {
  try {
    client = new ConvexReactClient(url);
    convexConfigured = true;
  } catch (e) {
    console.error("Convex client init failed:", e);
  }
}

export const convex = client;