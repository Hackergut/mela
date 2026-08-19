# Google OAuth con Convex Auth

L'accesso «Continua con Google» è gestito da Convex Auth. Il client Vite non
usa e non deve ricevere `VITE_GOOGLE_CLIENT_ID`: le credenziali OAuth sono
segreti del backend Convex.

## Configurazione

1. Crea un client OAuth 2.0 di tipo **Web application** in Google Cloud.
2. Nel deployment Convex corretto (sviluppo o produzione), imposta i segreti:

   ```bash
   npx convex env set AUTH_GOOGLE_ID '<google-client-id>'
   npx convex env set AUTH_GOOGLE_SECRET '<google-client-secret>'
   npx convex env set SITE_URL 'https://tua-app.vercel.app'
   ```

3. In Google Cloud aggiungi tra gli **Authorized redirect URI**:

   ```text
   https://<nome-deployment>.convex.site/api/auth/callback/google
   ```

   L'host `<nome-deployment>.convex.site` è l'HTTP Actions URL mostrato in
   Convex Dashboard → **Settings → URL & Deploy Key**. Non usare l'URL Vercel
   come callback URI.
4. Distribuisci le funzioni e lo schema:

   ```bash
   npx convex deploy
   ```

Crea client OAuth distinti per sviluppo e produzione e configura le rispettive
variabili nel deployment Convex appropriato. Vercel necessita solo di
`VITE_CONVEX_URL` per collegare il frontend al deployment; non impostare né
client ID Google né secret Google tra le variabili `VITE_*`.
