// @ts-nocheck
// Seed script: populates the Convex database with the demo catalogue derived
// from src/lib/productCatalog.js (products with their image galleries, plus
// default categories and store settings).
//
// Run after `npx convex dev` links a deployment:
//   npx convex seed
// or:
//   npx convex run seed:default

import { mutation } from "./_generated/server";
import { PRODUCT_CATALOG } from "./shared/productCatalog.js";
import { v } from "convex/values";

const slugify = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const eurosToCents = (priceText) => {
  const n = Number(String(priceText || "").replace(/[^\d,]/g, "").replace(".", "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

export default mutation({
  args: { reset: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.reset) {
      for (const table of ["product_variants", "products", "categories", "settings", "notifications"]) {
        const docs = await ctx.db.query(table).collect();
        for (const d of docs) await ctx.db.delete(d._id);
      }
    }

    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return { skipped: true, products: existingProducts.length, message: "Catalogo già presente. Usa reset:true per ricaricare." };
    }

    const now = new Date().toISOString();

    // Categories derived from the catalogue.
    const categoryNames = [...new Set(PRODUCT_CATALOG.map((p) => p.category || "Generale"))];
    const categoryIds = {};
    for (let i = 0; i < categoryNames.length; i++) {
      const name = categoryNames[i];
      categoryIds[name] = await ctx.db.insert("categories", {
        name, slug: slugify(name), description: `Scopri tutti i prodotti ${name}.`,
        status: "active", featured: ["iPhone", "Apple Watch", "Mac"].includes(name), sort_order: i * 10,
        created_date: now, updated_date: now,
      });
    }

    // Store default settings.
    const defaults = {
      store_name: "TechMania",
      store_email: "info@techmania.it",
      store_currency: "EUR",
      low_stock_threshold: "5",
      free_shipping_threshold: "99",
      shipping_flat_rate: "0",
      shipping_countries: "IT",
      bundle_discount_percent: "5",
    };
    for (const [key, value] of Object.entries(defaults)) {
      await ctx.db.insert("settings", { key, value, label: key, is_mockup: false, created_date: now, updated_date: now });
    }

    const counts = { products: 0, variants: 0 };
    for (const raw of PRODUCT_CATALOG) {
      const priceCents = eurosToCents(raw.price);
      const categoryName = raw.category || "Generale";
      const productId = await ctx.db.insert("products", {
        name: raw.name,
        slug: slugify(raw.name),
        subtitle: raw.badge || "",
        brand: "Apple",
        family: categoryName,
        sku: `TM-${String(raw.id).padStart(4, "0")}`,
        price: raw.price,
        price_cents: priceCents,
        cost_cents: Math.round(priceCents * 0.7),
        stock: raw.category === "Accessori" ? 50 : 25,
        low_stock_threshold: 5,
        status: "active",
        badge: raw.badge || null,
        category: categoryName,
        category_id: categoryIds[categoryName],
        option_names: [],
        featured: ["iPhone", "Mac", "Apple Watch"].includes(categoryName) || (raw.id <= 12),
        compare_group: categoryName,
        specs: {},
        image: raw.image,
        images: Array.isArray(raw.images) ? raw.images : (raw.image ? [raw.image] : []),
        colors: Array.isArray(raw.colors) ? raw.colors.map((c) => ({ name: c.name, hex: c.hex, image: c.image || raw.image })) : [],
        description: raw.description || "",
        sort_order: -raw.id,
        is_mockup: false,
        source: "legacy",
        created_date: now,
        updated_date: now,
      });

      // For products with explicit color galleries, create one variant per
      // color; otherwise a single default variant.
      const colors = Array.isArray(raw.colors) && raw.colors.length ? raw.colors : [null];
      let isDefault = true;
      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const title = color ? color.name : "Standard";
        const image = color?.image || raw.image;
        await ctx.db.insert("product_variants", {
          product_id: productId,
          title,
          sku: `TM-${String(raw.id).padStart(4, "0")}-${i + 1}`,
          option_values: color ? { Colore: color.name } : {},
          color_hex: color?.hex || "",
          price_cents: priceCents,
          compare_at_cents: 0,
          cost_cents: Math.round(priceCents * 0.7),
          stock: 25,
          low_stock_threshold: 5,
          image,
          images: Array.isArray(raw.images) ? raw.images : (image ? [image] : []),
          status: "active",
          is_default: isDefault,
          sort_order: i,
          created_date: now,
          updated_date: now,
        });
        isDefault = false;
        counts.variants++;
      }
      counts.products++;
    }

    return { ok: true, ...counts, categories: categoryNames.length };
  },
});