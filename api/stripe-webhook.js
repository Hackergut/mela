import crypto from "node:crypto";
import { send } from "./_lib/http.js";

async function readRaw(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function verifySignature(raw, header, secret) {
  const parts = Object.fromEntries(String(header || "").split(",").map((piece) => piece.split("=")));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Metodo non consentito" });
  const secret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  if (!secret) return send(res, 503, { error: "Webhook Stripe non configurato" });
  try {
    const raw = await readRaw(req);
    if (!verifySignature(raw, req.headers["stripe-signature"], secret)) {
      return send(res, 400, { error: "Firma webhook non valida" });
    }
    return send(res, 200, { received: true });
  } catch (error) {
    console.error("stripe webhook", error);
    return send(res, 400, { error: "Webhook non valido" });
  }
}
