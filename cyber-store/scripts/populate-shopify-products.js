#!/usr/bin/env node

/**
 * TechMania Shopify Product Populator CLI Tool
 * Creates / populates TechMania products directly on your Shopify store via Admin API.
 *
 * Usage:
 *   node scripts/populate-shopify-products.js
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'techmania-9imzke20.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

const TECHMANIA_PRODUCTS = [
  {
    title: 'iPhone 15 Pro Max',
    vendor: 'Apple',
    product_type: 'Smartphones',
    body_html: '<p>Fotocamera di livello professionale, chip A17 Pro ultraveloce e design in titanio di grado aerospaziale.</p>',
    tags: 'iPhone, Apple, Smartphone, Novità, In Evidenza',
    variants: [
      { price: '1299.00', sku: 'IPHONE-15-PRO-256', title: 'Titanio Naturale / 256GB' },
      { price: '1599.00', sku: 'IPHONE-15-PRO-512', title: 'Nero Spaziale / 512GB' }
    ]
  },
  {
    title: 'PlayStation 5 Slim',
    vendor: 'Sony',
    product_type: 'Gaming',
    body_html: '<p>Esperienza di gioco Next-Gen in design ultrasottile con grafica 4K e SSD ultraveloce.</p>',
    tags: 'PlayStation, Sony, Gaming, Console, Più Venduti',
    variants: [
      { price: '499.00', sku: 'PS5-SLIM-DIGITAL', title: 'Digital Edition' },
      { price: '549.00', sku: 'PS5-SLIM-DISC', title: 'Standard Edition' }
    ]
  },
  {
    title: 'AirPods Max',
    vendor: 'Apple',
    product_type: 'Headphones',
    body_html: '<p>Audio ad alta fedeltà con cancellazione attiva del rumore, modalità trasparenza ed audio spaziale.</p>',
    tags: 'AirPods, Apple, Cuffie, Audio, In Evidenza',
    variants: [
      { price: '579.00', sku: 'AIRPODS-MAX-BLACK', title: 'Nero Spaziale' },
      { price: '579.00', sku: 'AIRPODS-MAX-SILVER', title: 'Argento' }
    ]
  },
  {
    title: 'Apple Vision Pro',
    vendor: 'Apple',
    product_type: 'Spatial Computing',
    body_html: '<p>Il primo spatial computer al mondo per realtà immersiva e lavoro senza confini.</p>',
    tags: 'Vision Pro, Apple, Visore, Novità, In Evidenza',
    variants: [
      { price: '3499.00', sku: 'VISION-PRO-256', title: '256GB' }
    ]
  },
  {
    title: 'MacBook Pro 16" M3 Max',
    vendor: 'Apple',
    product_type: 'Computers',
    body_html: '<p>Potenza di calcolo estrema con il chip Apple M3 Max e display Liquid Retina XDR.</p>',
    tags: 'MacBook, Apple, Computer, Laptop, Più Venduti',
    variants: [
      { price: '2899.00', sku: 'MACBOOK-PRO-16-M3', title: 'Nero Spaziale / 36GB / 1TB' }
    ]
  },
  {
    title: 'Apple Watch Ultra 2',
    vendor: 'Apple',
    product_type: 'Smartwatches',
    body_html: '<p>Il più resistente e versatile Apple Watch di sempre, cassa in titanio da 49mm e GPS ad alta precisione.</p>',
    tags: 'Apple Watch, Apple, Smartwatch, Novità',
    variants: [
      { price: '899.00', sku: 'WATCH-ULTRA-2-TITANIUM', title: 'Cassa in Titanio / Cinturino Alpine' }
    ]
  }
];

async function populateShopifyProducts() {
  console.log('🚀 Popolamento Prodotti TechMania su Shopify...');
  console.log(`📌 Store: ${SHOPIFY_DOMAIN}`);

  if (!ADMIN_TOKEN) {
    console.log('⚠️ Nessun SHOPIFY_ACCESS_TOKEN Admin rilevato.');
    console.log('💡 Per popolare automaticamente via Admin API:');
    console.log('   1. In Shopify Admin -> Impostazioni -> App -> Sviluppa app');
    console.log('   2. Genera Admin API Access Token con permesso "write_products"');
    console.log('   3. Imposta SHOPIFY_ACCESS_TOKEN nel file .env.local');
    return;
  }

  for (const prod of TECHMANIA_PRODUCTS) {
    try {
      const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2025-01/products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMIN_TOKEN,
        },
        body: JSON.stringify({ product: prod }),
      });

      const data = await response.json();

      if (data.product) {
        console.log(`✅ Prodotto creato: ${data.product.title} (ID: ${data.product.id})`);
      } else {
        console.log(`⚠️ Impossibile creare ${prod.title}:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`❌ Errore creazione ${prod.title}:`, err.message);
    }
  }

  console.log('🎉 Popolamento completato!');
}

populateShopifyProducts();
