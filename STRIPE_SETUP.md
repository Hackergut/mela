# Configurazione pagamenti Stripe — TechMania

_Guida per collegare un **nuovo account Stripe** (già creato) al checkout del negozio._

> **Dominio configurato (techmania.pro):** con i record DNS `A @ → 2.57.91.91` e
> `CNAME www → techmania.pro`, imposta `PUBLIC_APP_URL=https://techmania.pro` e
> registra su Stripe l'endpoint `https://techmania.pro/apps/<APP_ID>/functions/stripe-webhook`
> (oppure l'equivalente su `www.techmania.pro`, coerente con il dominio scelto come canonico).

## Come funziona il flusso (già implementato)

```
Carrello ──▶ funzione create-checkout-session ──▶ Stripe Checkout (pagina di pagamento Stripe)
                     │ crea ordine "pending"                │ pagamento
                     ▼                                     ▼
            Base44 Orders entity  ◀──  funzione stripe-webhook (firma verificata)
                     │                     ├─ ordine → "paid" + dati cliente/spedizione
                     │                     ├─ sconto: usage_count +1
                     │                     ├─ stock decrementato (+ notifica se basso)
                     └─ redirect a /scheda-prodotto o /carrello con ?payment=success
```

Prezzi, stock e sconti sono **riletti server-side**: il browser non può alterare gli importi. Nessun codice va modificato per cambiare account — **basta aggiornare i secret**.

## I 4 secret da impostare su Base44

| Secret | Dove trovarlo su Stripe | A cosa serve |
|---|---|---|
| `STRIPE_SECRET_KEY` | Sviluppatori → **Chiavi API** → `sk_test_…` / `sk_live_…` (copiare la *Secret key*) | Crea le sessioni di checkout, verifica il webhook, legge il saldo |
| `STRIPE_PUBLISHABLE_KEY` | Stessa pagina → `pk_…` | Solo indicazione di stato nel pannello admin |
| `STRIPE_WEBHOOK_SECRET` | Sviluppatori → **Webhook** → endpoint → *Chiave di firma* `whsec_…` (dopo il punto 2 sotto) | Verifica la firma degli eventi in arrivo |
| `PUBLIC_APP_URL` | L'URL **pubblico** del sito, es. `https://techmania.base44.app` | Redirect di successo/annullamento; **senza questo il checkout in produzione risponde «Checkout non configurato» (503)** |

> Facoltativo: `BASE44_APP_ID` (solo metadato dell'ordine).

## Procedura con il nuovo account

### 1. Imposta le chiavi su Base44

**Opzione A — Builder Base44 (consigliata)**
Apri il progetto → **Dashboard → Integrations → Stripe** → incolla *Secret key* e *Publishable key* del nuovo account.

**Opzione B — CLI**

```bash
base44 secrets set STRIPE_SECRET_KEY='sk_test_…' \
                  STRIPE_PUBLISHABLE_KEY='pk_test_…' \
                  PUBLIC_APP_URL='https://tuo-dominio'
```

> Le chiavi `sk_test`/`pk_test` valutano in **modalità test**; le `sk_live`/`pk_live` in **live**. La modalità attiva è mostrata nel pannello admin.

### 2. Registra il webhook nel nuovo account Stripe

1. Su Stripe: **Sviluppatori → Webhook → Aggiungi endpoint**.
2. **URL dell'endpoint**:
   ```
   https://TUO-DOMINIO/apps/TUO_APP_ID/functions/stripe-webhook
   ```
   (`TUO_APP_ID` è visibile nel Builder Base44; in locale la funzione è servita da `base44 dev`.)
3. **Eventi da selezionare** (esattamente questi due):
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Salva → copia la **chiave di firma** `whsec_…` e impostala:
   ```bash
   base44 secrets set STRIPE_WEBHOOK_SECRET='whsec_…'
   ```

### 3. Verifica dal pannello admin

`/admin` → tab **Impostazioni** → sezione **Pagamenti (Stripe)**:

- ✅ Connessione Stripe · Modalità (Test/Live) · Webhook · Publishable · Redirect sito
- **Account Stripe collegato**: mostra `acct_…`, nome attività e paese — **controlla che sia il nuovo account**, non il vecchio
- Saldo disponibile/in attesa · pulsante **Test connessione**

### 4. Prova un pagamento (modalità test)

1. Aggiungi un prodotto al carrello → **Vai al checkout**.
2. Sulla pagina Stripe paga con: carta **`4242 4242 4242 4242`**, scadenza futura qualsiasi, CVC qualsiasi.
3. Verifica: redirect «Pagamento completato», ordine **paid** nell'admin, stock decrementato, eventuale notifica.

## Passare a live (go-live)

- [ ] Account nuovo: profilo aziendale e **payout abilitati** (il pannello mostra ⚠️ se non lo sono)
- [ ] Sostituisci le chiavi con `sk_live_…` / `pk_live_…`
- [ ] Ricrea/attiva il webhook **in modalità live** su Stripe (i webhook test e live sono separati: nuovo `whsec_live…`)
- [ ] `PUBLIC_APP_URL` = dominio pubblico definitivo
- [ ] Un pagamento reale di piccolo importo di verifica
- [ ] Vecchio account: **rimuovi l'endpoint webhook** e revoca le vecchie chiavi

## Risoluzione problemi

| Sintomo | Causa | Rimedio |
|---|---|---|
| «Checkout non configurato» (503) al checkout | `STRIPE_SECRET_KEY` o `PUBLIC_APP_URL` mancanti | Imposta i secret (tabella sopra) e riprova |
| Ordini rimasti `pending` dopo il pagamento | Webhook non registrato / `STRIPE_WEBHOOK_SECRET` sbagliato / eventi mancanti | Rifai il punto 2; su Stripe → Webhook → *tentativi di consegna* per il dettaglio degli errori |
| «Invalid webhook» nei log | Firma non corrispondente (endpoint di un altro account o whsec test/live mescolati) | Rigenera il segreto dell'endpoint e aggiorna il secret |
| Il pannello mostra il vecchio account | Chiavi del vecchio account ancora impostate | Guarda «Account Stripe collegato» e sovrascrivi `STRIPE_SECRET_KEY` |
| Pagamenti riusciti ma saldo 0 / valuta strana | Stai guardando il test mode | Sul dashboard Stripe attiva/disattiva **Modalità test** |

## Note di sicurezza (già attive nel codice)

- Verifica firma sul body raw; solo gli eventi attesi vengono processati.
- Idempotenza: consegne duplicate non duplicano stock, contatori sconto o clienti.
- Verifica incrociata ordine↔sessione (importo, valuta, session ID) prima di qualsiasi movimento.
- Gli importi derivano sempre dal catalogo server-side; il minimo Stripe (0,50 €) è rispettato.
- Le chiavi non vengono mai restituite al browser: il pannello mostra solo la presenza e i dati pubblici dell'account.
