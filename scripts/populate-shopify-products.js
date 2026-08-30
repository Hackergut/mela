#!/usr/bin/env node

/**
 * TechMania Shopify Product Populator CLI Tool
 * Creates / populates TechMania products directly on your Shopify store via Admin API,
 * and updates local JSON catalog.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'techmania-9imzke20.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

const TECHMANIA_PRODUCTS = [
  {
    title: 'iPhone 15 Pro Max',
    vendor: 'Apple',
    product_type: 'smartphones',
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
    product_type: 'gaming',
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
    product_type: 'headphones',
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
    product_type: 'spatial computing',
    body_html: '<p>Il primo spatial computer al mondo per realtà immersiva e lavoro senza confini.</p>',
    tags: 'Vision Pro, Apple, Visore, Novità, In Evidenza',
    variants: [
      { price: '3499.00', sku: 'VISION-PRO-256', title: '256GB' }
    ]
  },
  {
    title: 'MacBook Pro 16" M3 Max',
    vendor: 'Apple',
    product_type: 'computers',
    body_html: '<p>Potenza di calcolo estrema con il chip Apple M3 Max e display Liquid Retina XDR.</p>',
    tags: 'MacBook, Apple, Computer, Laptop, Più Venduti',
    variants: [
      { price: '2899.00', sku: 'MACBOOK-PRO-16-M3', title: 'Nero Spaziale / 36GB / 1TB' }
    ]
  },
  {
    title: 'Apple Watch Ultra 2',
    vendor: 'Apple',
    product_type: 'smartwatches',
    body_html: '<p>Il più resistente e versatile Apple Watch di sempre, cassa in titanio da 49mm e GPS ad alta precisione.</p>',
    tags: 'Apple Watch, Apple, Smartwatch, Novità',
    variants: [
      { price: '899.00', sku: 'WATCH-ULTRA-2-TITANIUM', title: 'Cassa in Titanio / Cinturino Alpine' }
    ]
  }
];

// Always write local fallback json for instant rendering in app
function saveLocalCatalog() {
  const localCatalog = TECHMANIA_PRODUCTS.map((p, i) => ({
    id: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: p.title,
    brand: p.vendor,
    category: p.product_type,
    price: parseFloat(p.variants[0].price),
    originalPrice: Math.round(parseFloat(p.variants[0].price) * 1.15),
    rating: 4.9,
    reviewCount: 50,
    discount: 15,
    image: getProductImage(p.title),
    images: [getProductImage(p.title)],
    description: p.body_html.replace(/<[^>]+>/g, ''),
    specs: {
      Display: 'Super Retina XDR OLED',
      Chip: 'Processore Next-Gen',
      Fotocamera: 'Sistema fotocamere Pro'
    }
  }));

  const targetPath = path.resolve(__dirname, '../cyber-store/src/data/shopify-synced-products.json');
  fs.writeFileSync(targetPath, JSON.stringify(localCatalog, null, 2));
  console.log(`✅ Catalogo prodotti locale aggiornato in: ${targetPath}`);
}

function getProductImage(title) {
  if (title.includes('iPhone')) return '/assets/iphone-image-2619-2264.png';
  if (title.includes('PlayStation')) return '/assets/playstation-2619-2204.png';
  if (title.includes('AirPods')) return '/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png';
  if (title.includes('Vision')) return '/assets/image-61-2619-1982.png';
  if (title.includes('MacBook')) return '/assets/banner-2-2619-2128.png';
  return '/assets/image-62-2619-1983.png';
}

async function populateShopifyProducts() {
  console.log('🚀 Popolamento Prodotti TechMania su Shopify...');
  console.log(`📌 Store: ${SHOPIFY_DOMAIN}`);

  saveLocalCatalog();

  if (!ADMIN_TOKEN || !ADMIN_TOKEN.startsWith('shpat_')) {
    console.log('\n⚠️ SHOPIFY_ACCESS_TOKEN non valido o non presente in .env.local.');
    console.log('💡 Per creare i prodotti su Shopify Admin:');
    console.log('   1. Vai su Shopify Admin -> Impostazioni -> App e canali di vendita -> Sviluppa app');
    console.log('   2. Crea un\'app e abilita gli ambiti API Admin: "write_products" e "read_products"');
    console.log('   3. Clicca su "Installa app" e copia il token che comincia con "shpat_..."');
    console.log('   4. Incolla in .env.local: SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxx\n');
    return;
  }

  let createdCount = 0;
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
        console.log(`✅ Prodotto creato su Shopify: ${data.product.title} (ID: ${data.product.id})`);
        createdCount++;
      } else {
        console.log(`⚠️ Risposta Shopify per ${prod.title}:`, JSON.stringify(data));
      }
    } catch (err) {
      console.error(`❌ Errore creazione ${prod.title}:`, err.message);
    }
  }

  console.log(`🎉 Popolamento completato! ${createdCount} prodotti creati su Shopify live.`);
}

populateShopifyProducts();
