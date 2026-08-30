# TechMania Shopify Theme (OS 2.0)

Questo è il tema Shopify 2.0 completo di TechMania, progettato per rispecchiare fedelmente il design e-commerce Apple-style di TechMania.

## Struttura del Tema

- `layout/theme.liquid`: Layout master con Tailwind CSS, font Inter e sistema cart drawer.
- `sections/hero.liquid`: Hero Banner originale con iPhone 15 Pro, "Oltre Ogni Limite", animazione floating.
- `sections/featured-grid.liquid`: Griglia a 4 tile (PlayStation 5 Slim, AirPods Max, Apple Vision Pro, MacBook Pro 16").
- `sections/category-grid.liquid`: Griglia interattiva categorie (Smartphones, Fotocamere, Cuffie, Computer, Gaming, Smartwatch).
- `sections/featured-products.liquid`: Griglia prodotti a schede (*Novità*, *Più Venduti*, *In Evidenza*).
- `sections/promo-banner.liquid`: Banner promozionale TechMania.
- `sections/value-props.liquid`: Badge garanzie, spedizione express e pagamenti sicuri.
- `sections/footer.liquid` & `sections/header.liquid`: Navbar e footer ufficiali.
- `sections/main-product.liquid`: Scheda prodotto completa di selettore colore, variante memoria, galleria e garanzie.
- `assets/`: Tutti gli asset grafici Figma originali (56+ immagini), `theme.css` e `theme.js`.

## Come caricare il Tema su Shopify

### Metodo 1: Caricamento ZIP via Shopify Admin
1. Comprimi il contenuto della cartella `techmania-shopify` in un file `.zip`.
2. Vai nel tuo pannello **Shopify Admin → Negozio Online → Temi**.
3. Clicca su **Aggiungi tema → Carica file zip**.
4. Pubblica il tema.

### Metodo 2: Shopify CLI
```bash
cd techmania-shopify
shopify theme push
```

### Metodo 3: Integrazione GitHub Direct
In Shopify Admin → **Temi → Aggiungi tema → Collega da GitHub**, seleziona il repository `Hackergut/mela` e imposta il root della directory su `techmania-shopify`.
