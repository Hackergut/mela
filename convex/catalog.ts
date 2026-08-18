// @ts-nocheck
// Public catalogue: products, variants, categories and store settings.
// This query is reactive — the Convex React hook re-renders components when
// the catalogue changes in the dashboard/admin.

import { query } from "./_generated/server";
import { shapeList, publicSettings } from "./lib/shared";

export default query({
  args: {},
  handler: async (ctx) => {
    const [productsRaw, variantsRaw, categoriesRaw] = await Promise.all([
      ctx.db.query("products").order("desc").collect(),
      ctx.db.query("product_variants").collect(),
      ctx.db.query("categories").collect(),
    ]);

    const products = shapeList(productsRaw, "products").filter(
      (p) => p.status == null || p.status === "active",
    );
    const productIds = new Set(products.map((p) => String(p.id)));
    const variants = shapeList(variantsRaw, "product_variants").filter((v) =>
      productIds.has(String(v.product_id)),
    );
    const categories = shapeList(categoriesRaw, "categories").filter(
      (c) => c.status == null || c.status === "active",
    );
    const settings = await publicSettings(ctx);

    return { products, variants, categories, settings };
  },
});