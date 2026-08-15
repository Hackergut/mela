import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import ImagePicker from './ImagePicker';
import { EyeOff, ImageOff, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useBulkSelect, BulkActionBar, RowCheckbox } from '@/lib/bulkSelect';
import { CATALOG_QUERY_KEY } from '@/lib/useProducts';
import { slugifyCatalogValue } from '@/lib/catalog';

const FIELD = 'min-h-11 w-full rounded-xl border border-[#d2d2d7] px-3 text-sm outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]';
const blankCategory = (sortOrder) => ({ name: '', slug: '', description: '', parent_id: '', image: '', status: 'active', featured: false, sort_order: sortOrder });

export default function CategoryManager({ password }) {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [picker, setPicker] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'category' });
      setCategories(response.data.items || []);
    } catch (loadError) { setError(loadError.response?.data?.error || loadError.message); }
    finally { setLoading(false); }
  }, [password]);
  useEffect(() => { load(); }, [load]);

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...editing, slug: editing.slug || slugifyCatalogValue(editing.name) };
      await base44.functions.invoke('admin-cms', { password, operation: editing.id ? 'update' : 'create', resource: 'category', payload });
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      await load();
    } catch (saveError) { setError(saveError.response?.data?.error || saveError.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Eliminare questa categoria? Puoi farlo solo dopo aver riassegnato prodotti e sottocategorie.')) return;
    setError('');
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'category', payload: { id } });
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      await load();
    } catch (removeError) { setError(removeError.response?.data?.error || removeError.message); }
  };

  const bulk = useBulkSelect(categories);
  const bulkDelete = async () => {
    if (!bulk.selectedIds.length || !confirm(`Eliminare ${bulk.selectedIds.length} categorie selezionate?`)) return;
    setError('');
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'category', payload: { ids: bulk.selectedIds } });
      bulk.clear();
      await queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      await load();
    } catch (removeError) { setError(removeError.response?.data?.error || removeError.message); }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-semibold tracking-tight">Categorie</h2><p className="mt-1 text-sm text-[#6e6e73]">{categories.length} gruppi editoriali sincronizzati con il frontend.</p></div>
        <div className="flex items-center gap-2"><BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} /><button onClick={() => setEditing(blankCategory(categories.length))} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0071e3] px-4 text-sm font-semibold text-white"><Plus size={16} /> Nuova categoria</button></div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071e3]" size={28} /></div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <article key={category.id} className={`overflow-hidden rounded-3xl border bg-white ${bulk.selected[category.id] ? 'border-[#0071e3] ring-1 ring-[#0071e3]' : 'border-black/5'}`}>
              <div className="relative h-40 bg-[#f5f5f7]">
                {category.image ? <Image src={category.image} alt={category.name} className="h-full w-full" fittingType="fill" /> : <div className="grid h-full place-items-center text-[#c7c7cc]"><ImageOff size={30} /></div>}
                {category.status === 'hidden' && <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white"><EyeOff size={11} /> Nascosta</span>}
                {category.featured && <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">In evidenza</span>}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3"><RowCheckbox checked={Boolean(bulk.selected[category.id])} onChange={() => bulk.toggleOne(category.id)} /><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{category.name}</h3><p className="truncate text-xs text-[#6e6e73]">/{category.slug || slugifyCatalogValue(category.name)} · ordine {category.sort_order || 0}</p></div></div>
                <div className="flex gap-1"><button onClick={() => setEditing({ ...category })} className="grid h-8 w-8 place-items-center rounded-full bg-[#f5f5f7]" aria-label={`Modifica ${category.name}`}><Pencil size={14} /></button><button onClick={() => remove(category.id)} className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600" aria-label={`Elimina ${category.name}`}><Trash2 size={14} /></button></div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 p-4 backdrop-blur-sm">
          <form onSubmit={save} className="mx-auto my-8 max-w-xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-semibold text-[#0066cc]">Tassonomia</p><h2 className="text-2xl font-semibold tracking-tight">{editing.id ? 'Modifica categoria' : 'Nuova categoria'}</h2></div><button type="button" onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]"><X size={18} /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome *" className="sm:col-span-2"><input required value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} className={FIELD} /></Field>
              <Field label="Slug"><input value={editing.slug || ''} onChange={event => setEditing({ ...editing, slug: slugifyCatalogValue(event.target.value) })} className={FIELD} placeholder="generato automaticamente" /></Field>
              <Field label="Categoria principale"><select value={editing.parent_id || ''} onChange={event => setEditing({ ...editing, parent_id: event.target.value })} className={FIELD}><option value="">Nessuna</option>{categories.filter(item => item.id !== editing.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label="Stato"><select value={editing.status || 'active'} onChange={event => setEditing({ ...editing, status: event.target.value })} className={FIELD}><option value="active">Visibile</option><option value="hidden">Nascosta</option></select></Field>
              <Field label="Ordine"><input type="number" value={editing.sort_order || 0} onChange={event => setEditing({ ...editing, sort_order: Number(event.target.value) })} className={FIELD} /></Field>
              <Field label="Descrizione" className="sm:col-span-2"><textarea rows={4} value={editing.description || ''} onChange={event => setEditing({ ...editing, description: event.target.value })} className={`${FIELD} py-3`} /></Field>
              <label className="flex min-h-11 items-center gap-3 rounded-xl bg-[#f5f5f7] px-3 text-sm sm:col-span-2"><input type="checkbox" checked={Boolean(editing.featured)} onChange={event => setEditing({ ...editing, featured: event.target.checked })} className="accent-[#0071e3]" /> Mostra in evidenza</label>
              <div className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold text-[#6e6e73]">Immagine copertina</span><div className="flex items-center gap-3">{editing.image && <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#f5f5f7]"><Image src={editing.image} alt="" className="h-full w-full" fittingType="fill" /></div>}<button type="button" onClick={() => setPicker(true)} className="min-h-10 rounded-full bg-[#e8f2ff] px-4 text-sm font-semibold text-[#0066cc]">Scegli dalla libreria</button></div></div>
            </div>
            <div className="mt-7 flex gap-3"><button disabled={saving} type="submit" className="min-h-11 flex-1 rounded-full bg-[#0071e3] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Salvataggio…' : 'Salva categoria'}</button><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-full bg-[#f5f5f7] px-5 text-sm font-semibold">Annulla</button></div>
          </form>
        </div>
      )}
      {picker && <ImagePicker password={password} onSelect={url => { setEditing(current => ({ ...current, image: url })); setPicker(false); }} onClose={() => setPicker(false)} />}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-xs font-semibold text-[#6e6e73]">{label}</span>{children}</label>;
}
