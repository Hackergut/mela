import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RotateCcw, Plus, Trash2, Loader2, X } from 'lucide-react';
import { useBulkSelect, BulkActionBar, RowCheckbox } from '@/lib/bulkSelect';

const REASONS = { defective: 'Difettoso', wrong_item: 'Articolo errato', not_as_described: 'Non conforme', changed_mind: 'Ripensamento', damaged: 'Arrivato danneggiato', other: 'Altro' };
const STATUSES = { requested: 'Richiesto', approved: 'Approvato', completed: 'Completato', rejected: 'Rifiutato' };
const STATUS_COLORS = { requested: 'bg-amber-100 text-amber-700', approved: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };

export default function ReturnsManager({ password }) {
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([
        base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'return' }),
        base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' }),
      ]);
      setReturns(r.data.items || []);
      setOrders(o.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'return', payload: { id, status } });
    setReturns(returns.map(r => r.id === id ? { ...r, status } : r));
    // If completed, restock the product
    if (status === 'completed') {
      const r = returns.find(x => x.id === id);
      if (r?.product_id) {
        try {
          const prod = await base44.entities.Product.get(r.product_id);
          if (prod && typeof prod.stock === 'number') {
            await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'product', payload: { id: r.product_id, stock: prod.stock + (r.quantity || 1) } });
          }
        } catch {}
      }
    }
  };

  const remove = async (id) => {
    if (!confirm('Eliminare questa richiesta di reso?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'return', payload: { id } });
    setReturns(returns.filter(r => r.id !== id));
  };

  const filtered = filter === 'all' ? returns : returns.filter(r => r.status === filter);

  const bulk = useBulkSelect(filtered);
  const bulkDelete = async () => {
    if (bulk.selectedIds.length === 0 || !confirm(`Eliminare ${bulk.selectedIds.length} resi selezionati?`)) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'return', payload: { ids: bulk.selectedIds } });
    bulk.clear(); await load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCcw size={18} className="text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Resi e Stornaggi</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="px-3 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl flex items-center gap-2"><Plus size={16} /> Nuovo reso</button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {[['all','Tutti'],['requested','Richiesti'],['approved','Approvati'],['completed','Completati'],['rejected','Rifiutati']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${filter===k?'bg-[#FF6B35] text-white':'bg-white border border-gray-200 text-[#6e6e73]'}`}>{l}</button>
        ))}
      </div>

      <div className="mb-3"><BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} /></div>

      {filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-16 text-sm">Nessun reso.</p> : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-xl p-4 ${bulk.selected[r.id] ? 'ring-2 ring-[#FF6B35]' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 flex items-start gap-3">
                  <div className="pt-0.5"><RowCheckbox checked={!!bulk.selected[r.id]} onChange={() => bulk.toggleOne(r.id)} /></div>
                  <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1d1d1f]">{r.return_number}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[r.status]}`}>{STATUSES[r.status]}</span>
                  </div>
                  <p className="text-sm text-[#1d1d1f] mt-1">{r.product_name || '—'}</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">
                    {r.customer_name || '—'} · Ordine {r.order_number || '—'} · {r.quantity || 1} pz
                    {r.refund_cents > 0 && ` · rimborso ${(r.refund_cents/100).toFixed(2)} €`}
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-0.5">Motivo: {REASONS[r.reason] || r.reason}</p>
                  {r.notes && <p className="text-xs text-[#6e6e73] mt-1 italic">{r.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {r.status === 'requested' && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'approved')} className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg">Approva</button>
                      <button onClick={() => updateStatus(r.id, 'rejected')} className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg">Rifiuta</button>
                    </>
                  )}
                  {r.status === 'approved' && (
                    <button onClick={() => updateStatus(r.id, 'completed')} className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg">Completa + rientro stock</button>
                  )}
                  <button onClick={() => remove(r.id)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ReturnForm password={password} orders={orders} onClose={() => setShowForm(false)} onCreated={(r) => { setReturns([r, ...returns]); setShowForm(false); }} />}
    </div>
  );
}

function ReturnForm({ password, orders, onClose, onCreated }) {
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('other');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedOrder = orders.find(o => o.id === orderId);

  const submit = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const firstItem = (selectedOrder.items || [])[0] || {};
      const res = await base44.functions.invoke('admin-cms', {
        password, operation: 'create', resource: 'return',
        payload: {
          order_number: selectedOrder.order_number,
          order_id: selectedOrder.id,
          product_name: firstItem.name || '—',
          customer_name: selectedOrder.customer_name || '',
          customer_email: selectedOrder.customer_email || '',
          reason,
          quantity: Number(quantity),
          refund_cents: (firstItem.price_cents || 0) * Number(quantity),
          status: 'requested',
          notes,
        },
      });
      onCreated(res.data.item);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1d1d1f]">Nuovo reso / storno</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73]">Ordine di origine</span>
            <select value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Seleziona ordine…</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} — {o.customer_name || '—'}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73]">Motivo</span>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {Object.entries(REASONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73]">Quantità</span>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73]">Note</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </label>
          {selectedOrder && (selectedOrder.items || [])[0] && (
            <p className="text-xs text-[#6e6e73] bg-[#f5f5f7] rounded-lg p-2">Rimborso stimato: {(((selectedOrder.items[0].price_cents || 0) * quantity) / 100).toFixed(2)} €</p>
          )}
          <button onClick={submit} disabled={!selectedOrder || saving} className="w-full px-4 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} Crea richiesta reso
          </button>
        </div>
      </div>
    </div>
  );
}