/* eslint-disable */
/**
 * Generated `api` utility used to reference functions from the client or other
 * functions. Local stub for builds before `npx convex dev` links a deployment.
 * Regenerated automatically by Convex codegen — do not edit.
 */
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import type * as adminCms from "../adminCms";
import type * as catalog from "../catalog";
import type * as createCheckout from "../createCheckout";
import type * as integrationHub from "../integrationHub";
import type * as orderLookup from "../orderLookup";
import type * as shopifySync from "../shopifySync";
import type * as shopifyStorefront from "../shopifyStorefront";
import type * as _crud from "../_crud";
import type * as currentUser from "../currentUser";
declare const fullApi: ApiFromModules<{
  adminCms: typeof adminCms;
  catalog: typeof catalog;
  createCheckout: typeof createCheckout;
  integrationHub: typeof integrationHub;
  orderLookup: typeof orderLookup;
  shopifySync: typeof shopifySync;
  shopifyStorefront: typeof shopifyStorefront;
  _crud: typeof _crud;
  currentUser: typeof currentUser;
}>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
