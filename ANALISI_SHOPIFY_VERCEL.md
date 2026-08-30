# Analisi: progetto TechMania e connessione Shopify / Vercel / Storefront

> Data: 2026-08-30 · Branch: `arena/01a054ff-mela`
> Scopo: capire l'architettura del progetto e come il frontend (Vite + React
> deployato su Vercel) si collega a Shopify Storefront, a Shopify Admin API e
> ai backend Convex/Vercel.

---

## 1. Panoramica del progetto

TechMania è uno storefront + pannello amministrativo **non** costruito con
Next.js. È un'app **SPA React + Vite** (vedi `package.json`, `vite.config.js`).

Componenti principali:

| Livello | Tecnologia / file | Ruolo |
|---|---|---|
| Frontend | React 18 + Vite + React Router, `src/` | Storefront, carrello, prodotto, admin |
| Serverless Vercel | `api/*` + `vercel.json` | Checkout/ordini/status/webhook **Stripe** |
| Backend CMS/Commerce | Convex (`convex/*`) | Catalogo, admin CMS, auth Google, sync Shopify |
| Integrazione Shopify | `src/lib/shopify/*`, `convex/shopifyStorefront.ts`, `convex/shopifySync.ts` | Catalogo live, checkout hosted, sync dati |
| Integrations Hub | `convex/integrationHub.ts`, `base44/shared/integrations.js` | Gestione servizi esterni dal pannello admin |

Il filtro architetturale più importante: **il commercio Shopify non passa da
Vercel `/api`**. Vercel `/api` è solo il fallback **Stripe**. Shopify viene
gestito o direttamente nel browser (Storefront API) oppure via Convex.

---

## 2. Dove viene deployato il frontend

- `vercel.json`: `framework: "vite"`, `buildCommand: "npm run build"`, output
  `dist`, rewrite di tutte le route non-`/api` verso `index.html`.
- Le route `/api/*` sono gestite dalle functions serverless in `api/`.
- `src/api/functions.js` è il dispatcher: le chiamate legacy
  `base44.functions.invoke(...)` prima tentano le route Vercel locali (Stripe),
  poi Convex se `VITE_CONVEX_URL` è configurata, altrimenti falliscono.

Nota: il file `src/api/base44Client.js` imposta `base44.isConfigured = true`
indistintamente; il comportamento reale dipende da `convexConfigured`.

---

## 3. Identificazione API Shopify usate

### 3.1 Storefront API (pubblico)

Usata per **catalogo e checkout hosted**.

- Endpoint: `https://<domain>/api/2025-01/graphql.json`
- Header: `X-Shopify-Storefront-Access-Token: <storefront token>`
- Client frontend: `src/lib/shopify/client.js`
- Query/mutation: `src/lib/shopify/queries.js`
  - `PRODUCTS_QUERY`, `PRODUCT_BY_HANDLE_QUERY`
  - `CREATE_CART_MUTATION`, `ADD_TO_CART_MUTATION`, `UPDATE_CART_MUTATION`,
    `REMOVE_FROM_CART_MUTATION`, `GET_CART_QUERY`,
    `APPLY_DISCOUNT_MUTATION`
- Mapping dei dati Shopify → shape TechMania: `src/lib/shopify/mapProduct.js`
- Orchestrazione frontend: `src/lib/shopify/storefront.js`
- Proxy/azione server Convex: `convex/shopifyStorefront.ts` (azioni `config`,
  `checkout`)

### 3.2 Admin API (riservata, solo backend)

Usata per **sync prodotti/ordini/clienti** dal pannello admin.

- Implementazione: `convex/shopifySync.ts`
- Il token Admin **non** deve mai arrivare al browser.
- Il tab admin `ShopifyManager.jsx` salva dominio + token Storefront + token
  Admin come Convex `Settings` e invoca `shopify-sync` con `password`.

---

## 4. Flusso catalogo (frontend → Shopify)

1. `src/lib/useProducts.js` → `fetchCatalog()`
2. Chiama `loadShopifyCatalog()` (`src/lib/shopify/storefront.js`)
3. `resolveShopifyConfig()` risolve le credenziali:
   - **priorità**: variabili `VITE_SHOPIFY_STORE_DOMAIN` +
     `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` (build-time)
   - **altrimenti**: invoca `shopify-storefront` operation `config` su Convex,
     che a sua volta legge:
     - `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_SHOP_DOMAIN` da env Convex
     - oppure `Settings` salvate dal tab Admin (`shopify_shop_domain`,
       `shopify_storefront_access_token`)
4. `fetchShopifyProducts()` esegue GraphQL Storefront.
5. `shapeShopifyCatalog()` mappa prodotti, varianti, categorie, prezzi/stock e
   restituisce `settings.shopify_enabled = true`.

