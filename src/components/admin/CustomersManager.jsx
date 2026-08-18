import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, X, Mail, Phone, StickyNote, Pencil } from 'lucide-react';
import { useBulkSelect, BulkActionBar, SelectAllCheckbox, RowCheckbox } from '@/lib/bulkSelect';

const fmt = (c) => '€' + ((c || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CustomersManager({ password }) {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, o] = await Promise.all([
        base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'customer' }),
        base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' }),
      ]);
      setCustomers(c.data.items || []);
      setOrders(o.data.items || []);
    } finally { setLoading(false); }
  }, [password]);
  useEffect(() => { load(); }, [load]);

  const saveEdit = async (e) => {
    e.preventDefault();
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'customer', payload: editing });
    setEditing(null); await load();
  };

  const filtered = customers.filter(c => !search || `${c.name} ${c.email} ${c.phone || ''}`.toLowerCase().includes(search.toLowerCase()));

  const bulk = useBulkSelect(filtered);
  const bulkDelete = async () => {
    if (bulk.selectedIds.length === 0 || !confirm(`Eliminare ${bulk.selectedIds.length} clienti selezionati?`)) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'customer', payload: { ids: bulk.selectedIds } });
    bulk.clear(); await load();
  };

  const openDetail = (c) => {
    const cOrders = orders.filter(o => o.customer_email === c.email);
    setDetail({ customer: c, orders: cOrders });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca cliente…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
        </div>
        <p className="text-sm text-[#6e6e73]">{customers.length} clienti</p>
      </div>

      <div className="mb-3"><BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} /></div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div> :
        filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-20">Nessun cliente.</p> : (
          <div className="bg-white rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                  <th className="p-3 w-10"><SelectAllCheckbox checked={bulk.allSelected} indeterminate={bulk.someSelected} onChange={bulk.toggleAll} /></th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Telefono</th>
                  <th className="p-3">Ordini</th>
                  <th className="p-3">Totale speso</th>
                  <th className="p-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${bulk.selected[c.id] ? 'bg-[#0071E3]/5' : ''}`} onClick={() => openDetail(c)}>
                    <td className="p-3"><RowCheckbox checked={!!bulk.selected[c.id]} onChange={() => bulk.toggleOne(c.id)} /></td>
                    <td className="p-3 text-sm font-semibold text-[#1d1d1f]">{c.name || '—'}</td>
                    <td className="p-3 text-sm text-[#6e6e73]">{c.email}</td>
                    <td className="p-3 text-sm text-[#6e6e73]">{c.phone || '—'}</td>
                    <td className="p-3 text-sm text-[#1d1d1f]">{c.orders_count || 0}</td>
                    <td className="p-3 text-sm font-bold text-[#1d1d1f]">{fmt(c.total_spent)}</td>
                    <td className="p-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setEditing(c); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 inline-flex items-center justify-center"><Pencil size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 my-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-[#1d1d1f]">{detail.customer.name || detail.customer.email}</h2>
              <button onClick={() => setDetail(null)}><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm mb-5">
              <p className="flex items-center gap-2 text-[#6e6e73]"><Mail size={14} /> {detail.customer.email}</p>
              {detail.customer.phone && <p className="flex items-center gap-2 text-[#6e6e73]"><Phone size={14} /> {detail.customer.phone}</p>}
              {detail.customer.notes && <p className="flex items-start gap-2 text-[#6e6e73]"><StickyNote size={14} className="mt-0.5" /> {detail.customer.notes}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#f5f5f7] rounded-xl p-4">
                <p className="text-xs text-[#6e6e73]">Ordini totali</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">{detail.customer.orders_count || 0}</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-xl p-4">
                <p className="text-xs text-[#6e6e73]">Totale speso</p>
                <p className="text-2xl font-bold text-[#0071E3]">{fmt(detail.customer.total_spent)}</p>
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#1d1d1f] mb-2">Storico ordini</h3>
            {detail.orders.length === 0 ? <p className="text-sm text-[#6e6e73]">Nessun ordine.</p> : (
              <div className="space-y-1">
                {detail.orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{o.order_number}</p>
                      <p className="text-xs text-[#6e6e73]">{new Date(o.created_date).toLocaleDateString('it-IT')}</p>
                    </div>
                    <span className="font-bold text-[#1d1d1f]">{fmt(o.total_cents)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={saveEdit} className="bg-white rounded-3xl w-full max-w-md p-6 my-8 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[#1d1d1f]">Modifica Cliente</h2>
              <button type="button" onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <label className="block"><span className="text-xs font-medium text-[#6e6e73] mb-1 block">Nome</span><input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0071E3] focus:outline-none" /></label>
            <label className="block"><span className="text-xs font-medium text-[#6e6e73] mb-1 block">Email</span><input value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0071E3] focus:outline-none" /></label>
            <label className="block"><span className="text-xs font-medium text-[#6e6e73] mb-1 block">Telefono</span><input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0071E3] focus:outline-none" /></label>
            <label className="block"><span className="text-xs font-medium text-[#6e6e73] mb-1 block">Note</span><textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0071E3] focus:outline-none" /></label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-[#0071E3] text-white text-sm font-semibold rounded-xl">Salva</button>
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-3 bg-gray-100 text-sm font-semibold rounded-xl">Annulla</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}