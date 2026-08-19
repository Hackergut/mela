import { send } from "./_lib/http.js";
import { stripeMode, stripeRequest, stripeSecret } from "./_lib/stripe.js";

export default async function handler(req, res) {
  const key = stripeSecret();
  const publishable = Boolean(process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const webhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const publicAppUrl = String(process.env.PUBLIC_APP_URL || "").trim();
  const payload = {
    stripeKeySet: Boolean(key),
    publishableKeySet: publishable,
    webhookSecretSet: webhook,
    publicAppUrl,
    mode: stripeMode(key),
    currency: "eur",
    provider: "vercel",
  };
  if (!key) return send(res, 200, payload);
  try {
    const account = await stripeRequest("/account");
    const balance = await stripeRequest("/balance");
    const eur = (buckets) => (buckets || []).find((item) => item.currency === "eur")?.amount ?? null;
    payload.account = {
      id: account.id,
      business_name: account.business_profile?.name || account.settings?.dashboard?.display_name || "",
      country: account.country,
      payouts_enabled: account.payouts_enabled,
      available_eur: eur(balance.available),
      pending_eur: eur(balance.pending),
    };
  } catch (error) {
    payload.account = { error: error.message };
  }
  return send(res, 200, payload);
}
