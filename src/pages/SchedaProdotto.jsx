import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Heart, Loader2, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import ProductCard from '@/components/ProductCard';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useCatalog } from '@/lib/useProducts';
import { formatPriceCents, variantOptionGroups } from '@/lib/catalog';
import { relatedProducts } from '@/lib/orders';
import { useStore } from '@/lib/StoreContext';

const optionLabel = (variant) => Object.values(variant?.option_values || {}).filter(Boolean).join(' · ');

export default function SchedaProdotto() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const payment = params.get('payment');
  const { products, loading } = useCatalog();
  const { addToCart, toggleWishlist, isInWishlist, recordProductView, recentlyViewedIds } = useStore();
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [buying, setBuying] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [added, setAdded] = useState(false);

  const product = products.find(item => String(item.id) === String(id));
  const activeVariants = useMemo(
    () => (product?.variants || []).filter(variant => variant.status === 'active'),
    [product],
  );
  const selectedVariant = activeVariants.find(variant => String(variant.id) === selectedVariantId)
    || product?.default_variant
    || activeVariants[0];
  const groups = useMemo(() => variantOptionGroups(activeVariants), [activeVariants]);

  useEffect(() => {
    if (!product) return;
    const initial = product.default_variant || activeVariants[0];
    setSelectedVariantId(String(initial?.id || ''));
    setSelectedImage(initial?.image || product.image || '');
    recordProductView(product);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedVariant) setSelectedImage(selectedVariant.image || product?.image || '');
  }, [selectedVariant?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectOption = (optionName, value) => {
    const current = selectedVariant?.option_values || {};
    const exact = activeVariants.find(variant =>
      Object.entries({ ...current, [optionName]: value }).every(([key, option]) => variant.option_values?.[key] === option),
    );
    const fallback = activeVariants.find(variant => variant.option_values?.[optionName] === value);
    const next = exact || fallback;
    if (next) setSelectedVariantId(String(next.id));
  };

  const optionAvailable = (optionName, value) => activeVariants.some((variant) => {
    if (variant.option_values?.[optionName] !== value || variant.stock <= 0) return false;
    return Object.entries(selectedVariant?.option_values || {}).every(([key, selected]) =>
      key === optionName || !variant.option_values?.[key] || variant.option_values[key] === selected,
    );
  });

  const handleAdd = () => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;
    addToCart(product, selectedVariant);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuy = async () => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;
    setBuying(true);
    setCheckoutError('');
    try {
      const response = await base44.functions.invoke('create-checkout-session', {
        productId: product.id,
        variantId: selectedVariant.legacy ? '' : selectedVariant.id,
        quantity: 1,
      });
      if (!response.data?.url) throw new Error(response.data?.error || 'Sessione di pagamento non disponibile.');
      window.location.href = response.data.url;
    } catch (error) {
      setCheckoutError(error?.response?.data?.error || error.message || 'Impossibile avviare il checkout.');
      setBuying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-[#f5f5f7]"><Loader2 className="animate-spin text-[#0071e3]" size={32} /></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">Prodotto non trovato.</h1>
          <p className="mt-3 text-[#6e6e73]">Potrebbe essere stato ritirato o non essere più disponibile.</p>
          <Link to="/catalogo" className="mt-8 inline-flex rounded-full bg-[#0071e3] px-6 py-3 text-sm font-medium text-white">Torna al catalogo</Link>
        </div>
      </div>
    );
  }

  const gallery = [...new Set([
    selectedVariant?.image,
    ...(selectedVariant?.images || []),
    product.image,
    ...(product.images || []),
  ].filter(Boolean))];
  const inWishlist = isInWishlist(product.id);
  const stock = Number(selectedVariant?.stock || 0);
  const price = formatPriceCents(selectedVariant?.price_cents ?? product.price_cents);
  const related = relatedProducts(products, product, { limit: 4 });
  const recent = recentlyViewedIds
    .map(recentId => products.find(item => String(item.id) === String(recentId)))
    .filter(item => item && String(item.id) !== String(product.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <PromoBanner />
      <Navbar />

      <AnimatePresence>
        {payment && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={payment === 'success' ? 'bg-[#eaf7ed]' : 'bg-[#fff4e5]'}>
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3 text-sm font-medium">
              {payment === 'success' ? <Check size={18} className="text-[#248a3d]" /> : <X size={18} className="text-[#b45309]" />}
              {payment === 'success' ? 'Pagamento completato. Il tuo ordine è stato registrato.' : 'Pagamento annullato. Il carrello non è stato modificato.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 lg:px-10">
          <nav aria-label="Percorso di navigazione" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-[#6e6e73]">
            <Link to="/" className="rounded px-1 py-0.5 hover:text-[#1d1d1f]">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/catalogo" className="rounded px-1 py-0.5 hover:text-[#1d1d1f]">Catalogo</Link>
            {product.category && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/catalogo?categoria=${encodeURIComponent(product.category)}`} className="rounded px-1 py-0.5 hover:text-[#1d1d1f]">{product.category}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="px-1 py-0.5 font-medium text-[#1d1d1f]">{product.name}</span>
          </nav>

          <Link to="/catalogo" className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]">
            <ArrowLeft size={16} /> Catalogo
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)] lg:gap-16">
            <section aria-label="Galleria prodotto" className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative aspect-square overflow-hidden rounded-[32px] bg-[#f5f5f7]">
                <AnimatePresence mode="wait">
                  <motion.div key={selectedImage} initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .22 }} className="absolute inset-0 p-5 sm:p-10">
                    <Image src={selectedImage || product.image} alt={`${product.name}${optionLabel(selectedVariant) ? `, ${optionLabel(selectedVariant)}` : ''}`} className="h-full w-full" fittingType="fit" quality={90} />
                  </motion.div>
                </AnimatePresence>
                {product.badge && <span className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] shadow-sm backdrop-blur-xl">{product.badge}</span>}
              </div>
              {gallery.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {gallery.map(image => (
                    <button key={image} onClick={() => setSelectedImage(image)} aria-label="Mostra immagine" className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f5f5f7] p-1 transition ${selectedImage === image ? 'ring-2 ring-[#0071e3] ring-offset-2' : 'hover:bg-[#e8e8ed]'}`}>
                      <Image src={image} alt="" className="h-full w-full" fittingType="fit" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="py-1 lg:py-8">
              <p className="text-sm font-semibold text-[#bf4800]">{product.subtitle || (stock > 0 ? 'Disponibile ora' : 'Momentaneamente esaurito')}</p>
              <h1 className="mt-2 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">{product.name}</h1>
              <p className="mt-4 text-2xl font-semibold tracking-tight">{price}</p>
              {product.price_min_cents !== product.price_max_cents && <p className="mt-1 text-sm text-[#6e6e73]">Il prezzo cambia in base alla configurazione.</p>}
              <p className="mt-6 text-base leading-7 text-[#6e6e73]">{product.description}</p>

              <div className="mt-9 space-y-8">
                {Object.entries(groups).map(([name, values]) => (
                  <fieldset key={name}>
                    <legend className="mb-3 text-sm font-semibold">{name}: <span className="font-normal text-[#6e6e73]">{selectedVariant?.option_values?.[name]}</span></legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {values.map((value) => {
                        const active = selectedVariant?.option_values?.[name] === value;
                        const available = optionAvailable(name, value);
                        const colorVariant = activeVariants.find(variant => variant.option_values?.[name] === value);
                        const isColor = /colore|finitura/i.test(name);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectOption(name, value)}
                            disabled={!available}
                            className={`min-h-14 rounded-2xl border px-3 py-3 text-sm font-medium transition ${active ? 'border-[#0071e3] ring-1 ring-[#0071e3]' : 'border-[#d2d2d7] hover:border-[#86868b]'} disabled:cursor-not-allowed disabled:opacity-35`}
                          >
                            <span className="flex items-center justify-center gap-2">
                              {isColor && <span className="h-4 w-4 rounded-full border border-black/10 shadow-inner" style={{ background: colorVariant?.color_hex || '#8e8e93' }} />}
                              {value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[#f5f5f7] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{optionLabel(selectedVariant) || 'Configurazione standard'}</p>
                    <p className={`mt-1 text-xs ${stock > 0 ? 'text-[#248a3d]' : 'text-[#d70015]'}`}>{stock > 0 ? `${stock} disponibili · SKU ${selectedVariant?.sku}` : 'Non disponibile'}</p>
                  </div>
                  <p className="text-base font-semibold">{price}</p>
                </div>
              </div>

              {checkoutError && <div role="alert" className="mt-4 rounded-2xl bg-[#fff2f2] px-4 py-3 text-sm text-[#b42318]">{checkoutError}</div>}
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button disabled={stock <= 0 || buying} onClick={handleBuy} className="min-h-12 rounded-full bg-[#0071e3] px-8 text-sm font-semibold text-white transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-45">
                  {buying ? <span className="inline-flex items-center gap-2"><Loader2 size={17} className="animate-spin" /> Apertura checkout</span> : 'Acquista ora'}
                </button>
                <button disabled={stock <= 0} onClick={handleAdd} className="min-h-12 rounded-full bg-[#e8f2ff] px-6 text-sm font-semibold text-[#0066cc] transition hover:bg-[#dbeaff] disabled:opacity-45">
                  <span className="inline-flex items-center gap-2"><ShoppingBag size={17} /> {added ? 'Aggiunto' : 'Aggiungi'}</span>
                </button>
              </div>
              <button onClick={() => toggleWishlist(product)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[#0066cc] hover:bg-[#f5f5f7]">
                <Heart size={17} fill={inWishlist ? 'currentColor' : 'none'} /> {inWishlist ? 'Nei preferiti' : 'Aggiungi ai preferiti'}
              </button>

              <div className="mt-8 border-y border-[#d2d2d7]">
                <InfoRow icon={ShieldCheck} title="Pagamento sicuro" text="Prezzo e disponibilità sono verificati sul server prima del checkout Stripe." />
              </div>

              {Object.keys(product.specs || {}).length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-semibold tracking-tight">Specifiche</h2>
                  <dl className="mt-4 divide-y divide-[#d2d2d7]">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4 py-3 text-sm"><dt className="text-[#6e6e73]">{key}</dt><dd className="font-medium">{value}</dd></div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-products" className="mt-16 border-t border-[#d2d2d7] pt-10">
              <h2 id="related-products" className="text-2xl font-semibold tracking-tight sm:text-3xl">Potrebbero interessarti.</h2>
              <p className="mt-2 text-sm text-[#6e6e73]">Altri prodotti{product.category ? ` di ${product.category}` : ''} selezionati per te.</p>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {related.map(item => <ProductCard key={item.id} product={item} />)}
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section aria-labelledby="recent-products" className="mt-14 border-t border-[#d2d2d7] pt-10">
              <h2 id="recent-products" className="text-2xl font-semibold tracking-tight sm:text-3xl">Visti di recente.</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {recent.map(item => <ProductCard key={item.id} product={item} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

function InfoRow({ icon: Icon, title, text }) {
  return <div className="flex gap-3 py-4"><Icon size={20} className="mt-0.5 shrink-0 text-[#1d1d1f]" /><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-[#6e6e73]">{text}</p></div></div>;
}
