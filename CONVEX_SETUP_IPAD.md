# Configurare Convex da iPad (tutto via browser)

Non serve il terminale: un **GitHub Action** distribuisce funzioni e catalogo su
Convex in automatico a ogni push su `main`. Tu crei solo una chiave di deploy.

## 1. Crea la chiave di deploy (sul sito Convex)

1. Apri **https://dashboard.convex.dev** e apri il progetto **zenitron**
   (`lovable-blackbird-995`).
2. Vai in **Settings** (icona ingranaggio) → **Deploy Keys**.
3. Clicca **Generate a Deploy Key** (production).
4. **Copia** il token (inizia con `convex deploy:`).

## 2. Salva la chiave su GitHub

1. Su GitHub apri il repository **Hackergut/mela**.
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Name: `CONVEX_DEPLOY_KEY`
4. Secret: incolla il token di prima.
5. **Add secret**.

## 3. Avvia il deploy

Il workflow parte in automatico (perché ho appena pushato su `main`). Per
verificarlo/rilanciarlo a mano:

1. Tab **Actions** → **Deploy Convex**.
2. Se non è in esecuzione, **Run workflow** → **Run workflow**.
3. Attendi che diventi verde (di solito 1–2 minuti).

Quando è verde, funzioni e 44 prodotti sono su Convex in **produzione**.

## 4. Ottieni l'URL di produzione

Il Cloud URL che hai è quello di **dev** (`...convex.cloud`). Per Vercel serve
l'URL di **produzione**:

1. Nella dashboard Convex cambia ambiente da **dev** a **production** (in alto a
   sinistra, accanto al nome progetto).
2. In **Settings → Deployment URL** copia il valore, es.
   `https://zenitron.convex.cloud` (potrebbe avere un suffisso numerico).

## 5. Dai i dati a Vercel

1. Apri il progetto su **vercel.com** → **Settings** → **Environment Variables**.
2. Aggiungi:
   - Name: `VITE_CONVEX_URL`
   - Value: l'URL di produzione del punto 4
   - Environments: seleziona **Production**, **Preview** e **Development**.
3. Salva, poi vai su **Deployments**, apri l'ultimo deploy e **Redeploy**.

## 6. Secret di admin e pagamenti (dopo, opzionali)

Per accedere al pannello admin e attivare Stripe, nella dashboard Convex
(ambiente **production**) → **Settings → Environment Variables** aggiungi:

- `ADMIN_PASSWORD`
- `SUPER_ADMIN_PASSWORD`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `PUBLIC_APP_URL` = l'URL del tuo sito Vercel

Poi crea il webhook Stripe (eventi `checkout.session.completed` e
`checkout.session.expired`) verso:
`https://<deployment>.convex.site/stripe-webhook` e copia il segreto in
`STRIPE_WEBHOOK_SECRET`.

## Fatto
Dopo il redeploy Vercel, il sito carica i prodotti dal tuo database Convex.
Finché non imposti `VITE_CONVEX_URL` mostra il catalogo demo integrato.
