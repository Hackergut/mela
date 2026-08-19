import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import {
  clearSession,
  loginAccount,
  readSession,
  registerAccount,
  requestPasswordReset,
  resetPasswordWithToken,
} from '@/lib/auth/accounts';

const AuthContext = createContext(null);

function authReturnPath(returnTo) {
  if (typeof window === 'undefined') return '/';
  const target = returnTo || window.location.href;
  try {
    const url = new URL(target, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}` : '/';
  } catch {
    return '/';
  }
}

function LocalAuthProvider({ children }) {
  const [user, setUser] = useState(() => (typeof window === 'undefined' ? null : readSession()));
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const sync = () => setUser(readSession());
    window.addEventListener('storage', sync);
    window.addEventListener('tm-auth', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('tm-auth', sync);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoadingAuth(true); setAuthError(null);
    try { const next = await loginAccount({ email, password }); setUser(next); return next; }
    catch (error) { setAuthError(error.message); throw error; }
    finally { setIsLoadingAuth(false); }
  }, []);

  const register = useCallback(async ({ email, password, name }) => {
    setIsLoadingAuth(true); setAuthError(null);
    try { const next = await registerAccount({ email, password, name }); setUser(next); return next; }
    catch (error) { setAuthError(error.message); throw error; }
    finally { setIsLoadingAuth(false); }
  }, []);

  const logout = useCallback((shouldRedirect = true) => {
    clearSession(); setUser(null);
    if (shouldRedirect && typeof window !== 'undefined') window.location.href = '/';
  }, []);

  const navigateToLogin = useCallback((returnTo) => {
    if (typeof window !== 'undefined') window.location.href = `/login?returnTo=${encodeURIComponent(authReturnPath(returnTo))}`;
  }, []);

  const unavailableGoogle = useCallback(async () => {
    throw new Error('Google OAuth richiede un backend Convex configurato. Imposta VITE_CONVEX_URL e configura AUTH_GOOGLE_ID e AUTH_GOOGLE_SECRET su Convex.');
  }, []);

  const value = useMemo(() => ({
    user, isAuthenticated: Boolean(user), isLoadingAuth, isLoadingPublicSettings: false,
    authError, appPublicSettings: {}, authChecked: true, googleConfigured: false,
    login, register, loginWithGoogle: unavailableGoogle, requestPasswordReset,
    resetPasswordWithToken, logout, navigateToLogin, checkUserAuth: async () => readSession(),
    checkAppState: async () => {},
  }), [user, isLoadingAuth, authError, login, register, unavailableGoogle, logout, navigateToLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ConvexAuthContextProvider({ children }) {
  const { signIn, signOut } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const convexUser = useQuery(api.currentUser.get);
  const [authError, setAuthError] = useState(null);

  const loginWithGoogle = useCallback(async (returnTo) => {
    setAuthError(null);
    // This starts a full-page OAuth redirect. Convex Auth validates the callback
    // and stores tokens; Google credentials never enter the Vite bundle.
    return signIn('google', { redirectTo: authReturnPath(returnTo) });
  }, [signIn]);

  const logout = useCallback(async (shouldRedirect = true) => {
    await signOut();
    clearSession();
    if (shouldRedirect && typeof window !== 'undefined') window.location.href = '/';
  }, [signOut]);

  const navigateToLogin = useCallback((returnTo) => {
    if (typeof window !== 'undefined') window.location.href = `/login?returnTo=${encodeURIComponent(authReturnPath(returnTo))}`;
  }, []);

  const value = useMemo(() => ({
    user: isAuthenticated ? (convexUser || { name: 'Utente' }) : null,
    isAuthenticated, isLoadingAuth: isLoading, isLoadingPublicSettings: false,
    authError, appPublicSettings: {}, authChecked: !isLoading, googleConfigured: true,
    // Email/password remains the legacy local-account flow. Google is handled
    // exclusively by Convex Auth while this provider is enabled.
    login: loginAccount, register: registerAccount, loginWithGoogle,
    requestPasswordReset, resetPasswordWithToken, logout, navigateToLogin,
    checkUserAuth: async () => (isAuthenticated ? convexUser : null), checkAppState: async () => {},
  }), [isAuthenticated, convexUser, isLoading, authError, loginWithGoogle, logout, navigateToLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = ({ children, convexAuthEnabled = false }) => (
  convexAuthEnabled
    ? <ConvexAuthContextProvider>{children}</ConvexAuthContextProvider>
    : <LocalAuthProvider>{children}</LocalAuthProvider>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
