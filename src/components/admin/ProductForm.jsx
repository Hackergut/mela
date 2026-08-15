import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, ImageIcon, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { parsePriceCents, slugifyCatalogValue } from '@/lib/catalog';
import ImagePicker from './ImagePicker';

const FIELD = 'min-h-11 w-full rounded-xl border border-[#d2d2d7] bg-white px-3 text-sm text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]';
const LABEL = 'mb-1.5 block text-xs font-semibold text-[#6e6e73]';

const makeVariant = (product = {}, index = 0) => ({
  _key: crypto.randomUUID(),
  title: index ? `Variante ${index + 1}` : 'Standard',
  sku: product.sku || `TM-${slugifyCatalogValue(product.name || 'PRODOTTO').toUpperCase().slice(0, 18)}-${index + 1}`,
  option_values: {},
  color_hex: '#8E8E93',
  price_cents: Number.isSafeInteger(product.price_cents) ? product.price_cents : parsePriceCents(product.price),
  compare_at_cents: 0,
  cost_cents: Number(product.cost_cents) || 0,
  stock: Number(product.stock) || 0,
  low_stock_threshold: Number(product.low_stock_threshold) || 5,
  image: product.image || '',
  images: [],
  status: 'active',
  is_default: index === 0,
  sort_order: index,
});

const specsToText = (specs) => Object.entries(specs || {}).map(([key, value]) => `${key}: ${value}`).join('\n');
const textToSpecs = (text) => Object.fromEntries(
  String(text || '').split('\n').map(line => line.split(':')).filter(parts => parts.length > 1)
    .map(([key, ...rest]) => [key.trim(), rest.join(':').trim()]).filter(([key, value]) => key && value),
);

