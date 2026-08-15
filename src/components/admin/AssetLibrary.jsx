import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Upload, Trash2, Loader2, Search } from 'lucide-react';

export default function AssetLibrary({ password }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try { setAssets(await base44.entities.Asset.list('-created_date', 500)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.functions.invoke('admin-cms', { password, operation: 'create', resource: 'asset', payload: { url: file_url, name: file.name } });
      }
      await load();
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#6e6e73]">{assets.length} asset nella libreria</p>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white" />
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-[#0071E3] text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Importa dal PC
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Upload size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[#6e6e73]">Nessun asset. Importa immagini dal PC per riutilizzarle nei prodotti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {filtered.map(a => (
            <div key={a.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white" style={{ aspectRatio: '1 / 1' }}>
              <Image src={a.url} alt={a.name} className="w-full h-full" fittingType="fill" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{a.name}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-600 transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}