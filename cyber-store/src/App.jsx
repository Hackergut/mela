import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ShoppingCart from './pages/ShoppingCart';
import CheckoutAddress from './pages/CheckoutAddress';
import CheckoutShipping from './pages/CheckoutShipping';
import CheckoutPayment from './pages/CheckoutPayment';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        className="flex-1 flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          
          {/* Shopping Cart */}
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/shopping-cart" element={<ShoppingCart />} />

          {/* Checkout 3 Steps */}
          <Route path="/checkout/address" element={<CheckoutAddress />} />
          <Route path="/checkout-address" element={<CheckoutAddress />} />

          <Route path="/checkout/shipping" element={<CheckoutShipping />} />
          <Route path="/checkout-shipping" element={<CheckoutShipping />} />

          <Route path="/checkout/payment" element={<CheckoutPayment />} />
          <Route path="/checkout-payment" element={<CheckoutPayment />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
          <Header />
          <main className="flex-1 flex flex-col">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0F0F0F',
              color: '#FFFFFF',
              border: '1px solid #2C2C2E',
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
            },
          }}
        />
      </Router>
    </StoreProvider>
  );
}
