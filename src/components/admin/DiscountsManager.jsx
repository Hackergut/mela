import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Loader2, X, Tag, Power } from 'lucide-react';
import { useBulkSelect, BulkActionBar, RowCheckbox } from '@/lib/bulkSelect';

const INP = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0071E3] focus:outline-none";

export default function DiscountsManager({ password }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'discount' });
      setDiscounts(res.data.items || []);
    } finally { setLoading(false); }
  }, [password]);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const op = editing.id ? 'update' : 'create';
    const numericValue = Number(editing.value) || 0;
    const payload = {
      ...editing,
      value: editing.type === 'fixed' ? Math.round(numericValue * 100) : numericValue,
      max_uses: editing.max_uses ? Number(editing.max_uses) : null,
      usage_count: editing.usage_count || 0,
    };
    await base44.functions.invoke('admin-cms', { password, operation: op, resource: 'discount', payload });
    setEditing(null); await load();
  };

  const remove = async (id) => {
    if (!confirm('Eliminare questo codice sconto?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'discount', payload: { id } });
    await load();
  };

  const toggle = async (d) => {
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'discount', payload: { id: d.id, active: !d.active } });
    await load();
  };

  const bulk = useBulkSelect(discounts);
  const bulkDelete = async () => {
    if (bulk.selectedIds.length === 0 || !confirm(`Eliminare ${bulk.selectedIds.length} codici sconto selezionati?`)) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'discount', payload: { ids: bulk.selectedIds } });
    bulk.clear(); await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#6e6e73]">{discounts.length} codici sconto</p>
          <BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} />
        </div>
        <button onClick={() => setEditing({ code: '', type: 'percent', value: 10, active: true, max_uses: '', expires_at: '', description: '' })} className="px-4 py-2 bg-[#0071E3] text-white text-sm font-semibold rounded-lg flex items-center gap-2">
          <Plus size={16} /> Nuovo Codice
        </button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div> :
        discounts.length === 0 ? <p className="text-center text-[#6e6e73] py-20">Nessun codice sconto. Clicca "Nuovo Codice".</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discounts.map(d => (
              <div key={d.id} className={`bg-white rounded-2xl p-5 border border-gray-100 ${bulk.selected[d.id] ? 'ring-2 ring-[#0071E3]' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <RowCheckbox checked={!!bulk.selected[d.id]} onChange={() => bulk.toggleOne(d.id)} />
                      <Tag size={16} className={d.active ? 'text-[#0071E3]' : 'text-gray-400'} />
                      <span className="text-lg font-bold text-[#1d1d1f] tracking-wide">{d.code}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.active ? 'Attivo' : 'Inattivo'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggle(d)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Power size={14} /></button>
                    <button onClick={() => setEditing({ ...d, value: d.type === 'fixed' ? Number(d.value || 0) / 100 : d.value })} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Pencil size={14} /></button>
                    <button onClick={() => remove(d.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0071E3]">{d.type === 'percent' ? `−${d.value}%` : `−€${(d.value / 100).toFixed(2)}`}</p>
                {d.description && <p className="text-xs text-[#6e6e73] mt-1">{d.description}</p>}
                <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-[#6e6e73] space-y-0.5">
                  <p>Utilizzi: <span className="font-semibold text-[#1d1d1f]">{d.usage_count || 0}{d.max_uses ? ` / ${d.max_uses}` : ''}</span></p>
                  {d.expires_at && <p>Scadenza: {new Date(d.expires_at).toLocaleDateString('it-IT')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={save} className="bg-white rounded-3xl w-full max-w-md p-6 my-8 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[#1d1d1f]">{editing.id ? 'Modifica Codice' : 'Nuovo Codice Sconto'}</h2>
              <button type="button" onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Codice *</span>
              <input required value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="ES. ESTATE20" className={INP} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Tipo</span>
                <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value, value: '' })} className={INP}>
                  <option value="percent">Percentuale (%)</option>
                  <option value="fixed">Importo fisso (€)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#6e6e73] mb-1 block">{editing.type === 'percent' ? 'Valore (%)' : 'Importo (€)'}</span>
                <input
                  required
                  type="number"
                  min={editing.type === 'percent' ? 1 : 0.01}
                  max={editing.type === 'percent' ? 100 : undefined}
                  step={editing.type === 'percent' ? 1 : 0.01}
                  value={editing.value}
                  onChange={e => setEditing({ ...editing, value: e.target.value })}
                  className={INP}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Utilizzi massimi</span>
                <input type="number" value={editing.max_uses || ''} onChange={e => setEditing({ ...editing, max_uses: e.target.value })} placeholder="Vuoto = illimitati" className={INP} />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Scadenza</span>
                <input type="datetime-local" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ''} onChange={e => setEditing({ ...editing, expires_at: e.target.value })} className={INP} />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Descrizione</span>
              <input value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Sconto estivo" className={INP} />
            </label>
            <label className="flex items-center gap-2 pt-1">
              <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-[#1d1d1f]">Attivo</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-[#0071E3] text-white text-sm font-semibold rounded-xl">Salva Codice</button>
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-3 bg-gray-100 text-sm font-semibold rounded-xl">Annulla</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}