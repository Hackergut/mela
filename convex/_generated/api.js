/* eslint-disable */
// Local stub of the generated `api` object. A Convex function reference is any
// object carrying the `Symbol.for("functionName")` property with the UDF path
// (e.g. "catalog:default"). We build those objects directly so this file has no
// runtime import that Vite/Rollup would try to bundle. `npx convex dev` /
// `convex deploy` regenerates this file from the functions in ../*.ts.

const FN = Symbol.for("functionName");

const ref = (path) => ({ [FN]: path });

// Recursively turn { catalog: "catalog:default", _crud: { listAll: ... } }
// into nested function references.
function build(spec) {
  if (typeof spec === "string") return ref(spec);
  const out = {};
  for (const [k, v] of Object.entries(spec)) out[k] = build(v);
  return out;
}

const spec = {
  catalog: "catalog:default",
  adminCms: "adminCms:default",
  createCheckout: "createCheckout:default",
  integrationHub: "integrationHub:default",
  shopifySync: "shopifySync:default",
  orderLookup: "orderLookup:default",
};

const internalSpec = {
  _crud: {
    listAll: "_crud:listAll",
    getById: "_crud:getById",
    createOne: "_crud:createOne",
    updateOne: "_crud:updateOne",
    deleteOne: "_crud:deleteOne",
    bulkCreate: "_crud:bulkCreate",
    bulkUpdate: "_crud:bulkUpdate",
    bulkDelete: "_crud:bulkDelete",
    catalogSnapshot: "_crud:catalogSnapshot",
    variantsByProduct: "_crud:variantsByProduct",
    productById: "_crud:productById",
    variantById: "_crud:variantById",
    categoryById: "_crud:categoryById",
    orderById: "_crud:orderById",
    allProducts: "_crud:allProducts",
    allVariants: "_crud:allVariants",
    allCategories: "_crud:allCategories",
    productsByCategory: "_crud:productsByCategory",
    categoriesByParent: "_crud:categoriesByParent",
    unreadNotifications: "_crud:unreadNotifications",
    markNotificationsRead: "_crud:markNotificationsRead",
    customersByEmail: "_crud:customersByEmail",
    discountsByCode: "_crud:discountsByCode",
    webhookEventsByOrder: "_crud:webhookEventsByOrder",
  },
};

export const api = build(spec);
export const internal = build(internalSpec);
export default api;
