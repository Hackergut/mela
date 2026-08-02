import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StoreContext = createContext(null);
const CART_KEY = 'tm_cart';
const WISH_KEY = 'tm_wishlist';

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(i => i.id !== id)), []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) return setCart(prev => prev.filter(i => i.id !== id));
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => prev.find(i => i.id === product.id)
      ? prev.filter(i => i.id !== product.id)
      : [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, category: product.category }]);
  }, []);

  const isInWishlist = useCallback((id) => wishlist.some(i => i.id === id), [wishlist]);

  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0);

  return (
    <StoreContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isInWishlist, cartCount }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};