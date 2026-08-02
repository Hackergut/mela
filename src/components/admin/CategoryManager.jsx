import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import ImagePicker from './ImagePicker';
import { Plus, Pencil, Trash2, Loader2, X, ImageOff } from 'lucide-react';

const INP = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:outline-none";

export default function CategoryManager({ password }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [picker, setPicker] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setCats(await base44.entities.Category.list('sort_order', 200)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({ name: '', image: '', sort_order: cats.length });
  const startEdit = (c) => setEditing({ ...c });

  const save = async (e) => {
    e.preventDefault();
    const op = editing.id ? 'update' : 'create';
    await base44.functions.invoke('admin-cms', { password, operation: op, resource: 'category', payload: editing });
    setEditing(null);
    await load();
  };

  const remove = async (id) => {
    if (!confirm('Eliminare questa categoria? I prodotti con questa categoria resteranno ma non appariranno nei filtri finché non li riassegni.')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'category', payload: { id } });
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6e6e73]">{cats.length} categorie</p>
        <button onClick={startNew} className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-lg flex items-center gap-2">
          <Plus size={16} /> Aggiungi Categoria
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cats.map(c => (
            <div key={c.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="relative h-32 bg-[#f5f5f7]">
                {c.image ? <Image src={c.image} alt={c.name} className="w-full h-full" fittingType="fill" /> : <div className="flex items-center justify-center h-full text-gray-300"><ImageOff size={28} /></div>}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{c.name}</p>
                  <p className="text-xs text-[#6e6e73]">Ordine {c.sort_order}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Pencil size={14} /></button>
                  <button onClick={() => remove(c.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <form onSubmit={save} className="bg-white rounded-3xl w-full max-w-md p-6 my-8 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[#1d1d1f]">{editing.id ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
              <button type="button" onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Nome *</span>
              <input required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className={INP} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Immagine copertina</span>
              <div className="flex items-center gap-3">
                {editing.image && <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#f5f5f7] flex-shrink-0"><Image src={editing.image} alt="" className="w-full h-full" fittingType="fill" /></div>}
                <button type="button" onClick={() => setPicker(true)} className="px-4 py-2 bg-gray-100 text-sm font-semibold rounded-lg">Scegli dalla libreria</button>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Ordine</span>
              <input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} className={INP} />
            </label>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl">Salva</button>
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-3 bg-gray-100 text-sm font-semibold rounded-xl">Annulla</button>
            </div>
          </form>
        </div>
      )}

      {picker && (
        <ImagePicker
          password={password}
          onSelect={(url) => { setEditing(e => ({ ...e, image: url })); setPicker(false); }}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}