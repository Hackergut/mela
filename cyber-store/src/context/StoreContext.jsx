import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { products as initialProducts } from '../data/products';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Products storage from backend/localStorage or default catalog
  const [productsList, setProductsList] = useState(() => {
    try {
      const saved = localStorage.getItem('techmania_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Cart state stored in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('techmania_cart');
      return saved ? JSON.parse(saved) : [
        { id: 'iphone-15-pro-max', color: 'Titanio Naturale', storage: '256GB', quantity: 1, price: 1199 },
        { id: 'airpods-max', color: 'Grigio Spaziale', storage: null, quantity: 1, price: 549 },
      ];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('techmania_wishlist');
      return saved ? JSON.parse(saved) : ['iphone-15-pro-max', 'macbook-pro-16-m3', 'sony-wh1000xm5'];
    } catch {
      return [];
    }
  });

  // Auth User State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('techmania_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
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
      localStorage.setItem('techmania_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('techmania_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('techmania_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('techmania_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('techmania_products', JSON.stringify(productsList));
    } catch (e) {
      console.error(e);
    }
  }, [productsList]);

  const showToast = (message, type = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  // Auth Functions
  const loginUser = (email, password) => {
    const name = email.split('@')[0];
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      token: `token_${Math.random().toString(36).substr(2)}`,
    };
    setUser(newUser);
    toast.success(`Benvenuto su TechMania, ${newUser.name}!`);
    return newUser;
  };

  const registerUser = (name, email, password) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      name,
      token: `token_${Math.random().toString(36).substr(2)}`,
    };
    setUser(newUser);
    toast.success(`Account TechMania creato con successo! Benvenuto ${name}!`);
    return newUser;
  };

  const logoutUser = () => {
    setUser(null);
    toast.info('Scollegato dal tuo account TechMania');
  };

  // Product Management
  const addCustomProduct = (newProd) => {
    const created = {
      ...newProd,
      id: newProd.id || `prod_${Date.now()}`,
      rating: newProd.rating || 5.0,
      reviewCount: newProd.reviewCount || 1,
    };
    setProductsList(prev => [created, ...prev]);
    toast.success(`Prodotto "${created.name}" salvato nel catalogo TechMania!`);
  };

  const addToCart = (productId, color, storage, quantity = 1) => {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    const selectedColor = color || (product.colors && product.colors[0]?.name) || 'Standard';
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

    toast.success(`Aggiunto "${product.name}" al carrello TechMania`, {
      description: `${selectedColor}${selectedStorage ? ` • ${selectedStorage}` : ''}`,
    });
  };

  const removeFromCart = (productId, color, storage) => {
    const product = productsList.find(p => p.id === productId);
    setCart(prev => prev.filter(
      item => !(item.id === productId && item.color === color && item.storage === storage)
    ));
    toast.info(`Rimosso "${product?.name || 'Prodotto'}" dal carrello`);
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
    const product = productsList.find(p => p.id === productId);
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        toast.info(`Rimosso "${product?.name || 'Prodotto'}" dai preferiti`);
        return prev.filter(id => id !== productId);
      } else {
        toast.success(`Salvato "${product?.name || 'Prodotto'}" nei preferiti`);
        return [...prev, productId];
      }
    });
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'TECHMANIA10' || cleanCode === 'CYBER10' || cleanCode === 'DISCOUNT10') {
      setPromoCode(cleanCode);
      setDiscountPercent(10);
      toast.success('Codice promo TECHMANIA10 applicato! Sconto 10%');
      return { success: true, message: 'Sconto del 10% applicato!' };
    } else if (cleanCode === 'TECHMANIA20' || cleanCode === 'CYBER20') {
      setPromoCode(cleanCode);
      setDiscountPercent(20);
      toast.success('Codice promo TECHMANIA20 applicato! Sconto 20%');
      return { success: true, message: 'Sconto del 20% applicato!' };
    } else {
      toast.error('Codice promo non valido. Prova TECHMANIA10');
      return { success: false, message: 'Codice non valido. Prova "TECHMANIA10"' };
    }
  };

  // Stripe Checkout API Session Creation
  const createStripeCheckoutSession = async (shippingFee = 0) => {
    try {
      const orderItems = cart.map(item => {
        const prod = productsList.find(p => p.id === item.id);
        return {
          product_id: item.id,
          name: prod?.name || item.id,
          qty: item.quantity,
          price_cents: Math.round(item.price * 100),
          image: prod?.image || '',
        };
      });

      const payload = {
        orderItems,
        shippingCents: Math.round(shippingFee * 100),
        discountPercent,
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return { success: true, url: data.url };
        }
      }
      return { success: false, fallback: true };
    } catch (err) {
      console.warn('Stripe endpoint error, proceeding with demo checkout fallback:', err);
      return { success: false, fallback: true };
    }
  };

  const cartSubtotal = cart.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        productsList,
        addCustomProduct,
        cart,
        wishlist,
        user,
        loginUser,
        registerUser,
        logoutUser,
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
        createStripeCheckoutSession,
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
    throw new Error('useStore deve essere utilizzato all\'interno di StoreProvider');
  }
  return context;
};
