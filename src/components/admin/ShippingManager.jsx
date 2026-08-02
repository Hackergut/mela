import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Truck, Package, CheckCircle2, Search, Loader2, MapPin } from 'lucide-react';

const CARRIERS = ['DHL', 'UPS', 'FedEx', 'BRT', 'Poste Italiane', 'SDA'];

export default function ShippingManager({ password }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('paid');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' });
      setOrders(res.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const update = async (id, data) => {
    setSaving(id);
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'order', payload: { id, ...data } });
      setOrders(orders.map(o => o.id === id ? { ...o, ...data } : o));
    } catch (e) { console.error(e); }
    finally { setSaving(null); }
  };

  const shipOrder = async (o) => {
    const tracking = prompt('Numero tracking:', o.tracking_number || '');
    if (tracking === null) return;
    const carrier = prompt('Corriere (DHL/UPS/FedEx/BRT/Poste/SDA):', o.carrier || 'DHL');
    if (carrier === null) return;
    await update(o.id, { status: 'shipped', tracking_number: tracking, carrier, shipped_date: new Date().toISOString() });
  };

  const deliver = async (o) => {
    await update(o.id, { status: 'delivered', delivered_date: new Date().toISOString() });
  };

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'paid') return o.status === 'paid';
    if (filter === 'shipped') return o.status === 'shipped';
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  }).filter(o => !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.tracking_number?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    toShip: orders.filter(o => o.status === 'paid').length,
    inTransit: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Truck size={18} className="text-[#FF6B35]" />
        <h2 className="text-lg font-bold text-[#1d1d1f]">Tracking Spedizioni</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-amber-50 rounded-xl p-4"><p className="text-xs text-amber-700 font-semibold">Da spedire</p><p className="text-2xl font-bold text-amber-600">{stats.toShip}</p></div>
        <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs text-blue-700 font-semibold">In transito</p><p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p></div>
        <div className="bg-emerald-50 rounded-xl p-4"><p className="text-xs text-emerald-700 font-semibold">Consegnati</p><p className="text-2xl font-bold text-emerald-600">{stats.delivered}</p></div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per ordine, cliente, tracking…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]" />
        </div>
        {[['paid','Da spedire'],['shipped','In transito'],['delivered','Consegnati'],['all','Tutti']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-2 text-xs font-semibold rounded-lg ${filter===k?'bg-[#FF6B35] text-white':'bg-white border border-gray-200 text-[#6e6e73]'}`}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-16 text-sm">Nessun ordine in questo stato.</p> : (
        <div className="space-y-2">
          {filtered.map(o => (
            <div key={o.id} className="bg-white rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${o.status==='delivered'?'bg-emerald-50 text-emerald-600':o.status==='shipped'?'bg-blue-50 text-blue-600':'bg-amber-50 text-amber-600'}`}>
                    {o.status === 'delivered' ? <CheckCircle2 size={18} /> : o.status === 'shipped' ? <Truck size={18} /> : <Package size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1d1d1f]">{o.order_number}</p>
                    <p className="text-xs text-[#6e6e73]">{o.customer_name || '—'} · {(o.total_cents/100).toFixed(2)} €</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  {saving === o.id && <Loader2 size={14} className="animate-spin text-[#FF6B35]" />}
                </div>
              </div>

              {o.status === 'paid' && (
                <button onClick={() => shipOrder(o)} className="mt-3 w-full px-3 py-2 bg-[#FF6B35] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2">
                  <Truck size={14} /> Registra spedizione
                </button>
              )}

              {o.status === 'shipped' && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6e6e73]">Corriere:</span><span className="font-semibold text-[#1d1d1f]">{o.carrier || '—'}</span>
                    <span className="text-[#6e6e73] ml-3">Tracking:</span><span className="font-mono font-semibold text-[#1d1d1f]">{o.tracking_number || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      placeholder="Aggiorna tracking…"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B35]"
                      onKeyDown={e => { if (e.key === 'Enter' && e.target.value) { update(o.id, { tracking_number: e.target.value }); e.target.value=''; } }}
                    />
                    <button onClick={() => deliver(o)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg">Consegnato</button>
                  </div>
                </div>
              )}

              {o.status === 'delivered' && o.delivered_date && (
                <div className="mt-2 text-xs text-[#6e6e73] flex items-center gap-1"><MapPin size={12} /> Consegnato il {new Date(o.delivered_date).toLocaleDateString('it-IT')}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    paid: 'bg-amber-100 text-amber-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
  };
  const labels = { paid: 'Da spedire', shipped: 'Spedito', delivered: 'Consegnato', pending: 'In attesa', cancelled: 'Annullato', refunded: 'Rimborsato' };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${map[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
}