export default function ProductForm({ product, variants: initialVariants = [], categories, password, onSave, onCancel, saving = false }) {
  const initialCategoryId = product?.category_id
    || categories.find(category => category.name?.trim().toLowerCase() === product?.category?.trim().toLowerCase())?.id
    || '';
  const [data, setData] = useState(() => ({
    name: '', slug: '', subtitle: '', brand: 'Apple', family: '', badge: '', category: '',
    image: '', images: [], description: '', specs: {}, featured: false, compare_group: '', status: 'active',
    sort_order: 0, source: 'base44', ...product, category_id: initialCategoryId,
  }));
  const [variants, setVariants] = useState(() => (
    initialVariants.length ? initialVariants.map((variant, index) => ({ ...variant, _key: variant.id || crypto.randomUUID(), sort_order: index })) : [makeVariant(product)]
  ));
  const [specText, setSpecText] = useState(() => specsToText(product?.specs));
  const [pickerTarget, setPickerTarget] = useState(null);
  const [activeSection, setActiveSection] = useState('product');
  const [error, setError] = useState('');

  const activeCount = variants.filter(variant => variant.status === 'active').length;
  const totalStock = variants.filter(variant => variant.status === 'active').reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
  const priceRange = useMemo(() => {
    const prices = variants.filter(variant => variant.status === 'active').map(variant => Number(variant.price_cents) || 0).filter(Boolean);
    if (!prices.length) return 'Nessun prezzo';
    const format = cents => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100);
    const min = Math.min(...prices); const max = Math.max(...prices);
    return min === max ? format(min) : `${format(min)} – ${format(max)}`;
  }, [variants]);

  const updateVariant = (key, patch) => setVariants(list => list.map(variant => variant._key === key ? { ...variant, ...patch } : variant));
  const updateOption = (key, option, value) => setVariants(list => list.map(variant => {
    if (variant._key !== key) return variant;
    const optionValues = { ...(variant.option_values || {}), [option]: value };
    if (!value) delete optionValues[option];
    const title = Object.values(optionValues).filter(Boolean).join(' · ') || variant.title || 'Standard';
    return { ...variant, option_values: optionValues, title };
  }));
  const addVariant = () => {
    const source = variants[variants.length - 1] || makeVariant(data);
    setVariants(list => [...list, {
      ...source, id: undefined, _key: crypto.randomUUID(), sku: '', is_default: false,
      title: `Variante ${list.length + 1}`, sort_order: list.length, stock: 0,
    }]);
    setActiveSection('variants');
  };
  const duplicateVariant = (variant) => setVariants(list => [...list, {
    ...variant, id: undefined, _key: crypto.randomUUID(), sku: `${variant.sku}-COPY`, is_default: false,
    title: `${variant.title} copia`, sort_order: list.length,
  }]);
  const removeVariant = (key) => {
    if (variants.length === 1) return setError('Ogni prodotto deve avere almeno una variante.');
    const target = variants.find(variant => variant._key === key);
    const next = variants.filter(variant => variant._key !== key);
    if (target?.is_default && next[0]) next[0] = { ...next[0], is_default: true };
    setVariants(next);
  };
  const setDefault = (key) => setVariants(list => list.map(variant => ({ ...variant, is_default: variant._key === key })));

  const submit = (event) => {
    event.preventDefault();
    setError('');
    if (!data.name.trim() || !data.category.trim() || !data.category_id || !data.image) return setError('Nome, categoria e immagine principale sono obbligatori.');
    if (!variants.length) return setError('Aggiungi almeno una variante.');
    if (variants.some(variant => !variant.sku.trim() || Number(variant.price_cents) < 50)) return setError('Ogni variante richiede uno SKU e un prezzo di almeno 0,50 €.');
    const skus = variants.map(variant => variant.sku.trim().toUpperCase());
    if (new Set(skus).size !== skus.length) return setError('Gli SKU devono essere univoci.');
    onSave({
      product: { ...data, slug: data.slug || slugifyCatalogValue(data.name), specs: textToSpecs(specText) },
      variants: variants.map(({ _key, ...variant }, index) => ({ ...variant, sort_order: index })),
    });
  };

  const chooseImage = (url) => {
    if (pickerTarget === 'product') setData(current => ({ ...current, image: url }));
    else updateVariant(pickerTarget, { image: url });
    setPickerTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 p-3 backdrop-blur-sm sm:p-6">
      <form onSubmit={submit} className="mx-auto my-2 min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[28px] bg-[#f5f5f7] shadow-2xl sm:my-4 sm:min-h-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-white/90 px-5 py-4 backdrop-blur-2xl sm:px-7">
          <div>
            <p className="text-xs font-semibold text-[#0066cc]">Catalogo Base44</p>
            <h2 className="text-xl font-semibold tracking-tight">{product?.id ? 'Modifica prodotto' : 'Nuovo prodotto'}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onCancel} className="hidden min-h-10 rounded-full px-4 text-sm font-medium hover:bg-[#f5f5f7] sm:block">Annulla</button>
            <button disabled={saving} type="submit" className="min-h-10 rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white hover:bg-[#0077ed] disabled:opacity-50">
              {saving ? <span className="inline-flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Salvataggio</span> : <span className="inline-flex items-center gap-2"><Check size={15} /> Salva</span>}
            </button>
            <button type="button" onClick={onCancel} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[#f5f5f7] sm:hidden" aria-label="Chiudi"><X size={19} /></button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b border-black/10 bg-white px-4 py-3 lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Sezioni prodotto">
              {[
                ['product', 'Prodotto'], ['variants', `Varianti (${variants.length})`], ['content', 'Media e contenuti'],
              ].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setActiveSection(key)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-medium ${activeSection === key ? 'bg-[#e8f2ff] text-[#0066cc]' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'}`}>{label}</button>
              ))}
            </nav>
            <div className="mt-6 hidden rounded-2xl bg-[#f5f5f7] p-4 text-xs lg:block">
              <p className="font-semibold text-[#1d1d1f]">Riepilogo</p>
              <dl className="mt-3 space-y-2 text-[#6e6e73]">
                <div className="flex justify-between"><dt>Attive</dt><dd>{activeCount}</dd></div>
                <div className="flex justify-between"><dt>Stock</dt><dd>{totalStock}</dd></div>
                <div className="pt-2 text-[#1d1d1f]"><dt className="text-[#6e6e73]">Prezzi</dt><dd className="mt-1 font-semibold">{priceRange}</dd></div>
              </dl>
            </div>
          </aside>

          <div className="max-h-[calc(100vh-110px)] overflow-y-auto p-4 sm:p-7">
            {error && <div role="alert" className="mb-5 rounded-2xl bg-[#fff2f2] px-4 py-3 text-sm text-[#b42318]">{error}</div>}

            {activeSection === 'product' && (
              <section className="space-y-5">
                <SectionTitle title="Informazioni prodotto" text="Dati editoriali condivisi da tutte le varianti." />
                <div className="rounded-3xl bg-white p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome *" className="sm:col-span-2"><input required value={data.name} onChange={event => setData({ ...data, name: event.target.value })} className={FIELD} placeholder="iPhone 17 Pro" /></Field>
                    <Field label="Sottotitolo"><input value={data.subtitle || ''} onChange={event => setData({ ...data, subtitle: event.target.value })} className={FIELD} placeholder="Potenza. Senza compromessi." /></Field>
                    <Field label="Slug"><input value={data.slug || ''} onChange={event => setData({ ...data, slug: slugifyCatalogValue(event.target.value) })} className={FIELD} placeholder="generato automaticamente" /></Field>
                    <Field label="Brand"><input value={data.brand || ''} onChange={event => setData({ ...data, brand: event.target.value })} className={FIELD} /></Field>
                    <Field label="Famiglia"><input value={data.family || ''} onChange={event => setData({ ...data, family: event.target.value })} className={FIELD} placeholder="iPhone 17" /></Field>
                    <Field label="Categoria *"><div className="relative"><select required value={data.category_id || data.category} onChange={event => { const category = categories.find(item => String(item.id) === event.target.value); setData({ ...data, category: category?.name || event.target.value, category_id: category?.id || '' }); }} className={`${FIELD} appearance-none pr-9`}><option value="">Seleziona</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-[#86868b]" /></div></Field>
                    <Field label="Stato"><select value={data.status || 'active'} onChange={event => setData({ ...data, status: event.target.value })} className={FIELD}><option value="active">Pubblicato</option><option value="withdrawn">Ritirato</option><option value="discontinued">Fuori produzione</option></select></Field>
                    <Field label="Badge"><input value={data.badge || ''} onChange={event => setData({ ...data, badge: event.target.value })} className={FIELD} placeholder="Novità" /></Field>
                    <Field label="Ordine"><input type="number" value={data.sort_order || 0} onChange={event => setData({ ...data, sort_order: Number(event.target.value) })} className={FIELD} /></Field>
                    <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[#f5f5f7] px-3 text-sm"><input type="checkbox" checked={Boolean(data.featured)} onChange={event => setData({ ...data, featured: event.target.checked })} className="h-4 w-4 accent-[#0071e3]" /> Prodotto in evidenza</label>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'variants' && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4"><SectionTitle title="Varianti" text="Prezzo, stock, SKU, capacità, colore e immagine sono indipendenti." /><button type="button" onClick={addVariant} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#0071e3] px-4 text-sm font-semibold text-white"><Plus size={15} /> Variante</button></div>
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant._key} className="rounded-3xl bg-white p-5 sm:p-6">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <button type="button" onClick={() => setDefault(variant._key)} className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${variant.is_default ? 'border-[#0071e3] bg-[#0071e3] text-white' : 'border-[#d2d2d7]'}`} aria-label="Imposta predefinita">{variant.is_default && <Check size={13} />}</button>
                          <div className="min-w-0"><h3 className="truncate text-base font-semibold">{variant.title || `Variante ${index + 1}`}</h3><p className="text-xs text-[#6e6e73]">{variant.is_default ? 'Variante predefinita' : `Posizione ${index + 1}`}</p></div>
                        </div>
                        <div className="flex gap-1"><button type="button" onClick={() => duplicateVariant(variant)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f5f5f7]" aria-label="Duplica"><Copy size={15} /></button><button type="button" onClick={() => removeVariant(variant._key)} className="grid h-9 w-9 place-items-center rounded-full text-[#d70015] hover:bg-[#fff2f2]" aria-label="Elimina"><Trash2 size={15} /></button></div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field label="Finitura / colore"><input value={variant.option_values?.Finitura || ''} onChange={event => updateOption(variant._key, 'Finitura', event.target.value)} className={FIELD} placeholder="Titanio naturale" /></Field>
                        <Field label="Colore HEX"><div className="flex gap-2"><input type="color" value={variant.color_hex || '#8E8E93'} onChange={event => updateVariant(variant._key, { color_hex: event.target.value.toUpperCase() })} className="h-11 w-12 rounded-xl border border-[#d2d2d7] bg-white p-1" /><input value={variant.color_hex || ''} onChange={event => updateVariant(variant._key, { color_hex: event.target.value })} className={FIELD} placeholder="#8E8E93" /></div></Field>
                        <Field label="Capacità"><input value={variant.option_values?.Capacità || ''} onChange={event => updateOption(variant._key, 'Capacità', event.target.value)} className={FIELD} placeholder="256 GB" /></Field>
                        <Field label="SKU *"><input required value={variant.sku || ''} onChange={event => updateVariant(variant._key, { sku: event.target.value.toUpperCase() })} className={FIELD} placeholder="APL-IP17P-256-NAT" /></Field>
                        <Field label="Prezzo (€) *"><input required type="number" min="0.5" step="0.01" value={(Number(variant.price_cents) || 0) / 100} onChange={event => updateVariant(variant._key, { price_cents: Math.round(Number(event.target.value) * 100) })} className={FIELD} /></Field>
                        <Field label="Costo (€)"><input type="number" min="0" step="0.01" value={(Number(variant.cost_cents) || 0) / 100} onChange={event => updateVariant(variant._key, { cost_cents: Math.round(Number(event.target.value) * 100) })} className={FIELD} /></Field>
                        <Field label="Stock *"><input required type="number" min="0" value={variant.stock || 0} onChange={event => updateVariant(variant._key, { stock: Math.max(0, Number(event.target.value)) })} className={FIELD} /></Field>
                        <Field label="Soglia stock"><input type="number" min="0" value={variant.low_stock_threshold ?? 5} onChange={event => updateVariant(variant._key, { low_stock_threshold: Math.max(0, Number(event.target.value)) })} className={FIELD} /></Field>
                        <Field label="Stato"><select value={variant.status || 'active'} onChange={event => updateVariant(variant._key, { status: event.target.value })} className={FIELD}><option value="active">Attiva</option><option value="draft">Bozza</option><option value="archived">Archiviata</option></select></Field>
                      </div>
                      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f5f5f7] p-3">
                        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">{variant.image ? <Image src={variant.image} alt="" className="h-full w-full" fittingType="fit" /> : <ImageIcon className="text-[#86868b]" />}</div>
                        <div><p className="text-xs font-semibold">Immagine variante</p><button type="button" onClick={() => setPickerTarget(variant._key)} className="mt-1 text-sm text-[#0066cc] hover:underline">Scegli dalla libreria</button></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'content' && (
              <section className="space-y-5">
                <SectionTitle title="Media e contenuti" text="Immagine principale, descrizione e specifiche mostrate nel frontend." />
                <div className="rounded-3xl bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="grid aspect-square w-full max-w-56 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f5f5f7] p-3">{data.image ? <Image src={data.image} alt="" className="h-full w-full" fittingType="fit" /> : <ImageIcon size={32} className="text-[#86868b]" />}</div>
                    <div className="flex-1"><p className={LABEL}>Immagine principale *</p><button type="button" onClick={() => setPickerTarget('product')} className="min-h-11 rounded-full bg-[#e8f2ff] px-5 text-sm font-semibold text-[#0066cc]">Scegli dalla libreria</button><p className="mt-3 text-xs leading-5 text-[#6e6e73]">Usa un'immagine ad alta risoluzione, preferibilmente su sfondo neutro. Le varianti possono sovrascriverla.</p></div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <Field label="Descrizione"><textarea rows={6} value={data.description || ''} onChange={event => setData({ ...data, description: event.target.value })} className={`${FIELD} py-3`} placeholder="Racconta il prodotto…" /></Field>
                    <Field label="Specifiche (una per riga: Nome: Valore)"><textarea rows={7} value={specText} onChange={event => setSpecText(event.target.value)} className={`${FIELD} py-3 font-mono text-xs`} placeholder={'Display: 6,3 pollici\nChip: A19 Pro'} /></Field>
                    <Field label="Gruppo confronto"><input value={data.compare_group || ''} onChange={event => setData({ ...data, compare_group: event.target.value })} className={FIELD} placeholder="iPhone" /></Field>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </form>

      {pickerTarget && <ImagePicker password={password} onSelect={chooseImage} onClose={() => setPickerTarget(null)} />}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className={LABEL}>{label}</span>{children}</label>;
}

function SectionTitle({ title, text }) {
  return <div><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm leading-6 text-[#6e6e73]">{text}</p></div>;
}
