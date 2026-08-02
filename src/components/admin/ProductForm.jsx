import React, { useState } from 'react';
import { X, Plus, Trash2, ImageOff, Upload } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { Image } from '@/components/ui/image';

const INP = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#FF6B35] focus:outline-none";

const empty = { name: '', price: '', price_cents: '', badge: '', category: '', image: '', images: [], colors: [], description: '', sort_order: 0 };

export default function ProductForm({ product, categories, password, onSave, onCancel }) {
  const [form, setForm] = useState(() => product ? {
    ...product,
    images: product.images || [],
    colors: product.colors || [],
    price_cents: product.price_cents || '',
  } : { ...empty, sort_order: product === undefined ? 0 : 0 });

  const [picker, setPicker] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const parseCents = (price) => {
    if (!price) return 0;
    const n = parseFloat(String(price).replace('€', '').replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : Math.round(n * 100);
  };

  const handlePicked = (url) => {
    if (picker === 'image') set('image', url);
    else if (picker === 'gallery') set('images', [...form.images, url]);
    else if (String(picker).startsWith('color:')) {
      const i = Number(picker.split(':')[1]);
      set('colors', form.colors.map((c, idx) => idx === i ? { ...c, image: url } : c));
    }
    setPicker(null);
  };

  const addColor = () => set('colors', [...form.colors, { name: '', hex: '#000000', image: '' }]);
  const removeColor = (i) => set('colors', form.colors.filter((_, idx) => idx !== i));
  const removeGalleryImage = (i) => set('images', form.images.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(form.id ? { id: form.id } : {}),
      name: form.name,
      price: form.price,
      price_cents: Number(form.price_cents) || parseCents(form.price),
      badge: form.badge || null,
      category: form.category,
      image: form.image,
      images: form.images,
      colors: form.colors.filter(c => c.name && c.image),
      description: form.description,
      sort_order: Number(form.sort_order) || 0,
      stock: Number(form.stock) || 0,
      cost_cents: Number(form.cost_cents) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 5,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl w-full max-w-lg p-6 my-8 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#1d1d1f]">{form.id ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h2>
          <button type="button" onClick={onCancel}><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Nome *</span>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className={INP} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Prezzo * (es. €1.199)</span>
            <input required value={form.price} onChange={e => { set('price', e.target.value); set('price_cents', parseCents(e.target.value)); }} className={INP} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Categoria *</span>
            <input list="cats" required value={form.category} onChange={e => set('category', e.target.value)} className={INP} />
            <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Badge</span>
            <input value={form.badge || ''} onChange={e => set('badge', e.target.value)} className={INP} placeholder="Nuovo (opzionale)" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Ordine</span>
            <input type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={INP} />
          </label>
        </div>

        {/* Inventario */}
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Stock</span>
            <input type="number" value={form.stock ?? ''} onChange={e => set('stock', e.target.value)} className={INP} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Costo (€)</span>
            <input type="number" step="0.01" value={form.cost_cents ? String(form.cost_cents / 100) : ''} onChange={e => set('cost_cents', Math.round(Number(e.target.value) * 100))} className={INP} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Soglia stock basso</span>
            <input type="number" value={form.low_stock_threshold ?? 5} onChange={e => set('low_stock_threshold', e.target.value)} className={INP} />
          </label>
        </div>

        {/* Immagine principale */}
        <div>
          <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Immagine principale *</span>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#f5f5f7] flex-shrink-0 border border-gray-200">
              {form.image ? <Image src={form.image} alt="" className="w-full h-full" fittingType="fill" /> : <div className="flex items-center justify-center h-full text-gray-300"><ImageOff size={20} /></div>}
            </div>
            <button type="button" onClick={() => setPicker('image')} className="px-4 py-2 bg-gray-100 text-sm font-semibold rounded-lg flex items-center gap-2">
              <Upload size={14} /> Scegli / Carica
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Descrizione</span>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className={INP} rows={2} />
        </label>

        {/* Galleria */}
        <div>
          <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Galleria immagini</span>
          <div className="flex flex-wrap gap-2 items-center">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#f5f5f7] border border-gray-200 group">
                <Image src={img} alt="" className="w-full h-full" fittingType="fill" />
                <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white rounded-bl flex items-center justify-center"><Trash2 size={10} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setPicker('gallery')} className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-[#FF6B35] hover:text-[#FF6B35]">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Colori */}
        <div>
          <span className="text-xs font-medium text-[#6e6e73] mb-1 block">Colori / Finiture</span>
          <div className="space-y-2">
            {form.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={c.name} onChange={e => set('colors', form.colors.map((cc, idx) => idx === i ? { ...cc, name: e.target.value } : cc))} placeholder="Nome" className={INP + ' flex-1'} />
                <input type="color" value={c.hex || '#000000'} onChange={e => set('colors', form.colors.map((cc, idx) => idx === i ? { ...cc, hex: e.target.value } : cc))} className="w-9 h-9 rounded border border-gray-200 cursor-pointer" />
                <button type="button" onClick={() => setPicker(`color:${i}`)} className="w-9 h-9 rounded border border-gray-200 overflow-hidden bg-[#f5f5f7] flex items-center justify-center">
                  {c.image ? <Image src={c.image} alt="" className="w-full h-full" fittingType="fill" /> : <ImageOff size={14} className="text-gray-300" />}
                </button>
                <button type="button" onClick={() => removeColor(i)} className="w-9 h-9 rounded bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={addColor} className="text-sm text-[#FF6B35] font-semibold flex items-center gap-1"><Plus size={14} /> Aggiungi colore</button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 py-3 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl">Salva Prodotto</button>
          <button type="button" onClick={onCancel} className="px-5 py-3 bg-gray-100 text-sm font-semibold rounded-xl">Annulla</button>
        </div>
      </form>

      {picker && (
        <ImagePicker password={password} onSelect={handlePicked} onClose={() => setPicker(null)} />
      )}
    </div>
  );
}