Se Shopify non è configurato:
- fallback su catalogo Convex via `base44.functions.invoke("catalog")`
- fallback finale su catalogo demo `src/lib/fallbackCatalog.js`.

Il segnale che il frontend usa Shopify è:
`catalogSource === 'shopify'` oppure `settings.shopify_enabled === true`
(usato in `Carrello.jsx` e `SchedaProdotto.jsx`).

---

## 5. Flusso checkout (Shopify vs Stripe)

### Caso Shopify (catalogo da Storefront)

In `Carrello.jsx` e `SchedaProdotto.jsx`:

1. Se `shopifyCheckout` è true, si richiede che ogni riga abbia
   `variant_id` che inizia con `gid://shopify/ProductVariant/`.
2. Si costruiscono le line `{ merchandiseId, quantity }`.
3. `shopifyCheckoutUrl(lines, discountCode)` (`src/lib/shopify/storefront.js`):
   - risolve la config (Vite env o Convex)
   - esegue `cartCreate` con `discountCodes` se presente
   - prende `cart.checkoutUrl`
   - redirige il browser a **Shopify Checkout hosted** (`window.location.href`).

Nota d'architettura: **questo flusso è client-side**. Non passa né da Vercel
`/api` né da Convex (tranne la risoluzione della config). Il carrello in
`StoreContext` resta un carrello locale React; per il checkout si crea un cart
Shopify "al volo" con le righe del carrello locale.

### Caso Stripe (fallback / catalogo Convex / demo)

1. `base44.functions.invoke("create-checkout-session", {...})`
2. `src/api/functions.js` mappa su `/api/create-checkout-session`
   (serverless Vercel) se disponibile.
3. `api/create-checkout-session.js` usa `src/lib/checkoutPricing.js`
   (`quoteCheckout`) per validare prezzi/stock/importo e crea una session
   Stripe.
4. In alternativa, se `VITE_CONVEX_URL` è configurata, può chiamare l'azione
   Convex `createCheckout` (`convex/createCheckout.ts`).

---

## 6. Connessione con Vercel

### 6.1 Serverless routes presenti

| Route | File | Funzione |
|---|---|---|
| `POST /api/create-checkout-session` | `api/create-checkout-session.js` | Creazione Checkout Stripe |
| `GET|POST /api/order` | `api/order.js` | Ricerca ordine Stripe (session_id / order_number / email) |
| `GET /api/stripe-status` | `api/stripe-status.js` | Stato configurazione/account Stripe |
| `POST /api/stripe-webhook` | `api/stripe-webhook.js` | Ricezione webhook Stripe (verifica firma) |

### 6.2 Cosa **non** c'è su Vercel

