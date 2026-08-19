import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Store, CheckCircle2, XCircle, Loader2, Save, Zap, ShieldAlert, Trash2, Plus, Lock } from 'lucide-react';
import { queryClientInstance } from '@/lib/query-client';
import { CATALOG_QUERY_KEY } from '@/lib/useProducts';

const STORE_KEYS = [
  { key: 'store_name', label: 'Nome store', value: 'TechMania' },
  { key: 'store_email', label: 'Email contatto', value: 'info@techmania.it' },
  { key: 'store_currency', label: 'Valuta', value: 'EUR' },
  { key: 'low_stock_threshold', label: 'Soglia stock basso (globale)', value: '5' },
  { key: 'free_shipping_threshold', label: 'Soglia spedizione gratuita (€)', value: '99' },
  { key: 'shipping_flat_rate', label: 'Tariffa spedizione standard (€)', value: '0' },
  { key: 'shipping_countries', label: 'Paesi di consegna (codici ISO separati da virgola)', value: 'IT' },
  { key: 'bundle_discount_percent', label: 'Sconto bundle accessori (% sul totale accessori, max 15)', value: '5' },
];
const MAIN_KEYS = STORE_KEYS.map(s => s.key);

export default function SettingsManager({ password, isSuperAdmin }) {
  const [payment, setPayment] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [settings, setSettings] = useState({});
  const [allSettings, setAllSettings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [selected, setSelected] = useState({});
  const [showAddCustom, setShowAddCustom] = useState(false);

  const loadPayment = useCallback(async () => {
    setLoadingPayment(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'payment_status' });
      setPayment(res.data);
      return res.data;
    } catch (e) { console.error(e); }
    finally { setLoadingPayment(false); }
  }, [password]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'setting' });
      const items = res.data.items || [];
      setAllSettings(items);
      const map = {};
      items.forEach(s => { map[s.key] = s; });
      const merged = {};
      STORE_KEYS.forEach(({ key, value }) => { merged[key] = map[key]?.value ?? value; });
      setSettings(merged);
    } catch (e) { console.error(e); }
  }, [password]);

  useEffect(() => { loadPayment(); loadSettings(); }, [loadPayment, loadSettings]);

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    try {
      const currentPayment = await loadPayment();
      setTestResult({ ok: !!currentPayment?.stripeKeySet, msg: currentPayment?.stripeKeySet ? 'Connessione Stripe attiva' : 'Chiave Stripe non configurata' });
    } catch (e) { setTestResult({ ok: false, msg: e.message }); }
    finally { setTesting(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const { key, label } of STORE_KEYS) {
        await base44.functions.invoke('admin-cms', { password, operation: 'upsert_setting', resource: 'setting', payload: { key, value: settings[key], label } });
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
      await queryClientInstance.invalidateQueries({ queryKey: CATALOG_QUERY_KEY });
      loadSettings();
    } catch (e) { console.error(e); alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const customSettings = allSettings.filter(s => !MAIN_KEYS.includes(s.key));

  const toggleOne = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const toggleAllCustom = () => {
    const ids = customSettings.map(s => s.id);
    const allSel = ids.length > 0 && ids.every(id => selected[id]);
    const next = { ...selected };
    if (allSel) ids.forEach(id => delete next[id]);
    else ids.forEach(id => { next[id] = true; });
    setSelected(next);
  };
  const selectedIds = Object.keys(selected).filter(id => selected[id]);

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Eliminare ${selectedIds.length} settaggi selezionati?`)) return;
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'bulk_delete', resource: 'setting', payload: { ids: selectedIds } });
      setSelected({}); loadSettings();
    } catch (e) { alert(e.response?.data?.error || e.message); }
  };

  const deleteCustom = async (id) => {
    if (!confirm('Eliminare questo settaggio?')) return;
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'delete', resource: 'setting', payload: { id } });
      loadSettings();
    } catch (e) { alert(e.response?.data?.error || e.message); }
  };

  return (
    <div className="space-y-6">
      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Modalità Admin</p>
            <p className="text-xs text-amber-700 mt-0.5">I settaggi CMS principali (nome store, valuta, soglie) sono modificabili solo dal <strong>super admin</strong>. Puoi comunque gestire i settaggi personalizzati ed eliminare i mockup.</p>
          </div>
        </div>
      )}

      {/* Payment settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-[#0071E3]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Pagamenti (Stripe)</h2>
        </div>

        {loadingPayment ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#0071E3]" size={22} /></div> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <StatusCard label="Connessione Stripe" ok={!!payment?.stripeKeySet} okText="Configurata" badText="Non configurata" />
              <StatusCard label="Modalità" ok={payment?.mode === 'test'} bad={payment?.mode === 'live'} okText="Test (Sandbox)" badText="Live" neutral={payment?.mode} />
              <StatusCard label="Webhook" ok={!!payment?.webhookSecretSet} okText="Configurato" badText="Non configurato" />
              <StatusCard label="Publishable Key" ok={!!payment?.publishableKeySet} okText="Configurata" badText="Mancante" />
              <StatusCard label="Redirect sito (PUBLIC_APP_URL)" ok={!!payment?.publicAppUrl} okText="Configurato" badText="Mancante" neutral={payment?.publicAppUrl || undefined} />
              <StatusCard label="Valuta" neutral="EUR (€)" />
              <div className="bg-[#f5f5f7] rounded-xl p-3">
                <p className="text-[10px] text-[#6e6e73] uppercase font-semibold mb-1">Carta di test</p>
                <p className="text-sm font-mono text-[#1d1d1f]">4242 4242 4242 4242</p>
              </div>
            </div>

            {payment?.account && (
              <div className="bg-[#f5f5f7] rounded-xl p-3 mb-4 text-sm">
                <p className="text-xs font-semibold text-[#6e6e73] uppercase mb-1">Account Stripe collegato</p>
                {payment.account.error ? (
                  <p className="text-red-600 text-xs">{payment.account.error}</p>
                ) : (
                  <>
                    <p className="text-[#1d1d1f]">
                      {payment.account.id ? <span className="font-mono text-xs">{payment.account.id} </span> : null}
                      {payment.account.business_name ? `· ${payment.account.business_name}` : ''}
                      {payment.account.country ? ` (${payment.account.country})` : ''}
                      {payment.account.payouts_enabled ? '' : ' · ⚠️ payout non abilitati'}
                    </p>
                    <p className="text-[#6e6e73] text-xs mt-1">
                      Disponibile: {payment.account.available_eur != null ? `${(payment.account.available_eur/100).toFixed(2)} €` : '—'} ·
                      In attesa: {payment.account.pending_eur != null ? `${(payment.account.pending_eur/100).toFixed(2)} €` : '—'}
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={testConnection} disabled={testing} className="px-4 py-2 bg-[#1d1d1f] text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
                {testing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Test connessione
              </button>
              {testResult && (
                <span className={`text-sm font-medium flex items-center gap-1 ${testResult.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  {testResult.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {testResult.msg}
                </span>
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 leading-relaxed">
              <p className="font-semibold text-amber-800 mb-1">Collegare un account Stripe (guida completa: <code>STRIPE_SETUP.md</code>)</p>
              1. Su <strong>Vercel → Settings → Environment Variables</strong> imposta <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code> e (opzionale) <code>STRIPE_PUBLISHABLE_KEY</code>. Convex non è più obbligatorio per pagare.<br />
              2. Su Stripe → Webhook registra <code>https://tuo-dominio/api/stripe-webhook</code> con <code>checkout.session.completed</code> e <code>checkout.session.expired</code>.<br />
              3. In test usa la carta 4242. Per Google OAuth configura <code>AUTH_GOOGLE_ID</code>, <code>AUTH_GOOGLE_SECRET</code> e <code>SITE_URL</code> nel deployment Convex.
            </div>
          </>
        )}
      </div>

      {/* Store settings — main CMS (super admin only) */}
      <div className={`bg-white rounded-2xl p-6 ${!isSuperAdmin ? 'opacity-90' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-[#0071E3]" />
            <h2 className="text-lg font-bold text-[#1d1d1f]">Settaggi CMS Principali</h2>
            {!isSuperAdmin && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><Lock size={10} /> Super admin</span>
            )}
          </div>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isSuperAdmin ? 'pointer-events-none' : ''}`}>
          {STORE_KEYS.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">{label}</span>
              <input
                value={settings[key] ?? ''}
                onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3] disabled:bg-[#f5f5f7] disabled:text-[#6e6e73] disabled:cursor-not-allowed"
              />
            </label>
          ))}
        </div>
        {isSuperAdmin ? (
          <button onClick={saveSettings} disabled={saving} className="mt-4 px-4 py-2 bg-[#0071E3] text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salva impostazioni
          </button>
        ) : (
          <p className="mt-4 text-xs text-[#6e6e73] flex items-center gap-1"><Lock size={12} /> Solo il super admin può modificare questi settaggi.</p>
        )}
        {savedMsg && <span className="ml-3 text-sm text-emerald-600 font-medium">Salvato ✓</span>}
      </div>

      {/* Custom & mockup settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-[#1d1d1f]">Settaggi personalizzati & Mockup</h2>
          <button onClick={() => setShowAddCustom(true)} className="px-3 py-2 bg-[#0071E3] text-white text-sm font-semibold rounded-xl flex items-center gap-2"><Plus size={16} /> Aggiungi</button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#0071E3]/10 border border-[#0071E3]/30 rounded-xl px-3 py-2 mb-3">
            <span className="text-sm font-semibold text-[#0071E3]">{selectedIds.length} selezionati</span>
            <button onClick={bulkDelete} className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"><Trash2 size={13} /> Elimina</button>
            <button onClick={() => setSelected({})} className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] px-2">Annulla</button>
          </div>
        )}

        {customSettings.length === 0 ? (
          <p className="text-sm text-[#6e6e73] py-6 text-center">Nessun settaggio personalizzato. Usa "Aggiungi" per crearne.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <input type="checkbox" checked={customSettings.length > 0 && customSettings.every(s => selected[s.id])} onChange={toggleAllCustom} className="w-4 h-4 accent-[#0071E3] cursor-pointer" />
              <span className="text-xs font-semibold text-[#6e6e73] uppercase">Chiave</span>
              <span className="text-xs font-semibold text-[#6e6e73] uppercase flex-1">Valore</span>
              <span className="text-xs font-semibold text-[#6e6e73] uppercase">Tipo</span>
              <span className="text-xs font-semibold text-[#6e6e73] uppercase w-8">Azioni</span>
            </div>
            {customSettings.map(s => (
              <div key={s.id} className={`flex items-center gap-3 p-2 rounded-lg ${selected[s.id] ? 'bg-[#0071E3]/5' : ''}`}>
                <input type="checkbox" checked={!!selected[s.id]} onChange={() => toggleOne(s.id)} className="w-4 h-4 accent-[#0071E3] cursor-pointer" />
                <span className="text-sm font-mono font-semibold text-[#1d1d1f] w-40 truncate">{s.key}</span>
                <span className="text-sm text-[#6e6e73] flex-1 truncate">{s.value}</span>
                <div className="w-20">
                  {s.is_mockup ? <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-700 rounded">MOCKUP</span> : <span className="text-[10px] text-[#6e6e73]">custom</span>}
                </div>
                <button onClick={() => deleteCustom(s.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddCustom && <AddCustomSetting password={password} onDone={() => { setShowAddCustom(false); loadSettings(); }} onCancel={() => setShowAddCustom(false)} />}
    </div>
  );
}

function AddCustomSetting({ password, onDone, onCancel }) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [isMockup, setIsMockup] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!key) return;
    setSaving(true);
    try {
      await base44.functions.invoke('admin-cms', { password, operation: 'upsert_setting', resource: 'setting', payload: { key: key.trim().toLowerCase(), value, label: label || key, is_mockup: isMockup } });
      onDone();
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">Nuovo settaggio</h3>
        <div className="space-y-3">
          <label className="block"><span className="text-xs font-medium text-[#6e6e73]">Chiave</span>
            <input value={key} onChange={e => setKey(e.target.value)} placeholder="es. shipping_flat_rate" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" /></label>
          <label className="block"><span className="text-xs font-medium text-[#6e6e73]">Valore</span>
            <input value={value} onChange={e => setValue(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></label>
          <label className="block"><span className="text-xs font-medium text-[#6e6e73]">Etichetta</span>
            <input value={label} onChange={e => setLabel(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={isMockup} onChange={e => setIsMockup(e.target.checked)} className="w-4 h-4 accent-[#0071E3]" />
            <span className="text-sm text-[#1d1d1f]">Segna come <strong>mockup</strong> (dato demo eliminabile da qualunque admin)</span></label>
          <button onClick={submit} disabled={saving || !key} className="w-full px-4 py-2.5 bg-[#0071E3] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null} Crea settaggio
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, ok = false, bad = false, okText = '', badText = '', neutral = '' }) {
  const isOk = ok === true;
  const isBad = bad === true || ok === false;
  return (
    <div className="bg-[#f5f5f7] rounded-xl p-3">
      <p className="text-[10px] text-[#6e6e73] uppercase font-semibold mb-1">{label}</p>
      {neutral !== undefined && ok === undefined ? (
        <p className="text-sm font-semibold text-[#1d1d1f]">{neutral}</p>
      ) : (
        <p className={`text-sm font-semibold flex items-center gap-1 ${isOk ? 'text-emerald-600' : isBad ? 'text-red-600' : 'text-[#1d1d1f]'}`}>
          {isOk ? <CheckCircle2 size={14} /> : isBad ? <XCircle size={14} /> : null}
          {isOk ? okText : isBad ? badText : neutral}
        </p>
      )}
    </div>
  );
}