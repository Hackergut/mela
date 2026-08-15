import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Search, Loader2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';

export default function ImagePicker({ password, onSelect, onClose }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try { const list = await base44.entities.Asset.list('-created_date', 200); setAssets(list); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.functions.invoke('admin-cms', { password, operation: 'create', resource: 'asset', payload: { url: file_url, name: file.name } });
        uploaded.push(file_url);
      }
      await load();
      onSelect(uploaded[0]);
    } catch (err) {
      alert('Errore upload: ' + (err.message || err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Rimuovere questo asset dalla libreria?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'asset', payload: { id } });
    await load();
  };

  const filtered = assets.filter(a => (a.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-[#1d1d1f]">Libreria Asset</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-4 border-b flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca…" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-[#0071E3] text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Carica dal PC
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0071E3]" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Nessun asset. Carica un'immagine dal PC.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {filtered.map(a => (
                <div key={a.id} className="relative group rounded-lg overflow-hidden border border-gray-200" style={{ aspectRatio: '1 / 1' }}>
                  <button onClick={() => onSelect(a.url)} className="w-full h-full">
                    <Image src={a.url} alt={a.name} className="w-full h-full" fittingType="fill" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-600 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}