import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { StoreProvider } from '@/lib/StoreContext';
import ScrollToTop from '@/components/ScrollToTop';
import AppErrorBoundary from '@/lib/AppErrorBoundary';
import SupportChatButton from '@/components/SupportChatButton';
import IntegrationBoot from '@/components/IntegrationBoot';

// Each route is downloaded only when visited. In particular, the sizeable
// admin dashboard (charts and PDF tooling) never enters the storefront bundle.
const Home = lazy(() => import('@/pages/Home'));
const Catalogo = lazy(() => import('@/pages/Catalogo'));
const SchedaProdotto = lazy(() => import('@/pages/SchedaProdotto'));
const Carrello = lazy(() => import('@/pages/Carrello'));
const Preferiti = lazy(() => import('@/pages/Preferiti'));
const Ordine = lazy(() => import('@/pages/Ordine'));
const TracciaOrdine = lazy(() => import('@/pages/TracciaOrdine'));
const InfoLegali = lazy(() => import('@/pages/InfoLegali'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const OAuthConsent = lazy(() => import('@/pages/OAuthConsent'));
const Admin = lazy(() => import('@/pages/Admin'));
const PageNotFound = lazy(() => import('@/lib/PageNotFound'));

const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white" role="status" aria-live="polite">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
    <span className="sr-only">Caricamento…</span>
  </div>
);

// The WhatsApp chat button floats on every storefront page but stays out of
// the admin console, which has its own dedicated interface.
const SupportChatGate = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <SupportChatButton />;
};

const StorefrontRoutes = () => {
  // Authentication resolves in the background. Public Store routes remain
  // usable even when Base44 has no active user session.
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/scheda-prodotto" element={<SchedaProdotto />} />
        <Route path="/carrello" element={<Carrello />} />
        <Route path="/preferiti" element={<Preferiti />} />
        <Route path="/ordine" element={<Ordine />} />
        <Route path="/traccia-ordine" element={<TracciaOrdine />} />
        <Route path="/informazioni-legali" element={<InfoLegali />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

export default function App({ convexAuthEnabled = false }) {
  return (
    <AppErrorBoundary>
      <AuthProvider convexAuthEnabled={convexAuthEnabled}>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <IntegrationBoot />
            <ScrollToTop />
            <StoreProvider>
              <StorefrontRoutes />
            </StoreProvider>
            <SupportChatGate />
            {import.meta.env.DEV && (
              <div
                data-build-marker
                aria-hidden="true"
                className="fixed bottom-2 left-2 z-[9999] rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white pointer-events-none"
              >
                BUILD PDP-v3 · 5set
              </div>
            )}
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
