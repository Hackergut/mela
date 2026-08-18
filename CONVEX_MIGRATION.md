# Backend Convex — setup e deploy

Il progetto usa **Convex** come backend (database reattivo, funzioni, webhook e
storage). Base44 è stato completamente rimosso.

```
React app  ──ConvexReactClient (convex/react)──►  Convex
            └─ HTTP action via adapter           (funzioni in convex/)
```

## 1. Primo collegamento (una tantum)

```bash
npm install
npm run convex:dev        # = npx convex dev
```

Al primo avvio:
1. si apre il browser: **crea un account Convex** (gratuito) e un progetto;
2. il CLI scarica le env vars in `.env.local` con `VITE_CONVEX_URL=...` e
   `CONVEX_DEPLOYMENT=...`;
3. Convex carica schema e funzioni e genera `convex/_generated/`.

Lascia `convex dev` in esecuzione durante lo sviluppo: rigenera i tipi e
ridistribuisce le funzioni ad ogni salvataggio.

## 2. Secret lato server

Dalla dashboard Convex → **Settings → Environment Variables** (o via CLI):

```bash
npx convex env set ADMIN_PASSWORD         '...'
npx convex env set SUPER_ADMIN_PASSWORD '...'
npx convex env set STRIPE_SECRET_KEY     'sk_live_...'
npx convex env set STRIPE_WEBHOOK_SECRET 'whsec_...'
npx convex env set STRIPE_PUBLISHABLE_KEY 'pk_live_...'
npx convex env set PUBLIC_APP_URL        'https://tuo-dominio.it'
# Opzionali:
npx convex env set SHOPIFY_SHOP_DOMAIN   'negozio.myshopify.com'
npx convex env set SHOPIFY_ACCESS_TOKEN 'shpat_...'
```

In **produzione** aggiungi `--prod`:

```bash
npx convex env --prod set ADMIN_PASSWORD '...'
```

## 3. Carica il catalogo (seed)

```bash
npm run convex:seed                  # dev
npx convex deploy --cmd-check 'npm run build'
npx convex run --prod seed:default   # produzione
```

Lo seed crea categorie, prodotti, varianti (per colore), gallerie immagini e
le impostazioni predefinite. Per ricaricare da zero:

```bash
npx convex run seed:default '{"reset":true}'
```

## 4. Avvio locale

```bash
npm install
npm run convex:dev     # termina A: backend Convex (restando in esecuzione)
npm run dev            # termina B: Vite su http://localhost:5173
```

Vite legge `VITE_CONVEX_URL` da `.env.local` creato da `convex dev`.

## 5. Deploy di produzione

```bash
# 1) Funzioni Convex in produzione
npm run convex:deploy         # = npx convex deploy

# 2) Seed in produzione (solo la prima volta)
npx convex run --prod seed:default

# 3) Frontend (Vercel)
#    Imposta la variabile pubblica:
#      VITE_CONVEX_URL = https://<prod>.convex.cloud
```

L'URL di produzione si trova nella dashboard Convex → **Settings → Deployment
URL** (quello etichettato "production", di solito privo di numeretto).

## 6. Webhook Stripe

Nella dashboard Stripe → **Developers → Webhooks → Add endpoint**:

```
URL:            https://<deployment>.convex.site/stripe-webhook
Eventi:         checkout.session.completed
                checkout.session.expired
```

Copia il **Signing secret** (`whsec_...`) e impostalo come
`STRIPE_WEBHOOK_SECRET`.

## Mappa delle funzioni

| Funzione Convex | Tipo | Note |
|---|---|---|
| `catalog:default` | query | Catalogo pubblico reattivo |
| `adminCms:default` | action | CRUD admin (prodotti, ordini, resi, …) |
| `createCheckout:default` | action | Crea ordine + sessione Stripe |
| `integrationHub:default` | action | Hub Integrazioni |
| `shopifySync:default` | action | Sincronizzazione Shopify |
| `orderLookup:default` | action | Tracking pubblico ordini |
| `_crud:*` | internal | Query/mutation interne |
| `seed:default` | mutation | Carica il catalogo demo |
| `http:default` | http | Webhook Stripe + `/health` |

## Note

- **Immagini**: le immagini demo sono URL assoluti storici e funzionano. Per
  caricare file nuovi usa lo storage Convex (`ctx.storage`).
- **Account cliente**: l'autenticazione dei clienti non è attiva; l'admin usa la
  password condivisa. Per gli account cliente si può attivare Convex Auth in un
  secondo momento (lo schema `users` è predisposto).
- Se `VITE_CONVEX_URL` non è impostato, il sito mostra comunque il catalogo
  integrato (44 prodotti) in modalità demo.
