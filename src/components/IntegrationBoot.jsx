import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { setWhatsAppConfig } from '@/lib/contact';

let bootStarted = false;
let loadedIntegrations = null;

async function fetchPublicConfig() {
  try {
    const res = await base44.functions.invoke('integration-hub', { operation: 'public_config' });
    return res?.data?.config || {};
  } catch {
    return {};
  }
}

function loadScript(src, attrs = {}) {
  if (!src || document.querySelector(`script[data-tm-src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.setAttribute('data-tm-src', src);
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

function loadInlineScript(id, text) {
  if (!text || document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.text = text;
  document.head.appendChild(s);
}

function applyIntegrations(config) {
  // ── WhatsApp number ──────────────────────────────────────────────────
  const wa = config.whatsapp;
  if (wa?.phone_number) {
    setWhatsAppConfig({
      phoneNumber: String(wa.phone_number).replace(/[^0-9]/g, ''),
      defaultMessage: wa.default_message || undefined,
    });
  }

  // ── Sentry (must load as early as possible; placed before analytics) ─
  const sentry = config.sentry;
  if (sentry?.dsn) {
    const dsn = encodeURIComponent(sentry.dsn);
    const env = encodeURIComponent(sentry.environment || 'production');
    const rate = Number(sentry.traces_sample_rate);
    const sample = Number.isFinite(rate) ? rate : 0.1;
    loadScript(
      `https://js.sentry-cdn.com/${sentry.dsn.split('/').pop()}.min.js`,
      { crossorigin: 'anonymous' },
    );
    loadInlineScript(
      'tm-sentry-init',
      `window.addEventListener('load',function(){try{if(window.Sentry){Sentry.init({dsn:decodeURIComponent("${dsn}"),environment:decodeURIComponent("${env}"),tracesSampleRate:${sample}});}}catch(e){}});`,
    );
  }

  // ── GTM dataLayer + loader ───────────────────────────────────────────
  const gtm = config.google_tag_manager;
  if (gtm?.container_id) {
    loadInlineScript(
      'tm-gtm-bootstrap',
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+'&l='+l;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtm.container_id)});`,
    );
  }

  // ── gtag bootstrap (shared by Google Analytics and Google Ads) ───────
  const ga = config.google_analytics;
  const gads = config.google_ads;
  if (ga?.measurement_id || gads?.conversion_id) {
    // Define dataLayer + gtag once; each product then calls gtag('config').
    loadInlineScript(
      'tm-gtag-bootstrap',
      `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};gtag('js',new Date());`,
    );
    if (ga?.measurement_id) {
      loadInlineScript(
        'tm-ga4-config',
        `gtag('config',${JSON.stringify(ga.measurement_id)});`,
      );
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga.measurement_id)}`);
    }
    if (gads?.conversion_id) {
      loadInlineScript(
        'tm-gads-config',
        `gtag('config',${JSON.stringify(gads.conversion_id)});`,
      );
      if (!ga?.measurement_id) {
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gads.conversion_id)}`);
      }
    }
  }

  // ── Meta Pixel ───────────────────────────────────────────────────────
  const meta = config.meta_pixel;
  if (meta?.pixel_id) {
    loadInlineScript(
      'tm-meta-pixel',
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(String(meta.pixel_id))});fbq('track','PageView');`,
    );
  }

  // ── TikTok Pixel ─────────────────────────────────────────────────────
  const tt = config.tiktok_pixel;
  if (tt?.pixel_id) {
    loadInlineScript(
      'tm-tiktok-pixel',
      `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(${JSON.stringify(String(tt.pixel_id))});ttq.page()}(window,document,'ttq');`,
    );
  }

  // ── Microsoft Ads UET ────────────────────────────────────────────────
  const bing = config.bing_ads;
  if (bing?.tag_id) {
    loadInlineScript(
      'tm-bing-uet',
      `(function(w,d,t,r,u){w[u]=w[u]||[];var n={ti:${JSON.stringify(String(bing.tag_id))}};w[u].push(n);w[u].push({pagePath:location.pathname+location.search});var s=d.createElement(t);s.src=r;s.async=1;var f=d.getElementsByTagName(t)[0];f.parentNode.insertBefore(s,f)})(window,document,'script','//bat.bing.com/bat.js','uetq');`,
    );
  }

  // ── Hotjar ───────────────────────────────────────────────────────────
  const hj = config.hotjar;
  if (hj?.site_id) {
    loadInlineScript(
      'tm-hotjar',
      `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${Number(hj.site_id)},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r)})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
    );
  }

  // ── Klaviyo (company ID) ─────────────────────────────────────────────
  const kl = config.klaviyo;
  if (kl?.public_key) {
    loadInlineScript(
      'tm-klaviyo',
      `(function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://static.klaviyo.com/onsite/js/companies/"+${JSON.stringify(String(kl.public_key))}+"/Klaviyo.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)})();`,
    );
  }
}

/**
 * Applies publicly-exposed integration settings (analytics pixels, WhatsApp
 * number, Sentry) to the storefront. Secrets are never included. Mount once
 * near the app root; re-running is a no-op.
 */
export default function IntegrationBoot() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (loadedIntegrations) {
      setConfig(loadedIntegrations);
      if (!bootStarted) { bootStarted = true; applyIntegrations(loadedIntegrations); }
      return;
    }
    fetchPublicConfig().then((cfg) => {
      if (cancelled) return;
      loadedIntegrations = cfg;
      setConfig(cfg);
      if (!bootStarted) { bootStarted = true; applyIntegrations(cfg); }
    });
    return () => { cancelled = true; };
  }, []);

  // Test/debug exposure so other components can read the resolved config.
  useEffect(() => {
    if (config) window.__TM_INTEGRATIONS__ = config;
  }, [config]);

  return null;
}
