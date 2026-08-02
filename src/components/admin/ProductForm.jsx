import React, { useState } from 'react';
import { X } from 'lucide-react';

const INP = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:outline-none";

const empty = { name: '', price: '', price_cents: '', badge: '', category: '', image: '', description: '', sort_order: 0, _images: '', _colors: '' };

export default function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() => product ? {
    ...product,
    _images: (product.images || []).join('\n'),
    _colors: (product.colors || []).map(c => `${c.name}|${c.hex}|${c.image}`).join('\n'),
    price_cents: product.price_cents || '',
  } : empty);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const parseCents = (price) => {
    if (!price) return 0;
    const n = parseFloat(price.replace('€', '').replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : Math.round(n * 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      name: form.name,
      price: form.price,
      price_cents: Number(form.price_cents) || parseCents(form.price),
      badge: form.badge || null,
      category: form.category,
      image: form.image,
      images: form._images.split('\n').map(s => s.trim()).filter(Boolean),
      colors: form._colors.split('\n').map(s => {
        const [name, hex, image] = s.split('|').map(x => x && x.trim());
        return { name, hex, image };
      }).filter(c => c.name && c.image),
      description: form.description,
      sort_order: Number(form.sort_order) || 0,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-lg p-6 my-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#1d1d1f]">{form.id ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h2>
          <button type="button" onClick={onCancel}><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome *"><input required value={form.name} onChange={e => set('name', e.target.value)} className={INP} /></Field>
          <Field label="Prezzo * (es. €1.199)"><input required value={form.price} onChange={e => { set('price', e.target.value); set('price_cents', parseCents(e.target.value)); }} className={INP} /></Field>
          <Field label="Categoria *">
            <input list="cats" required value={form.category} onChange={e => set('category', e.target.value)} className={INP} />
            <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Badge"><input value={form.badge || ''} onChange={e => set('badge', e.target.value)} className={INP} placeholder="Nuovo (opzionale)" /></Field>
          <Field label="Immagine principale *"><input required value={form.image} onChange={e => set('image', e.target.value)} className={INP} placeholder="URL" /></Field>
          <Field label="Ordine"><input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={INP} /></Field>
        </div>
        <Field label="Descrizione"><textarea value={form.description} onChange={e => set('description', e.target.value)} className={INP} rows={2} /></Field>
        <Field label="Galleria immagini (un URL per riga)"><textarea value={form._images} onChange={e => set('_images', e.target.value)} className={INP} rows={3} /></Field>
        <Field label="Colori (nome|hex|immagine, uno per riga)"><textarea value={form._colors} onChange={e => set('_colors', e.target.value)} className={INP} rows={3} /></Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 py-3 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl">Salva</button>
          <button type="button" onClick={onCancel} className="px-5 py-3 bg-gray-100 text-sm font-semibold rounded-xl">Annulla</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#6e6e73] mb-1 block">{label}</span>
      {children}
    </label>
  );
}