# Audit tecnico e ottimizzazione — TechMania

_Data audit: 15 agosto 2026 · baseline: `50da0532fa6547e0901f73d914d11319a2a2618e`_

> ## Aggiornamento — 18 agosto 2026
>
> Interventi successivi all'audit, verificati con lint/typecheck/test/build:
>
> - **React Router 6 → 7.18.2**: risolte entrambe le vulnerabilità moderate segnalate da `npm audit` (CVE-2025-68470 bypass e injection in hydration). `npm audit` ora riporta **0 vulnerabilità**. I flag `future` v6 sono stati rimossi (default in v7).
> - **CI effettivamente presente**: la pipeline `.github/workflows/ci.yml` citata nel report non era stata inclusa nel repository; ora è committata (npm ci + lint + typecheck + test + build su ogni push/PR).
> - **Rate limiting sul login admin** (mitigazione interim della priorità alta #1): 5 tentativi falliti per IP → lockout 10 minuti con `Retry-After`, sia su `admin-cms` sia su `shopify-sync` (che condivide le stesse password). Confronto password a tempo costante.
> - **Diagnosi accesso admin**: se i secret `ADMIN_PASSWORD`/`SUPER_ADMIN_PASSWORD` non sono impostati, il server risponde ora 503 con istruzioni esplicite invece del generico 401 «Password non valida»; la schermata di login mostra la procedura di configurazione. Guida completa in `ADMIN_ACCESS.md`.
> - **Ledger eventi webhook + riconciliazione** (priorità alta #2, parte 1 e 3): nuova entità `WebhookEvent`; i duplicati sequenziali vengono scartati prima di qualsiasi mutazione e gli effetti secondari falliti (CRM, sconto, notifiche) restano segnati come `effects_pending`. L'operazione admin `reconcile_order` ricalcola in modo idempotente totali cliente e utilizzi sconto dagli ordini pagati e chiude gli eventi in sospeso (pulsante nell'area Ordini). La finestra di gara per consegne perfettamente simultanee resta aperta in assenza di un vincolo univoco a livello piattaforma.
> - **Setup Stripe verificabile**: `payment_status` identifica l'account collegato (`acct_…`, nome, paese, payout) e lo stato di `PUBLIC_APP_URL`; guida completa in `STRIPE_SETUP.md`.
> - **UX e-commerce completata**: pagina di conferma ordine `/ordine` (con `success_url` Stripe basata su session id), tracciamento ordine pubblico `/traccia-ordine` con timeline, tracking corriere e lookup rate-limited, prodotti correlati e visti di recente sulla scheda prodotto, ricerca rapida in navbar, breadcrumb, link ordini nel footer/menu.
> - **Test estesi** (priorità media #6): 16 test (timeline ordine, mascheramento email, link corrieri, correlati, formattazioni).
> - **Pipeline immagini estese**: il componente `Image` serve ora anche gli URL `cdn.shopify.com` ridimensionati (`width`/`height`/`crop` + srcset DPR come per Wix Media); gli URL esterni senza API di trasformazione ricevono default sicuri (`object-fit` coerente con `fittingType`, `max-w-full`, lazy + decoding async) — elimina le immagini sproporzionate nei contenuti sincronizzati o caricati con URL arbitrari.
> - **Admin panel mobile**: header e toolbar della console si impilano/a capo su schermi stretti, tab nav scorrevole a filo bordi, tabelle prodotti/ordini/clienti con larghezza minima e scroll orizzontale invece di colonne compresse, toolbar dei manager con `flex-wrap` ovunque.
> - **Storefront mobile**: barra filtri catalogo allineata alla navbar sticky con padding ridotti su mobile; griglie già responsive verificate su tutte le pagine.

## Sintesi

Il progetto è una SPA e-commerce React 18/Vite 6 con backend serverless Base44, entità JSONC, checkout Stripe e sincronizzazione Shopify. L'intervento ha privilegiato modifiche compatibili: nessun cambio di framework o di modello dati distruttivo, mantenimento di React Router 6 e delle API Base44 esistenti.

Risultati principali:

- chunk JavaScript principale ridotto da **1.578,65 kB / 468,03 kB gzip** a **366,74 kB / 120,50 kB gzip** (**-76,8% / -74,3%**);
- dashboard admin monolitica da **961,99 kB / 274,81 kB gzip** sostituita da una shell da **25,75 kB / 7,61 kB gzip**, con ogni sezione caricata solo quando aperta;
- errori del typecheck ridotti da **189 a 0**;
- vulnerabilità npm ridotte da **10 (5 high)** a **2 moderate (0 high/critical)**;
- rimosse **15 dipendenze dirette inutilizzate** e **111 pacchetti installati** (`npm ci`: 628 → 517);
- aggiunti test unitari senza nuove dipendenze e una pipeline CI completa;
- checkout, webhook Stripe, CMS e integrazione Shopify irrobustiti sul server.

## Struttura e stack

| Area | Tecnologia / impostazione |
|---|---|
| Frontend | React 18, Vite 6, React Router 6, Tailwind CSS 3 |
| Dati client | SDK Base44, TanStack Query 5, Context per autenticazione/store locale |
| UI | Radix UI, Lucide, Framer Motion, Recharts |
| Backend | Funzioni Base44/Deno e servizio Base44 con entità JSONC |
| Pagamenti | Stripe Checkout + webhook firmato |
| Integrazioni | Shopify Admin API |
| Qualità | ESLint 9, TypeScript `checkJs`, Node test runner, GitHub Actions |

La separazione tra storefront, console amministrativa e funzioni backend è adeguata alle dimensioni attuali. I manager admin restano componenti indipendenti; lo split per tab evita però che grafici, PDF e canvas entrino nel percorso pubblico.

## Miglioramenti applicati

### Prestazioni

- Tutte le pagine sono ora importate con `React.lazy` e protette da un boundary `Suspense`.
- Le sezioni sotto la prima viewport della home vengono caricate in chunk distinti; hero e contenuto iniziale restano immediati.
- Ogni manager admin, il form prodotto e gli strumenti pesanti sono caricati on demand.
- `recharts`, `jspdf`, `html2canvas` e DOMPurify sono isolati nei tab che li usano.
- Il catalogo usa una query TanStack condivisa con deduplicazione, cache di 5 minuti e garbage collection di 30 minuti.
- I context espongono callback stabili e valori memoizzati, riducendo render non necessari.
- Il rilevamento dimensioni usa un solo `ResizeObserver` condiviso invece di un observer per componente.
- Immagine hero impostata eager/high-priority; immagini non critiche lazy e con fallback più robusto.
- Categorie senza prodotti non vengono renderizzate.

### Qualità e affidabilità

- Sistemate annotazioni JSDoc e firme `forwardRef` nei componenti UI condivisi.
- Corrette firme di props/eventi, accesso a browser API e storage in contesti con SSR o privacy restriction.
- Abilitata la copertura ESLint su tutto `src`, sulle funzioni Base44 e sui test.
- Abilitata e risolta la regola `react-hooks/exhaustive-deps`: **0 errori e 0 warning** nel lint completo.
- Corretta la verifica asincrona della connessione Stripe, che prima leggeva uno state precedente all'aggiornamento.
- Centralizzata la conversione dei prezzi in centesimi; supportati formati `€1.199,99`, `1.199` e `19.99`.
- I prodotti creati in bulk ora ricevono sempre `price_cents`; prima potevano essere visibili ma non acquistabili.
- Il totale carrello usa centesimi interi e formattazione valutaria, evitando errori da floating point o separatori locali.
- Validazione del corriere prima dell'aggiornamento e campo note ripristinato nel form ricevute.

### Dipendenze

Sono state eliminate librerie mai importate, tra cui Stripe client-side, editor/markdown/mappe/Three.js, lodash, moment, date-fns, zod e drag-and-drop. React Router, TanStack Query e PostCSS sono stati aggiornati entro major compatibili; il database Browserslist è aggiornato.

Non sono stati applicati automaticamente upgrade major (React 19, React Router 7, Vite 8, Tailwind 4, Recharts 3): richiedono una migrazione e test di regressione dedicati.

### Sicurezza backend

#### Checkout Stripe

- Il client invia solo `productId` e codice sconto.
- Nome, descrizione, immagine, prezzo, stato e stock vengono riletti server-side.
- Prezzo in centesimi, sconto, scadenza e limite utilizzi vengono validati prima di creare l'ordine.
- Gli importi non possono diventare negativi o inferiori al minimo Stripe.
- I redirect di produzione provengono esclusivamente da `PUBLIC_APP_URL`; il fallback da header è limitato a localhost, eliminando l'open redirect post-pagamento.
- Se Stripe rifiuta la sessione, l'ordine viene annullato mantenendo una traccia di audit.

#### Webhook Stripe

- Verifica firma sul body raw e gestione del solo evento previsto.
- Verifica incrociata di ordine, stato, session ID, valuta e totale.
- Registrazione di `stripe_event_id` e `paid_at`.
- Protezione dai retry sequenziali prima di aggiornare CRM, sconti, stock e notifiche.
- Errori negli effetti secondari non causano applicazioni duplicate dovute a retry Stripe.

#### CMS amministrativo

- Il token Shopify non viene più restituito dalle liste di setting.
- Creazione, modifica, eliminazione e bulk delete dei setting protetti rispettano il ruolo super admin.
- Operazioni bulk limitate a 500 ID.
- Gli errori interni e i dettagli Stripe non vengono serializzati nelle risposte client.

#### Shopify

- Dominio normalizzato e vincolato a `https://*.myshopify.com`.
- Anche gli URL di paginazione sono confinati allo stesso origin, mitigando SSRF e furto del token via `Link` malevolo.
- Token limitato e mai restituito in chiaro.
- Supporto preferenziale ai secret runtime `SHOPIFY_SHOP_DOMAIN` e `SHOPIFY_ACCESS_TOKEN`.
- Versione API aggiornata da `2024-01` a `2025-10`.
- I dettagli delle risposte Shopify restano nei log server e non vengono esposti al browser.

### Metadata e identità

- Rimossi titolo e favicon placeholder Base44.
- Aggiunti lingua italiana, descrizione SEO, Open Graph, colore tema e referrer policy.
- Aggiunti favicon SVG e web manifest locali TechMania.
- Allineati a TechMania anche i valori iniziali delle impostazioni e le ricevute PDF.

## Test e verifiche finali

| Comando | Esito |
|---|---|
| `npm ci` | OK — 517 pacchetti installati, 518 verificati |
| `npm test` | OK — 4/4 test |
| `npx eslint .` | OK — 0 errori, 0 warning |
| `npm run typecheck` | OK — 0 errori |
| `npm run build` | OK — 3.072 moduli, 10,17 s |
| `npm audit` | 2 moderate, 0 high, 0 critical |
| `git diff --check` | OK |

La workflow `.github/workflows/ci.yml` esegue installazione riproducibile, test, lint, typecheck e build su ogni pull request.

## Rischi residui e prossimi passi

### Priorità alta

1. **Autenticazione CMS** — il CMS usa ancora una password condivisa conservata in `sessionStorage`, senza rate limiting/lockout. Migrare a identità Base44, ruoli server-side per utente e sessioni revocabili; aggiungere rate limiting nel frattempo.
2. **Atomicità webhook** — lo stato ordine blocca i duplicati sequenziali, ma due invocazioni perfettamente simultanee possono leggere entrambe `pending`. Introdurre un event ledger con vincolo univoco/transazione o una primitive compare-and-set. Aggiungere una coda di riconciliazione per gli effetti secondari falliti.
3. **React Router** — `npm audit` segnala due advisory moderate. La correzione disponibile richiede React Router 7. L'esposizione attuale è ridotta perché l'app usa `BrowserRouter`, link interni e non usa hydration SSR, ma la migrazione major va pianificata e testata.

### Priorità media

4. **Credenziali Shopify** — ruotare il token attuale e configurarlo come secret runtime; rimuovere il fallback persistito nell'entità solo dopo aver verificato tutti gli ambienti.
5. **Shopify GraphQL** — la REST Admin API è legacy. Migrare sincronizzazione ordini/clienti a GraphQL e aggiungere checkpoint incrementali invece di rileggere tutto lo storico.
6. **Copertura test** — la suite iniziale verifica visibilità catalogo e prezzi. Aggiungere test di integrazione per checkout/webhook con fixture Stripe, test CMS/RBAC ed E2E dei flussi principali.
7. **Accessibilità** — eseguire un audit automatico/manuale WCAG su dialoghi e tabelle admin, focus management, pulsanti solo icona e contrasto.

### Priorità bassa

8. Introdurre pagination/cursori nel CMS oltre il limite attuale di 500 record.
9. Valutare uno split ulteriore del chunk Navbar/vendor e una strategia CSS per route se la dimensione iniziale torna a crescere.
10. Aggiungere monitoraggio errori, metriche webhook e alert per ordini pagati con effetti secondari da riconciliare.
