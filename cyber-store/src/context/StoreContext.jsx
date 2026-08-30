import React, { createContext, useContext, useState, useEffect } from 'react';
import { products } from '../data/products';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Cart state stored in localStorage or default
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_cart');
      return saved ? JSON.parse(saved) : [
        { id: 'iphone-15-pro-max', color: 'Natural Titanium', storage: '256GB', quantity: 1, price: 1199 },
        { id: 'airpods-max', color: 'Space Gray', storage: null, quantity: 1, price: 549 },
      ];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_wishlist');
      return saved ? JSON.parse(saved) : ['iphone-15-pro-max', 'macbook-pro-16-m3', 'sony-wh1000xm5'];
    } catch {
      return [];
    }
  });

  // Active Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Address & Shipping checkout selections
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [selectedShippingId, setSelectedShippingId] = useState('ship-free');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('cyber_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('cyber_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (productId, color, storage, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === productId && item.color === color && item.storage === storage
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: productId,
            color: color || (product.colors && product.colors[0]?.name) || 'Default',
            storage: storage || (product.storageOptions && product.storageOptions[0]) || null,
            quantity,
            price: product.price,
          }
        ];
      }
    });

    showToast(`Added "${product.name}" to your cart`);
  };

  const removeFromCart = (productId, color, storage) => {
    setCart(prev => prev.filter(
      item => !(item.id === productId && item.color === color && item.storage === storage)
    ));
    showToast('Item removed from cart');
  };

  const updateQuantity = (productId, color, storage, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.color === color && item.storage === storage) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId);
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(`Removed "${product?.name || 'Item'}" from wishlist`);
        return prev.filter(id => id !== productId);
      } else {
        showToast(`Added "${product?.name || 'Item'}" to wishlist`);
        return [...prev, productId];
      }
    });
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'CYBER10' || cleanCode === 'DISCOUNT10') {
      setPromoCode(cleanCode);
      setDiscountPercent(10);
      showToast('Promo code applied: 10% OFF');
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'CYBER20') {
      setPromoCode(cleanCode);
      setDiscountPercent(20);
      showToast('Promo code applied: 20% OFF');
      return { success: true, message: '20% discount applied!' };
    } else {
      showToast('Invalid promo code');
      return { success: false, message: 'Invalid promo code. Try "CYBER10"' };
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        cartSubtotal,
        cartCount,
        promoCode,
        discountPercent,
        applyPromoCode,
        selectedAddressId,
        setSelectedAddressId,
        selectedShippingId,
        setSelectedShippingId,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 animate-bounce">
          <span>✓</span> {toastMessage}
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
