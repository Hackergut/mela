import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, PackageSearch, RefreshCw, SearchX } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import OrderDetail from '@/components/OrderDetail';
import { base44 } from '@/api/base44Client';

export default function Ordine() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('catalog', { operation: 'order_lookup', session_id: sessionId });
      setOrder(response.data?.order || null);
      if (!response.data?.order) throw new Error('Ordine non trovato.');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Ordine non trovato.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <PromoBanner />
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-8">
        {loading ? (
          <div className="grid place-items-center rounded-[32px] bg-white px-6 py-24 shadow-[0_1px_2px_rgba(0,0,0,.03)]">
            <Loader2 size={32} className="animate-spin text-[#0071e3]" aria-hidden="true" />
            <p className="mt-4 text-sm text-[#6e6e73]">Recupero dei dettagli dell'ordine…</p>
          </div>
        ) : !sessionId ? (
          <div className="rounded-[32px] bg-white px-6 py-20 text-center shadow-[0_1px_2px_rgba(0,0,0,.03)]">
            <PackageSearch size={44} strokeWidth={1.4} className="mx-auto text-[#86868b]" aria-hidden="true" />
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">Grazie per il tuo acquisto.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6e6e73]">
              Il tuo ordine è stato registrato. Puoi consultarne lo stato in qualsiasi momento dalla pagina di tracciamento.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/traccia-ordine" className="rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0071e3]">Traccia il tuo ordine</Link>
              <Link to="/catalogo" className="rounded-full bg-[#e8f2ff] px-6 py-3 text-sm font-semibold text-[#0066cc]">Continua lo shopping</Link>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[32px] bg-white px-6 py-20 text-center shadow-[0_1px_2px_rgba(0,0,0,.03)]">
            <SearchX size={44} strokeWidth={1.4} className="mx-auto text-[#86868b]" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">Ordine non trovato.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6e6e73]">{error}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={load} className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0071e3]">
                <RefreshCw size={15} aria-hidden="true" /> Riprova
              </button>
              <Link to="/traccia-ordine" className="rounded-full bg-[#e8f2ff] px-6 py-3 text-sm font-semibold text-[#0066cc]">Traccia con numero ordine</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-[32px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03)] sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eaf7ed] text-[#248a3d]">
                  <CheckCircle2 size={26} aria-hidden="true" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Grazie per il tuo ordine.</h1>
                  <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                    {order?.status === 'paid' || order?.status === 'shipped' || order?.status === 'delivered'
                      ? 'Il pagamento è andato a buon fine. Riceverai aggiornamenti via email a ogni cambio di stato.'
                      : 'Stiamo confermando il pagamento: l\'aggiornamento richiede di norma pochi secondi.'}
                  </p>
                  {order?.status === 'pending' && (
                    <button onClick={load} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#1d1d1f] transition hover:bg-[#e8e8ed]">
                      <RefreshCw size={13} aria-hidden="true" /> Aggiorna stato
                    </button>
                  )}
                </div>
              </div>
            </div>
            {order && (
              <div className="rounded-[32px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03)] sm:p-8">
                <OrderDetail order={order} />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/catalogo" className="rounded-full bg-[#0071e3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ed]">Continua lo shopping</Link>
              <Link to="/traccia-ordine" className="rounded-full border border-[#d2d2d7] bg-white px-6 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:border-[#86868b]">Traccia l'ordine in seguito</Link>
            </div>
          </div>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
