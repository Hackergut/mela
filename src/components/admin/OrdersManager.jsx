import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';

const fmt = (c) => '€' + ((c || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const LABELS = { pending: 'In attesa', paid: 'Pagato', shipped: 'Spedito', delivered: 'Consegnato', cancelled: 'Annullato' };
const BADGE = { pending: 'bg-amber-100 text-amber-700', paid: 'bg-green-100 text-green-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

export default function OrdersManager({ password }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' });
      setOrders(res.data.items || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'order', payload: { id, status } });
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  };

  const filtered = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (!search || `${o.order_number} ${o.customer_email} ${o.customer_name || ''}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca ordine, email…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none">
          <option value="all">Tutti gli stati</option>
          {STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div> :
        filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-20">Nessun ordine.</p> : (
          <div className="bg-white rounded-2xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                  <th className="p-3">Ordine</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Sconto</th>
                  <th className="p-3">Totale</th>
                  <th className="p-3">Stato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="p-3 text-sm font-semibold text-[#1d1d1f]">{o.order_number}</td>
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
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${BADGE[o.status] || ''}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}