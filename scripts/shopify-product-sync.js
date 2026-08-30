#!/usr/bin/env node

/**
 * TechMania Shopify Product Sync CLI Tool
 * Synchronizes products live from Shopify Storefront / Admin API directly into local catalog.
 *
 * Usage:
 *   node scripts/shopify-product-sync.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'vercel-store-efc7b1b7-zuf0wqb2.myshopify.com';
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'c062fbc8b37ef049751e1be5a971d468';
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

console.log('🚀 TechMania Shopify Sync CLI Starting...');
console.log(`📌 Domain: ${SHOPIFY_DOMAIN}`);

const PRODUCTS_GRAPHQL_QUERY = `
  query FetchAllProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        description
        vendor
        productType
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          nodes {
            url
            altText
          }
        }
        variants(first: 50) {
          nodes {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

async function syncShopifyProducts() {
  const endpoint = `https://${SHOPIFY_DOMAIN}/api/2025-01/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: PRODUCTS_GRAPHQL_QUERY,
        variables: { first: 250 },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ Shopify GraphQL Errors:', result.errors);
      process.exit(1);
    }

    const shopifyProducts = result.data?.products?.nodes || [];
    console.log(`✅ ${shopifyProducts.length} prodotti trovati su Shopify!`);

    const mappedProducts = shopifyProducts.map((p, idx) => {
      const minPrice = parseFloat(p.priceRange?.minVariantPrice?.amount || '0');
      const images = p.images?.nodes?.map((img) => img.url) || [];
      const primaryImage = images[0] || '/assets/iphone-image-2619-2264.png';

      return {
        id: p.handle || `shopify-product-${idx + 1}`,
        shopifyId: p.id,
        name: p.title,
        brand: p.vendor || 'Apple',
        category: (p.productType || 'smartphones').toLowerCase(),
        price: minPrice,
        originalPrice: Math.round(minPrice * 1.15),
        rating: 4.9,
        reviewCount: 42,
        discount: 15,
        image: primaryImage,
        images: images.length > 0 ? images : [primaryImage],
        description: p.description || `${p.title} disponibile su TechMania.`,
        specs: {
          Display: 'Super Retina XDR OLED',
          Chip: 'Processore Next-Gen',
          Fotocamera: 'Sistema fotocamere Pro',
          Connettività: '5G / Wi-Fi 6E',
        },
        colors: [
          { name: 'Titanio Naturale', hex: '#BEB7A4' },
          { name: 'Nero Spaziale', hex: '#212122' },
        ],
        storageOptions: ['128GB', '256GB', '512GB', '1TB'],
        tags: p.tags || ['Novità', 'In Evidenza'],
      };
    });

    // Save to cyber-store data file
    const targetFile = path.resolve(__dirname, '../cyber-store/src/data/shopify-synced-products.json');
    fs.writeFileSync(targetFile, JSON.stringify(mappedProducts, null, 2));

    console.log(`🎉 Prodotti salvati con successo in: ${targetFile}`);
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error.message);
  }
}

syncShopifyProducts();
