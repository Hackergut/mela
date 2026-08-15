import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { buildCartLine, getCartLineId } from '@/lib/catalog';

const StoreContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const normalizeStoredCart = (items) => items
  .filter(item => item && item.id)
  .map((item) => ({
    ...item,
    product_id: String(item.product_id || item.id),
    variant_id: item.variant_id ? String(item.variant_id) : null,
    line_id: item.line_id || getCartLineId(item.product_id || item.id, item.variant_id),
    qty: Math.max(1, Number(item.qty) || 1),
  }));

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => normalizeStoredCart(readStorage('tm_cart', [])));
  const [wishlist, setWishlist] = useState(() => readStorage('tm_wishlist', []));

  useEffect(() => {
    try { localStorage.setItem('tm_cart', JSON.stringify(cart)); } catch { /* storage unavailable */ }
  }, [cart]);
  useEffect(() => {
    try { localStorage.setItem('tm_wishlist', JSON.stringify(wishlist)); } catch { /* storage unavailable */ }
  }, [wishlist]);

  const addToCart = useCallback((product, variant = product?.default_variant, quantity = 1) => {
    if (!product) return;
    const line = buildCartLine(product, variant, quantity);
    setCart(prev => {
      const existing = prev.find(item => item.line_id === line.line_id);
      const availableStock = Number.isFinite(Number(line.stock)) ? Math.max(0, Number(line.stock)) : Infinity;
      if (availableStock === 0) return prev;
      if (existing) {
        const nextQty = Math.min((existing.qty || 1) + line.qty, availableStock);
        return prev.map(item => item.line_id === line.line_id ? { ...item, ...line, qty: nextQty } : item);
      }
      return [...prev, { ...line, qty: Math.min(line.qty, availableStock) }];
    });
  }, []);

  const removeFromCart = useCallback((lineId) => {
    setCart(prev => prev.filter(item => item.line_id !== lineId && item.id !== lineId));
  }, []);

  const updateQty = useCallback((lineId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.line_id !== lineId && item.id !== lineId));
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.line_id !== lineId && item.id !== lineId) return item;
      const availableStock = Number.isFinite(Number(item.stock)) ? Math.max(1, Number(item.stock)) : qty;
      return { ...item, qty: Math.min(Math.max(1, qty), availableStock) };
    }));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const syncCatalog = useCallback((products) => {
    if (!Array.isArray(products)) return;
    const productMap = new Map(products.map(product => [String(product.id), product]));
    setWishlist(previous => previous
      .map(item => productMap.get(String(item.id)))
      .filter(Boolean));
    setCart(previous => previous.map((item) => {
      const product = productMap.get(String(item.product_id || item.id));
      if (!product) return { ...item, stock: 0, unavailable: true };
      const variantId = String(item.variant_id || '');
      const variant = variantId
        ? product.variants?.find(candidate => String(candidate.id) === variantId)
        : product.default_variant;
      if (variantId && !variant) return { ...item, name: product.name, stock: 0, unavailable: true };
      const fresh = buildCartLine(product, variant, item.qty || 1);
      return fresh ? { ...fresh, unavailable: false } : { ...item, stock: 0, unavailable: true };
    }));
  }, []);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    setWishlist(prev => prev.some(item => item.id === product.id)
      ? prev.filter(item => item.id !== product.id)
      : [...prev, product]);
  }, []);

  const isInWishlist = useCallback((id) => wishlist.some(item => item.id === id), [wishlist]);

  const value = useMemo(() => ({
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    syncCatalog,
    toggleWishlist,
    isInWishlist,
    cartCount: cart.reduce((sum, item) => sum + (item.qty || 1), 0),
    wishlistCount: wishlist.length,
  }), [cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, syncCatalog, toggleWishlist, isInWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
