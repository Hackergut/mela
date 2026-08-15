import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Save, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { CATALOG_QUERY_KEY } from '@/lib/useProducts';
import { formatPriceCents } from '@/lib/catalog';

export default function InventoryManager({ password }) {
  const queryClient = useQueryClient();
  const [catalog, setCatalog] = useState({ products: [], variants: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await base44.functions.invoke('admin-cms', { password, operation: 'list_catalog', resource: 'product' });
      setCatalog({ products: response.data.products || [], variants: response.data.variants || [] });
    } catch (loadError) { setError(loadError.response?.data?.error || loadError.message); }
    finally { setLoading(false); }
  }, [password]);
  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    const productsById = new Map(catalog.products.map(product => [String(product.id), product]));
    const variantRows = catalog.variants.map(variant => ({ ...variant, product: productsById.get(String(variant.product_id)), legacy: false }));
    const productsWithVariants = new Set(catalog.variants.map(variant => String(variant.product_id)));
    const legacyRows = catalog.products.filter(product => !productsWithVariants.has(String(product.id))).map(product => ({
      id: product.id, product_id: product.id, title: 'Standard legacy', sku: product.sku || '', price_cents: product.price_cents,
      cost_cents: product.cost_cents, stock: product.stock, low_stock_threshold: product.low_stock_threshold, image: product.image,
      status: product.status === 'active' || !product.status ? 'active' : 'archived', product, legacy: true,
    }));
    return [...variantRows, ...legacyRows];
  }, [catalog]);

  const filtered = rows.filter(row => {
    const query = search.trim().toLowerCase();
    return !query || row.product?.name?.toLowerCase().includes(query) || row.sku?.toLowerCase().includes(query) || row.title?.toLowerCase().includes(query);
  });
  const activeRows = rows.filter(row => row.status === 'active');
  const totalUnits = activeRows.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);
  const totalCost = activeRows.reduce((sum, row) => sum + (Number(row.stock) || 0) * (Number(row.cost_cents) || 0), 0);
  const lowCount = activeRows.filter(row => (Number(row.stock) || 0) <= (row.low_stock_threshold ?? 5)).length;

  const save = async (row, field, value) => {
    const key = `${row.id}:${field}`;
    setSaving(key); setError('');
    try {
      await base44.functions.invoke('admin-cms', {
        password,
        operation: 'update',
        resource: row.legacy ? 'product' : 'product_variant',
        payload: { id: row.id, [field]: Math.max(0, Number(value) || 0) },
      });
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      await load();
    } catch (saveError) { setError(saveError.response?.data?.error || saveError.message); }
    finally { setSaving(''); }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-semibold tracking-tight">Inventario varianti</h2><p className="mt-1 text-sm text-[#6e6e73]">Le disponibilità vengono aggiornate in Base44 e aggregate sul prodotto.</p></div>
        <div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Prodotto, variante o SKU" className="min-h-11 w-full rounded-full border border-[#d2d2d7] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0071e3]" /></div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Varianti" value={rows.length} />
        <Metric label="Unità disponibili" value={totalUnits} />
        <Metric label="Valore a costo" value={formatPriceCents(totalCost)} />
        <Metric label="Stock basso" value={lowCount} alert={lowCount > 0} />
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071e3]" size={28} /></div> : (
        <div className="overflow-x-auto rounded-3xl bg-white">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-[#e5e5e5] text-left text-[11px] font-semibold uppercase tracking-wide text-[#6e6e73]"><th className="p-4">Prodotto / Variante</th><th className="p-4">SKU</th><th className="p-4">Prezzo</th><th className="p-4">Costo</th><th className="p-4">Stock</th><th className="p-4">Soglia</th><th className="p-4">Stato</th></tr></thead>
            <tbody>
              {filtered.map(row => {
                const low = row.status === 'active' && (Number(row.stock) || 0) <= (row.low_stock_threshold ?? 5);
                return (
                  <tr key={`${row.legacy ? 'p' : 'v'}:${row.id}`} className="border-b border-[#eeeeee] last:border-0">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f5f5f7] p-1"><Image src={row.image || row.product?.image} alt="" className="h-full w-full" fittingType="fit" /></div><div><p className="text-sm font-semibold">{row.product?.name || 'Prodotto'}</p><p className="text-xs text-[#6e6e73]">{row.title || 'Standard'}{row.legacy ? ' · da migrare' : ''}</p></div></div></td>
                    <td className="p-4 font-mono text-xs text-[#6e6e73]">{row.sku || '—'}</td>
                    <td className="p-4 text-sm font-semibold">{formatPriceCents(row.price_cents)}</td>
                    <td className="p-4"><EditableNumber value={(Number(row.cost_cents) || 0) / 100} step="0.01" suffix="€" saving={saving === `${row.id}:cost_cents`} onSave={value => save(row, 'cost_cents', Math.round(value * 100))} /></td>
                    <td className="p-4"><div className="flex items-center gap-2"><EditableNumber value={Number(row.stock) || 0} saving={saving === `${row.id}:stock`} onSave={value => save(row, 'stock', value)} />{low && <AlertTriangle size={16} className="text-red-500" />}</div></td>
                    <td className="p-4"><EditableNumber value={row.low_stock_threshold ?? 5} saving={saving === `${row.id}:low_stock_threshold`} onSave={value => save(row, 'low_stock_threshold', value)} /></td>
                    <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${row.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{row.status === 'active' ? 'Attiva' : row.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length && <p className="py-16 text-center text-sm text-[#6e6e73]">Nessuna variante trovata.</p>}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, alert = false }) {
  return <div className="rounded-2xl bg-white p-4"><p className="text-xs text-[#6e6e73]">{label}</p><p className={`mt-1 text-xl font-semibold ${alert ? 'text-red-600' : 'text-[#1d1d1f]'}`}>{value}</p></div>;
}

function EditableNumber({ value, onSave, saving, step = '1', suffix = '' }) {
  const [draft, setDraft] = useState(String(value));
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setDraft(String(value)); setDirty(false); }, [value]);
  return <div className="flex items-center gap-1"><div className="relative"><input type="number" min="0" step={step} value={draft} onChange={event => { setDraft(event.target.value); setDirty(true); }} className={`h-9 w-20 rounded-lg border px-2 text-sm outline-none ${dirty ? 'border-[#0071e3]' : 'border-[#d2d2d7]'}`} />{suffix && <span className="absolute right-2 top-2 text-xs text-[#86868b]">{suffix}</span>}</div>{dirty && <button onClick={() => onSave(Number(draft))} disabled={saving} className="grid h-8 w-8 place-items-center rounded-full bg-[#0071e3] text-white disabled:opacity-50" aria-label="Salva">{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}</button>}</div>;
}
