// Central registry of every integration available in the admin "Integrazioni"
// panel. The backend function `integration-hub` serves this catalogue to the
// admin UI, stores field values as (masked) settings, and exposes only the
// public fields to the storefront via the `public_config` operation.
//
// To add a new integration the team only has to append an entry here: the
// admin card, the configuration form, the secret masking and the public
// exposure are generated automatically. See ../../INTEGRATIONS.md for the
// recipe.

/** @typedef {'text'|'password'|'url'|'email'|'number'|'textarea'|'select'|'switch'} IntegrationFieldType */
/** @typedef {'payments'|'shipping'|'analytics'|'marketing'|'communication'|'crm'|'automation'|'reviews'|'security'} IntegrationCategory */
/** @typedef {'live'|'beta'|'coming_soon'} IntegrationMaturity */

export const HIDDEN_VALUE = '••••••••';

export function settingKey(integrationId, fieldKey) {
  return `integration_${integrationId}_${fieldKey}`;
}

export function isSettingKey(key) {
  return typeof key === 'string' && key.startsWith('integration_');
}

export function maskSecret(value) {
  const v = String(value || '');
  if (!v) return '';
  if (v.length <= 4) return HIDDEN_VALUE;
  return `${HIDDEN_VALUE}${v.slice(-4)}`;
}

/** @type {Record<IntegrationCategory, string>} */
export const CATEGORY_LABELS = {
  payments: 'Pagamenti',
  shipping: 'Spedizioni',
  analytics: 'Analytics',
  marketing: 'Marketing',
  communication: 'Comunicazione',
  crm: 'CRM / ERP',
  automation: 'Automazione',
  reviews: 'Recensioni',
  security: 'Sicurezza',
};

/** @type {Record<IntegrationMaturity, string>} */
export const MATURITY_LABELS = {
  live: 'Attivo',
  beta: 'Beta',
  coming_soon: 'Prossimamente',
};

