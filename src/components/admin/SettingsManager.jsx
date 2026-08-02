import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Store, CheckCircle2, XCircle, Loader2, Save, Zap } from 'lucide-react';

const STORE_KEYS = [
  { key: 'store_name', label: 'Nome store', value: 'Terra-Mater' },
  { key: 'store_email', label: 'Email contatto', value: 'info@terra-mater.it' },
  { key: 'store_currency', label: 'Valuta', value: 'EUR' },
  { key: 'low_stock_threshold', label: 'Soglia stock basso (globale)', value: '5' },
  { key: 'free_shipping_threshold', label: 'Soglia spedizione gratuita (€)', value: '99' },
];

export default function SettingsManager({ password }) {
  const [payment, setPayment] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const loadPayment = async () => {
    setLoadingPayment(true);
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'payment_status' });
      setPayment(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingPayment(false); }
  };

  const loadSettings = async () => {
    try {
      const res = await base44.functions.invoke('admin-cms', { password, operation: 'list', resource: 'setting' });
      const map = {};
      (res.data.items || []).forEach(s => { map[s.key] = s; });
      const merged = {};
      STORE_KEYS.forEach(({ key, value }) => { merged[key] = map[key]?.value ?? value; });
      setSettings(merged);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadPayment(); loadSettings(); }, []);

  const testConnection = async () => {
    setTesting(true); setTestResult(null);
    try {
      await loadPayment();
      setTestResult({ ok: !!payment?.stripeKeySet, msg: payment?.stripeKeySet ? 'Connessione Stripe attiva' : 'Chiave Stripe non configurata' });
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
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Payment settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Pagamenti (Stripe)</h2>
        </div>

        {loadingPayment ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#FF6B35]" size={22} /></div> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <StatusCard label="Connessione Stripe" ok={!!payment?.stripeKeySet} okText="Configurata" badText="Non configurata" />
              <StatusCard label="Modalità" ok={payment?.mode === 'test'} bad={payment?.mode === 'live'} okText="Test (Sandbox)" badText="Live" neutral={payment?.mode} />
              <StatusCard label="Webhook" ok={!!payment?.webhookSecretSet} okText="Configurato" badText="Non configurato" />
              <StatusCard label="Publishable Key" ok={!!payment?.publishableKeySet} okText="Configurata" badText="Mancante" />
              <StatusCard label="Valuta" neutral="EUR (€)" />
              <div className="bg-[#f5f5f7] rounded-xl p-3">
                <p className="text-[10px] text-[#6e6e73] uppercase font-semibold mb-1">Carta di test</p>
                <p className="text-sm font-mono text-[#1d1d1f]">4242 4242 4242 4242</p>
              </div>
            </div>

            {payment?.account && (
              <div className="bg-[#f5f5f7] rounded-xl p-3 mb-4 text-sm">
                <p className="text-xs font-semibold text-[#6e6e73] uppercase mb-1">Saldo Stripe</p>
                {payment.account.error ? (
                  <p className="text-red-600 text-xs">{payment.account.error}</p>
                ) : (
                  <p className="text-[#1d1d1f]">
                    Disponibile: {payment.account.available_eur != null ? `${(payment.account.available_eur/100).toFixed(2)} €` : '—'} ·
                    In attesa: {payment.account.pending_eur != null ? `${(payment.account.pending_eur/100).toFixed(2)} €` : '—'}
                  </p>
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

            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
              Le chiavi Stripe si configurano in <strong>Dashboard → Integrations → Stripe</strong>. In modalità test puoi pagare con la carta 4242. Per andare live, inserisci le chiavi di produzione nella stessa sezione.
            </div>
          </>
        )}
      </div>

      {/* Store settings */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store size={18} className="text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Impostazioni Store</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STORE_KEYS.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-[#6e6e73] mb-1 block">{label}</span>
              <input
                value={settings[key] ?? ''}
                onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B35]"
              />
            </label>
          ))}
        </div>
        <button onClick={saveSettings} disabled={saving} className="mt-4 px-4 py-2 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salva impostazioni
        </button>
        {savedMsg && <span className="ml-3 text-sm text-emerald-600 font-medium">Salvato ✓</span>}
      </div>
    </div>
  );
}

function StatusCard({ label, ok, bad, okText, badText, neutral }) {
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