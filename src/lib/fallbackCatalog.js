// Built-in fallback catalogue. When Convex is not configured (e.g. a Vercel
// deploy without VITE_CONVEX_URL) or the backend request fails, the storefront
// uses this snapshot so the site is never empty. The shape matches what the
// Convex `catalog` action returns, so the rest of the app is unchanged.

import { PRODUCT_CATALOG } from "./productCatalog";

const slugify = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const eurosToCents = (priceText) => {
  const n = Number(String(priceText || "").replace(/[^\d,]/g, "").replace(".", "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

const moneyLabel = (cents) => {
  const value = Math.max(0, Math.round(Number(cents) || 0));
  const euros = Math.floor(value / 100).toLocaleString("it-IT");
  const decimal = String(value % 100).padStart(2, "0");
  return decimal === "00" ? `€${euros}` : `€${euros},${decimal}`;
};

let memo = null;

/** Build the fallback catalogue once (products, variants, categories). */
export function buildFallbackCatalog() {
  if (memo) return memo;

  const categoryNames = [
    ...new Set(PRODUCT_CATALOG.map((p) => p.category || "Generale")),
  ];
  const categories = categoryNames.map((name, i) => ({
    id: `cat-${slugify(name)}`,
    name,
    slug: slugify(name),
    description: `Scopri tutti i prodotti ${name}.`,
    status: "active",
    featured: ["iPhone", "Apple Watch", "Mac", "AirPods"].includes(name),
    image: "",
    sort_order: i * 10,
    created_date: "2024-01-01T00:00:00.000Z",
  }));
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const products = [];
  const variants = [];

  PRODUCT_CATALOG.forEach((raw, index) => {
    const priceCents = eurosToCents(raw.price);
    const categoryName = raw.category || "Generale";
    const category = categoryByName[categoryName];
    const productId = `prod-${index + 1}`;
    const colors = Array.isArray(raw.colors)
      ? raw.colors.map((c) => ({
          name: c.name,
          hex: c.hex,
          image: c.image || raw.image,
          images: Array.isArray(c.images) && c.images.length
            ? c.images
            : (c.image ? [c.image] : [raw.image]),
        }))
      : [];
    // Product-level gallery: the cover plus one image per color, so the PDP
    // shows each option without dumping every color's full photo sequence.
    const gallery = [...new Set([raw.image, ...colors.map((c) => c.image)].filter(Boolean))];

    products.push({
      id: productId,
      name: raw.name,
      slug: slugify(raw.name),
      subtitle: raw.badge || "",
      brand: "Apple",
      family: categoryName,
      sku: `TM-${String(raw.id ?? index + 1).padStart(4, "0")}`,
      price: moneyLabel(priceCents),
      price_cents: priceCents,
      cost_cents: Math.round(priceCents * 0.7),
      stock: 50,
      low_stock_threshold: 5,
      status: "active",
      badge: raw.badge || null,
      category: categoryName,
      category_id: category?.id || "",
      option_names: colors.length ? ["Colore"] : [],
      featured: index < 12 || ["iPhone", "Mac"].includes(categoryName),
      compare_group: categoryName,
      specs: {},
      image: raw.image,
      images: gallery,
      colors,
      description: raw.description || "",
      sort_order: -(raw.id ?? index),
      is_mockup: false,
      source: "legacy",
      created_date: "2024-01-01T00:00:00.000Z",
    });

    // One variant per color (or a single default variant).
    const variantDefs = colors.length
      ? colors
      : [{ name: "Standard", hex: "", image: raw.image }];
    let isDefault = true;
    variantDefs.forEach((c, i) => {
      variants.push({
        id: `var-${index + 1}-${i + 1}`,
        product_id: productId,
        title: c.name || "Standard",
        sku: `TM-${String(raw.id ?? index + 1).padStart(4, "0")}-${i + 1}`,
        option_values: colors.length ? { Colore: c.name } : {},
        color_hex: c.hex || "",
        price_cents: priceCents,
        compare_at_cents: 0,
        cost_cents: Math.round(priceCents * 0.7),
        stock: 50,
        low_stock_threshold: 5,
        image: c.image || raw.image,
        images: (colors.length && Array.isArray(c.images) && c.images.length)
          ? c.images
          : (c.image ? [c.image] : gallery),
        status: "active",
        is_default: isDefault,
        sort_order: i,
        created_date: "2024-01-01T00:00:00.000Z",
      });
      isDefault = false;
    });
  });

  memo = {
    products,
    variants,
    categories,
    settings: {
      store_name: "TechMania",
      currency: "EUR",
      free_shipping_threshold_cents: 9900,
      shipping_flat_rate_cents: 0,
      bundle_discount_percent: 5,
    },
    source: "fallback",
  };
  return memo;
}
