import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/shopify-storefront.js";

const ENV_VARS = [
  "SHOPIFY_STORE_DOMAIN",
  "SHOPIFY_SHOP_DOMAIN",
  "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
];

function withEnv(values, fn) {
  const saved = Object.fromEntries(ENV_VARS.map((key) => [key, process.env[key]]));
  Object.entries(values).forEach(([key, value]) => {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  });
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      Object.entries(saved).forEach(([key, value]) => {
        if (value == null) delete process.env[key];
        else process.env[key] = value;
      });
    });
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    setHeader() {},
    end(payload) {
      res.body = payload;
    },
  };
  return res;
}

function invoke(body) {
  const res = mockRes();
  return handler({ method: "POST", body }, res).then(() => ({
    status: res.statusCode,
    body: res.body ? JSON.parse(res.body) : null,
  }));
}

test("Vercel Shopify Storefront config does not expose the token", async () => {
  await withEnv(
    { SHOPIFY_STORE_DOMAIN: "demo.myshopify.com", SHOPIFY_STOREFRONT_ACCESS_TOKEN: "shpat_test" },
    async () => {
      const { status, body } = await invoke({ operation: "config" });
      assert.equal(status, 200);
      assert.equal(body.configured, true);
      assert.equal(body.domain, "demo.myshopify.com");
      assert.equal(body.token, "");
      assert.equal(body.proxied, true);
    },
  );
});

test("Vercel Shopify Storefront proxies GraphQL server-side", async () => {
  await withEnv(
    { SHOPIFY_STORE_DOMAIN: "demo.myshopify.com", SHOPIFY_STOREFRONT_ACCESS_TOKEN: "shpat_test" },
    async () => {
      const original = globalThis.fetch;
      globalThis.fetch = async (url, init) => {
        assert.equal(url, "https://demo.myshopify.com/api/2025-01/graphql.json");
        assert.equal(init.headers["X-Shopify-Storefront-Access-Token"], "shpat_test");
        return {
          ok: true,
          async json() {
            return { data: { products: { nodes: [{ id: "gid://shopify/Product/1" }] } } };
          },
        };
      };
      try {
        const { status, body } = await invoke({
          operation: "graphql",
          payload: { query: "query { products(first: 1) { nodes { id } } }", variables: {} },
        });
        assert.equal(status, 200);
        assert.equal(body.data.products.nodes.length, 1);
      } finally {
        globalThis.fetch = original;
      }
    },
  );
});

test("Vercel Shopify Storefront returns 503 when credentials are missing", async () => {
  await withEnv({ SHOPIFY_STORE_DOMAIN: "", SHOPIFY_STOREFRONT_ACCESS_TOKEN: "" }, async () => {
    const { status, body } = await invoke({ operation: "config" });
    assert.equal(status, 503);
    assert.match(body.error, /non configurato/i);
  });
});
