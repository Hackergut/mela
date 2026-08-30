# Storefront Shopify

Il design Apple di TechMania resta su Vite + React. Il commercio (catalogo, varianti, checkout) può girare sulla **Storefront API** di Shopify, con lo stesso GraphQL della guida Next.js.

Non abbiamo riscritto l'app in Next.js: avremmo perso admin, integrazioni e il layout attuale. Il client GraphQL è lo stesso (`api/2026-07/graphql.json`).

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

### Opzione A — secret Convex (consigliata)

```
SHOPIFY_STORE_DOMAIN=il-tuo-negozio.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ACCESS_TOKEN=...          # solo per sync admin
SHOPIFY_SHOP_DOMAIN=...           # alias accettato
```

Il frontend chiede dominio + token Storefront a Convex (`shopify-storefront` / `config`). Il token Storefront è pensato per l'uso pubblico (non può scrivere in Admin).

### Opzione B — `.env.local` (anteprima senza Convex)

```
VITE_SHOPIFY_STORE_DOMAIN=il-tuo-negozio.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
```

Le variabili `VITE_` finiscono nel bundle: usale solo per il token Storefront, mai per l'Admin token.

### Opzione C — tab Admin → Shopify

Salva dominio, token Storefront e token Admin. Poi:

- **Sincronizza prodotti** importa catalogo e varianti in Convex (cache / CMS).
- **Sincronizza ordini / clienti** come prima.

## File principali

| File | Ruolo |
|---|---|
| `src/lib/shopify/queries.js` | Query e mutation Storefront (come nella guida) |
| `src/lib/shopify/client.js` | Client GraphQL |
| `src/lib/shopify/mapProduct.js` | Mapping Shopify → shape TechMania |
| `src/lib/shopify/storefront.js` | Catalogo + checkout |
| `src/lib/useProducts.js` | Preferisce il catalogo Shopify |
| `convex/shopifyStorefront.ts` | Config pubblica + checkout server-side |
| `convex/shopifySync.ts` | Admin API: prodotti, ordini, clienti |
| `convex/createCheckout.ts` | Checkout Shopify se le line sono GID, altrimenti Stripe |

## Verifica

```bash
npm test
npm run lint
npm run build
```

Apri `/` e `/catalogo`: i prodotti devono arrivare dal negozio. Aggiungi al carrello e premi **Vai al pagamento** — il browser deve aprire il checkout Shopify.
