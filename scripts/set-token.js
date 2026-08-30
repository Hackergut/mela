#!/usr/bin/env node

/**
 * Helper to save Admin API Token into .env.local and run product populate.
 * Usage:
 *   node scripts/set-token.js shpat_1234567890abcdef
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tokenArg = process.argv[2] || '';

if (!tokenArg) {
  console.log('⚠️ Fornisci il token Admin API come argomento!');
  console.log('👉 Esempio: node scripts/set-token.js shpat_1234567890abcdef');
  process.exit(1);
}

const envPath = path.resolve(__dirname, '../.env.local');

const envContent = `SHOPIFY_STORE_DOMAIN=techmania-9imzke20.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=c062fbc8b37ef049751e1be5a971d468
SHOPIFY_ACCESS_TOKEN=${tokenArg.trim()}
`;

fs.writeFileSync(envPath, envContent);
console.log(`✅ Token salvato con successo in ${envPath}!`);
console.log('🚀 Esecuzione del popolamento prodotti...\n');

try {
  execSync('node scripts/populate-shopify-products.js', { stdio: 'inherit' });
} catch (err) {
  console.error('Errore durante l\'esecuzione:', err.message);
}
