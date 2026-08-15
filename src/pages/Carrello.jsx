import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Image } from '@/components/ui/image';
import { useStore } from '@/lib/StoreContext';
import { formatPriceCents, parsePriceCents } from '@/lib/catalog';
import { base44 } from '@/api/base44Client';
import { useCatalog } from '@/lib/useProducts';

const linePrice = (item) => Number.isSafeInteger(item.price_cents) ? item.price_cents : parsePriceCents(item.price);

export default function Carrello() {
  const { cart, updateQty, removeFromCart, clearCart, syncCatalog } = useStore();
  const {
    products,
    settings,
    loading: catalogLoading,
    error: catalogError,
    configured: catalogConfigured,
    ready: catalogReady,
  } = useCatalog();
  const [params] = useSearchParams();
  const payment = params.get('payment');
  const [discountCode, setDiscountCode] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const hasUnavailableLines = cart.some(item => item.unavailable || item.stock <= 0);
  const subtotal = useMemo(() => cart.reduce((sum, item) => (
    item.unavailable || item.stock <= 0 ? sum : sum + linePrice(item) * (item.qty || 1)
  ), 0), [cart]);
  const shippingRate = Math.max(0, Number(settings.shipping_flat_rate_cents) || 0);
  const freeShippingThreshold = Math.max(0, Number(settings.free_shipping_threshold_cents) || 0);
  const shipping = shippingRate > 0 && (freeShippingThreshold <= 0 || subtotal < freeShippingThreshold)
    ? shippingRate
    : 0;
  const estimatedTotal = subtotal + shipping;

  useEffect(() => {
    if (payment === 'success') clearCart();
  }, [payment, clearCart]);

  useEffect(() => {
    // Never invalidate persisted snapshots because a catalogue request failed
    // or because a standalone preview has no Base44 launch configuration.
    if (catalogReady) syncCatalog(products);
  }, [catalogReady, products, syncCatalog]);

  const checkout = async () => {
    if (!cart.length) return;
    if (!catalogReady) {
      setError('Attendi la verifica del catalogo prima di procedere.');
      return;
    }
    if (hasUnavailableLines) {
      setError('Rimuovi gli articoli non disponibili prima di procedere.');
      return;
    }
    setCheckingOut(true);
    setError('');
    try {
      const response = await base44.functions.invoke('create-checkout-session', {
        items: cart.map(item => ({
          productId: item.product_id || item.id,
          variantId: item.variant_id || '',
          quantity: item.qty || 1,
        })),
        discountCode: discountCode.trim(),
      });
      if (!response.data?.url) throw new Error(response.data?.error || 'Checkout non disponibile.');
      window.location.href = response.data.url;
    } catch (checkoutError) {
      setError(checkoutError?.response?.data?.error || checkoutError.message || 'Impossibile avviare il checkout.');
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <PromoBanner />
      <Navbar />
      {payment && (
        <div className={payment === 'success' ? 'bg-[#eaf7ed]' : 'bg-[#fff4e5]'}>
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3 text-sm font-medium">
            {payment === 'success' ? <Check size={18} className="text-[#248a3d]" /> : <X size={18} className="text-[#b45309]" />}
            {payment === 'success' ? 'Pagamento completato. Grazie per il tuo ordine.' : 'Pagamento annullato. I prodotti sono ancora nel carrello.'}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#6e6e73] hover:bg-white hover:text-[#1d1d1f]">
          <ArrowLeft size={16} /> Continua gli acquisti
        </Link>
        <div className="mb-9 mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0066cc]">Il tuo ordine</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Carrello.</h1>
          </div>
          {cart.length > 0 && <p className="hidden text-sm text-[#6e6e73] sm:block">{cart.reduce((sum, item) => sum + (item.qty || 1), 0)} articoli</p>}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[32px] bg-white px-6 py-24 text-center shadow-[0_1px_2px_rgba(0,0,0,.03)]">
            <ShoppingBag size={44} strokeWidth={1.4} className="mx-auto text-[#86868b]" />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">Il carrello è vuoto.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6e6e73]">Esplora il catalogo e configura il prodotto perfetto per te.</p>
            <Link to="/catalogo" className="mt-7 inline-flex rounded-full bg-[#0071e3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ed]">Scopri i prodotti</Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="overflow-hidden rounded-[28px] bg-white px-5 sm:px-7">
              {cart.map((item, index) => {
                const lineId = item.line_id || item.id;
                const options = Object.values(item.option_values || {}).filter(Boolean).join(' · ');
                const unavailable = item.unavailable || item.stock <= 0;
                return (
                  <article
                    key={lineId}
                    aria-label={unavailable ? `${item.name}, non disponibile` : item.name}
                    className={`flex gap-4 py-6 sm:gap-7 sm:py-8 ${index ? 'border-t border-[#d2d2d7]' : ''}`}
                  >
                    <Link to={`/scheda-prodotto?id=${item.product_id || item.id}`} className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f5f5f7] p-2 sm:h-36 sm:w-36">
                      <Image src={item.image} alt={item.name} className="h-full w-full" fittingType="fit" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/scheda-prodotto?id=${item.product_id || item.id}`} className="text-base font-semibold leading-tight hover:text-[#0066cc] sm:text-lg">{item.name}</Link>
                          {options && <p className="mt-1 text-sm text-[#6e6e73]">{options}</p>}
                          {item.sku && <p className="mt-1 text-xs text-[#86868b]">SKU {item.sku}</p>}
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold sm:text-base">{formatPriceCents(linePrice(item) * (item.qty || 1))}</p>
                      </div>
                      <p className={`mt-3 text-xs ${unavailable ? 'font-medium text-[#d70015]' : 'text-[#248a3d]'}`}>
                        {item.unavailable ? 'Questa configurazione non è più disponibile' : item.stock > 0 ? 'Disponibile' : 'Esaurito'}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-4">
                        <div className="flex items-center rounded-full border border-[#d2d2d7]">
                          <button disabled={unavailable} onClick={() => updateQty(lineId, (item.qty || 1) - 1)} className="grid h-9 w-9 place-items-center text-[#0066cc] disabled:text-[#c7c7cc]" aria-label="Diminuisci quantità"><Minus size={14} /></button>
                          <span className="w-7 text-center text-sm font-medium" aria-live="polite">{item.qty || 1}</span>
                          <button disabled={unavailable || (item.qty || 1) >= item.stock} onClick={() => updateQty(lineId, (item.qty || 1) + 1)} className="grid h-9 w-9 place-items-center text-[#0066cc] disabled:text-[#c7c7cc]" aria-label="Aumenta quantità"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(lineId)} className="inline-flex items-center gap-1.5 text-sm text-[#0066cc] hover:underline"><Trash2 size={14} /> Rimuovi</button>
                      </div>
                    </div>
                  </article>
                );
              })}
              <div className="border-t border-[#d2d2d7] py-5 text-right">
                <button onClick={clearCart} className="text-sm text-[#0066cc] hover:underline">Svuota il carrello</button>
              </div>
            </section>

            <aside className="h-fit rounded-[28px] bg-white p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold tracking-tight">Riepilogo</h2>
              {!catalogConfigured && (
                <div role="status" className="mt-4 rounded-xl bg-[#fff4e5] p-3 text-xs leading-5 text-[#8a4b08]">
                  Il catalogo non è collegato in questa anteprima. Il pagamento sarà disponibile nello Store configurato.
                </div>
              )}
              {catalogError && (
                <div role="alert" className="mt-4 rounded-xl bg-[#fff2f2] p-3 text-xs leading-5 text-[#b42318]">
                  Non è stato possibile verificare prezzi e disponibilità. Riprova tra poco.
                </div>
              )}
              {hasUnavailableLines && catalogReady && (
                <div role="alert" className="mt-4 rounded-xl bg-[#fff2f2] p-3 text-xs leading-5 text-[#b42318]">
                  Rimuovi gli articoli non disponibili per continuare.
                </div>
              )}
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-[#6e6e73]"><span>Subtotale</span><span>{formatPriceCents(subtotal)}</span></div>
                <div className="flex justify-between text-[#6e6e73]">
                  <span>Spedizione</span>
                  <span>{catalogLoading ? 'Calcolo…' : !catalogReady ? '—' : shipping > 0 ? formatPriceCents(shipping) : 'Gratuita'}</span>
                </div>
                {catalogReady && shipping > 0 && freeShippingThreshold > 0 && (
                  <p className="text-xs leading-5 text-[#86868b]">Gratuita da {formatPriceCents(freeShippingThreshold)}.</p>
                )}
              </div>
              <div className="mt-5 border-t border-[#d2d2d7] pt-5">
                <label htmlFor="discount" className="mb-2 block text-xs font-semibold text-[#6e6e73]">Codice promozionale</label>
                <input id="discount" value={discountCode} onChange={event => setDiscountCode(event.target.value.toUpperCase())} maxLength={64} placeholder="CODICE" className="min-h-11 w-full rounded-xl border border-[#d2d2d7] px-3 text-sm uppercase outline-none transition focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]" />
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-[#d2d2d7] pt-5">
                <span className="font-semibold">Totale stimato</span>
                <span className="text-2xl font-semibold tracking-tight">{catalogReady ? formatPriceCents(estimatedTotal) : '—'}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#6e6e73]">Sconto, disponibilità e totale definitivo vengono verificati sul server prima del pagamento.</p>
              {error && <div role="alert" className="mt-4 rounded-xl bg-[#fff2f2] p-3 text-xs leading-5 text-[#b42318]">{error}</div>}
              <button disabled={checkingOut || !catalogReady || hasUnavailableLines} onClick={checkout} className="mt-6 min-h-12 w-full rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-45">
                {checkingOut
                  ? <span className="inline-flex items-center gap-2"><Loader2 size={17} className="animate-spin" /> Apertura checkout</span>
                  : catalogLoading ? 'Verifica del carrello…' : 'Vai al pagamento'}
              </button>
              <p className="mt-4 text-center text-xs text-[#86868b]">Pagamento gestito in sicurezza da Stripe</p>
            </aside>
          </div>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
