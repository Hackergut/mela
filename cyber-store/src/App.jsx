import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
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
          </main>
          <Footer />
        </div>
      </Router>
    </StoreProvider>
  );
}
