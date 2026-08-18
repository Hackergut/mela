import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Search, Plug, CheckCircle2, AlertCircle, ExternalLink, Save,
  Unplug, Zap, ArrowLeft, Lock, Sparkles, Beaker, Clock, Eye, EyeOff,
} from 'lucide-react';

const TYPE_ICONS = {
  live: { Icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700', label: 'Attivo' },
  beta: { Icon: Beaker, cls: 'bg-amber-100 text-amber-700', label: 'Beta' },
  coming_soon: { Icon: Clock, cls: 'bg-gray-100 text-gray-500', label: 'Prossimamente' },
};

function Field({ field, value, onChange, disabled, canManage }) {
  const [show, setShow] = useState(false);
  const isSecret = field.secret;
  const filled = isSecret && value && value.includes('••••');
  const inputType = isSecret ? (show ? 'text' : 'password') : field.type === 'number' ? 'number' : field.type;
  const baseCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3] disabled:bg-[#f5f5f7] disabled:text-[#6e6e73] disabled:cursor-not-allowed';

  if (field.type === 'switch') {
    return (
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={`relative w-10 h-6 rounded-full transition-colors ${value ? 'bg-[#0071E3]' : 'bg-gray-300'} disabled:opacity-50`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : ''}`} />
        </button>
        <span className="text-sm text-[#1d1d1f]">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={baseCls}>
        {(field.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }

  if (field.type === 'textarea') {
    return <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} rows={4} placeholder={field.placeholder} className={`${baseCls} font-mono text-xs`} />;
  }

  return (
    <div className="relative">
      <input
        type={inputType}
        value={value ?? ''}
        onChange={(e) => onChange(field.type === 'number' ? e.target.value : e.target.value)}
        disabled={disabled}
        placeholder={field.placeholder}
        className={`${baseCls} ${isSecret ? 'pr-9' : ''}`}
        autoComplete="off"
        spellCheck={false}
      />
      {isSecret && (
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d1d1f] p-1" tabIndex={-1} aria-label={show ? 'Nascondi' : 'Mostra'}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
      {filled && <p className="text-[10px] text-emerald-600 mt-1">Valore segreto salvato — lascia vuoto per mantenerlo</p>}
    </div>
  );
}

function IntegrationTile({ def, status, onOpen }) {
  const connected = status?.connected;
  const { Icon, cls, label } = TYPE_ICONS[def.maturity] || TYPE_ICONS.coming_soon;
  return (
    <button
      onClick={() => onOpen(def.id)}
      className="group relative text-left bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#0071E3]/40 hover:shadow-md transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
          style={{ backgroundColor: def.color }}
          aria-hidden="true"
        >
          {def.initials}
        </div>
        {connected ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            <CheckCircle2 size={11} /> Connesso
          </span>
        ) : (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cls}`}>
            <Icon size={11} /> {label}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#1d1d1f] truncate">{def.name}</h3>
        <p className="text-xs text-[#6e6e73] truncate">{def.tagline}</p>
      </div>
      <p className="text-[11px] text-[#86868b] leading-relaxed line-clamp-2 min-h-[28px]">{def.description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#86868b]">{status?.categoryLabel || def.categoryLabel}</span>
        <span className="text-xs font-semibold text-[#0071E3] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
          Configura <ArrowLeft size={13} className="rotate-180" />
        </span>
      </div>
      {def.requiresSuperAdmin && (
        <span className="absolute top-3 right-3 text-[#86868b]" title="Richiede super admin"><Lock size={12} /></span>
      )}
    </button>
  );
}

function IntegrationDetail({ def, status, canManage, isSuperAdmin, password, onBack, onSaved }) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSecretNote, setShowSecretNote] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('integration-hub', { password, operation: 'get', integration_id: def.id });
      const next = {};
      (def.fields || []).forEach((f) => {
        const v = res.data.values?.[f.key];
        next[f.key] = f.type === 'switch' ? Boolean(v) : (v ?? (f.hasDefault ? f.default : ''));
      });
      setValues(next);
      setShowSecretNote((def.fields || []).some((f) => f.secret));
    } catch (e) {
      setFeedback({ ok: false, msg: e.response?.data?.error || e.message });
    } finally {
      setLoading(false);
    }
  }, [password, def]);

  useEffect(() => { load(); }, [load]);

  const setField = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  const save = async () => {
    setSaving(true); setFeedback(null);
    try {
      const payload = {};
      (def.fields || []).forEach((f) => {
        if (f.secret) {
          const raw = values[f.key] ?? '';
          payload[f.key] = raw.includes('••••') ? '' : raw;
        } else {
          payload[f.key] = values[f.key];
        }
      });
      const res = await base44.functions.invoke('integration-hub', { password, operation: 'save', integration_id: def.id, values: payload });
      setFeedback({ ok: true, msg: 'Configurazione salvata.' });
      const next = {};
      (def.fields || []).forEach((f) => {
        const v = res.data.values?.[f.key];
        next[f.key] = f.type === 'switch' ? Boolean(v) : (v ?? '');
      });
      setValues(next);
      onSaved?.(res.data.connected);
    } catch (e) {
      setFeedback({ ok: false, msg: e.response?.data?.error || e.message });
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true); setFeedback(null);
    try {
      const res = await base44.functions.invoke('integration-hub', { password, operation: 'test', integration_id: def.id });
      const r = res.data.result || {};
      setFeedback({ ok: r.ok !== false, msg: r.message || 'Test completato' });
    } catch (e) {
      setFeedback({ ok: false, msg: e.response?.data?.error || e.message });
    } finally {
      setTesting(false);
    }
  };

  const disconnect = async () => {
    if (!confirm(`Disconnettere ${def.name}? I valori salvati saranno eliminati.`)) return;
    setDisconnecting(true); setFeedback(null);
    try {
      await base44.functions.invoke('integration-hub', { password, operation: 'disconnect', integration_id: def.id });
      onSaved?.(false);
      onBack();
    } catch (e) {
      setFeedback({ ok: false, msg: e.response?.data?.error || e.message });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>;

  const connected = status?.connected;
  const locked = def.requiresSuperAdmin && !canManage;
  const readOnly = locked || disconnecting;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm font-semibold text-[#0071E3] flex items-center gap-1 hover:underline">
        <ArrowLeft size={15} /> Tutte le integrazioni
      </button>

      <div className="bg-white rounded-2xl p-6">
        <div className="flex flex-wrap items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: def.color }}>
            {def.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[#1d1d1f]">{def.name}</h2>
              {connected && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle2 size={11} /> Connesso</span>}
              {def.requiresSuperAdmin && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full"><Lock size={10} /> Super admin</span>}
            </div>
            <p className="text-sm text-[#6e6e73] mt-0.5">{def.tagline}</p>
            <p className="text-xs text-[#86868b] mt-1">{def.description}</p>
            {def.website && (
              <a href={def.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071E3] mt-2 hover:underline">
                Documentazione / Dashboard <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {locked && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-4">
            <Lock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">Questa integrazione gestisce credenziali sensibili. Solo il <strong>super admin</strong> può modificarla.</p>
          </div>
        )}

        {feedback && (
          <div className={`rounded-xl px-4 py-3 mb-4 text-sm flex items-start gap-2 ${feedback.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {feedback.ok ? <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {def.fields && def.fields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {def.fields.map((f) => (
              <label key={f.key} className={`block ${f.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                {f.type !== 'switch' && (
                  <span className="text-xs font-semibold text-[#6e6e73] mb-1 flex items-center gap-1.5">
                    {f.label}
                    {f.required && <span className="text-red-500">*</span>}
                    {f.public && <span className="text-[9px] font-bold uppercase text-[#0071E3] bg-[#0071E3]/10 px-1.5 py-0.5 rounded">storefront</span>}
                    {f.secret && <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">segreto</span>}
                  </span>
                )}
                <Field field={f} value={values[f.key]} onChange={(v) => setField(f.key, v)} disabled={readOnly || saving || testing} canManage={canManage} />
                {f.help && <span className="text-[10px] text-[#86868b] mt-1 block">{f.help}</span>}
              </label>
            ))}
          </div>
        )}

        {showSecretNote && (
          <p className="text-[11px] text-[#86868b] mt-3 flex items-center gap-1.5">
            <Lock size={12} /> I campi segreti sono mascherati in lista e non vengono mai inviati al browser; per sostituirli digitalo il nuovo valore.
          </p>
        )}

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button onClick={save} disabled={saving || testing} className="px-4 py-2 bg-[#0071E3] text-white text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salva connessione
            </button>
            <button onClick={test} disabled={saving || testing} className="px-4 py-2 bg-white border border-gray-200 text-[#1d1d1f] text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50">
              {testing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />} Test connessione
            </button>
            {connected && (
              <button onClick={disconnect} disabled={saving || testing} className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 ml-auto">
                {disconnecting ? <Loader2 size={15} className="animate-spin" /> : <Unplug size={15} />} Disconnetti
              </button>
            )}
          </div>
        )}
      </div>

      {def.setup && def.setup.length > 0 && (
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#1d1d1f] mb-3">Come collegare {def.name}</h3>
          <ol className="space-y-3">
            {def.setup.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{step.title}</p>
                  <p className="text-xs text-[#6e6e73] mt-0.5 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function IntegrationsManager({ password, isSuperAdmin }) {
  const [catalog, setCatalog] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('integration-hub', { password, operation: 'catalog' });
      const cat = res.data;
      setCatalog(cat);
      // Fetch status for each integration in parallel.
      const results = await Promise.all((cat.integrations || []).map(async (def) => {
        try {
          const s = await base44.functions.invoke('integration-hub', { password, operation: 'status', integration_id: def.id });
          return [def.id, s.data];
        } catch {
          return [def.id, { connected: false }];
        }
      }));
      setStatuses(Object.fromEntries(results));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const total = catalog?.integrations?.length || 0;
    const connected = Object.values(statuses).filter((s) => s?.connected).length;
    return { total, connected };
  }, [catalog, statuses]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    return catalog.integrations.filter((d) => {
      if (category !== 'all' && d.category !== category) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
    });
  }, [catalog, query, category]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>;

  const selectedDef = selected ? catalog.integrations.find((d) => d.id === selected) : null;
  if (selectedDef) {
    return (
      <IntegrationDetail
        def={selectedDef}
        status={statuses[selectedDef.id]}
        canManage={isSuperAdmin || !selectedDef.requiresSuperAdmin}
        isSuperAdmin={isSuperAdmin}
        password={password}
        onBack={() => setSelected(null)}
        onSaved={() => load()}
      />
    );
  }

  const categories = [['all', 'Tutte'], ...Object.entries(catalog.categories || {})];
  const connectedCount = counts.connected;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#0071E3] to-[#0a4ea2] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><Plug size={22} /></div>
          <div>
            <h2 className="text-lg font-bold">Integrazioni</h2>
            <p className="text-sm text-white/80">Collega servizi e attiva upgrade della piattaforma senza scrivere codice — come su Shopify.</p>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-2xl font-bold">{connectedCount}<span className="text-white/60 text-sm font-normal">/{counts.total}</span></p>
            <p className="text-xs text-white/70">connesse</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un servizio…" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0071E3]" />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {categories.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${category === id ? 'bg-[#0071E3] text-white' : 'bg-white border border-gray-200 text-[#6e6e73] hover:text-[#1d1d1f]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 text-center">
          <Sparkles size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-[#6e6e73]">Nessuna integrazione trovata.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((def) => (
            <IntegrationTile
              key={def.id}
              def={{ ...def, categoryLabel: catalog.categories?.[def.category] || def.category }}
              status={statuses[def.id]}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      <div className="bg-[#fff8f0] border border-[#0071E3]/15 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-[#0071E3] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#6e6e73] leading-relaxed">
          <strong className="text-[#1d1d1f]">Per gli sviluppatori:</strong> per aggiungere un nuovo servizio basta inserire una voce in <code className="text-[#0071E3]">base44/shared/integrations.js</code> — la card, il form di configurazione, l'oscuramento dei segreti e l'esposizione pubblica vengono generati automaticamente. Vedi <code className="text-[#0071E3]">INTEGRATIONS.md</code>.
        </p>
      </div>
    </div>
  );
}
