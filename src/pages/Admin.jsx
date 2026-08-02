import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLogin from '@/components/admin/AdminLogin';
import ProductForm from '@/components/admin/ProductForm';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import { Image } from '@/components/ui/image';
import { Plus, Pencil, Trash2, LogOut, Loader2 } from 'lucide-react';

const PW_KEY = 'tm_admin_pw';

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PW_KEY) || '');
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(PW_KEY));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const load = async (pw) => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('admin-cms', { password: pw, operation: 'list' });
      setProducts(res.data.products || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (authed) load(password); }, []);

  const handleLogin = (pw) => {
    sessionStorage.setItem(PW_KEY, pw);
    setPassword(pw); setAuthed(true); load(pw);
  };
  const handleLogout = () => {
    sessionStorage.removeItem(PW_KEY);
    setAuthed(false); setPassword(''); setProducts([]);
  };

  const handleSave = async (data) => {
    const op = data.id ? 'update' : 'create';
    await base44.functions.invoke('admin-cms', { password, operation: op, payload: data });
    setShowForm(false); setEditing(null);
    await load(password);
  };
  const handleDelete = async (id) => {
    if (!confirm('Eliminare definitivamente questo prodotto?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', payload: { id } });
    await load(password);
  };

  if (!authed) return <AdminLogin onLogin={handleLogin} />;

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <PromoBanner />
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Gestione Catalogo</h1>
            <p className="text-sm text-[#6e6e73]">{products.length} prodotti · CMS sincronizzato</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl flex items-center gap-2">
              <Plus size={16} /> Aggiungi
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-xl flex items-center gap-2">
              <LogOut size={16} /> Esci
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div>
        ) : products.length === 0 ? (
          <p className="text-center text-[#6e6e73] py-20">Nessun prodotto. Clicca "Aggiungi" per crearne uno.</p>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-[#6e6e73] uppercase">
                  <th className="p-3">Prodotto</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Prezzo</th>
                  <th className="p-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f5f5f7] flex-shrink-0">
                          <Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1d1d1f]">{p.name}</p>
                          {p.badge && <span className="text-[10px] text-[#FF6B35] font-semibold">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[#6e6e73]">{p.category}</td>
                    <td className="p-3 text-sm font-semibold text-[#1d1d1f]">{p.price}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditing(p); setShowForm(true); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}