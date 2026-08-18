import React, { useState } from 'react';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import { base44 } from '@/api/base44Client';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true); setError(null); setErrorKind(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'product' });
      const role = res.data?.role || 'admin';
      onLogin(password, res.data.items || [], role);
    } catch (err) {
      const status = err.response?.status;
      setErrorKind(status === 503 ? 'not_configured' : status === 429 ? 'locked' : 'invalid');
      setError(err.response?.data?.error || err.message || 'Password non valida');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <PromoBanner />
      <Navbar />
      <div className="flex items-center justify-center px-6 py-20">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#0071E3]/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={26} className="text-[#0071E3]" />
          </div>
          <h1 className="text-2xl font-bold text-center text-[#1d1d1f] mb-1">Area Admin</h1>
          <p className="text-sm text-[#6e6e73] text-center mb-6">Inserisci la password per gestire il catalogo</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071E3] focus:outline-none text-sm mb-3"
            autoFocus
          />
          {error && (
            <div
              role="alert"
              className={
                'text-sm mb-3 text-center rounded-xl px-3 py-2 ' +
                (errorKind === 'not_configured'
                  ? 'bg-amber-50 text-amber-800'
                  : errorKind === 'locked'
                    ? 'bg-orange-50 text-orange-800'
                    : 'text-red-600')
              }
            >
              <p>{error}</p>
              {errorKind === 'not_configured' && (
                <p className="mt-2 text-left text-[12px] leading-relaxed text-amber-700">
                  1. Apri il progetto in Base44 e vai in <strong>Impostazioni → Secrets</strong> (oppure esegui
                  <code className="mx-1 rounded bg-amber-100 px-1 py-0.5">base44 secrets set ADMIN_PASSWORD=…</code>).<br />
                  2. Imposta <strong>ADMIN_PASSWORD</strong> (accesso operativo) ed eventualmente <strong>SUPER_ADMIN_PASSWORD</strong> (settaggi CMS).<br />
                  3. Le funzioni vengono ridistribuite automaticamente: riprova l’accesso.
                </p>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-xl hover:bg-[#0071E3] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifica…</> : 'Accedi'}
          </button>
          <p className="mt-4 text-[11px] text-[#6e6e73] text-center flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> Super admin = password dedicata per settaggi CMS principali
          </p>
        </form>
      </div>
    </div>
  );
}