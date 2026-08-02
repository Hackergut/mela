import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Receipt as ReceiptIcon, Plus, Download, Trash2, Loader2, X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { useBulkSelect, BulkActionBar, RowCheckbox } from '@/lib/bulkSelect';

export default function ReceiptsManager({ password }) {
  const [receipts, setReceipts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([
        base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'receipt' }),
        base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'order' }),
      ]);
      setReceipts(r.data.items || []);
      setOrders(o.data.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Eliminare questa ricevuta?')) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'receipt', payload: { id } });
    setReceipts(receipts.filter(r => r.id !== id));
  };

  const generatePDF = (r) => {
    const doc = new jsPDF();
    const isSale = r.type === 'sale';
    // Header
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('TERRA-MATER', 20, 25);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Ceramiche Artigianali · P.IVA 01234567890', 20, 33);
    doc.text('info@terra-mater.it', 20, 39);
    // Receipt info
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(isSale ? 'RICEVUTA DI VENDITA' : 'RICEVUTA DI ACQUISTO', 20, 55);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`N. ${r.receipt_number}`, 20, 63);
    doc.text(`Data: ${new Date(r.created_date).toLocaleDateString('it-IT')}`, 20, 69);
    doc.text(`Stato: ${r.status === 'issued' ? 'Emessa' : 'Annullata'}`, 20, 75);
    // Party
    doc.setFont('helvetica', 'bold');
    doc.text(isSale ? 'Cliente:' : 'Fornitore:', 120, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(r.party_name || '—', 120, 69);
    if (r.party_email) doc.text(r.party_email, 120, 75);
    if (r.party_address) doc.text(r.party_address.slice(0, 40), 120, 81);
    // Items table
    let y = 95;
    doc.setFillColor(245, 245, 247); doc.rect(20, y - 5, 170, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('Descrizione', 22, y); doc.text('Qtà', 120, y); doc.text('Prezzo', 145, y); doc.text('Totale', 175, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    (r.items || []).forEach(it => {
      doc.text((it.name || '').slice(0, 55), 22, y);
      doc.text(String(it.qty || 1), 120, y);
      doc.text(`${(it.unit_cents/100).toFixed(2)} €`, 145, y);
      doc.text(`${((it.total_cents || it.unit_cents * (it.qty||1))/100).toFixed(2)} €`, 175, y);
      y += 7;
    });
    // Totals
    y += 5;
    doc.line(120, y, 190, y); y += 7;
    doc.text(`Subtotale: ${(r.subtotal_cents/100).toFixed(2)} €`, 150, y); y += 7;
    if (r.tax_cents) { doc.text(`IVA: ${(r.tax_cents/100).toFixed(2)} €`, 150, y); y += 7; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text(`TOTALE: ${(r.total_cents/100).toFixed(2)} €`, 150, y);
    // Footer
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Ricevuta generata dal sistema Terra-Mater CMS', 20, 285);
    if (r.notes) doc.text(`Note: ${r.notes}`, 20, 278);
    doc.save(`${r.receipt_number}.pdf`);
  };

  const filtered = filter === 'all' ? receipts : receipts.filter(r => r.type === filter);

  const bulk = useBulkSelect(filtered);
  const bulkDelete = async () => {
    if (bulk.selectedIds.length === 0 || !confirm(`Eliminare ${bulk.selectedIds.length} ricevute selezionate?`)) return;
    await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'receipt', payload: { ids: bulk.selectedIds } });
    bulk.clear(); await load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF6B35]" size={28} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ReceiptIcon size={18} className="text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Ricevute (Vendita & Acquisto)</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="px-3 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl flex items-center gap-2"><Plus size={16} /> Nuova ricevuta</button>
      </div>

      <div className="flex gap-1 mb-4">
        {[['all','Tutte'],['sale','Vendita'],['purchase','Acquisto']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${filter===k?'bg-[#FF6B35] text-white':'bg-white border border-gray-200 text-[#6e6e73]'}`}>{l}</button>
        ))}
      </div>

      <div className="mb-3"><BulkActionBar count={bulk.selectedIds.length} onBulkDelete={bulkDelete} onClear={bulk.clear} /></div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-[#6e6e73]">Nessuna ricevuta. Crea una ricevuta di vendita o d'acquisto.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className={`bg-white rounded-xl p-4 flex items-center justify-between gap-3 ${bulk.selected[r.id] ? 'ring-2 ring-[#FF6B35]' : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <RowCheckbox checked={!!bulk.selected[r.id]} onChange={() => bulk.toggleOne(r.id)} />
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${r.type==='sale'?'bg-emerald-50 text-emerald-600':'bg-blue-50 text-blue-600'}`}>
                  <ReceiptIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1d1d1f]">{r.receipt_number}</p>
                  <p className="text-xs text-[#6e6e73] truncate">
                    {r.type === 'sale' ? 'Vendita' : 'Acquisto'} · {r.party_name || '—'} · {new Date(r.created_date).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-[#1d1d1f]">{(r.total_cents/100).toFixed(2)} €</span>
                {r.status === 'void' && <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">Annullata</span>}
                <button onClick={() => generatePDF(r)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" title="Scarica PDF"><Download size={14} /></button>
                <button onClick={() => remove(r.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ReceiptForm password={password} orders={orders} onClose={() => setShowForm(false)} onCreated={(r) => { setReceipts([r, ...receipts]); setShowForm(false); }} />}
    </div>
  );
}

function ReceiptForm({ password, orders, onClose, onCreated }) {
  const [type, setType] = useState('sale');
  const [partyName, setPartyName] = useState('');
  const [partyEmail, setPartyEmail] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [items, setItems] = useState([{ name: '', qty: 1, unit_cents: 0 }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.unit_cents * (i.qty || 1)), 0);
  const tax = Math.round(subtotal * 0.22);
  const total = subtotal + tax;

  const fillFromOrder = (orderId) => {
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    setPartyName(o.customer_name || '');
    setPartyEmail(o.customer_email || '');
    setItems((o.items || []).map(i => ({ name: i.name || '', qty: i.qty || 1, unit_cents: i.price_cents || 0 })));
  };

  const submit = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke('admin-cms', {
        password, operation: 'create', resource: 'receipt',
        payload: {
          type,
          party_name: partyName,
          party_email: partyEmail,
          party_address: partyAddress,
          items: items.map(i => ({ ...i, total_cents: i.unit_cents * (i.qty || 1) })),
          subtotal_cents: subtotal,
          tax_cents: tax,
          total_cents: total,
          status: 'issued',
          notes,
          payment_method: type === 'sale' ? 'Stripe' : 'Bonifico',
        },
      });
      onCreated(res.data.item);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1d1d1f]">Nuova ricevuta</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            {['sale','purchase'].map(t => (
              <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${type===t?'bg-[#FF6B35] text-white':'bg-gray-100 text-[#6e6e73]'}`}>
                {t === 'sale' ? 'Vendita' : 'Acquisto'}
              </button>
            ))}
          </div>

          {type === 'sale' && orders.length > 0 && (
            <label className="block">
              <span className="text-xs font-medium text-[#6e6e73]">Precompila da ordine</span>
              <select onChange={e => fillFromOrder(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Seleziona ordine…</option>
                {orders.map(o => <option key={o.id} value={o.id}>{o.order_number} — {o.customer_name || '—'}</option>)}
              </select>
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-xs font-medium text-[#6e6e73]">{type === 'sale' ? 'Cliente' : 'Fornitore'}</span>
              <input value={partyName} onChange={e => setPartyName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></label>
            <label className="block"><span className="text-xs font-medium text-[#6e6e73]">Email</span>
              <input value={partyEmail} onChange={e => setPartyEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></label>
          </div>
          <label className="block"><span className="text-xs font-medium text-[#6e6e73]">Indirizzo</span>
            <input value={partyAddress} onChange={e => setPartyAddress(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></label>

          {/* Items */}
          <div>
            <span className="text-xs font-medium text-[#6e6e73]">Articoli</span>
            <div className="space-y-2 mt-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input placeholder="Descrizione" value={it.name} onChange={e => { const v=[...items]; v[idx]={...v[idx], name: e.target.value}; setItems(v); }} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                  <input type="number" min="1" value={it.qty} onChange={e => { const v=[...items]; v[idx]={...v[idx], qty: Number(e.target.value)}; setItems(v); }} className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                  <input type="number" step="0.01" placeholder="€" value={it.unit_cents ? (it.unit_cents/100).toFixed(2) : ''} onChange={e => { const v=[...items]; v[idx]={...v[idx], unit_cents: Math.round(Number(e.target.value)*100)}; setItems(v); }} className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm" />
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => setItems([...items, { name: '', qty: 1, unit_cents: 0 }])} className="text-xs text-[#FF6B35] font-semibold">+ Aggiungi riga</button>
            </div>
          </div>

          <div className="bg-[#f5f5f7] rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-[#6e6e73]">Subtotale</span><span className="font-medium">{(subtotal/100).toFixed(2)} €</span></div>
            <div className="flex justify-between"><span className="text-[#6e6e73]">IVA 22%</span><span className="font-medium">{(tax/100).toFixed(2)} €</span></div>
            <div className="flex justify-between font-bold text-[#1d1d1f] pt-1 border-t border-gray-200"><span>Totale</span><span>{(total/100).toFixed(2)} €</span></div>
          </div>

          <button onClick={submit} disabled={saving || items.every(i => !i.name)} className="w-full px-4 py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ReceiptIcon size={16} />} Crea ricevuta
          </button>
        </div>
      </div>
    </div>
  );
}