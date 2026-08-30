# Shopify Hydrogen Redirect Theme for Custom Storefronts

Questo tema Shopify Liquid serve per reindirizzare automaticamente tutto il traffico dal tuo negozio Shopify hosted (`your-store.myshopify.com`) al tuo nuovo **Storefront Headless (Next.js / React)** mantenendo attivi:
- Reindirizzamento checkout e link sconto (`/discount/...`)
- Checkpoint bot protection e flash sales (`/challenge`)
- Integrazione account clienti (`logged_in=true`)
- Regole di redirect personalizzate (es. `/account/login > /login`)

## Guida all'Installazione

1. Comprimi il contenuto della cartella `hydrogen-redirect-theme` in un file `.zip`.
2. Vai nel tuo Shopify Admin: **Negozio Online → Temi**.
3. Clicca **Aggiungi tema → Carica file zip**.
4. Vai su **Personalizza → Impostazioni tema → Storefront**.
5. Inserisci il tuo **Storefront Hostname** (es. `techmania.vercel.app` oppure `localhost:3000`).
6. Pubblica il tema.
