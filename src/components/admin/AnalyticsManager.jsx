import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, ShoppingCart, Euro, Package, Award, Loader2, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#0071E3', '#1d1d1f', '#6e6e73', '#FFB347', '#4ECDC4', '#95A5A6'];

export default function AnalyticsManager({ password }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, p] = await Promise.all([
          base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' }),
          base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'product' }),
        ]);
        setOrders(o.data.items || []);
        setProducts(p.data.items || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [password]);

  const metrics = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(); cutoff.setDate(now.getDate() - range);
    const inRange = orders.filter(o => new Date(o.created_date) >= cutoff);
    const prevCutoff = new Date(); prevCutoff.setDate(now.getDate() - range * 2);
    const prevRange = orders.filter(o => new Date(o.created_date) >= prevCutoff && new Date(o.created_date) < cutoff);

    const revenue = inRange.filter(o => o.status !== 'pending' && o.status !== 'cancelled').reduce((s, o) => s + (o.total_cents || 0), 0);
    const prevRevenue = prevRange.filter(o => o.status !== 'pending' && o.status !== 'cancelled').reduce((s, o) => s + (o.total_cents || 0), 0);
    const orderCount = inRange.length;
    const prevOrderCount = prevRange.length;
    const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;
    const prevAov = prevOrderCount > 0 ? Math.round(prevRevenue / prevOrderCount) : 0;
    const unitsSold = inRange.reduce((s, o) => s + (o.items || []).reduce((a, i) => a + (i.qty || 1), 0), 0);
    const profit = inRange.reduce((s, o) => {
      if (o.status === 'pending' || o.status === 'cancelled') return s;
      const cost = (o.items || []).reduce((a, i) => {
        const prod = products.find(p => p.name === i.name);
        return a + ((prod?.cost_cents || 0) * (i.qty || 1));
      }, 0);
      return s + (o.total_cents || 0) - cost;
    }, 0);

    const trend = (cur, prev) => prev > 0 ? ((cur - prev) / prev * 100) : (cur > 0 ? 100 : 0);

    return {
      revenue, prevRevenue, revenueTrend: trend(revenue, prevRevenue),
      orderCount, prevOrderCount, orderTrend: trend(orderCount, prevOrderCount),
      aov, prevAov, aovTrend: trend(aov, prevAov),
      unitsSold, profit,
      inRange,
    };
  }, [orders, products, range]);

  const chartData = useMemo(() => {
    const days = {};
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }), revenue: 0, orders: 0 };
    }
    metrics.inRange.forEach(o => {
      const key = new Date(o.created_date).toISOString().slice(0, 10);
      if (days[key] && o.status !== 'pending' && o.status !== 'cancelled') {
        days[key].revenue += (o.total_cents || 0) / 100;
        days[key].orders += 1;
      }
    });
    return Object.values(days);
  }, [metrics, range]);

  const topProducts = useMemo(() => {
    const map = {};
    metrics.inRange.forEach(o => {
      (o.items || []).forEach(i => {
        if (!i.name) return;
        if (!map[i.name]) map[i.name] = { name: i.name, units: 0, revenue: 0 };
        map[i.name].units += (i.qty || 1);
        map[i.name].revenue += (i.price_cents || 0) * (i.qty || 1);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [metrics]);

  const statusBreakdown = useMemo(() => {
    const map = {};
    metrics.inRange.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [metrics]);

  const categoryData = useMemo(() => {
    const map = {};
    metrics.inRange.forEach(o => {
      (o.items || []).forEach(i => {
        const prod = products.find(p => p.name === i.name);
        const cat = prod?.category || 'Altro';
        if (!map[cat]) map[cat] = { name: cat, revenue: 0 };
        map[cat].revenue += (i.price_cents || 0) * (i.qty || 1) / 100;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [metrics, products]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-[#0071E3]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Analytics Vendite</h2>
        </div>
        <div className="flex gap-1 bg-white rounded-lg p-1">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setRange(d)} className={`px-3 py-1 text-xs font-semibold rounded-md ${range === d ? 'bg-[#0071E3] text-white' : 'text-[#6e6e73]'}`}>{d}g</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Euro} label="Ricavi" value={`${(metrics.revenue / 100).toFixed(2)} €`} trend={metrics.revenueTrend} color="emerald" />
        <KpiCard icon={ShoppingCart} label="Ordini" value={metrics.orderCount} trend={metrics.orderTrend} color="blue" />
        <KpiCard icon={TrendingUp} label="Valore medio ordine" value={`${(metrics.aov / 100).toFixed(2)} €`} trend={metrics.aovTrend} color="orange" />
        <KpiCard icon={Package} label="Unità vendute" value={metrics.unitsSold} color="purple" />
      </div>

      {/* Profit banner */}
      <div className="bg-gradient-to-r from-[#1d1d1f] to-[#2a2a2e] text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60 uppercase font-semibold">Margine lordo ({range}g)</p>
          <p className="text-2xl font-bold mt-1">{(metrics.profit / 100).toFixed(2)} €</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">Margine %</p>
          <p className="text-2xl font-bold text-[#0071E3]">{metrics.revenue > 0 ? ((metrics.profit / metrics.revenue) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#1d1d1f] mb-4">Andamento ricavi ({range} giorni)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0071E3" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0071E3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6e6e73' }} interval={Math.floor(range / 8)} />
            <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
            <Tooltip formatter={v => [`${Number(v).toFixed(2)} €`, 'Ricavi']} contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#0071E3" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2"><Award size={15} className="text-[#0071E3]" /> Best Seller</h3>
          {topProducts.length === 0 ? <p className="text-sm text-[#6e6e73] py-8 text-center">Nessuna vendita nel periodo.</p> : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#f5f5f7] text-xs font-bold text-[#1d1d1f] flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] truncate">{p.name}</p>
                    <p className="text-xs text-[#6e6e73]">{p.units} unità</p>
                  </div>
                  <p className="text-sm font-bold text-[#1d1d1f]">{(p.revenue / 100).toFixed(2)} €</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status pie */}
        <div className="bg-white rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-4">Stato ordini</h3>
          {statusBreakdown.length === 0 ? <p className="text-sm text-[#6e6e73] py-8 text-center">Nessun dato.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category revenue */}
        <div className="bg-white rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-4">Ricavi per categoria</h3>
          {categoryData.length === 0 ? <p className="text-sm text-[#6e6e73] py-8 text-center">Nessun dato.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6e6e73' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6e6e73' }} width={80} />
                <Tooltip formatter={v => [`${Number(v).toFixed(2)} €`, 'Ricavi']} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#0071E3" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, trend = null, color }) {
  const colors = { emerald: 'text-emerald-600 bg-emerald-50', blue: 'text-blue-600 bg-blue-50', orange: 'text-[#0071E3] bg-[#FFF0E8]', purple: 'text-purple-600 bg-purple-50' };
  return (
    <div className="bg-white rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}><Icon size={16} /></div>
        {typeof trend === 'number' && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-xs text-[#6e6e73] font-medium">{label}</p>
      <p className="text-lg font-bold text-[#1d1d1f] mt-0.5">{value}</p>
    </div>
  );
}