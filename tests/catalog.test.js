import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCartLine,
  filterPublicProducts,
  getCartLineId,
  hydrateProducts,
  isPublicProduct,
  parsePriceCents,
  variantOptionGroups,
} from '../src/lib/catalog.js';

test('public catalogue includes active and legacy products', () => {
  assert.equal(isPublicProduct({ status: 'active' }), true);
  assert.equal(isPublicProduct({}), true);
  assert.equal(isPublicProduct({ status: null }), true);
});

test('public catalogue excludes withdrawn and discontinued products', () => {
  assert.equal(isPublicProduct({ status: 'withdrawn' }), false);
  assert.equal(isPublicProduct({ status: 'discontinued' }), false);
  assert.deepEqual(
    filterPublicProducts([
      { id: 'active', status: 'active' },
      { id: 'legacy' },
      { id: 'withdrawn', status: 'withdrawn' },
    ]).map((product) => product.id),
    ['active', 'legacy'],
  );
});

test('public catalogue handles an invalid API response safely', () => {
  assert.deepEqual(filterPublicProducts(null), []);
  assert.deepEqual(filterPublicProducts({}), []);
});

test('display prices are normalized to integer cents', () => {
  assert.equal(parsePriceCents('€1.199,99'), 119999);
  assert.equal(parsePriceCents('1.199'), 119900);
  assert.equal(parsePriceCents('19.99'), 1999);
  assert.equal(parsePriceCents(19.99), 1999);
  assert.equal(parsePriceCents('not-a-price'), 0);
});

test('products are hydrated from active relational variants', () => {
  const [product] = hydrateProducts(
    [{ id: 'p1', name: 'Phone', price: '€999', price_cents: 99900, stock: 99, status: 'active', image: 'main.jpg' }],
    [
      { id: 'v2', product_id: 'p1', sku: 'PHONE-512', title: '512 GB', option_values: { Capacità: '512 GB' }, price_cents: 129900, stock: 2, status: 'active', sort_order: 2 },
      { id: 'v1', product_id: 'p1', sku: 'PHONE-256', title: '256 GB', option_values: { Capacità: '256 GB' }, price_cents: 109900, stock: 3, status: 'active', is_default: true, sort_order: 1, image: 'variant.jpg' },
      { id: 'draft', product_id: 'p1', sku: 'DRAFT', price_cents: 50000, stock: 100, status: 'draft' },
    ],
  );

  assert.equal(product.default_variant.id, 'v1');
  assert.equal(product.price_min_cents, 109900);
  assert.equal(product.price_max_cents, 129900);
  assert.equal(product.price_cents, 109900);
  assert.equal(product.stock, 5);
  assert.equal(product.image, 'variant.jpg');
  assert.deepEqual(product.variants.map(variant => variant.id), ['v1', 'v2']);
});

test('legacy products receive a safe synthetic default variant', () => {
  const [product] = hydrateProducts([{ id: 'legacy', name: 'Legacy', price: '€25,50', stock: 4, image: 'legacy.jpg' }], []);
  assert.equal(product.default_variant.legacy, true);
  assert.equal(product.default_variant.price_cents, 2550);
  assert.equal(product.default_variant.stock, 4);
  assert.equal(product.variants.length, 1);
});

test('cart lines preserve product and variant snapshots with stable compound ids', () => {
  const product = { id: 'p1', name: 'Phone', image: 'main.jpg', price_cents: 99900, stock: 5 };
  const variant = { id: 'v1', sku: 'PHONE-BLUE', title: 'Blu', option_values: { Finitura: 'Blu' }, price_cents: 109900, stock: 2, image: 'blue.jpg' };
  const line = buildCartLine(product, variant, 8);

  assert.equal(getCartLineId('p1', 'v1'), 'p1::v1');
  assert.equal(getCartLineId('p1'), 'p1::default');
  assert.equal(line.line_id, 'p1::v1');
  assert.equal(line.product_id, 'p1');
  assert.equal(line.variant_id, 'v1');
  assert.equal(line.price_cents, 109900);
  assert.equal(line.qty, 2);
  assert.equal(line.image, 'blue.jpg');
  assert.deepEqual(line.option_values, { Finitura: 'Blu' });
});

test('variant options are grouped without duplicate values', () => {
  assert.deepEqual(variantOptionGroups([
    { option_values: { Finitura: 'Blu', Capacità: '256 GB' } },
    { option_values: { Finitura: 'Blu', Capacità: '512 GB' } },
    { option_values: { Finitura: 'Nero', Capacità: '256 GB' } },
  ]), {
    Finitura: ['Blu', 'Nero'],
    Capacità: ['256 GB', '512 GB'],
  });
});
