import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronDown, Loader2, MapPin, Package, RefreshCw, Search } from 'lucide-react';
import { useBulkSelect, BulkActionBar, SelectAllCheckbox, RowCheckbox } from '@/lib/bulkSelect';

const fmt = (c) => '€' + ((c || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
const LABELS = { pending: 'In attesa', paid: 'Pagato', shipped: 'Spedito', delivered: 'Consegnato', cancelled: 'Annullato', refunded: 'Rimborsato' };
const BADGE = { pending: 'bg-amber-100 text-amber-700', paid: 'bg-green-100 text-green-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700', refunded: 'bg-purple-100 text-purple-700' };

export default function OrdersManager({ password }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState('');
  const [reconciling, setReconciling] = useState('');
  const [reconcileMsg, setReconcileMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' });
      setOrders(res.data.items || []);
    } finally { setLoading(false); }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const reconcile = async (order) => {
    setReconciling(order.id);
    setReconcileMsg(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'reconcile_order', payload: { id: order.id } });
      const report = res.data?.report || {};
      const parts = [];
      if (report.customer_synced) parts.push('cliente allineato');
      if (report.discount_synced) parts.push('sconto allineato');
      if (report.ledger_cleared) parts.push(`${report.ledger_cleared} eventi riconciliati`);
      setReconcileMsg({
        ok: true,
        text: report.stock_check_required
          ? `Riconciliato (${parts.join(', ')}) — attenzione: era fallito il decremento stock, verifica manualmente l'inventario.`
          : `Riconciliato: ${parts.join(', ') || 'nessuna azione necessaria'}.`,
      });
    } catch (error) {
      setReconcileMsg({ ok: false, text: error?.response?.data?.error || error.message || 'Riconciliazione non riuscita' });
    } finally {
      setReconciling('');
    }
  };

  const updateStatus = async (id, status) => {
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'order', payload: { id, status } });
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  };

  const filtered = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (!search || `${o.order_number} ${o.customer_email} ${o.customer_name || ''} ${(o.items || []).map(item => `${item.name} ${item.sku}`).join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  );

  const bulk = useBulkSelect(filtered);
  const bulkDelete = async () => {
    if (bulk.selectedIds.length === 0 || !confirm(`Eliminare ${bulk.selectedIds.length} ordini selezionati?`)) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'order', payload: { ids: bulk.selectedIds } });
    bulk.clear(); await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca ordine, email…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none">
          <option value="all">Tutti gli stati</option>
          {STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} />
      </div>

      {reconcileMsg && (
        <p role="status" className={`mb-3 rounded-xl px-4 py-3 text-sm ${reconcileMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {reconcileMsg.text}
        </p>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div> :
        filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-20">Nessun ordine.</p> : (
          <div className="bg-white rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                  <th className="p-3 w-10"><SelectAllCheckbox checked={bulk.allSelected} indeterminate={bulk.someSelected} onChange={bulk.toggleAll} /></th>
                  <th className="p-3">Ordine</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Sconto</th>
                  <th className="p-3">Totale</th>
                  <th className="p-3">Stato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const expanded = expandedId === o.id;
                  const address = o.shipping_address || {};
                  const addressLine = [address.line1, address.line2, address.postal_code, address.city, address.state, address.country].filter(Boolean).join(', ');
                  return (
                    <React.Fragment key={o.id}>
                      <tr className={`border-b border-gray-50 ${bulk.selected[o.id] ? 'bg-[#0071E3]/5' : ''}`}>
                        <td className="p-3"><RowCheckbox checked={!!bulk.selected[o.id]} onChange={() => bulk.toggleOne(o.id)} /></td>
                        <td className="p-3 text-sm font-semibold text-[#1d1d1f]">
                          <button onClick={() => setExpandedId(expanded ? '' : o.id)} className="inline-flex items-center gap-1.5 text-left hover:text-[#0071E3]" aria-expanded={expanded}>
                            <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                            {o.order_number}
                          </button>
                        </td>
                        <td className="p-3 text-sm text-[#6e6e73]">
                          <p className="font-medium text-[#1d1d1f]">{o.customer_name || '—'}</p>
                          <p className="text-xs">{o.customer_email}</p>
                        </td>
                        <td className="p-3 text-sm text-[#6e6e73]">{new Date(o.created_date).toLocaleDateString('it-IT')}</td>
                        <td className="p-3 text-sm text-[#6e6e73]">{o.discount_code ? `${o.discount_code} (−${fmt(o.discount_amount_cents)})` : '—'}</td>
                        <td className="p-3 text-sm font-bold text-[#1d1d1f]">{fmt(o.total_cents)}</td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                            className={`cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-semibold ${BADGE[o.status] || ''}`}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="border-b border-gray-100 bg-[#f5f5f7]/70">
                          <td colSpan={7} className="p-5">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,.7fr)]">
                              <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]"><Package size={16} /> Articoli</h3>
                                <div className="mt-3 divide-y divide-gray-200 rounded-xl bg-white px-4">
                                  {(o.items || []).map((item, index) => {
                                    const options = Object.values(item.option_values || item.options || {}).filter(Boolean).join(' · ');
                                    return (
                                      <div key={`${item.variant_id || item.product_id || item.name}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
                                        <div>
                                          <p className="font-medium text-[#1d1d1f]">{item.name}</p>
                                          {options && <p className="mt-0.5 text-xs text-[#6e6e73]">{options}</p>}
                                          {item.sku && <p className="mt-0.5 text-xs text-[#86868b]">SKU {item.sku}</p>}
                                        </div>
                                        <p className="shrink-0 text-[#6e6e73]">{item.qty || 1} × {fmt(item.price_cents)}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]"><MapPin size={16} /> Consegna</h3>
                                  <div className="mt-3 rounded-xl bg-white p-4 text-sm leading-6 text-[#6e6e73]">
                                    <p className="font-medium text-[#1d1d1f]">{o.shipping_name || o.customer_name || '—'}</p>
                                    <p>{addressLine || 'Indirizzo non ancora disponibile'}</p>
                                    {o.shipping_phone && <p>{o.shipping_phone}</p>}
                                  </div>
                                </div>
                                <dl className="space-y-2 rounded-xl bg-white p-4 text-sm">
                                  <div className="flex justify-between"><dt className="text-[#6e6e73]">Subtotale</dt><dd>{fmt(o.subtotal_cents)}</dd></div>
                                  <div className="flex justify-between"><dt className="text-[#6e6e73]">Sconto</dt><dd>−{fmt(o.discount_amount_cents)}</dd></div>
                                  <div className="flex justify-between"><dt className="text-[#6e6e73]">Spedizione</dt><dd>{fmt(o.shipping_cents)}</dd></div>
                                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><dt>Totale</dt><dd>{fmt(o.total_cents)}</dd></div>
                                </dl>
                                {['paid', 'shipped', 'delivered'].includes(o.status) && (
                                  <div className="rounded-xl bg-white p-4">
                                    <button
                                      onClick={() => reconcile(o)}
                                      disabled={reconciling === o.id}
                                      className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-semibold text-[#1d1d1f] transition hover:bg-[#e8e8ed] disabled:opacity-50"
                                    >
                                      <RefreshCw size={13} className={reconciling === o.id ? 'animate-spin' : ''} />
                                      {reconciling === o.id ? 'Riconciliazione…' : 'Riconcilia effetti (cliente/sconto)'}
                                    </button>
                                    <p className="mt-2 text-[11px] leading-relaxed text-[#86868b]">
                                      Ricalcola totali cliente e utilizzi sconto dagli ordini pagati; chiude gli eventi webhook in sospeso.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}