/** @type {Array<{id:string,name:string,tagline:string,description:string,category:IntegrationCategory,color:string,initials:string,website?:string,maturity:IntegrationMaturity,requiresSuperAdmin?:boolean,fields:Array<{key:string,label:string,type:IntegrationFieldType,required?:boolean,secret?:boolean,public?:boolean,placeholder?:string,help?:string,options?:Array<{value:string,label:string}>,pattern?:string,default?:string|boolean}>,setup?:Array<{title:string,body:string}>,testHook?:'webhook'}>} */
export const INTEGRATIONS = [
  // ───────────────────────────── Pagamenti ─────────────────────────────
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'Carte, Apple Pay, Google Pay',
    description: 'Gateway di pagamento già utilizzato per il checkout. Lo stato viene letto dai secret di runtime; la configurazione guidata mostra i passi e l’account collegato.',
    category: 'payments',
    color: '#635BFF',
    initials: 'St',
    website: 'https://dashboard.stripe.com',
    maturity: 'live',
    requiresSuperAdmin: true,
    fields: [
      { key: 'note', label: 'Nota', type: 'text', placeholder: 'Le chiavi Stripe vanno impostate come secret Base44' },
    ],
    setup: [
      { title: '1. Chiavi API', body: 'Su Stripe → Sviluppatori → Chiavi API copia la Secret key (sk_live_…) e la Publishable key (pk_live_…).' },
      { title: '2. Secret Base44', body: 'Imposta STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY e STRIPE_WEBHOOK_SECRET tra i secret Base44 (Dashboard → Integrations → Stripe oppure `base44 secrets set`).' },
      { title: '3. Webhook', body: 'Registra l’endpoint https://TUO-DOMINIO/apps/APP_ID/functions/stripe-webhook con gli eventi checkout.session.completed e checkout.session.expired.' },
      { title: '4. URL pubblico', body: 'Imposta PUBLIC_APP_URL con l’URL pubblico del sito (es. https://techmania.pro).' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    tagline: 'PayPal e carte',
    description: 'Accedi con PayPal. Le credenziali vengono salvate in attesa dell’attivazione del metodo di checkout.',
    category: 'payments',
    color: '#FFC439',
    initials: 'PP',
    website: 'https://developer.paypal.com',
    maturity: 'coming_soon',
    requiresSuperAdmin: true,
    fields: [
      { key: 'mode', label: 'Ambiente', type: 'select', required: true, default: 'sandbox', options: [{ value: 'sandbox', label: 'Sandbox' }, { value: 'live', label: 'Live' }] },
      { key: 'client_id', label: 'Client ID', type: 'text', required: true, secret: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true, secret: true },
      { key: 'webhook_id', label: 'Webhook ID', type: 'text', secret: true },
    ],
  },
  {
    id: 'satispay',
    name: 'Satispay',
    tagline: 'Pagamenti via app Italia',
    description: 'Metodo di pagamento molto diffuso in Italia. Credenziali pronte per l’attivazione.',
    category: 'payments',
    color: '#20B2AA',
    initials: 'Sa',
    website: 'https://developers.satispay.com',
    maturity: 'coming_soon',
    requiresSuperAdmin: true,
    fields: [
      { key: 'shop_id', label: 'Shop ID', type: 'text', required: true, secret: true },
      { key: 'private_key', label: 'Chiave privata', type: 'textarea', required: true, secret: true },
      { key: 'public_key', label: 'Chiave pubblica', type: 'textarea', required: true, secret: true },
      { key: 'sandbox', label: 'Modalità sandbox', type: 'switch', default: 'true' },
    ],
  },

  // ───────────────────────────── Spedizioni ────────────────────────────
  {
    id: 'brt',
    name: 'BRT Corriere',
    tagline: 'Tracking e spedizioni Italia',
    description: 'BRT (Bartolini). Credenziali API per generare spedizioni e leggere i tracking.',
    category: 'shipping',
    color: '#003DA5',
    initials: 'BR',
    website: 'https://www.brt.it',
    maturity: 'beta',
    fields: [
      { key: 'customer_code', label: 'Codice cliente', type: 'text', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true, secret: true },
      { key: 'sandbox', label: 'Ambiente di test', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'gls',
    name: 'GLS',
    tagline: 'Spedizioni nazionali',
    description: 'Credenziali GLS per la creazione automatica delle spedizioni.',
    category: 'shipping',
    color: '#E2231A',
    initials: 'GL',
    website: 'https://www.gls-italy.com',
    maturity: 'beta',
    fields: [
      { key: 'username', label: 'Utente API', type: 'text', required: true },
      { key: 'password', label: 'Password API', type: 'password', required: true, secret: true },
      { key: 'customer_code', label: 'Codice cliente', type: 'text' },
      { key: 'sandbox', label: 'Ambiente di test', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'dhl',
    name: 'DHL Express',
    tagline: 'Spedizioni internazionali',
    description: 'API DHL per etichette e tracking internazionale.',
    category: 'shipping',
    color: '#FFCC00',
    initials: 'DH',
    website: 'https://developer.dhl.com',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true, secret: true },
      { key: 'account_number', label: 'Numero conto', type: 'text', required: true },
      { key: 'sandbox', label: 'Ambiente di test', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'poste_italiane',
    name: 'Poste Italiane',
    tagline: 'Spedizioni e tracking',
    description: 'Integrazione con Poste Italiane per spedizioni e tracciamento.',
    category: 'shipping',
    color: '#0066CC',
    initials: 'PI',
    website: 'https://www.poste.it',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'account_code', label: 'Codice conto', type: 'text', required: true },
      { key: 'sandbox', label: 'Ambiente di test', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'shipengine',
    name: 'ShipEngine',
    tagline: 'Aggregatore di corrieri',
    description: 'Un’unica API per confrontare tariffe e stampare etichette di decine di corrieri.',
    category: 'shipping',
    color: '#7C3AED',
    initials: 'SE',
    website: 'https://www.shipengine.com',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'warehouse_country', label: 'Paese magazzino (ISO)', type: 'text', default: 'IT', placeholder: 'IT' },
    ],
  },

  // ───────────────────────────── Analytics ─────────────────────────────
  {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    tagline: 'Tracciamento visite ed e-commerce',
    description: 'Inietta automaticamente gtag.js e traccia pageview ed eventi e-commerce.',
    category: 'analytics',
    color: '#F9AB00',
    initials: 'GA',
    website: 'https://analytics.google.com',
    maturity: 'live',
    fields: [
      { key: 'measurement_id', label: 'Measurement ID', type: 'text', required: true, public: true, placeholder: 'G-XXXXXXXXXX', pattern: '^G-[A-Z0-9]+$' },
      { key: 'api_secret', label: 'API Secret (Measurement Protocol)', type: 'password', secret: true, help: 'Opzionale: per inviare eventi lato server.' },
    ],
    setup: [{ title: 'Ottieni l’ID', body: 'Su Google Analytics → Admin → Flussi di dati → seleziona il sito → copia il Measurement ID G-XXXX.' }],
  },
  {
    id: 'google_tag_manager',
    name: 'Google Tag Manager',
    tagline: 'Tag manager universale',
    description: 'Inietta il container GTM: poi gestisci tutti i pixel direttamente da GTM senza ripubblicare.',
    category: 'analytics',
    color: '#246FDB',
    initials: 'GT',
    website: 'https://tagmanager.google.com',
    maturity: 'live',
    fields: [
      { key: 'container_id', label: 'Container ID', type: 'text', required: true, public: true, placeholder: 'GTM-XXXXXX', pattern: '^GTM-[A-Z0-9]+$' },
    ],
  },
  {
    id: 'meta_pixel',
    name: 'Meta Pixel',
    tagline: 'Facebook & Instagram Ads',
    description: 'Pixel Meta per retargeting e ottimizzazione campagne.',
    category: 'marketing',
    color: '#0866FF',
    initials: 'Me',
    website: 'https://business.facebook.com/events_manager',
    maturity: 'live',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', type: 'text', required: true, public: true, placeholder: '123456789012345' },
      { key: 'access_token', label: 'Conversions API Token', type: 'password', secret: true, help: 'Opzionale: invio eventi lato server.' },
    ],
  },
  {
    id: 'tiktok_pixel',
    name: 'TikTok Pixel',
    tagline: 'Advertising TikTok',
    description: 'Pixel TikTok per campagne e retargeting.',
    category: 'marketing',
    color: '#000000',
    initials: 'TT',
    website: 'https://ads.tiktok.com',
    maturity: 'live',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', type: 'text', required: true, public: true },
      { key: 'access_token', label: 'Events API Token', type: 'password', secret: true },
    ],
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    tagline: 'Conversioni e remarketing',
    description: 'Tag di conversione Google Ads per misurare le campagne.',
    category: 'marketing',
    color: '#4285F4',
    initials: 'AW',
    website: 'https://ads.google.com',
    maturity: 'live',
    fields: [
      { key: 'conversion_id', label: 'Conversion ID (AW-…)', type: 'text', required: true, public: true, placeholder: 'AW-123456789' },
      { key: 'conversion_label', label: 'Conversion Label', type: 'text', public: true },
    ],
  },
  {
    id: 'bing_ads',
    name: 'Microsoft Ads',
    tagline: 'Remarketing Bing',
    description: 'Universal Event Tracking (UET) di Microsoft Advertising.',
    category: 'marketing',
    color: '#008373',
    initials: 'MS',
    website: 'https://ads.microsoft.com',
    maturity: 'live',
    fields: [
      { key: 'tag_id', label: 'UET Tag ID', type: 'text', required: true, public: true },
    ],
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    tagline: 'Heatmap e registrazioni',
    description: 'Inietta Hotjar per osservare come gli utenti usano il negozio.',
    category: 'analytics',
    color: '#FF4E4E',
    initials: 'Hj',
    website: 'https://www.hotjar.com',
    maturity: 'live',
    fields: [
      { key: 'site_id', label: 'Site ID', type: 'text', required: true, public: true },
    ],
  },

  // ───────────────────────────── Marketing ─────────────────────────────
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    tagline: 'Email & SMS marketing',
    description: 'Identifica gli utenti e sincronizza liste e carrelli abbandonati.',
    category: 'marketing',
    color: '#25CF6E',
    initials: 'Kl',
    website: 'https://www.klaviyo.com',
    maturity: 'beta',
    fields: [
      { key: 'public_key', label: 'Public API Key (company ID)', type: 'text', required: true, public: true, placeholder: 'AbC123' },
      { key: 'private_key', label: 'Private API Key', type: 'password', required: true, secret: true },
      { key: 'list_id', label: 'Lista newsletter', type: 'text' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    tagline: 'Newsletter e automazioni',
    description: 'Sincronizza i contatti del negozio su una audience Mailchimp.',
    category: 'marketing',
    color: '#FFE01B',
    initials: 'MC',
    website: 'https://mailchimp.com',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true, placeholder: '...-us14' },
      { key: 'audience_id', label: 'Audience ID', type: 'text', required: true },
      { key: 'server_prefix', label: 'Server prefix (es. us14)', type: 'text' },
    ],
  },
  {
    id: 'brevo',
    name: 'Brevo',
    tagline: 'Email e SMS transazionali',
    description: 'Invia email transazionali e campagne con Brevo (ex Sendinblue).',
    category: 'marketing',
    color: '#0092FF',
    initials: 'Br',
    website: 'https://www.brevo.com',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'sender_email', label: 'Email mittente', type: 'email', required: true },
      { key: 'sender_name', label: 'Nome mittente', type: 'text' },
    ],
  },
  {
    id: 'google_merchant',
    name: 'Google Merchant Center',
    tagline: 'Catalogo su Google Shopping',
    description: 'Sincronizza il catalogo prodotti con Google Merchant Center.',
    category: 'marketing',
    color: '#0F9D58',
    initials: 'GM',
    website: 'https://merchants.google.com',
    maturity: 'beta',
    fields: [
      { key: 'merchant_id', label: 'Merchant ID', type: 'text', required: true },
      { key: 'api_key', label: 'API Key (Content API)', type: 'password', required: true, secret: true },
      { key: 'target_country', label: 'Paese target (ISO)', type: 'text', default: 'IT' },
    ],
  },

  // ───────────────────────────── Comunicazione ─────────────────────────
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    tagline: 'Chat e notifiche',
    description: 'Numero WhatsApp dell’assistenza e credenziali Cloud API per l’invio di notifiche ordine.',
    category: 'communication',
    color: '#25D366',
    initials: 'Wa',
    website: 'https://business.whatsapp.com',
    maturity: 'live',
    fields: [
      { key: 'phone_number', label: 'Numero assistenza (internazionale senza +)', type: 'text', required: true, public: true, placeholder: '393512551866' },
      { key: 'default_message', label: 'Messaggio precompilato', type: 'text', public: true, default: 'Ciao! Ho bisogno di assistenza su TechMania.' },
      { key: 'provider', label: 'Provider API', type: 'select', default: 'cloud', options: [{ value: 'cloud', label: 'WhatsApp Cloud API' }, { value: 'none', label: 'Solo link wa.me' }] },
      { key: 'phone_number_id', label: 'Phone Number ID (Cloud API)', type: 'text' },
      { key: 'access_token', label: 'Access Token (Cloud API)', type: 'password', secret: true },
      { key: 'verify_token', label: 'Verify Token (webhook)', type: 'password', secret: true },
    ],
  },
  {
    id: 'twilio_sms',
    name: 'Twilio SMS',
    tagline: 'SMS di notifica ordine',
    description: 'Invia SMS di conferma e aggiornamento spedizione.',
    category: 'communication',
    color: '#F22F46',
    initials: 'Tw',
    website: 'https://www.twilio.com',
    maturity: 'beta',
    fields: [
      { key: 'account_sid', label: 'Account SID', type: 'text', required: true, secret: true },
      { key: 'auth_token', label: 'Auth Token', type: 'password', required: true, secret: true },
      { key: 'from_number', label: 'Mittente (E.164)', type: 'text', required: true, placeholder: '+393…' },
    ],
  },
  {
    id: 'smtp_email',
    name: 'SMTP / Email',
    tagline: 'Email transazionali',
    description: 'Server SMTP per inviare le email di conferma ordine e spedizione.',
    category: 'communication',
    color: '#6366F1',
    initials: '@',
    fields: [
      { key: 'host', label: 'Host SMTP', type: 'text', required: true, placeholder: 'smtp.example.com' },
      { key: 'port', label: 'Porta', type: 'number', required: true, default: '587' },
      { key: 'encryption', label: 'Sicurezza', type: 'select', default: 'tls', options: [{ value: 'tls', label: 'TLS/STARTTLS' }, { value: 'ssl', label: 'SSL' }, { value: 'none', label: 'Nessuna' }] },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true, secret: true },
      { key: 'from_email', label: 'Mittente (email)', type: 'email', required: true },
      { key: 'from_name', label: 'Mittente (nome)', type: 'text' },
    ],
  },
  {
    id: 'resend',
    name: 'Resend',
    tagline: 'Email per sviluppatori',
    description: 'API moderna per email transazionali e di marketing.',
    category: 'communication',
    color: '#000000',
    initials: 'Re',
    website: 'https://resend.com',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true, placeholder: 're_…' },
      { key: 'from_email', label: 'Mittente verificato', type: 'email', required: true, placeholder: 'ordini@tuodominio.it' },
    ],
  },

  // ───────────────────────────── CRM / ERP ─────────────────────────────
  {
    id: 'hubspot',
    name: 'HubSpot',
    tagline: 'CRM e vendite',
    description: 'Sincronizza clienti e ordini nel CRM HubSpot.',
    category: 'crm',
    color: '#FF7A59',
    initials: 'Hs',
    website: 'https://developers.hubspot.com',
    maturity: 'beta',
    fields: [
      { key: 'access_token', label: 'Access Token (Private App)', type: 'password', required: true, secret: true },
      { key: 'portal_id', label: 'Portal ID', type: 'text' },
    ],
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    tagline: 'CRM e contatti',
    description: 'Sincronizza contatti e lead con Zoho CRM.',
    category: 'crm',
    color: '#E42527',
    initials: 'Zo',
    website: 'https://www.zoho.com/crm/developer',
    maturity: 'beta',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true, secret: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true, secret: true },
      { key: 'refresh_token', label: 'Refresh Token', type: 'password', required: true, secret: true },
      { key: 'region', label: 'Region', type: 'select', default: 'eu', options: [{ value: 'eu', label: 'EU' }, { value: 'us', label: 'US' }, { value: 'in', label: 'India' }, { value: 'au', label: 'Australia' }] },
    ],
  },
  {
    id: 'odoo',
    name: 'Odoo',
    tagline: 'ERP open source',
    description: 'Collega Odoo per sincronizzare prodotti, ordini e clienti.',
    category: 'crm',
    color: '#714B67',
    initials: 'Od',
    website: 'https://www.odoo.com',
    maturity: 'beta',
    fields: [
      { key: 'url', label: 'URL istanza', type: 'url', required: true, placeholder: 'https://tuo-erp.odoo.com' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Utente', type: 'email', required: true },
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
    ],
  },
  {
    id: 'fatture_in_cloud',
    name: 'Fatture in Cloud',
    tagline: 'Fatturazione elettronica IT',
    description: 'Crea automaticamente le fatture degli ordini pagati.',
    category: 'crm',
    color: '#0D47A1',
    initials: 'FC',
    website: 'https://api.fattureincloud.it',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true, secret: true },
      { key: 'company_id', label: 'Company ID', type: 'text', required: true },
      { key: 'default_payment_type', label: 'Tipo pagamento predefinito', type: 'select', default: 'standard', options: [{ value: 'standard', label: 'Standard' }, { value: 'cash', label: 'Contanti' }] },
    ],
  },

  // ───────────────────────────── Automazione ───────────────────────────
  {
    id: 'zapier',
    name: 'Zapier',
    tagline: 'Automazioni no-code',
    description: 'Invia gli eventi degli ordini a uno Zap per collegare centinaia di app.',
    category: 'automation',
    color: '#FF4A00',
    initials: 'Zp',
    website: 'https://zapier.com',
    maturity: 'live',
    testHook: 'webhook',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, secret: true, placeholder: 'https://hooks.zapier.com/hooks/catch/...' },
      { key: 'event_order_paid', label: 'Invia evento "ordine pagato"', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    tagline: 'Scenari visivi',
    description: 'Attiva uno scenario Make ad ogni nuovo ordine, cliente o aggiornamento.',
    category: 'automation',
    color: '#6D2BD9',
    initials: 'Mk',
    website: 'https://www.make.com',
    maturity: 'live',
    testHook: 'webhook',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, secret: true, placeholder: 'https://hook.eu1.make.com/...' },
      { key: 'event_order_paid', label: 'Invia evento "ordine pagato"', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'n8n',
    name: 'n8n',
    tagline: 'Automazione self-hosted',
    description: 'Invia eventi al tuo n8n self-hosted o cloud.',
    category: 'automation',
    color: '#EA4B71',
    initials: 'n8',
    website: 'https://n8n.io',
    maturity: 'live',
    testHook: 'webhook',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, secret: true, placeholder: 'https://n8n.tuodominio.com/webhook/...' },
      { key: 'event_order_paid', label: 'Invia evento "ordine pagato"', type: 'switch', default: 'true' },
    ],
  },
  {
    id: 'custom_webhook',
    name: 'Webhook personalizzato',
    tagline: 'Endpoint HTTP generico',
    description: 'Un endpoint generico a cui inviare il payload JSON di ogni ordine pagato.',
    category: 'automation',
    color: '#0EA5E9',
    initials: 'WH',
    maturity: 'live',
    testHook: 'webhook',
    fields: [
      { key: 'webhook_url', label: 'URL endpoint', type: 'url', required: true, secret: true, placeholder: 'https://tuo-servizio.com/hook/orders' },
      { key: 'secret', label: 'Segreto firma (header X-TM-Signature)', type: 'password', secret: true },
      { key: 'event_order_paid', label: 'Invia evento "ordine pagato"', type: 'switch', default: 'true' },
    ],
  },

  // ───────────────────────────── Recensioni ────────────────────────────
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    tagline: 'Recensioni verificate',
    description: 'Invita i clienti a recensire i prodotti dopo la consegna.',
    category: 'reviews',
    color: '#00B67A',
    initials: 'Tp',
    website: 'https://developers.trustpilot.com',
    maturity: 'beta',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true, secret: true },
      { key: 'business_unit_id', label: 'Business Unit ID', type: 'text', required: true },
      { key: 'template_id', label: 'Template ID', type: 'text' },
    ],
  },
  {
    id: 'judge_me',
    name: 'Judge.me',
    tagline: 'Recensioni prodotto',
    description: 'Raccogli e mostra le recensioni prodotto.',
    category: 'reviews',
    color: '#5D3FD3',
    initials: 'Jd',
    website: 'https://judge.me',
    maturity: 'beta',
    fields: [
      { key: 'shop_domain', label: 'Dominio negozio', type: 'text', required: true, placeholder: 'tuo-negozio.myshopify.com' },
      { key: 'api_token', label: 'API Token', type: 'password', required: true, secret: true },
    ],
  },

  // ───────────────────────────── Sicurezza ─────────────────────────────
  {
    id: 'recaptcha',
    name: 'Google reCAPTCHA',
    tagline: 'Protezione anti-bot',
    description: 'Chiavi reCAPTCHA v3 pronte per proteggere i form del negozio.',
    category: 'security',
    color: '#4285F4',
    initials: 'rC',
    website: 'https://www.google.com/recaptcha',
    maturity: 'beta',
    fields: [
      { key: 'site_key', label: 'Site Key', type: 'text', required: true, public: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', required: true, secret: true },
      { key: 'score_threshold', label: 'Soglia punteggio (0-1)', type: 'text', default: '0.5' },
    ],
  },
  {
    id: 'turnstile',
    name: 'Cloudflare Turnstile',
    tagline: 'Alternativa anti-bot',
    description: 'CAPTCHA invisibile di Cloudflare.',
    category: 'security',
    color: '#F38020',
    initials: 'Tu',
    website: 'https://developers.cloudflare.com/turnstile',
    maturity: 'beta',
    fields: [
      { key: 'site_key', label: 'Site Key', type: 'text', required: true, public: true },
      { key: 'secret_key', label: 'Secret Key', type: 'password', required: true, secret: true },
    ],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    tagline: 'Monitoraggio errori',
    description: 'Inietta Sentry nel frontend per tracciare errori e performance.',
    category: 'security',
    color: '#362D59',
    initials: 'Se',
    website: 'https://sentry.io',
    maturity: 'beta',
    fields: [
      { key: 'dsn', label: 'DSN client', type: 'text', required: true, public: true, placeholder: 'https://xxxx@o0.ingest.sentry.io/0' },
      { key: 'environment', label: 'Environment', type: 'text', default: 'production', public: true },
      { key: 'traces_sample_rate', label: 'Tracce campionate (0-1)', type: 'text', default: '0.1', public: true },
    ],
  },
];

export function findIntegration(id) {
  return INTEGRATIONS.find((item) => item.id === id);
}
