# Pagamenti Stripe — setup (techmania.pro)

Il backend è già pronto: la funzione `createCheckout` crea una sessione Stripe
Checkout, `http.ts` riceve il webhook firmato, aggiorna l'ordine, decrementa lo
stock, crea clienti/notifiche e spedisce i webhook di automazione. Manca solo la
configurazione di 3 chiavi e dell'endpoint webhook.

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
   https://acoustic-flamingo-875.convex.site/stripe-webhook
   ```
3. **Eventi da ascoltare** → aggiungi:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Salva, poi clicca sul webhook creato → **Rivela** il
   **Segreto di firma** (`whsec_...`). Copialo.

### 3. Inserisci i secret in Convex
Sono variabili d'ambiente **lato server** (non vanno su Vercel).
Dashboard Convex → progetto `acoustic-flamingo-875` (ambiente **production**)
→ **Settings → Environment Variables** → aggiungi:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | password per accedere all'admin |
| `SUPER_ADMIN_PASSWORD` | password per i settaggi principali |
| `PUBLIC_APP_URL` | `https://techmania.pro` |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_51U57MaJPrsrxAt5rCQaEPmTuc4X9PCjO89gTqpGQ6KeXeY6mKdQtSTyZqePQJ80eErFXKqSGK5HrbEaHcWZKrpJK00iY8NpMCJ` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

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
