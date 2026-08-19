# Pagamenti Stripe — setup (techmania.pro)

Il checkout Stripe **non dipende più da Convex**. Le funzioni Vercel in `api/`
creano la sessione, verificano il webhook e recuperano l'ordine da Stripe.

## Cosa ho già fatto io (codice)
- Checkout server-side in EUR con creazione ordine `pending` e aggiornamento a
  `paid` via webhook firmato (idempotente).
- Verifica di prezzi, stock, sconti e spedizioni **sul server** (mai dal browser).
- URL di successo `https://techmania.pro/ordine?session_id=...` e di annullo.
- Stato connessione Stripe visibile in **Impostazioni → Pagamenti** dell'admin.

---

## Passaggi che devi fare TU (10 minuti)

### 1. Recupera le chiavi (Stripe Dashboard, modalità TEST)
Apri https://dashboard.stripe.com/test/apikeys (assicurati che l'interruttore
**Modalità di test** in alto a destra sia attivo). Ti servono:

- **Chiave segreta** `sk_test_...`  ⚠️ NON condividerla con nessuno.
- **Chiave pubblicabile** `pk_test_...`  (quella che mi hai già dato va bene).

### 2. Crea il webhook
1. Vai su https://dashboard.stripe.com/test/webhooks → **Aggiungi endpoint**.
2. **URL dell'endpoint**:
   ```
   https://tuo-dominio/api/stripe-webhook
   ```
3. **Eventi da ascoltare** → aggiungi:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Salva, poi clicca sul webhook creato → **Rivela** il
   **Segreto di firma** (`whsec_...`). Copialo.

### 3. Inserisci i secret su Vercel
Vercel → progetto → **Settings → Environment Variables** (Production + Preview):

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (o `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` / `pk_live_...` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID Web Google (OAuth) |
| `PUBLIC_APP_URL` | `https://techmania.pro` (opzionale: si usa l'origine della richiesta) |

Poi **Redeploy**. Non serve Convex per pagare o per accedere con email/Google.

### 4. Carica i prodotti (se non l'hai fatto)
Convex → **Functions** → `seed` → `default` → Arguments `{}` → **Run**.
(Crea i 44 prodotti demo con varianti e categorie.)

### 5. Redeploy Vercel
Assicurati che in Vercel → **Settings → Environment Variables** ci sia:
- `VITE_CONVEX_URL` = l'URL Cloud di **produzione** Convex.
Poi **Deployments → ⋯ → Redeploy**.

---

## Provare un pagamento (test)
Usa una carta di test:
- Numero: **`4242 4242 4242 4242`**
- Scadenza: una data futura (es. `12/34`)
- CVC: qualunque (es. `123`)

Altre carte di test (es. 3D Secure, fondi insufficienti):
https://stripe.com/docs/testing

## Andare in produzione (dopo i test)
Quando i test funzionano:
1. In Stripe attiva il conto business e passa alla **modalità Live**.
2. Crea un secondo webhook live sullo stesso URL e prendi il `whsec_...` live.
3. In Convex aggiorna le variabili con le chiavi `sk_live_...` / `pk_live_...` /
   `whsec_...` live.
4. Fai un Redeploy.

## Risoluzione
- **Pagamento non aggiorna l'ordine** → quasi sempre `STRIPE_WEBHOOK_SECRET`
  sbagliato o webhook non creato. Controlla i log del webhook su Stripe.
- **"Checkout non configurato"** → manca `STRIPE_SECRET_KEY` o `PUBLIC_APP_URL`.
- **"Store non disponibile"** → manca `VITE_CONVEX_URL` su Vercel o Convex non ha
  le funzioni deployate.
