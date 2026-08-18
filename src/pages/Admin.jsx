import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLogin from '@/components/admin/AdminLogin';

const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const OrdersManager = lazy(() => import('@/components/admin/OrdersManager'));
const InventoryManager = lazy(() => import('@/components/admin/InventoryManager'));
const DiscountsManager = lazy(() => import('@/components/admin/DiscountsManager'));
const CustomersManager = lazy(() => import('@/components/admin/CustomersManager'));
const TeamManager = lazy(() => import('@/components/admin/TeamManager'));
const NotificationsManager = lazy(() => import('@/components/admin/NotificationsManager'));
const SettingsManager = lazy(() => import('@/components/admin/SettingsManager'));
const AnalyticsManager = lazy(() => import('@/components/admin/AnalyticsManager'));
const ShippingManager = lazy(() => import('@/components/admin/ShippingManager'));
const ReturnsManager = lazy(() => import('@/components/admin/ReturnsManager'));
const ReceiptsManager = lazy(() => import('@/components/admin/ReceiptsManager'));
const ProductForm = lazy(() => import('@/components/admin/ProductForm'));
const CategoryManager = lazy(() => import('@/components/admin/CategoryManager'));
const AssetLibrary = lazy(() => import('@/components/admin/AssetLibrary'));
const ShopifyManager = lazy(() => import('@/components/admin/ShopifyManager'));
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import { Image } from '@/components/ui/image';
import { formatPriceCents } from '@/lib/catalog';
import { CATALOG_QUERY_KEY } from '@/lib/useProducts';
import { Plus, Pencil, Trash2, LogOut, Loader2, Package, FolderOpen, Images, LayoutDashboard, ShoppingCart, Boxes, Tags, Users, Search, Bell, Settings as SettingsIcon, BarChart3, Truck, RotateCcw, Receipt as ReceiptIcon, ShoppingBag, WandSparkles } from 'lucide-react';

const PW_KEY = 'tm_admin_pw';
const ROLE_KEY = 'tm_admin_role';

