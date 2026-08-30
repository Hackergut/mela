import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { products } from '../data/products';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Cart state stored in localStorage
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

  // Address & Shipping selections
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [selectedShippingId, setSelectedShippingId] = useState('ship-free');

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

  const showToast = (message, type = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  const addToCart = (productId, color, storage, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Default';
    const selectedStorage = storage || (product.storageOptions && product.storageOptions[0]) || null;

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === productId && item.color === selectedColor && item.storage === selectedStorage
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
            color: selectedColor,
            storage: selectedStorage,
            quantity,
            price: product.price,
          }
        ];
      }
    });

    toast.success(`Added "${product.name}" to cart`, {
      description: `${selectedColor}${selectedStorage ? ` • ${selectedStorage}` : ''}`,
    });
  };

  const removeFromCart = (productId, color, storage) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.filter(
      item => !(item.id === productId && item.color === color && item.storage === storage)
    ));
    toast.info(`Removed "${product?.name || 'Item'}" from cart`);
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
        toast.info(`Removed "${product?.name || 'Item'}" from wishlist`);
        return prev.filter(id => id !== productId);
      } else {
        toast.success(`Saved "${product?.name || 'Item'}" to wishlist`);
        return [...prev, productId];
      }
    });
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'CYBER10' || cleanCode === 'DISCOUNT10') {
      setPromoCode(cleanCode);
      setDiscountPercent(10);
      toast.success('Promo code CYBER10 applied! 10% OFF');
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'CYBER20') {
      setPromoCode(cleanCode);
      setDiscountPercent(20);
      toast.success('Promo code CYBER20 applied! 20% OFF');
      return { success: true, message: '20% discount applied!' };
    } else {
      toast.error('Invalid promo code. Try CYBER10');
      return { success: false, message: 'Invalid code. Try "CYBER10"' };
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
        showToast,
      }}
    >
      {children}
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
