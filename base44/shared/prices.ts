// Server-side price validation map (productId → amount in euro cents).
// Source of truth for checkout amounts — the frontend cannot override these.
// Keep in sync with src/lib/productCatalog.js price strings.
export const PRICE_MAP: Record<number, number> = {
  // iPhone (un prodotto per modello)
  1: 119900, // iPhone 17 Pro
  2: 99900,  // iPhone 17 Air
  3: 89900,  // iPhone 17
  4: 79900,  // iPhone 16
  // Apple Watch Series 10
  25: 44900, 26: 44900, 27: 44900, 28: 44900, 29: 44900,
  30: 44900, 31: 44900, 32: 44900,
  // Apple Watch Series 9
  33: 39900, 34: 39900, 35: 39900,
  // Apple Watch SE
  36: 24900,
  // AirPods
  37: 27900, 38: 27900, 39: 14900,
  // AirPods Max
  40: 57900, 41: 57900,
  // iPad
  42: 109900, 43: 109900, 44: 109900, 45: 109900, 46: 109900,
  47: 109900, 48: 119900, 49: 119900, 50: 119900,
  // Mac
  51: 69900, 52: 239900,
  // Accessori
  53: 34900, 54: 10900, 55: 2500, 56: 2500, 57: 2500,
  58: 3900, 59: 2500, 60: 2500, 61: 2500, 62: 2500,
  // Ecosistema
  63: 149900, 64: 179900,
};