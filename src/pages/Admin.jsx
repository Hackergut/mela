import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import OrdersManager from '@/components/admin/OrdersManager';
import InventoryManager from '@/components/admin/InventoryManager';
import DiscountsManager from '@/components/admin/DiscountsManager';
import CustomersManager from '@/components/admin/CustomersManager';
import TeamManager from '@/components/admin/TeamManager';
import NotificationsManager from '@/components/admin/NotificationsManager';
import SettingsManager from '@/components/admin/SettingsManager';
import AnalyticsManager from '@/components/admin/AnalyticsManager';
import ShippingManager from '@/components/admin/ShippingManager';
import ReturnsManager from '@/components/admin/ReturnsManager';
import ReceiptsManager from '@/components/admin/ReceiptsManager';
import ProductForm from '@/components/admin/ProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import AssetLibrary from '@/components/admin/AssetLibrary';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import { Image } from '@/components/ui/image';
import { Plus, Pencil, Trash2, LogOut, Loader2, Package, FolderOpen, Images, LayoutDashboard, ShoppingCart, Boxes, Tags, Users, Search, Bell, Settings as SettingsIcon, BarChart3, Truck, RotateCcw, Receipt as ReceiptIcon } from 'lucide-react';

const PW_KEY = 'tm_admin_pw';
const ROLE_KEY = 'tm_admin_role';

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PW_KEY) || '');
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY));
  const [role, setRole] = useState(() => sessionStorage.getItem(ROLE_KEY) || 'admin');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState({});

  const isSuperAdmin = role === 'super_admin';

  const loadUnread = async () => {
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'notification' });
      setUnread((res.data.items || []).filter(n => !n.read).length);
    } catch {}
  };
  useEffect(() => { if (authed) loadUnread(); }, [authed, tab]);

  const load = async (pw) => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password: pw, operation: 'list', resource: 'product' });
      setProducts(res.data.items || []);
      if (res.data?.role) setRole(res.data.role);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authed) load(password); }, []);

  const handleLogin = (pw, items, r) => {
    sessionStorage.setItem(PW_KEY, pw); sessionStorage.setItem(ROLE_KEY, r || 'admin');
    setPassword(pw); setAuthed(true); setRole(r || 'admin'); setProducts(items);
  };
  const handleLogout = () => { sessionStorage.removeItem(PW_KEY); sessionStorage.removeItem(ROLE_KEY); setAuthed(false); setPassword(''); setRole('admin'); setProducts([]); setSelected({}); };

  const handleSave = async (data) => {
    const op = data.id ? 'update' : 'create';
    await base44.functions.invoke('admin-cms', { password, operation: op, resource: 'product', payload: data });
    setShowForm(false); setEditing(null); await load(password);
  };
  const handleDelete = async (id) => {
    if (!confirm('Eliminare definitivamente questo prodotto?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'product', payload: { id } });
    await load(password);
  };

  const selectedIds = Object.keys(selected).filter(id => selected[id]);
  const filteredIds = filtered.map(p => p.id);
  const allSelected = filteredIds.length > 0 && filteredIds.every(id => selected[id]);
  const toggleAll = () => {
    const next = { ...selected };
    if (allSelected) filteredIds.forEach(id => delete next[id]);
    else filteredIds.forEach(id => { next[id] = true; });
    setSelected(next);
  };
  const toggleOne = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Eliminare ${selectedIds.length} prodotti selezionati?`)) return;
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'product', payload: { ids: selectedIds } });
      setSelected({}); await load(password);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

  if (!authed) return <AdminLogin onLogin={handleLogin} />;

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())) : products;

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Prodotti', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Ordini', icon: ShoppingCart },
    { id: 'shipping', label: 'Spedizioni', icon: Truck },
    { id: 'returns', label: 'Resi/Storni', icon: RotateCcw },
    { id: 'receipts', label: 'Ricevute', icon: ReceiptIcon },
    { id: 'inventory', label: 'Inventario', icon: Boxes },
    { id: 'discounts', label: 'Sconti', icon: Tags },
    { id: 'customers', label: 'Clienti (CRM)', icon: Users },
    { id: 'categories', label: 'Categorie', icon: FolderOpen },
    { id: 'assets', label: 'Libreria Asset', icon: Images },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifiche', label: 'Notifiche', icon: Bell },
    { id: 'impostazioni', label: 'Impostazioni', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <PromoBanner />
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Gestione Store</h1>
            <p className="text-sm text-[#6e6e73]">CMS e-commerce completo · analytics, ordini, inventario, CRM, sconti e team</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('notifiche')} className="relative p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50" aria-label="Notifiche">
              <Bell size={18} className="text-[#1d1d1f]" />
              {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            <button onClick={() => setTab('impostazioni')} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50" aria-label="Impostazioni">
              <SettingsIcon size={18} className="text-[#1d1d1f]" />
            </button>
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${isSuperAdmin ? 'bg-[#1d1d1f] text-white' : 'bg-amber-100 text-amber-700'}`}>{isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-xl flex items-center gap-2">
              <LogOut size={16} /> Esci
            </button>
          </div>
        </div>

        {error && tab === 'products' && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <AdminDashboard password={password} />}
        {tab === 'orders' && <OrdersManager password={password} />}
        {tab === 'analytics' && <AnalyticsManager password={password} />}
        {tab === 'shipping' && <ShippingManager password={password} />}
        {tab === 'returns' && <ReturnsManager password={password} />}
        {tab === 'receipts' && <ReceiptsManager password={password} />}
        {tab === 'inventory' && <InventoryManager password={password} />}
        {tab === 'discounts' && <DiscountsManager password={password} />}
        {tab === 'customers' && <CustomersManager password={password} />}
        {tab === 'team' && <TeamManager password={password} />}
        {tab === 'notifiche' && <NotificationsManager password={password} />}
        {tab === 'impostazioni' && <SettingsManager password={password} isSuperAdmin={isSuperAdmin} />}

        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca prodotti…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]" />
                </div>
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl px-3 py-2">
                    <span className="text-sm font-semibold text-[#FF6B35]">{selectedIds.length} selezionati</span>
                    <button onClick={bulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"><Trash2 size={13} /> Elimina</button>
                    <button onClick={() => setSelected({})} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2">Annulla</button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowBulkAdd(true)} className="px-3 py-2 bg-white border border-gray-200 text-[#1d1d1f] text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap hover:bg-gray-50">
                  <Plus size={16} /> Aggiungi in bulk
                </button>
                <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap">
                  <Plus size={16} /> Aggiungi Prodotto
                </button>
              </div>
            </div>
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div> :
              filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-20">Nessun prodotto.</p> : (
                <div className="bg-white rounded-2xl overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                        <th className="p-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-[#FF6B35] cursor-pointer" /></th>
                        <th className="p-3">Prodotto</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Prezzo</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} className={`border-b border-gray-50 ${selected[p.id] ? 'bg-[#FF6B35]/5' : ''}`}>
                          <td className="p-3"><input type="checkbox" checked={!!selected[p.id]} onChange={() => toggleOne(p.id)} className="w-4 h-4 accent-[#FF6B35] cursor-pointer" /></td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f5f5f7] flex-shrink-0"><Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" /></div>
                              <div>
                                <p className="text-sm font-semibold text-[#1d1d1f]">{p.name}</p>
                                <div className="flex items-center gap-1.5">
                                  {p.badge && <span className="text-[10px] text-[#FF6B35] font-semibold">{p.badge}</span>}
                                  {p.is_mockup && <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-700 rounded">MOCKUP</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-[#6e6e73]">{p.category}</td>
                          <td className="p-3 text-sm font-semibold text-[#1d1d1f]">{p.price}</td>
                          <td className="p-3 text-sm"><span className={`font-semibold ${(p.stock || 0) <= (p.low_stock_threshold ?? 5) ? 'text-red-600' : 'text-[#1d1d1f]'}`}>{p.stock || 0}</span></td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditing(p); setShowForm(true); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Pencil size={14} /></button>
                              <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {tab === 'categories' && <CategoryManager password={password} />}
        {tab === 'assets' && <AssetLibrary password={password} />}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          password={password}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {showBulkAdd && (
        <BulkAddProducts
          categories={categories}
          password={password}
          onDone={() => { setShowBulkAdd(false); load(password); }}
          onCancel={() => setShowBulkAdd(false)}
        />
      )}
    </div>
  );
}

function BulkAddProducts({ categories, password, onDone, onCancel }) {
  const [rows, setRows] = useState([{ name: '', category: '', price: '', image: '' }, { name: '', category: '', price: '', image: '' }, { name: '', category: '', price: '', image: '' }]);
  const [saving, setSaving] = useState(false);

  const update = (i, field, val) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  const addRow = () => setRows(r => [...r, { name: '', category: '', price: '', image: '' }]);
  const removeRow = (i) => setRows(r => r.filter((_, idx) => idx !== i));

  const submit = async () => {
    const valid = rows.filter(r => r.name && r.price);
    if (valid.length === 0) return;
    setSaving(true);
    try {
      for (const r of valid) {
        await base44.functions.invoke('admin-cms', {
          password, operation: 'create', resource: 'product',
          payload: { name: r.name, category: r.category || 'Generale', price: r.price, image: r.image || 'https://images.unsplash.com/photo-1578500494198-4067542e1a5c?w=600', is_mockup: false },
        });
      }
      onDone();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1d1d1f]">Aggiungi prodotti in bulk</h3>
          <button onClick={onCancel} className="text-[#6e6e73] hover:text-[#1d1d1f] text-xl">✕</button>
        </div>
        <p className="text-xs text-[#6e6e73] mb-4">Inserisci più prodotti contemporaneamente. Lascia vuote le righe non necessarie.</p>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input placeholder="Nome" value={r.name} onChange={e => update(i, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input list="bulk-cats" placeholder="Categoria" value={r.category} onChange={e => update(i, 'category', e.target.value)} className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input placeholder="€ 0,00" value={r.price} onChange={e => update(i, 'price', e.target.value)} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <button onClick={() => removeRow(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
          <datalist id="bulk-cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
          <button onClick={addRow} className="text-xs text-[#FF6B35] font-semibold flex items-center gap-1"><Plus size={14} /> Aggiungi riga</button>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} Crea {rows.filter(r => r.name && r.price).length} prodotti
          </button>
          <button onClick={onCancel} className="px-4 py-2.5 bg-gray-100 text-[#1d1d1f] text-sm font-semibold rounded-xl">Annulla</button>
        </div>
      </div>
    </div>
  );
}