import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { products } from '../data/products';

export default function ShoppingCart() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, applyPromoCode, discountPercent, promoCode } = useStore();
  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (inputCode) {
      const res = applyPromoCode(inputCode);
      setPromoMessage(res);
    }
  };

  const shippingCost = cartSubtotal > 100 || cart.length === 0 ? 0 : 8.50;
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const estimatedTax = (cartSubtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + estimatedTax);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-black shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">
            Looks like you haven't added any products to your cart yet. Explore our flagship smartphones, laptops, audio gear, and accessories.
          </p>
          <Link to="/products">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center bg-black text-white font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-sm shadow-md cursor-pointer"
            >
              Explore Products <ArrowRight className="w-4 h-4 ml-2" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-black">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl font-black text-black tracking-tight mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* CART ITEMS LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
              <AnimatePresence mode="popLayout">
                {cart.map((item, idx) => {
                  const prod = products.find(p => p.id === item.id) || {
                    name: 'Tech Product',
                    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400',
                    brand: 'Cyber'
                  };

                  return (
                    <motion.div
                      key={`${item.id}-${item.color}-${item.storage}-${idx}`}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden"
                    >
                      {/* Item Details */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl p-2 flex items-center justify-center flex-shrink-0">
                          <img src={prod.image} alt={prod.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{prod.brand}</span>
                          <Link to={`/products/${prod.id}`} className="block font-bold text-sm text-black hover:underline">
                            {prod.name}
                          </Link>
                          <div className="text-xs text-gray-500 space-x-2">
                            {item.color && <span>Color: <strong className="text-black">{item.color}</strong></span>}
                            {item.storage && <span>• Storage: <strong className="text-black">{item.storage}</strong></span>}
                          </div>
                          <div className="text-sm font-extrabold text-black pt-1">
                            ${item.price}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        
                        {/* Quantity buttons */}
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.color, item.storage, -1)}
                            className="w-8 h-8 flex items-center justify-center text-black font-bold text-sm hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            -
                          </motion.button>
                          <span className="w-10 text-center text-xs font-bold text-black">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.id, item.color, item.storage, 1)}
                            className="w-8 h-8 flex items-center justify-center text-black font-bold text-sm hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            +
                          </motion.button>
                        </div>

                        {/* Total Item Price */}
                        <div className="text-base font-black text-black w-20 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1, color: '#EF4444' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.id, item.color, item.storage)}
                          className="text-gray-400 p-2 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link to="/products" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="bg-gray-50 rounded-3xl p-6 sm:p-8 space-y-6 h-fit border border-gray-200">
            <h2 className="text-lg font-black text-black tracking-tight border-b border-gray-200 pb-4">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Discount Code
              </label>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. CYBER10"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-xs font-semibold text-black placeholder-gray-400 rounded-xl pl-8 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-black uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-black text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Apply
                </motion.button>
              </form>

              {promoMessage && (
                <p className={`text-xs font-semibold mt-2 ${promoMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                  {promoMessage.message}
                </p>
              )}
              {promoCode && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center justify-between"
                >
                  <span>Code '{promoCode}' active ({discountPercent}% OFF)</span>
                  <span>✓</span>
                </motion.div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 text-xs font-medium text-gray-600 border-t border-b border-gray-200 py-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-black">${cartSubtotal.toFixed(2)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-bold text-black">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-black">${estimatedTax.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-black uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-black">${grandTotal.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/checkout/address')}
              className="w-full bg-black text-white font-bold text-sm py-4 rounded-xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

          </div>

        </div>

      </div>
    </div>
  );
}
