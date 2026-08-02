import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import { base44 } from '@/api/base44Client';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'product' });
      onLogin(password, res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Password non valida');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <PromoBanner />
      <Navbar />
      <div className="flex items-center justify-center px-6 py-20">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={26} className="text-[#FF6B35]" />
          </div>
          <h1 className="text-2xl font-bold text-center text-[#1d1d1f] mb-1">Area Admin</h1>
          <p className="text-sm text-[#6e6e73] text-center mb-6">Inserisci la password per gestire il catalogo</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6B35] focus:outline-none text-sm mb-3"
            autoFocus
          />
          {error && <p className="text-sm text-red-600 mb-3 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-xl hover:bg-[#FF6B35] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifica…</> : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}