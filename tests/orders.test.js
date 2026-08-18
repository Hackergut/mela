import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOrderTimeline,
  bundleDiscountPercent,
  bundleTotals,
  carrierTrackingUrl,
  maskEmail,
  orderItemLabel,
  relatedProducts,
  selectBundleAccessories,
} from '../src/lib/orders.js';
import { formatPriceCents } from '../src/lib/catalog.js';

test('order timeline marks progress up to the current status', () => {
  const steps = buildOrderTimeline({ status: 'shipped', paid_at: '2026-08-01T10:00:00Z', shipped_date: '2026-08-02T09:00:00Z' });
  assert.deepEqual(steps.map(step => step.key), ['pending', 'paid', 'shipped', 'delivered']);
  assert.deepEqual(steps.map(step => step.state), ['done', 'done', 'current', 'todo']);
  assert.equal(steps[1].date, '2026-08-01T10:00:00Z');
});

test('order timeline collapses terminal statuses into one marker', () => {
  const steps = buildOrderTimeline({ status: 'cancelled' });
  assert.equal(steps.length, 1);
  assert.equal(steps[0].terminal, true);
  assert.equal(steps[0].state, 'current');
});

test('order timeline defaults gracefully for unknown or missing status', () => {
  assert.deepEqual(buildOrderTimeline(null), []);
  const fallback = buildOrderTimeline({});
  assert.equal(fallback[0].key, 'pending');
  assert.equal(fallback[0].state, 'current');
});

test('email masking keeps only the first character of the local part', () => {
  assert.equal(maskEmail('marco.rossi@gmail.com'), 'm*******@gmail.com');
  assert.equal(maskEmail('a@b.co'), 'a@b.co');
  assert.equal(maskEmail('not-an-email'), '');
  assert.equal(maskEmail(null), '');
});

test('carrier tracking urls are built only for known carriers with a code', () => {
  assert.match(carrierTrackingUrl('DHL', '123 456'), /dhl\.com.*123%20456/);
  assert.equal(carrierTrackingUrl('DHL', '  '), '');
  assert.equal(carrierTrackingUrl('Corriere sconosciuto', '123'), '');
});

test('order item labels include snapshot option values', () => {
  assert.equal(orderItemLabel({ name: 'iPhone 17 Pro', option_values: { 'Colore': 'Nero', 'Memoria': '256 GB' } }), 'iPhone 17 Pro · Nero · 256 GB');
  assert.equal(orderItemLabel({ name: 'Magic Mouse' }), 'Magic Mouse');
  assert.equal(orderItemLabel(null), 'Prodotto');
});

test('related products prefer same category, in stock and featured', () => {
  const current = { id: '1', category: 'iPhone', family: 'iPhone 17', brand: 'Apple' };
  const products = [
    { id: '2', name: 'Altro iPhone', category: 'iPhone', family: 'iPhone 17', brand: 'Apple', in_stock: true },
    { id: '3', name: 'Watch', category: 'Apple Watch', family: 'Series 10', brand: 'Apple', in_stock: true, featured: true },
    { id: '4', name: 'iPhone ritirato', category: 'iPhone' },
    { id: '1', name: 'Stesso prodotto' },
    { id: '5', name: 'Cuffie altre', category: 'Audio' },
  ];
  // Same category ranks first (4: +4 category, +4/+2/+1 bonuses); unrelated
  // categories need multiple bonuses to catch up and are excluded entirely
  // when they share nothing with the current product.
  assert.deepEqual(relatedProducts(products, current, { limit: 2 }).map(product => product.id), ['2', '4']);
  assert.deepEqual(relatedProducts(products, current).map(product => product.id), ['2', '4', '3']);
  assert.deepEqual(relatedProducts(products, null), []);
});

test('order totals are formatted as italian currency from integer cents', () => {
  // it-IT currency uses a non-breaking space before € and, per CLDR, does not
  // group four-digit numbers (minimumGroupingDigits: 2).
  assert.equal(formatPriceCents(129900), '1299,00\u00a0€');
  assert.equal(formatPriceCents(0), '0,00\u00a0€');
});

test('bundle discount percent is clamped to a safe range', () => {
  assert.equal(bundleDiscountPercent({ bundle_discount_percent: 5 }), 5);
  assert.equal(bundleDiscountPercent({ bundle_discount_percent: '8' }), 8);
  assert.equal(bundleDiscountPercent({ bundle_discount_percent: 90 }), 15);
  assert.equal(bundleDiscountPercent({ bundle_discount_percent: -3 }), 0);
  assert.equal(bundleDiscountPercent({}), 0);
  assert.equal(bundleDiscountPercent(null), 0);
});

test('bundle accessories are cheaper in-stock products from the same category first', () => {
  const current = { id: '1', category: 'iPhone', family: 'iPhone 17', price_cents: 120000 };
  const products = [
    { id: '2', name: 'Cover', category: 'iPhone', family: 'Accessori', in_stock: true, price_cents: 4900 },
    { id: '3', name: 'Mac', category: 'Mac', family: 'MacBook', in_stock: true, price_cents: 150000 },
    { id: '4', name: 'Cuffie', category: 'iPhone', family: 'Accessori', in_stock: true, price_cents: 24900 },
    { id: '5', name: 'Esaurita', category: 'iPhone', in_stock: false, price_cents: 2900 },
    { id: '1', name: 'Stesso', in_stock: true, price_cents: 100 },
  ];
  // id 3 costs more than the main product and is excluded; id 5 is out of stock.
  assert.deepEqual(selectBundleAccessories(products, current).map(p => p.id), ['4', '2']);
  assert.deepEqual(selectBundleAccessories(products, null), []);
});

test('bundle totals discount accessories only, never the main product', () => {
  const totals = bundleTotals({
    mainCents: 100000,
    accessories: [{ price_cents: 4900 }, { price_cents: 24900 }],
    percent: 10,
  });
  assert.equal(totals.accessoryCents, 29800);
  assert.equal(totals.accessoryDiscountCents, 2980);
  assert.equal(totals.totalCents, 100000 + 29800 - 2980);
  assert.equal(totals.savingsCents, 2980);
  assert.equal(bundleTotals({ mainCents: 500, accessories: [], percent: 10 }).totalCents, 500);
  // Percent above the safety cap is clamped server-side too.
  assert.equal(bundleTotals({ mainCents: 0, accessories: [{ price_cents: 1000 }], percent: 50 }).savingsCents, 150);
});
