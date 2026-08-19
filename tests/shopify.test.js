import test from "node:test";
import assert from "node:assert/strict";
import {
  categoriesFromProducts,
  mapShopifyCart,
  mapShopifyCartLine,
  mapShopifyProduct,
  mapShopifyVariant,
  moneyToCents,
  shapeShopifyCatalog,
  shopifyGidId,
} from "../src/lib/shopify/mapProduct.js";
import { normalizeStoreDomain } from "../src/lib/shopify/client.js";

const variantNode = {
  id: "gid://shopify/ProductVariant/99",
  title: "Blu",
  sku: "PHONE-BLUE",
  availableForSale: true,
  quantityAvailable: 4,
  price: { amount: "1099.00", currencyCode: "EUR" },
  compareAtPrice: { amount: "1199.00", currencyCode: "EUR" },
  selectedOptions: [
    { name: "Colore", value: "Blu" },
    { name: "Title", value: "Default Title" },
  ],
  image: { url: "https://cdn.shopify.com/blue.jpg" },
};

const productNode = {
  id: "gid://shopify/Product/1",
  title: "iPhone 17 Pro",
  handle: "iphone-17-pro",
  description: "Titanio. Camera. Velocità.",
  vendor: "Apple",
  productType: "iPhone",
  tags: ["new", "featured"],
  availableForSale: true,
  featuredImage: { url: "https://cdn.shopify.com/main.jpg" },
  images: { nodes: [{ url: "https://cdn.shopify.com/main.jpg" }, { url: "https://cdn.shopify.com/alt.jpg" }] },
  collections: { nodes: [{ id: "gid://shopify/Collection/2", handle: "iphone", title: "iPhone" }] },
  variants: { nodes: [variantNode] },
};

test("Shopify money values become integer cents", () => {
  assert.equal(moneyToCents({ amount: "19.99" }), 1999);
  assert.equal(moneyToCents("1099.00"), 109900);
  assert.equal(moneyToCents(null), 0);
  assert.equal(shopifyGidId("gid://shopify/Product/123"), "123");
});

test("store domains are normalised to a hostname", () => {
  assert.equal(normalizeStoreDomain("https://demo.myshopify.com/admin"), "demo.myshopify.com");
  assert.equal(normalizeStoreDomain("Demo.myshopify.com"), "demo.myshopify.com");
});

test("Shopify products map onto the existing storefront shape", () => {
  const { product, variants } = mapShopifyProduct(productNode);
  assert.equal(product.id, "iphone-17-pro");
  assert.equal(product.shopify_id, "gid://shopify/Product/1");
  assert.equal(product.name, "iPhone 17 Pro");
  assert.equal(product.category, "iPhone");
  assert.equal(product.badge, "Nuovo");
  assert.equal(product.source, "shopify");
  assert.equal(variants.length, 1);
  assert.equal(variants[0].id, "gid://shopify/ProductVariant/99");
  assert.equal(variants[0].price_cents, 109900);
  assert.equal(variants[0].stock, 4);
  assert.deepEqual(variants[0].option_values, { Colore: "Blu" });
});

test("catalogue shaping hydrates prices and categories", () => {
  const catalog = shapeShopifyCatalog({ products: { nodes: [productNode] } });
  assert.equal(catalog.source, "shopify");
  assert.equal(catalog.settings.commerce_provider, "shopify");
  assert.equal(catalog.products.length, 1);
  assert.equal(catalog.products[0].price_cents, 109900);
  assert.equal(catalog.products[0].default_variant.id, "gid://shopify/ProductVariant/99");
  assert.equal(catalog.categories[0].name, "iPhone");
  assert.equal(categoriesFromProducts(catalog.products).length, 1);
});

test("unavailable Shopify variants fall back to zero stock", () => {
  const mapped = mapShopifyVariant({
    ...variantNode,
    availableForSale: false,
    quantityAvailable: null,
  }, "iphone-17-pro");
  assert.equal(mapped.stock, 0);
});

test("Shopify cart lines keep GID variants for checkout", () => {
  const line = mapShopifyCartLine({
    id: "gid://shopify/CartLine/1",
    quantity: 2,
    merchandise: {
      ...variantNode,
      product: { id: productNode.id, title: productNode.title, handle: productNode.handle },
    },
  });
  assert.equal(line.product_id, "iphone-17-pro");
  assert.equal(line.variant_id, "gid://shopify/ProductVariant/99");
  assert.equal(line.qty, 2);
  assert.equal(line.price_cents, 109900);

  const cart = mapShopifyCart({
    id: "gid://shopify/Cart/1",
    checkoutUrl: "https://demo.myshopify.com/cart/c/abc",
    totalQuantity: 2,
    cost: { subtotalAmount: { amount: "2198.00" }, totalAmount: { amount: "2198.00" } },
    lines: { nodes: [{ id: "gid://shopify/CartLine/1", quantity: 2, merchandise: { ...variantNode, product: { handle: "iphone-17-pro", title: "iPhone 17 Pro" } } }] },
  });
  assert.equal(cart.checkoutUrl.includes("/cart/"), true);
  assert.equal(cart.items.length, 1);
});
