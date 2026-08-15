import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Euro, ShoppingBag, Package, AlertTriangle, TrendingUp, Users, Loader2, Award } from 'lucide-react';

const fmt = (c) => '€' + ((c || 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (c) => { const v = (c || 0) / 100; return v >= 1000 ? '€' + (v / 1000).toFixed(1) + 'k' : '€' + Math.round(v); };

const STATUS_LABELS = { pending: 'In attesa', paid: 'Pagato', shipped: 'Spedito', delivered: 'Consegnato', cancelled: 'Annullato' };
const STATUS_BADGE = { pending: 'bg-amber-100 text-amber-700', paid: 'bg-green-100 text-green-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

export default function AdminDashboard({ password }) {
  const [data, setData] = useState({ orders: [], products: [], variants: [], customers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, catalog, c] = await Promise.all([
          base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' }),
          base44.functions.invoke('admin-cms', { password, operation: 'list_catalog', resource: 'product' }),
          base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'customer' }),
        ]);
        setData({
          orders: o.data.items || [],
          products: catalog.data.products || [],
          variants: catalog.data.variants || [],
          customers: c.data.items || [],
        });
      } finally { setLoading(false); }
    })();
  }, [password]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>;

  const { orders, products, variants, customers } = data;
  const paidOrders = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status));
  const revenue = paidOrders.reduce((s, o) => s + (o.total_cents || 0), 0);
  const discountGiven = orders.reduce((s, o) => s + (o.discount_amount_cents || 0), 0);
  const productById = new Map(products.map(product => [String(product.id), product]));
  const variantProductIds = new Set(variants.map(variant => String(variant.product_id)));
  const inventoryRows = [
    ...variants.filter(variant => variant.status === 'active').map(variant => ({
      ...variant,
      product_name: productById.get(String(variant.product_id))?.name || 'Prodotto',
    })),
    ...products.filter(product => !variantProductIds.has(String(product.id))).map(product => ({
      ...product,
      product_name: product.name,
      title: 'Standard legacy',
    })),
  ];
  const inventoryValue = inventoryRows.reduce((sum, item) => sum + ((Number(item.stock) || 0) * (Number(item.cost_cents) || 0)), 0);
  const lowStock = inventoryRows.filter(item => (Number(item.stock) || 0) <= (item.low_stock_threshold ?? 5));

  const days = [...Array(30)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0, 0, 0, 0);
    return { label: d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }), ts: d.getTime(), revenue: 0, orders: 0 };
  });
  paidOrders.forEach(o => {
    const od = new Date(o.created_date); od.setHours(0, 0, 0, 0);
    const idx = days.findIndex(d => d.ts === od.getTime());
    if (idx >= 0) { days[idx].revenue += o.total_cents || 0; days[idx].orders += 1; }
  });

  const statusData = STATUSES.map(s => ({ name: STATUS_LABELS[s], value: orders.filter(o => o.status === s).length, color: STATUS_COLORS[s] }));

  const KPIS = [
    { label: 'Ricavi', value: fmtK(revenue), icon: Euro, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ordini', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clienti', value: customers.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Prodotti', value: products.length, icon: Package, color: 'text-[#0071E3]', bg: 'bg-blue-50' },
    { label: 'Valore Stock', value: fmtK(inventoryValue), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Stock Basso', value: lowStock.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const recent = orders.slice(0, 6);

  const topProducts = (() => {
    const map = {};
    paidOrders.forEach(o => (o.items || []).forEach(i => {
      if (!i.name) return;
      if (!map[i.name]) map[i.name] = { name: i.name, units: 0, revenue: 0 };
      map[i.name].units += i.qty || 1;
      map[i.name].revenue += (i.price_cents || 0) * (i.qty || 1);
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPIS.map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
              <k.icon size={18} className={k.color} />
            </div>
            <p className="text-xs text-[#6e6e73]">{k.label}</p>
            <p className="text-xl font-bold text-[#1d1d1f]">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-4">Ricavi · ultimi 30 giorni</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={days}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071E3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tickFormatter={(v) => fmtK(v)} tick={{ fontSize: 10 }} width={48} />
              <Tooltip formatter={(v) => fmt(v)} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} />
              <Area type="monotone" dataKey="revenue" stroke="#0071E3" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-4">Ordini per stato</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={72} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eee' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3 flex items-center gap-2"><Award size={15} className="text-[#0071E3]" /> Prodotti più acquistati</h3>
          {topProducts.length === 0 ? <p className="text-sm text-[#6e6e73] py-6 text-center">Nessuna vendita.</p> : (
            <div className="space-y-1">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="w-6 h-6 rounded-lg bg-[#f5f5f7] text-xs font-bold text-[#1d1d1f] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] truncate">{p.name}</p>
                    <p className="text-xs text-[#6e6e73]">{p.units} unità</p>
                  </div>
                  <p className="text-sm font-bold text-[#1d1d1f] flex-shrink-0">{fmt(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">Ordini recenti</h3>
          {recent.length === 0 ? <p className="text-sm text-[#6e6e73]">Nessun ordine.</p> : (
            <div className="space-y-1">
              {recent.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1d1d1f] truncate">{o.order_number}</p>
                    <p className="text-xs text-[#6e6e73] truncate">{o.customer_email || '—'} · {new Date(o.created_date).toLocaleDateString('it-IT')}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-[#1d1d1f]">{fmt(o.total_cents)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[o.status] || ''}`}>{STATUS_LABELS[o.status] || o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">Avvisi stock basso</h3>
          {lowStock.length === 0 ? <p className="text-sm text-[#6e6e73]">Tutti i prodotti hanno stock sufficiente.</p> : (
            <div className="space-y-1">
              {lowStock.slice(0, 6).map(item => (
                <div key={`${item.product_id || item.id}:${item.id}`} className="flex items-center justify-between gap-3 border-b border-gray-50 py-2 text-sm last:border-0">
                  <span className="min-w-0 truncate font-medium text-[#1d1d1f]">{item.product_name}<span className="font-normal text-[#6e6e73]"> · {item.title || 'Standard'}</span></span>
                  <span className={`shrink-0 font-semibold ${(item.stock || 0) === 0 ? 'text-red-600' : 'text-amber-600'}`}>{item.stock || 0} pz</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {discountGiven > 0 && (
        <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-[#0071E3]" />
          <p className="text-sm text-[#1d1d1f]">Sconti applicati in totale: <span className="font-bold">{fmt(discountGiven)}</span></p>
        </div>
      )}
    </div>
  );
}

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = { pending: '#f59e0b', paid: '#22c55e', shipped: '#3b82f6', delivered: '#10b981', cancelled: '#ef4444' };