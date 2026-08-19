# TechMania

Storefront and administration console built with React, Vite and Base44. Use this repository to run and edit the app locally, then publish changes back through Base44.

Any change pushed to the repo will also be reflected in the Base44 Builder.

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.

See the [Base44 CLI docs](https://docs.base44.com/developers/references/cli/get-started/overview) if you want to run Base44 commands directly.

## Run Locally

Run the full local development environment from the project root:

```bash
base44 dev
```

`base44 dev` starts the local Base44 development backend and, when this app is configured for it, also starts the frontend dev server for you. Use the frontend URL printed by the command.

For example, when the Base44 project config includes a `serveCommand`, `base44 dev` can launch the frontend too:

```json5
{
  "site": {
    "serveCommand": "npm run dev"
  }
}
```

In a Base44 project this lives in `base44/config.jsonc`.

## Run Only The Frontend

If you only want to work on the frontend against the hosted Base44 backend, run:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Quality Checks

The same checks run for every pull request through `.github/workflows/ci.yml`:

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

## Runtime Secrets

Configure backend secrets in Base44 rather than committing them to this repository:

- `ADMIN_PASSWORD` and, optionally, `SUPER_ADMIN_PASSWORD` protect CMS operations.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` enable checkout and signed webhook processing.
- `PUBLIC_APP_URL` is required for production checkout redirects (for example, `https://shop.example.com`).
- `BASE44_APP_ID` is included in Stripe checkout metadata.
- `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` power the live storefront (catalog + Shopify Checkout). `SHOPIFY_SHOP_DOMAIN` and `SHOPIFY_ACCESS_TOKEN` remain the Admin API credentials for syncing products, orders and customers. See **[SHOPIFY.md](./SHOPIFY.md)**. The admin **Shopify** tab is a compatibility fallback if you prefer not to set Convex secrets.

## Integrazioni (Hub stile Shopify)

Il pannello admin ha un tab **Integrazioni** da cui il team collega servizi
esterni (Stripe, corrieri, GA4/Meta/TikTok, WhatsApp, CRM, Zapier/Make, ecc.)
senza scrivere codice. Per aggiungere un nuovo servizio basta una voce nel
registro `base44/shared/integrations.ts`. Vedi **[INTEGRATIONS.md](./INTEGRATIONS.md)**.

Do not expose backend secrets through `VITE_` variables: Vite embeds those variables into browser bundles.

## Use The Hosted Backend

For frontend-only development, create or update `.env.local` in the project root:

```bash
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

`VITE_BASE44_APP_ID` identifies the Base44 app.

`VITE_BASE44_APP_BASE_URL` tells the Base44 Vite plugin where to send local `/api` requests. Point it at your deployed Base44 app URL when you want the local frontend to use the hosted backend.

When you use `base44 dev`, the command injects the local Base44 values for you, so `.env.local` is mainly needed for frontend-only workflows.

## Publish Your Changes

After pushing your changes to git, open the Base44 dashboard and publish the app:

```bash
base44 dashboard open
```

## Docs & Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Base44 CLI command reference: [https://docs.base44.com/developers/references/cli/commands/introduction](https://docs.base44.com/developers/references/cli/commands/introduction)

Support: [https://app.base44.com/support](https://app.base44.com/support)
