import React, { useState } from 'react';
import { Loader2, PackageSearch, Search } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import OrderDetail from '@/components/OrderDetail';
import { base44 } from '@/api/base44Client';
import { SUPPORT_EMAIL, whatsappLink } from '@/lib/contact';

export default function TracciaOrdine() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!orderNumber.trim() || !email.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const response = await base44.functions.invoke('catalog', {
        operation: 'order_lookup',
        order_number: orderNumber.trim(),
        email: email.trim(),
      });
      setOrder(response.data?.order || null);
      if (!response.data?.order) throw new Error('Ordine non trovato.');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Ordine non trovato.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <PromoBanner />
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-[#0066cc]">Assistenza ordini</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Traccia il tuo ordine.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6e6e73]">
            Inserisci il numero ordine (es. <span className="font-mono">TM-…</span> dalla email di conferma) e l'indirizzo email usato al checkout.
          </p>
        </div>

        <form onSubmit={submit} className="mb-8 rounded-[32px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03)] sm:p-8" aria-label="Cerca ordine">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="order-number" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6e6e73]">Numero ordine</label>
              <input
                id="order-number"
                type="text"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="TM-XXXXXXXX-XXXX"
                className="min-h-12 w-full rounded-2xl border border-[#d2d2d7] px-4 text-sm outline-none transition focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="order-email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6e6e73]">Email dell'ordine</label>
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@email.it"
                className="min-h-12 w-full rounded-2xl border border-[#d2d2d7] px-4 text-sm outline-none transition focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !orderNumber.trim() || !email.trim()}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0071e3] px-7 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
            {loading ? 'Ricerca…' : 'Trova il mio ordine'}
          </button>
          {error && <p role="alert" className="mt-4 rounded-xl bg-[#ffebe8] px-4 py-3 text-sm text-[#d70015]">{error}</p>}
        </form>

        {order ? (
          <div className="rounded-[32px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03)] sm:p-8">
            <OrderDetail order={order} />
          </div>
        ) : (
          !loading && !error && (
            <div className="rounded-[32px] border border-dashed border-[#d2d2d7] px-6 py-16 text-center">
              <PackageSearch size={40} strokeWidth={1.4} className="mx-auto text-[#86868b]" aria-hidden="true" />
              <p className="mt-4 text-sm text-[#6e6e73]">Il riepilogo e lo stato della spedizione appariranno qui.</p>
              <p className="mt-2 text-xs text-[#86868b]">Hai bisogno d'aiuto? Scrivici su <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#25D366] hover:underline">WhatsApp</a> o a <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#0066cc] hover:underline">{SUPPORT_EMAIL}</a>.</p>
            </div>
          )
        )}
      </main>
      <FooterSection />
    </div>
  );
}
