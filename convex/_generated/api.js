/* eslint-disable */
// Local stub — replaced by `npx convex codegen` once a deployment is linked.
// Mirrors the function module tree so the frontend adapter can reference
// `api.catalog`, `api.adminCms`, etc. during builds.
const anyApi = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (typeof prop !== "string") return undefined;
      return anyApi[prop] ?? (anyApi[prop] = createModule(prop));
    },
  },
);

function createModule(name) {
  return new Proxy(
    { [Symbol.for("convex.functionModule")]: name },
    {
      get: (_t, prop) => {
        if (typeof prop !== "string") return undefined;
        return `${name}:${prop}`;
      },
    },
  );
}

export const api = anyApi;
export const internal = anyApi;
export default anyApi;
