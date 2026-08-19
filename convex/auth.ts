import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

// OAuth secrets intentionally live only in the Convex deployment. Set
// AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET with `npx convex env set`; never expose
// either value through a VITE_ variable.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
});
