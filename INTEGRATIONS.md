# Hub Integrazioni (stile Shopify)

Dal pannello admin → tab **Integrazioni** il team può collegare servizi esterni
in pochi click, senza scrivere codice: basta cercare il servizio, compilare i
campi e premere **Salva connessione** → **Test connessione**.

L'hub è pensato per crescere velocemente: **aggiungere una nuova integrazione
richiede una sola voce in un file di registro**. Il backend, il form admin,
l'oscuramento dei segreti e l'esposizione pubblica vengono generati
automaticamente.

## Cosa c'è oggi

| Categoria | Servizi |
|---|---|
| Pagamenti | Stripe (guida), PayPal, Satispay |
| Spedizioni | BRT, GLS, DHL, Poste Italiane, ShipEngine |
| Analytics | Google Analytics 4, Google Tag Manager, Hotjar |
| Marketing | Meta Pixel, TikTok Pixel, Google Ads, Microsoft Ads, Klaviyo, Mailchimp, Brevo, Google Merchant Center |
| Comunicazione | WhatsApp Business, Twilio SMS, SMTP, Resend |
| CRM / ERP | HubSpot, Zoho, Odoo, Fatture in Cloud |
| Automazione | Zapier, Make, n8n, Webhook personalizzato |
| Recensioni | Trustpilot, Judge.me |
| Sicurezza | reCAPTCHA, Cloudflare Turnstile, Sentry |

I servizi contrassegnati **Beta/Prossimamente** salvano già le credenziali in
modo sicuro e sono pronti per essere attivati dal team di sviluppo quando
serve; i servizi **Attivi** sono già cablati nella piattaforma.

## Cosa fa già "out of the box"

- **Google Analytics 4 / GTM / Meta Pixel / TikTok / Google Ads / Bing Ads /
  Hotjar / Klaviyo / Sentry**: una volta salvato l'ID, lo script viene
  iniettato automaticamente sullo storefront.
- **WhatsApp Business**: il numero e il messaggio precompilato del pulsante
  assistenza diventano dinamici.
- **Zapier / Make / n8n / Webhook personalizzato**: ad ogni **ordine pagato**
  il sistema invia automaticamente un `POST` JSON con i dettagli dell'ordine.
- **Stripe**: scheda con guida passo-passo e link alla dashboard (le chiavi
  restano gestite come secret Base44, con lettura dello stato dal pannello).

I campi marcati **segreto** (token, password, chiavi API) non vengono mai
restituiti al browser: l'UI li mostra come `••••••1234` e "lascia vuoto per
mantenere il valore attuale".

## Aggiungere una nuova integrazione (guida per sviluppatori)

1. Apri `base44/shared/integrations.js`.
2. Aggiungi un oggetto in fondo all'array `INTEGRATIONS`:

```ts
{
  id: 'mioservizio',                 // univoco, snake_case
  name: 'Mio Servizio',
  tagline: 'Breve sottotitolo',
  description: 'Cosa fa…',
  category: 'marketing',             // payments|shipping|analytics|marketing|communication|crm|automation|reviews|security
  color: '#0071E3',                  // colore del tile
  initials: 'MS',                    // 2 caratteri sul tile
  website: 'https://…',
  maturity: 'beta',                  // live | beta | coming_soon
  requiresSuperAdmin: true,          // true per gestire credenziali sensibili
  fields: [
    { key: 'api_key', label: 'API Key', type: 'password', required: true, secret: true },
    { key: 'site_id', label: 'Site ID', type: 'text', required: true, public: true },
  ],
  setup: [
    { title: '1. Crea la chiave', body: 'Su MioServizio → Impostazioni → API…' },
  ],
}
```

3. **Finito.** La card, il form di configurazione, la validazione, il
   salvataggio, il test e l'eventuale esposizione pubblica sono automatici.

### Tipi di campo supportati

`text`, `password` (segreto), `url`, `email`, `number`, `textarea`, `select`,
`switch`. I campi con `secret: true` non lasciano mai il server; i campi con
`public: true` vengono esposti allo storefront tramite l'operazione
`public_config`.

### Attivare un comportamento (cablaggio)

Per i servizi che devono **fare qualcosa** oltre a salvare le credenziali:

- **Script storefront** → aggiungi un blocco in
  `src/components/IntegrationBoot.jsx` dentro `applyIntegrations()` (es. un
  nuovo pixel).
- **Eventi backend** (es. notifica ordine) → leggi i valori con
  `secrets`/Setting e aggiungi la chiamata nella funzione Base44 pertinente.
  L'invio dei webhook di automazione è già implementato in
  `base44/functions/stripe-webhook/entry.ts` (`dispatchAutomationWebhooks`)
  come riferimento.
- **Test personalizzato** → per verifica la connettività (es. una API),
  aggiungi un caso in `integration-hub/entry.ts` operazione `test`.

## Sicurezza

- Autenticazione con la stessa password admin (rate limit, confronto a tempo
  costante).
- I segreti sono memorizzati come `Setting` ma non vengono **mai** letti dal
  browser; il listino admin li maschera.
- Le integrazioni che gestiscono chiavi di pagamento sono riservate al
  **super admin** (`requiresSuperAdmin`).
- I settaggi `integration_*` sono esclusi dall'editor generico dei settaggi
  per evitare modifiche accidentali.

## File coinvolti

- `base44/shared/integrations.js` — registro centrale (leggi qui per aggiungere).
- `base44/functions/integration-hub/entry.ts` — backend (catalogo, CRUD
  sicuro, test, configurazione pubblica).
- `src/components/admin/IntegrationsManager.jsx` — UI marketplace + form.
- `src/components/IntegrationBoot.jsx` — applica le integrazioni pubbliche sul
  negozio.
- `src/pages/Admin.jsx` — tab **Integrazioni**.
- `base44/functions/stripe-webhook/entry.ts` — dispatch webhook automazione.
- `src/lib/contact.jsx` — numero/messaggio WhatsApp dinamici.
