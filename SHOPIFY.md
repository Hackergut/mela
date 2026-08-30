# Storefront Shopify

Il design Apple di TechMania resta su Vite + React. Il commercio (catalogo, varianti, checkout) può girare sulla **Storefront API** di Shopify, con lo stesso GraphQL della guida Next.js.

Non abbiamo riscritto l'app in Next.js: avremmo perso admin, integrazioni e il layout attuale. Il client GraphQL è lo stesso (`api/2025-01/graphql.json`).

## Cosa succede quando Shopify è collegato

1. Lo storefront legge i prodotti live da Shopify (prezzi, immagini, varianti, disponibilità).
2. **Aggiungi al carrello** resta l'UI attuale.
3. **Vai al pagamento / Acquista ora** crea un Cart Shopify e reindirizza a `checkoutUrl` (checkout hosted).
4. L'admin può importare prodotti, ordini e clienti via Admin API.

Se Shopify non è configurato, il sito continua a usare Convex / catalogo demo e Stripe.

## Credenziali

In Shopify Admin → **Impostazioni → App e canali di vendita → Sviluppa app**:

- **Storefront API**: token da usare per catalogo e checkout.
- **Admin API**: scope `read_products`, `read_orders`, `read_customers` per il sync in dashboard.

### Opzione A — secret Vercel (senza Convex, consigliata per lo storefront)

Imposta i secret sulle **Vercel Serverless Functions**:

```
SHOPIFY_STORE_DOMAIN=il-tuo-negozio.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ACCESS_TOKEN=...          # solo per sync admin
SHOPIFY_SHOP_DOMAIN=...           # alias accettato
```

Il frontend usa `POST /api/shopify-storefront` come **proxy server-side**: il
token Storefront non entra mai nel bundle né nella risposta `/config`. Il
catalogo, `cartCreate` e il redirect a Shopify Checkout passano da questo
endpoint. La migrazione verso Convex (`shopifyStorefront`) resta comunque
disponibile come fallback automatico se è impostata `VITE_CONVEX_URL`.

Nota: il sync Admin (prodotti/ordini/clienti) richiede Convex; in sola modalità
Vercel il catalogo live e il checkout funzionano, l'import in admin no.

### Opzione B — secret Convex (admin + storefront)

```
SHOPIFY_STORE_DOMAIN=il-tuo-negozio.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ACCESS_TOKEN=...          # solo per sync admin
SHOPIFY_SHOP_DOMAIN=...           # alias accettato
```

Il frontend chiede lo stato a Convex (`shopify-storefront` / `config`); il
token Storefront resta sul server e il GraphQL viene proxato
dall'azione Convex. In questo scenario sono disponibili anche il tab admin e
il sync Admin API.

### Opzione C — `.env.local` (solo anteprima dev senza backend)

```
VITE_SHOPIFY_STORE_DOMAIN=il-tuo-negozio.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
```

Le variabili `VITE_` finiscono nel bundle: usale solo per il token Storefront,
mai per l'Admin token.

### Opzione D — tab Admin → Shopify (Convex)

Salva dominio, token Storefront e token Admin. Poi:

- **Sincronizza prodotti** importa catalogo e varianti in Convex (cache / CMS),
  con checkpoint incrementale; la sincronizzazione completa disattiva i
  prodotti/varianti che non sono più su Shopify.
- **Sincronizza ordini / clienti** sono incrementali per `updated_at`.

Se il token Storefront è salvato qui, `createCheckout` e `shopifyStorefront`
lo leggono ugualmente tramite l'helper condiviso (`resolveShopifyStorefrontConfig`).

## File principali

| File | Ruolo |
|---|---|
| `src/lib/shopify/queries.js` | Query e mutation Storefront (come nella guida) |
| `src/lib/shopify/client.js` | Client GraphQL, con modalità `proxied` |
| `src/lib/shopify/mapProduct.js` | Mapping Shopify → shape TechMania |
| `src/lib/shopify/storefront.js` | Config + catalogo + checkout |
| `src/lib/useProducts.js` | Preferisce il catalogo Shopify |
| `api/shopify-storefront.js` | **Proxy Vercel** per config/GraphQL/checkout (i secret non entrano nel browser) |
| `convex/shopifyStorefront.ts` | Config + proxy GraphQL/checkout server-side |
| `convex/shopifySync.ts` | Admin API: **prodotti**, ordini, clienti |
| `convex/createCheckout.ts` | Checkout Shopify se le line sono GID, altrimenti Stripe |

## Verifica

```bash
npm test
npm run lint
npm run build
```

Apri `/` e `/catalogo`: i prodotti devono arrivare dal negozio. Aggiungi al carrello e premi **Vai al pagamento** — il browser deve aprire il checkout Shopify.