- Non esiste un endpoint `/api/shopify-*`.
- Le route Vercel non leggono `SHOPIFY_STORE_DOMAIN`,
  `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, né `SHOPIFY_ACCESS_TOKEN`.
- Se il progetto viene messo in produzione **solo su Vercel, senza Convex** e
  **senza** `VITE_SHOPIFY_*` in build, allora Shopify non viene usato e si
  resta su Stripe (o demo). Il percorso Shopify "vero" richiede Convex oppure
  token Storefront esposti via `VITE_`.

Questo è un punto da tenere presente se l'obiettivo è un deploy
"Vercel + Shopify senza Convex": `api/*` non fa da proxy Shopify.

---

## 7. Connessione con Convex

- `convex/schema.ts` + `convex/_crud.ts`: dati di catalogo, prodottivarianti,
  ordini, clienti, settings, discount, notifiche, integrazioni.
- `convex/catalog.ts`: catalogo pubblico.
- `convex/adminCms.ts`: operazioni admin (richiedono password).
- `convex/shopifyStorefront.ts`: azioni `config` e `checkout`.
- `convex/shopifySync.ts`: sync Admin API (ordini, clienti).
- `convex/http.ts`: route HTTP (webhook Stripe Convex, health, auth Google).
- `convex/auth.ts`: `convexAuth` con provider Google.

`src/api/functions.js` mappa i nomi `base44.functions.invoke` a funzioni
Convex in `convex/_generated/api.js`; l'uso di Convex dipende da
`VITE_CONVEX_URL`.

---

## 8. Regole di sicurezza / segreti (rilevanti per Shopify)

- I token Storefront sono "pubblici by design" e possono stare nel browser o
  essere restituiti da `shopify-storefront/config`.
- Il token **Admin API** non è mai esposto al browser:
  - risiede in Convex `Settings` o in env server;
  - `shopifySync` è protetto da `authenticateAdmin`.
- `VITE_SHOPIFY_*` finisce nel bundle JS; la documentazione
  (`SHOPIFY.md`) limita il loro uso al token Storefront.
- `SHOPIFY_ACCESS_TOKEN` non deve essere usato con prefisso `VITE_`.

---

## 9. Lettura del pannello admin Shopify

`src/components/admin/ShopifyManager.jsx` fornisce:

- salvataggio di dominio, storefront token, admin token (`save_creds`);
- test connessione Admin (`test`);
- sincronizzazione prodotti/ordini/clienti/tutto (`sync_*`);
- stato (`status`): mostra se Admin e Storefront sono configurati.

Lato backend `convex/shopifySync.ts` gestisce:
`status`, `save_creds`, `test`, `sync_orders`, `sync_customers`, `sync_all`.

---

## 10. Problemi / incoerenze riscontrate

### 🔴 10.1 «Sincronizza prodotti» non è implementato

`ShopifyManager.jsx` mostra il pulsante **Sincronizza prodotti** che invoca:

```js
sync('sync_products')
```

Ma in `convex/shopifySync.ts` **non esiste** il case `sync_products`:
resterebbe sul `default` → `"Operazione non valida"`.

Inoltre `sync_all` sincronizza solo **ordini + clienti**, non i prodotti.
L'unica funzione che sincronizza prodotti è `syncProducts()`, ma **non è mai
richiamata** dall'handler pubblico.

→ La documentazione `SHOPIFY.md` afferma che l'Admin tab può "importare
prodotti, ordini e clienti in Convex", ma il codice oggi non supporta
l'import prodotti.

### 🟠 10.2 `createCheckout` (Convex) ignora le credenziali Shopify da Admin

`convex/createCheckout.ts` legge Shopify solo da:

```js
process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_SHOP_DOMAIN
process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
```

Non chiama `resolveConfig`/`getSetting` come fa `convex/shopifyStorefront.ts`.
Quindi, se le credenziali Shopify sono state salvate dal tab Admin (Convex
`Settings`), `createCheckout` **non le vede** e ricadrebbe su Stripe, a meno
che non siano impostate anche come env Convex.

Il frontend normalmente evita `createCheckout` quando `settings.shopify_enabled`
è true (usa `shopifyCheckoutUrl`). Però la divergenza tra i due file è un
rischio per coerenza.

### 🟠 10.3 Il catalogo Shopify loader chiama prima le credenziali Vite, poi Convex

`src/lib/shopify/storefront.js` `resolveShopifyConfig()`:
- `VITE_SHOPIFY_*` ha precedenza assoluta;
- se non presente, invoca `shopify-storefront/config` su Convex;
- cache locale 5 minuti.

Questo comportamento è pensato per l'anteprima locale, ma in produzione può
creare confusione se `VITE_*` è impostata con un negozio di test mentre Convex
ha un negozio live (o viceversa).

### 🟡 10.4 Il carrello locale e il carrello Shopify sono separati

`StoreContext` mantiene un carrello React (`tm_cart`) usato dalla UI.
Shopify ha un proprio `cartId` salvato in `tm_shopify_cart_id`, ma il frontend
non usa le funzioni complete `shopifyAddToCart`, `shopifyUpdateLine`,
`shopifyRemoveLine`, `shopifyClearCart`, `shopifyApplyDiscount`; usa solo
`shopifyCheckoutUrl` che crea un cart Shopify nuovo a ogni checkout.

Vantaggi: UI del carrello resta semplice e "Apple-like".
Limiti/rischi:
- la logica di bundle, sconti locali e stock è decisa dal frontend, ma al
  checkout Shopify ricalcola/prende i suoi prezzi;
- eventuali modifiche al carrello Shopify (es. da Shopify webhooks o da altre
  sessioni) non vengono riflesse nell'UI;
- `discountCode` viene passato a `cartCreate`, quindi lo sconto è applicato da
  Shopify e non dal sistema locale.

### 🟡 10.5 I test non coprono il flusso live

I test (`tests/shopify.test.js`) coprono solo mapping/normalizzazione
(`mapProduct`, `mapShopifyCart`, `normalizeStoreDomain`). Non ci sono:
- test per `shopifySync.ts` (incluso `sync_products`);
- test mock di GraphQL per creazione cart/checkout;
- test e2e del passaggio `cart → checkoutUrl → redirect`.

---

## 11. Considerazioni di deploy (Vercel + Shopify)

### Scenario A — solo Vercel (static + `/api`), senza Convex

- Storefront: funziona solo se `VITE_SHOPIFY_STORE_DOMAIN` e
  `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` sono impostate **in build**.
- Checkout: funziona il flusso Shopify client-side (creazione cart + redirect).
  I token Storefront sono nel bundle.
- Admin Shopify (sync): **non funziona**, perché richiede Convex.
- Ordini Shopify: **non entrano in `/api`**, quindi `Api/order` (Stripe) non li
  trova; la ricerca ordini resta Stripe.

### Scenario B — Vercel + Convex (setup attuale documentato)

- Frontend su Vercel, backend Convex per CMS/auth/shopify.
- Shopify config: meglio in Convex (env o Settings da admin).
- Checkout Shopify: `shopifyCheckoutUrl` (client) oppure
  `shopifyStorefront/checkout` (server).
- Falback Stripe esistente via `/api` e/o Convex.

### Scenario C — si vuole "Vercel Storefront" davvero server-side (proxy Shopify)

Sarebbe necessario aggiungere route Vercel/proxy che:
- contengano `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN` come
  secret server-side;
- gestiscano GraphQL Storefront (catalogo + cart) senza esporre token al
  browser;
- funzionino anche senza Convex.

Oggi questo **non** esiste; `/api` è Stripe-only.

---

## 12. Sintesi e suggerimenti

Il progetto ha già una buona base:
- frontend React/Vite su Vercel;
- fallback Stripe serverless;
- integrazione Storefront e Admin API via Convex;
- mapping prodotti/carrello Shopify ben isolato e testato.

Le priorità, se si vuole completare/consolidare il percorso
**"Shopify + Vercel + Storefront"**:

1. **Implementare `sync_products`** in `convex/shopifySync.ts` e includerlo in
   `sync_all` (oppure togliere/disable il pulsante se non voluto).
2. **Uniformare la risoluzione config Shopify** in `createCheckout.ts` e
   `shopifyStorefront.ts`, leggendo Sia env che `Settings`.
3. **Decidere il ruolo di Vercel**: nel caso serva un vero proxy Storefront
   senza Convex, aggiungere `/api/shopify/storefront` (GraphQL proxy) o
   `/api/shopify/checkout`.
4. **Chiudere il gap UI/carrello Shopify**: decidere se mantenere il carrello
   locale oppure integrare davvero `tm_shopify_cart_id`.
5. **Aggiungere test per lo shopifySync** e mock GraphQL per `cartCreate`.

---

## 13. File chiave da cui partire

- `src/lib/shopify/client.js` — client GraphQL Storefront
- `src/lib/shopify/queries.js` — query/mutation
- `src/lib/shopify/mapProduct.js` — mapping Storefront → TechMania
- `src/lib/shopify/storefront.js` — risoluzione config + checkout
- `src/lib/useProducts.js` — loader catalogo (Shopify → Convex → fallback)
- `src/pages/Carrello.jsx`, `src/pages/SchedaProdotto.jsx` — trigger checkout
- `src/components/admin/ShopifyManager.jsx` — tab Admin Shopify
- `convex/shopifyStorefront.ts` — config/proxy GraphQL/checkout server-side
- `convex/shopifySync.ts` — Admin API sync (prodotti, ordini, clienti)
- `convex/createCheckout.ts` — checkout Stripe/Shopify via Convex
- `api/create-checkout-session.js` — checkout Stripe via Vercel
- `api/shopify-storefront.js` — **proxy Shopfy Storefront via Vercel**
- `src/api/functions.js` — dispatcher base44 → Vercel/Convex
- `vercel.json` — hosting SPA + serverless `/api`

---

## 14. Aggiornamento dopo il fix

I punti critici individuati in precedenza sono stati risolti in questo branch:

1. **`sync_products` è stato implementato** in `convex/shopifySync.ts` (`case
   "sync_products"`) ed è ora incluso anche in `sync_all`. La sync usa un
   checkpoint `shopify_products_checkpoint`; in modalità completa disattiva
   prodotti e varianti non più presenti su Shopify.
2. **Config Storefront unificata**: `resolveShopifyStorefrontConfig()` in
   `convex/lib/shared.ts` è usata sia da `shopifyStorefront.ts` che da
   `createCheckout.ts`, quindi legge sia env Convex sia `Settings` salvate dal
   tab Admin.
3. **Vercel ora può fare da proxy Shopify**: ogni chiamata Storefront può
   passare da `POST /api/shopify-storefront` (GraphQL proxy + `config` +
   `checkout`). Il token Storefront non è più restituito al browser: il client
   React usa la modalità `proxied`.
4. **Nessuna riga persa nel checkout misto**: `createCheckout.ts` rifiuta
   esplicitamente un carrello che mescoli varianti Shopify (`gid://...`) con
   varianti locali, invece di pagare solo una parte dell'ordine.
5. **Test aggiunti**: `tests/shopify-storefront-api.test.js` copre il proxy
   Vercel (config senza token, proxy GraphQL mock, 503 senza credenziali).