export default function Admin() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState(() => sessionStorage.getItem(PW_KEY) || '');
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY));
  const [role, setRole] = useState(() => sessionStorage.getItem(ROLE_KEY) || 'admin');
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categoryEntities, setCategoryEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [normalizing, setNormalizing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState({});

  const isSuperAdmin = role === 'super_admin';

  const loadUnread = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'notification' });
      setUnread((res.data.items || []).filter(n => !n.read).length);
    } catch {}
  }, [password]);
  useEffect(() => { if (authed) loadUnread(); }, [authed, tab, loadUnread]);

  const load = useCallback(async (pw) => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password: pw, operation: 'list_catalog', resource: 'product' });
      setProducts(res.data.products || []);
      setVariants(res.data.variants || []);
      setCategoryEntities(res.data.categories || []);
      if (res.data?.role) setRole(res.data.role);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(password); }, [authed, password, load]);

  const handleLogin = (pw, items, r) => {
    sessionStorage.setItem(PW_KEY, pw); sessionStorage.setItem(ROLE_KEY, r || 'admin');
    setPassword(pw); setAuthed(true); setRole(r || 'admin'); setProducts(items);
  };
  const handleLogout = () => { sessionStorage.removeItem(PW_KEY); sessionStorage.removeItem(ROLE_KEY); setAuthed(false); setPassword(''); setRole('admin'); setProducts([]); setVariants([]); setCategoryEntities([]); setSelected({}); };

  const handleSave = async (data) => {
    setSaving(true); setError(null);
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'save_product', resource: 'product', payload: data });
      setShowForm(false); setEditing(null);
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      await load(password);
    } catch (saveError) {
      setError(saveError.response?.data?.error || saveError.message || 'Impossibile salvare il prodotto.');
    } finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Eliminare definitivamente questo prodotto e tutte le sue varianti?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'product', payload: { id } });
    await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
    await load(password);
  };
  const normalizeCatalog = async () => {
    setNormalizing(true); setError(null);
    try {
      const preview = await base44.functions.invoke('admin-cms', { password, operation: 'normalize_catalog', resource: 'product', payload: { apply: false } });
      const report = preview.data.report;
      const message = `La migrazione aggiornerà ${report.product_updates} prodotti, creerà ${report.default_variants} varianti standard e ${report.missing_categories} categorie. Continuare?`;
      if (!confirm(message)) return;
      await base44.functions.invoke('admin-cms', { password, operation: 'normalize_catalog', resource: 'product', payload: { apply: true } });
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      await load(password);
    } catch (migrationError) {
      setError(migrationError.response?.data?.error || migrationError.message || 'Migrazione non riuscita.');
    } finally { setNormalizing(false); }
  };

  if (!authed) return <AdminLogin onLogin={handleLogin} />;

  const categories = categoryEntities;
  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())) : products;

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
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      setSelected({}); await load(password);
    } catch (e) { setError(e.response?.data?.error || e.message); }
  };

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
    { id: 'shopify', label: 'Shopify', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <PromoBanner />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1d1d1f] sm:text-2xl">Gestione Store</h1>
            <p className="hidden text-sm text-[#6e6e73] sm:block">CMS e-commerce completo · analytics, ordini, inventario, CRM, sconti e team</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button onClick={() => setTab('notifiche')} className="relative p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50" aria-label="Notifiche">
              <Bell size={18} className="text-[#1d1d1f]" />
              {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#0071E3] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
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
        <div className="-mx-4 flex gap-1 mb-6 overflow-x-auto border-b border-gray-200 px-4 no-scrollbar sm:mx-0 sm:px-0 [-webkit-overflow-scrolling:touch]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-[#0071E3] text-[#0071E3]' : 'border-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <Suspense fallback={<div className="flex justify-center py-20" role="status"><Loader2 className="animate-spin text-[#0071E3]" size={28} /><span className="sr-only">Caricamento sezione…</span></div>}>
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
        {tab === 'shopify' && <ShopifyManager password={password} />}

        {tab === 'products' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex min-w-full flex-wrap items-center gap-2 sm:min-w-0 sm:flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca prodotti…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
                </div>
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-[#0071E3]/10 border border-[#0071E3]/30 rounded-xl px-3 py-2">
                    <span className="text-sm font-semibold text-[#0071E3]">{selectedIds.length} selezionati</span>
                    <button onClick={bulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"><Trash2 size={13} /> Elimina</button>
                    <button onClick={() => setSelected({})} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2">Annulla</button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 sm:shrink-0">
                <button onClick={normalizeCatalog} disabled={normalizing} className="px-3 py-2 bg-white border border-gray-200 text-[#1d1d1f] text-sm font-semibold rounded-full flex items-center gap-2 whitespace-nowrap hover:bg-gray-50 disabled:opacity-50" title="Normalizza prodotti legacy senza inventare varianti di capacità o colore">
                  {normalizing ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />} Migra catalogo
                </button>
                <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-[#0071e3] text-white text-sm font-semibold rounded-full flex items-center gap-2 whitespace-nowrap hover:bg-[#0077ed]">
                  <Plus size={16} /> Nuovo prodotto
                </button>
              </div>
            </div>
            {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div> :
              filtered.length === 0 ? <p className="text-center text-[#6e6e73] py-20">Nessun prodotto.</p> : (
                <div className="bg-white rounded-2xl overflow-x-auto">
                  <table className="w-full min-w-[820px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                        <th className="p-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-[#0071E3] cursor-pointer" /></th>
                        <th className="p-3">Prodotto</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Varianti</th>
                        <th className="p-3">Prezzi</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Stato</th>
                        <th className="p-3 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => {
                        const productVariants = variants.filter(variant => String(variant.product_id) === String(p.id));
                        const activeVariants = productVariants.filter(variant => variant.status === 'active');
                        const prices = activeVariants.map(variant => Number(variant.price_cents) || 0).filter(Boolean);
                        const stock = activeVariants.length ? activeVariants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0) : (p.stock || 0);
                        const priceLabel = prices.length ? `${formatPriceCents(Math.min(...prices))}${Math.min(...prices) !== Math.max(...prices) ? ` – ${formatPriceCents(Math.max(...prices))}` : ''}` : p.price;
                        return (
                        <tr key={p.id} className={`border-b border-gray-50 ${selected[p.id] ? 'bg-[#0071e3]/5' : ''}`}>
                          <td className="p-3"><input type="checkbox" checked={!!selected[p.id]} onChange={() => toggleOne(p.id)} className="w-4 h-4 accent-[#0071e3] cursor-pointer" /></td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f5f5f7] flex-shrink-0 p-1"><Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fit" /></div>
                              <div>
                                <p className="text-sm font-semibold text-[#1d1d1f]">{p.name}</p>
                                <div className="flex items-center gap-1.5">
                                  {p.badge && <span className="text-[10px] text-[#0066cc] font-semibold">{p.badge}</span>}
                                  {p.sku && <span className="text-[10px] text-[#86868b]">{p.sku}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-[#6e6e73]">{p.category}</td>
                          <td className="p-3 text-sm"><span className="font-semibold">{productVariants.length || 1}</span><span className="block text-xs text-[#86868b]">{activeVariants.length || 1} attive</span></td>
                          <td className="p-3 text-sm font-semibold text-[#1d1d1f] whitespace-nowrap">{priceLabel}</td>
                          <td className="p-3 text-sm"><span className={`font-semibold ${stock <= (p.low_stock_threshold ?? 5) ? 'text-red-600' : 'text-[#1d1d1f]'}`}>{stock}</span></td>
                          <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${p.status === 'active' || !p.status ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status === 'active' || !p.status ? 'Pubblicato' : 'Ritirato'}</span></td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => { setEditing(p); setShowForm(true); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" aria-label={`Modifica ${p.name}`}><Pencil size={14} /></button>
                              <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center" aria-label={`Elimina ${p.name}`}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {tab === 'categories' && <CategoryManager password={password} />}
        {tab === 'assets' && <AssetLibrary password={password} />}
        </Suspense>
      </div>

      <Suspense fallback={null}>
      {showForm && (
        <ProductForm
          key={editing?.id || 'new'}
          product={editing}
          variants={editing ? variants.filter(variant => String(variant.product_id) === String(editing.id)) : []}
          categories={categories}
          password={password}
          saving={saving}
          onSave={handleSave}
          onCancel={() => { if (!saving) { setShowForm(false); setEditing(null); } }}
        />
      )}

      </Suspense>
    </div>
  );
}
