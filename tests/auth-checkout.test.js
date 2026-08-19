import test from "node:test";
import assert from "node:assert/strict";
import { quoteCheckout, normalizeCheckoutInput } from "../src/lib/checkoutPricing.js";

test("checkout input is merged and validated", () => {
  const { lines } = normalizeCheckoutInput({
    items: [
      { productId: "prod-1", variantId: "var-1-1", quantity: 1 },
      { productId: "prod-1", variantId: "var-1-1", quantity: 2 },
    ],
  });
  assert.equal(lines.length, 1);
  assert.equal(lines[0].quantity, 3);
});

test("checkout quote prices from the built-in catalogue, not the client", () => {
  const quote = quoteCheckout({
    items: [{ productId: "prod-1", variantId: "var-1-1", quantity: 1 }],
  });
  assert.equal(quote.orderItems.length, 1);
  assert.ok(quote.finalAmount >= 50);
  assert.equal(quote.orderItems[0].name.includes("iPhone 17 Pro"), true);
  assert.match(quote.orderNumber, /^TM-/);
});

test("unknown products are rejected", () => {
  assert.throws(
    () => quoteCheckout({ items: [{ productId: "missing", quantity: 1 }] }),
    /non è più disponibile/,
  );
});
