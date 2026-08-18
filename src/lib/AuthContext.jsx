import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

// After the Base44 → Convex migration there is no app-bootstrap network call
// and no built-in customer session on the storefront. Customer accounts can be
// added later via Convex Auth; the admin console uses its own shared password.
// This provider keeps the same useAuth() shape consumed across the app so no
// call sites need to change, without any Base44 runtime dependency.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user] = useState(null);
  const [isAuthenticated] = useState(false);
  const [isLoadingAuth] = useState(false);
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);
  const [authChecked] = useState(true);
  const [appPublicSettings] = useState({});

  const checkUserAuth = useCallback(async () => null, []);
  const checkAppState = useCallback(async () => {}, []);

  const logout = useCallback((shouldRedirect = true) => {
    base44.auth.logout(shouldRedirect ? window.location.href : undefined);
  }, []);

  const navigateToLogin = useCallback(() => {
    base44.auth.redirectToLogin(window.location.href);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings,
    authChecked,
    logout,
    navigateToLogin,
    checkUserAuth,
    checkAppState,
  }), [
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings,
    authChecked,
    logout,
    navigateToLogin,
    checkUserAuth,
    checkAppState,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
