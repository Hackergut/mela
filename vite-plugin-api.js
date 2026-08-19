import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROUTES = {
  "/api/create-checkout-session": "../api/create-checkout-session.js",
  "/api/order": "../api/order.js",
  "/api/stripe-status": "../api/stripe-status.js",
  "/api/stripe-webhook": "../api/stripe-webhook.js",
};

function pathOnly(url) {
  return url.split("?")[0];
}

export function localApiPlugin() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = ROUTES[pathOnly(req.url || "")];
        if (!route) return next();
        try {
          const href = pathToFileURL(fileURLToPath(new URL(route, import.meta.url))).href + `?t=${Date.now()}`;
          const mod = await import(href);
          await mod.default(req, res);
        } catch (error) {
          console.error("local api", error);
          if (!res.headersSent) {
            res.statusCode = error.status || 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: error.message || "Errore API locale" }));
          }
        }
      });
    },
  };
}
