import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Store, RefreshCw, CheckCircle2, AlertCircle, Save, Link2 } from 'lucide-react';

export default function ShopifyManager({ password }) {
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [storefrontToken, setStorefrontToken] = useState('');
  const [configured, setConfigured] = useState(false);
  const [storefrontConfigured, setStorefrontConfigured] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [hasStorefrontToken, setHasStorefrontToken] = useState(false);
  const [fullSync, setFullSync] = useState(false);
  const [checkpoints, setCheckpoints] = useState({ orders: null, customers: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('shopify-sync', { password, operation: 'status' });
      setConfigured(res.data.configured);
      setStorefrontConfigured(res.data.storefront_configured);
      setShopDomain(res.data.domain || '');
      setAccessToken('');
      setStorefrontToken('');
      setHasToken(res.data.has_token);
      setHasStorefrontToken(res.data.has_storefront_token);
      setCheckpoints({ orders: res.data.orders_checkpoint || null, customers: res.data.customers_checkpoint || null });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const saveCreds = async () => {
    if (!shopDomain || (!accessToken && !hasToken && !storefrontToken && !hasStorefrontToken)) {
      setError('Inserisci dominio e almeno un token');
      return;
    }
    setSaving(true); setError(null);
    try {
      await base44.functions.invoke('shopify-sync', {
        password,
        operation: 'save_creds',
        payload: {
          shop_domain: shopDomain,
          access_token: accessToken,
          storefront_access_token: storefrontToken,
        },
      });
      if (accessToken) setHasToken(true);
      if (storefrontToken) setHasStorefrontToken(true);
      setAccessToken('');
      setStorefrontToken('');
      setConfigured(true);
      setStorefrontConfigured(Boolean(storefrontToken || hasStorefrontToken));
      setResult({ saved: true });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };

  const test = async () => {
    setTesting(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('shopify-sync', { password, operation: 'test', payload: { shop_domain: shopDomain, access_token: accessToken } });
      setShopInfo(res.data.shop);
      setResult({ test: true });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setTesting(false); }
  };

  const sync = async (op) => {
    setSyncing(op); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('shopify-sync', { password, operation: op, payload: { shop_domain: shopDomain, access_token: accessToken, full: fullSync } });
      setResult(res.data);
      await load();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setSyncing(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#95BF47]/15 flex items-center justify-center"><Store size={20} className="text-[#95BF47]" /></div>
          <div>
            <h3 className="text-base font-bold text-[#1d1d1f]">Integrazione Shopify</h3>
            <p className="text-xs text-[#6e6e73]">Catalogo live, carrello e checkout Shopify · sync ordini e clienti in admin</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-1">
            {storefrontConfigured && <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 size={12} /> Storefront</span>}
            {configured && <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#95BF47]/15 text-[#5a7d2a] flex items-center gap-1"><CheckCircle2 size={12} /> Admin API</span>}
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4 flex items-start gap-2"><AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Dominio negozio</label>
            <input value={shopDomain} onChange={e => setShopDomain(e.target.value)} placeholder="il-tuo-negozio.myshopify.com" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Storefront access token {hasStorefrontToken && <span className="text-green-600">(salvato)</span>}</label>
            <input type="password" value={storefrontToken} onChange={e => setStorefrontToken(e.target.value)} placeholder={hasStorefrontToken ? '•••••••• (inserisci per sostituire)' : 'shpat_… / Storefront token'} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
            <p className="mt-1 text-[11px] text-[#86868b]">Usato dallo storefront per catalogo, carrello e checkout hosted.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Admin API access token {hasToken && <span className="text-green-600">(salvato)</span>}</label>
            <input type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder={hasToken ? '•••••••• (inserisci per sostituire)' : 'shpat_…'} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
            <p className="mt-1 text-[11px] text-[#86868b]">Usato per importare prodotti, ordini e clienti in admin.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={saveCreds} disabled={saving} className="px-4 py-2 bg-[#1d1d1f] text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salva credenziali
          </button>
          <button onClick={test} disabled={testing || (!shopDomain && !configured) || (!accessToken && !hasToken)} className="px-4 py-2 bg-white border border-gray-200 text-[#1d1d1f] text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
            {testing ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />} Testa connessione
          </button>
        </div>

        {shopInfo && (
          <div className="mt-4 bg-[#f5f5f7] rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-xs text-[#6e6e73]">Negozio</p><p className="font-semibold text-[#1d1d1f]">{shopInfo.name}</p></div>
            <div><p className="text-xs text-[#6e6e73]">Dominio</p><p className="font-semibold text-[#1d1d1f]">{shopInfo.domain}</p></div>
            <div><p className="text-xs text-[#6e6e73]">Paese</p><p className="font-semibold text-[#1d1d1f]">{shopInfo.country}</p></div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">Sincronizzazione dati</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button onClick={() => sync('sync_products')} disabled={!configured && !accessToken || syncing} className="px-4 py-3 bg-[#95BF47] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {syncing === 'sync_products' ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Sincronizza prodotti
          </button>
          <button onClick={() => sync('sync_orders')} disabled={!configured && !accessToken || syncing} className="px-4 py-3 bg-[#0071E3] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {syncing === 'sync_orders' ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Sincronizza ordini
          </button>
          <button onClick={() => sync('sync_customers')} disabled={!configured && !accessToken || syncing} className="px-4 py-3 bg-[#0071E3] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {syncing === 'sync_customers' ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Sincronizza clienti
          </button>
          <button onClick={() => sync('sync_all')} disabled={!configured && !accessToken || syncing} className="px-4 py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {syncing === 'sync_all' ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Sincronizza tutto
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <label className="flex items-center gap-2 text-xs text-[#6e6e73]">
            <input type="checkbox" checked={fullSync} onChange={e => setFullSync(e.target.checked)} className="h-4 w-4 accent-[#0071E3] cursor-pointer" />
            Risincronizzazione completa (ignora i checkpoint e rilegge tutto lo storico)
          </label>
          {(checkpoints.orders || checkpoints.customers) && (
            <p className="text-[11px] text-[#86868b]">
              Checkpoint: ordini {checkpoints.orders ? new Date(checkpoints.orders).toLocaleString('it-IT') : '—'} · clienti {checkpoints.customers ? new Date(checkpoints.customers).toLocaleString('it-IT') : '—'}
            </p>
          )}
        </div>
        <p className="text-xs text-[#6e6e73] mt-2">
          La sincronizzazione usa l'Admin GraphQL API con checkpoint incrementali: dopo il primo backfill vengono letti solo gli ordini e i clienti modificati dall'ultima sincronizzazione. I record esistenti vengono aggiornati per numero ordine ed email.
        </p>

        {result && !result.saved && !result.test && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
            {result.orders || result.products ? (
              <div className="space-y-1">
                <p className="font-semibold text-green-800">Sincronizzazione completata</p>
                {result.products && <p className="text-green-700">Prodotti: {result.products.fetched} scaricati · {result.products.created} nuovi · {result.products.updated} aggiornati · varianti +{result.products.variants_created}/{result.products.variants_updated}</p>}
                {result.orders && <p className="text-green-700">Ordini: {result.orders.fetched} scaricati · {result.orders.created} nuovi · {result.orders.updated} aggiornati{result.orders.incremental ? ' · incrementale' : ' · backfill completo'}</p>}
                {result.customers && <p className="text-green-700">Clienti: {result.customers.fetched} scaricati · {result.customers.created} nuovi · {result.customers.updated} aggiornati{result.customers.incremental ? ' · incrementale' : ' · backfill completo'}</p>}
              </div>
            ) : (
              <p className="text-green-700">{result.fetched} scaricati · {result.created} nuovi · {result.updated} aggiornati{result.variants_created != null ? ` · varianti +${result.variants_created}/${result.variants_updated}` : ''}{result.incremental ? ' · incrementale' : result.created != null ? ' · backfill completo' : ''}</p>
            )}
          </div>
        )}
        {result?.saved && <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 size={16} /> Credenziali salvate.</div>}
        {result?.test && <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 size={16} /> Connessione riuscita.</div>}
      </div>

      <div className="bg-[#fff8f0] border border-[#0071E3]/20 rounded-2xl p-4">
        <p className="text-xs text-[#6e6e73]"><strong className="text-[#1d1d1f]">Come ottenere le credenziali:</strong> in Shopify Admin vai su Impostazioni → App → Sviluppa app → Crea app, abilita gli scope <code className="text-[#0071E3]">read_orders</code> e <code className="text-[#0071E3]">read_customers</code>, installa l'app e copia il token Admin API.</p>
      </div>
    </div>
  );
}