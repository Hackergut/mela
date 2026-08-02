import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Check, Trash2, Package, AlertTriangle, Tags, ShoppingCart, Info, Loader2 } from 'lucide-react';

export default function NotificationsManager({ password }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'notification' });
      setItems(res.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await base44.functions.invoke('admin-cms', { password, operation: 'update', resource: 'notification', payload: { id, read: true } });
    setItems(items.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await base44.functions.invoke('admin-cms', { password, operation: 'mark_all_read', resource: 'notification' });
    setItems(items.map(n => ({ ...n, read: true })));
  };

  const remove = async (id) => {
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'notification', payload: { id } });
    setItems(items.filter(n => n.id !== id));
  };

  const ICONS = { order: ShoppingCart, stock: AlertTriangle, discount: Tags, payment: Package, system: Info };
  const COLORS = {
    success: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-red-600 bg-red-50',
    info: 'text-blue-600 bg-blue-50',
  };

  const filtered = filter === 'all' ? items : filter === 'unread' ? items.filter(n => !n.read) : items.filter(n => n.type === filter);
  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Notifiche</h2>
          {unreadCount > 0 && <span className="px-2 py-0.5 text-xs font-bold text-white bg-[#FF6B35] rounded-full">{unreadCount} non lette</span>}
        </div>
        <button onClick={markAllRead} disabled={unreadCount === 0} className="px-3 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
          Segna tutte come lette
        </button>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {[['all','Tutte'],['unread','Non lette'],['order','Ordini'],['stock','Stock'],['payment','Pagamenti'],['system','Sistema']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${filter===k?'bg-[#FF6B35] text-white':'bg-white border border-gray-200 text-[#6e6e73] hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#FF6B35]" size={24} /></div> :
        filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-[#6e6e73]">Nessuna notifica.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const Icon = ICONS[n.type] || Info;
              return (
                <div key={n.id} className={`bg-white rounded-xl p-4 flex items-start gap-3 border ${n.read ? 'border-gray-100' : 'border-[#FF6B35]/30 bg-[#FF6B35]/[0.02]'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${COLORS[n.severity] || COLORS.info}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? 'font-medium text-[#1d1d1f]' : 'font-bold text-[#1d1d1f]'}`}>{n.title}</p>
                    <p className="text-xs text-[#6e6e73] mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_date).toLocaleString('it-IT')}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.read && <button onClick={() => markRead(n.id)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="Segna come letta"><Check size={14} /></button>}
                    <button onClick={() => remove(n.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center" title="Elimina"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}