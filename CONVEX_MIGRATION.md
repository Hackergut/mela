# Migrazione a Convex (backend autonomo)

Il progetto è stato **distaccato da Base44** e ora usa **Convex** come backend
completo (database reattivo, funzioni, file storage e webhook HTTP). Su Vercel i
prodotti e i dati non mancano più: bastano un deployment Convex, le variabili
d'ambiente e il seed del catalogo.

## Architettura

```
src/  ── (React invariato) ── base44.functions.invoke(...)  ──┐
                                                              ├─► src/api/base44Client.js (adapter)
                                                              │     • invoke()  → Convex action
                                                              │     • useCatalog() → Convex query reattiva
                                                              ▼
                                              convex/  (database + funzioni)
```

I componenti admin e dello storefront non sono stati riscritti: continuano a
chiamare `base44.functions.invoke("admin-cms", …)`, ma l'adapter in
`src/api/functions.js` instrada tutto su Convex.

### Funzioni Convex (`convex/`)

| File | Funzione | Sostituisce |
|---|---|---|
| `catalog.ts` | query pubblica prodotti/varianti/categorie/settings | `catalog` |
| `adminCms.ts` | CMS admin (CRUD, prodotti, ordini, resi, …) | `admin-cms` |
| `createCheckout.ts` | sessione Stripe Checkout + ordine pending | `create-checkout-session` |
| `http.ts` | webhook Stripe firmato (`/stripe-webhook`) + health | `stripe-webhook` |
| `integrationHub.ts` | Hub Integrazioni | `integration-hub` |
| `shopifySync.ts` | sincronizzazione Shopify | `shopify-sync` |
| `orderLookup.ts` | tracking pubblico ordini | `catalog` (`order_lookup`) |
| `seed.ts` | caricamento catalogo demo | — |
| `_crud.ts` | query/mutation interne riutilizzabili | — |

## Setup iniziale (una tantum)

```bash
npm install
npx convex dev        # apre il browser, crea/collega un progetto Convex
```

`npx convex dev` stampa il **Deployment URL** (es.
`https://your-name-123.convex.cloud`) e rigenera `convex/_generated/`.
Tienilo in esecuzione durante lo sviluppo: ad ogni salvataggio ridistribuisce
le funzioni.

### Variabili d'ambiente

Crea `.env.local` (già in `.gitignore`):

```bash
VITE_CONVEX_URL=https://your-name-123.convex.cloud
```

Secret lato server (dashboard Convex → **Settings → Environment Variables**,
oppure `npx convex env set`):

```bash
npx convex env set ADMIN_PASSWORD        '...'
npx convex env set SUPER_ADMIN_PASSWORD '...'
npx convex env set STRIPE_SECRET_KEY    'sk_live_...'
npx convex env set STRIPE_WEBHOOK_SECRET 'whsec_...'
npx convex env set STRIPE_PUBLISHABLE_KEY 'pk_live_...'
npx convex env set PUBLIC_APP_URL       'https://tuo-dominio.it'
# Opzionali:
npx convex env set SHOPIFY_SHOP_DOMAIN  'negozio.myshopify.com'
npx convex env set SHOPIFY_ACCESS_TOKEN 'shpat_...'
```

### Carica i prodotti (seed)

```bash
npm run convex:seed
# oppure: npx convex run seed:default
```

Lo seed crea categorie, prodotti con varianti/colori/gallerie (usando le
immagini già pubblicate) e i settaggi predefiniti. Per ricaricare da zero:

```bash
npx convex run seed:default '{"reset":true}'
```

## Stripe webhook

Su Stripe → Sviluppatori → Webhook, registra l'endpoint:

```
<CONVEX_SITE_URL>/stripe-webhook
```

Il `<CONVEX_SITE_URL>` è quello mostrato da `npx convex dev` (stesso host della
funzione, es. `https://your-name-123.convex.site`). Eventi:

- `checkout.session.completed`
- `checkout.session.expired`

Copia il segreto di firma `whsec_…` e impostalo come `STRIPE_WEBHOOK_SECRET`.

## Deploy su Vercel

1. **Deploy Convex in produzione**:
   ```bash
   npx convex deploy        # deploy delle funzioni
   npm run convex:seed      # seed del catalogo in produzione
   ```
2. Su Vercel → Project → **Settings → Environment Variables** aggiungi:
   - `VITE_CONVEX_URL` = l'URL di produzione Convex (`…convex.cloud`)
3. Imposta anche i secret lato server su Convex produzione con
   `npx convex env set --prod …` o dalla dashboard.
4. Ridistribuisci su Vercel.

> `VITE_CONVEX_URL` è una variabile pubblica (con prefisso `VITE_`) perché il
> browser deve aprire la connessione reattiva a Convex. I secret riservati
> (`ADMIN_PASSWORD`, chiavi Stripe, token Shopify) restano **solo** nelle
> environment variables Convex e non sono mai esposti al browser.

## Storage immagini

Le immagini demo attuali puntano agli URL pubblici storici
(`media.base44.com/images/...`) e continuano a funzionare. Per caricare nuove
immagini usa lo storage file di Convex (`ctx.storage.generateUploadUrl`) e salva
l'URL restituito nel campo `image`/`images`; l'admin Asset Library è pronto per
essere collegato a quel flusso.

## Note

- L'autenticazione clienti (OTP/OAuth) di Base44 non è più attiva. L'admin usa
  la password condivisa invariata; per gli account cliente si può attivare
  **Convex Auth** in un secondo momento (lo schema `users` è già predisposto).
- Per aggiungere un'integrazione vedi `INTEGRATIONS.md` (ora il registro vive
  in `convex/shared/integrations.js`).
