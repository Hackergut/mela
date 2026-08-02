import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Loader2, AlertTriangle, Save, Search, Trash2 } from 'lucide-react';
import { useBulkSelect, BulkActionBar, SelectAllCheckbox, RowCheckbox } from '@/lib/bulkSelect';

const fmt = (c) => '€' + ((c || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InventoryManager({ password }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'product' });
      setProducts(res.data.items || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (p, field, value) => {
    setSaving(p.id);
    const num = Number(value) || 0;
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'product', payload: { id: p.id, [field]: num } });
    setProducts(list => list.map(x => x.id === p.id ? { ...x, [field]: num } : x));
    setSaving(null);
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnits = products.reduce((s, p) => s + (p.stock || 0), 0);
  const totalCost = products.reduce((s, p) => s + (p.stock || 0) * (p.cost_cents || 0), 0);
  const lowCount = products.filter(p => (p.stock || 0) <= (p.low_stock_threshold ?? 5)).length;

  const bulk = useBulkSelect(filtered);
  const bulkDelete = async () => {
    if (bulk.selectedIds.length === 0 || !confirm(`Eliminare ${bulk.selectedIds.length} prodotti dall'inventario?`)) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'product', payload: { ids: bulk.selectedIds } });
    bulk.clear(); await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="bg-white rounded-2xl px-4 py-2">
          <p className="text-xs text-[#6e6e73]">Unità totali</p>
          <p className="text-lg font-bold text-[#1d1d1f]">{totalUnits}</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-2">
          <p className="text-xs text-[#6e6e73]">Valore stock (costo)</p>
          <p className="text-lg font-bold text-[#1d1d1f]">{fmt(totalCost)}</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-2">
          <p className="text-xs text-[#6e6e73]">Avvisi stock basso</p>
          <p className="text-lg font-bold text-red-600">{lowCount}</p>
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca prodotto…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]" />
        </div>
      </div>

      <div className="mb-3"><BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} /></div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div> : (
        <div className="bg-white rounded-2xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                <th className="p-3 w-10"><SelectAllCheckbox checked={bulk.allSelected} indeterminate={bulk.someSelected} onChange={bulk.toggleAll} /></th>
                <th className="p-3">Prodotto</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Prezzo</th>
                <th className="p-3">Costo</th>
                <th className="p-3">Margine</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Soglia</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const margin = (p.price_cents || 0) - (p.cost_cents || 0);
                const low = (p.stock || 0) <= (p.low_stock_threshold ?? 5);
                return (
                  <tr key={p.id} className={`border-b border-gray-50 ${bulk.selected[p.id] ? 'bg-[#FF6B35]/5' : ''}`}>
                    <td className="p-3"><RowCheckbox checked={!!bulk.selected[p.id]} onChange={() => bulk.toggleOne(p.id)} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f7] flex-shrink-0"><Image src={p.image} alt="" className="w-full h-full" fittingType="fill" /></div>
                        <span className="text-sm font-semibold text-[#1d1d1f]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[#6e6e73]">{p.category}</td>
                    <td className="p-3 text-sm text-[#1d1d1f]">{p.price}</td>
                    <td className="p-3">
                      <CostInput value={p.cost_cents || 0} onSave={v => save(p, 'cost_cents', v)} saving={saving === p.id} />
                    </td>
                    <td className="p-3 text-sm font-semibold text-green-600">{fmt(margin)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <StockInput value={p.stock || 0} onSave={v => save(p, 'stock', v)} saving={saving === p.id} />
                        {low && <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <StockInput value={p.low_stock_threshold ?? 5} onSave={v => save(p, 'low_stock_threshold', v)} saving={saving === p.id} small />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StockInput({ value, onSave, saving, small }) {
  const [v, setV] = useState(String(value));
  const [dirty, setDirty] = useState(false);
  useEffect(() => setV(String(value)), [value]);
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={v}
        onChange={e => { setV(e.target.value); setDirty(true); }}
        className={`w-16 px-2 py-1 border rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] ${dirty ? 'border-[#FF6B35]' : 'border-gray-200'} ${small ? 'text-xs' : ''}`}
      />
      {dirty && (
        <button onClick={() => { onSave(v); setDirty(false); }} disabled={saving} className="w-7 h-7 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center disabled:opacity-50">
          <Save size={12} />
        </button>
      )}
    </div>
  );
}

function CostInput({ value, onSave, saving }) {
  const [v, setV] = useState(value ? String(value / 100) : '');
  const [dirty, setDirty] = useState(false);
  useEffect(() => setV(value ? String(value / 100) : ''), [value]);
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={v}
        onChange={e => { setV(e.target.value); setDirty(true); }}
        className={`w-20 px-2 py-1 border rounded-lg text-sm focus:outline-none focus:border-[#FF6B35] ${dirty ? 'border-[#FF6B35]' : 'border-gray-200'}`}
        placeholder="0.00"
      />
      {dirty && (
        <button onClick={() => { onSave(Math.round(Number(v) * 100)); setDirty(false); }} disabled={saving} className="w-7 h-7 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center disabled:opacity-50">
          <Save size={12} />
        </button>
      )}
    </div>
  );
}