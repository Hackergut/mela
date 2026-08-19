import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  loginAccount,
  loginGoogleProfile,
  readSession,
  registerAccount,
  requestPasswordReset,
  resetPasswordWithToken,
} from '@/lib/auth/accounts';
import { isGoogleAuthConfigured, requestGoogleProfile } from '@/lib/auth/google';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const next = await loginAccount({ email, password });
      setUser(next);
      return next;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const register = useCallback(async ({ email, password, name }) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const next = await registerAccount({ email, password, name });
      setUser(next);
      return next;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const profile = await requestGoogleProfile();
      const next = loginGoogleProfile(profile);
      setUser(next);
      return next;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback((shouldRedirect = true) => {
    clearSession();
    setUser(null);
    if (shouldRedirect && typeof window !== 'undefined') window.location.href = '/';
  }, []);

  const navigateToLogin = useCallback((returnTo) => {
    const target = returnTo || (typeof window !== 'undefined' ? window.location.href : '/');
    const path = target.startsWith('http') ? new URL(target).pathname + new URL(target).search : target;
    window.location.href = `/login?returnTo=${encodeURIComponent(path || '/')}`;
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError,
    appPublicSettings: {},
    authChecked: true,
    googleConfigured: isGoogleAuthConfigured(),
    login,
    register,
    loginWithGoogle,
    requestPasswordReset,
    resetPasswordWithToken,
    logout,
    navigateToLogin,
    checkUserAuth: async () => readSession(),
    checkAppState: async () => {},
  }), [user, isLoadingAuth, authError, login, register, loginWithGoogle, logout, navigateToLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
