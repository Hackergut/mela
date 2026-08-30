import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import { useStore } from '../context/StoreContext';

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    discountPercent,
    promoCode,
    selectedShippingId,
    clearCart,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardData, setCardCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    saveCard: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shippingCost = selectedShippingId === 'ship-priority' ? 15.00 : selectedShippingId === 'ship-sameday' ? 25.00 : selectedShippingId === 'ship-standard' ? 8.50 : 0;
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const estimatedTax = (cartSubtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + estimatedTax);

  const handlePayOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedOrderNum = `CYBER-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrderNum);
      setIsOrderComplete(true);
      clearCart();
    }, 1500);
  };

  if (isOrderComplete) {
    return (
      <div className="min-h-screen bg-white py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Payment Successful
            </span>
            <h1 className="text-3xl font-black text-black tracking-tight mt-2">Order Confirmed!</h1>
            <p className="text-xs font-mono font-bold text-gray-500 mt-1">Order ID: #{orderNumber}</p>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
            Thank you for your purchase from Cyber Store! We have received your order and sent a confirmation receipt to your email address.
          </p>

          <div className="pt-4 space-y-3">
            <Link
              to="/products"
              className="block w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-xs"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="block w-full text-xs font-bold text-black hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Steps Progress Bar */}
        <CheckoutSteps currentStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          
          {/* STEP 3 MAIN CONTENT: PAYMENT FORM */}
          <div className="lg:col-span-2 space-y-8">
            
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight mb-2">Payment Details</h1>
              <p className="text-xs text-gray-500">All transactions are encrypted with 256-bit SSL security.</p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'credit-card', name: 'Credit Card', icon: CreditCard },
                { id: 'paypal', name: 'PayPal', icon: ShieldCheck },
                { id: 'apple-pay', name: 'Apple Pay', icon: Lock },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{method.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Credit Card Form */}
            {paymentMethod === 'credit-card' ? (
              <form onSubmit={handlePayOrder} className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-200 space-y-6">
                
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardData.number}
                      onChange={(e) => setCardCardData({ ...cardData, number: e.target.value })}
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-black focus:ring-2 focus:ring-black focus:outline-none pl-11"
                    />
                    <CreditCard className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="JOHN DOE"
                    value={cardData.name}
                    onChange={(e) => setCardCardData({ ...cardData, name: e.target.value })}
                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none uppercase"
                  />
                </div>

                {/* Expiration + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardCardData({ ...cardData, expiry: e.target.value })}
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="•••"
                      value={cardData.cvv}
                      onChange={(e) => setCardCardData({ ...cardData, cvv: e.target.value })}
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save Card Checkbox */}
                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cardData.saveCard}
                    onChange={(e) => setCardCardData({ ...cardData, saveCard: e.target.checked })}
                    className="rounded text-black focus:ring-black w-4 h-4"
                  />
                  <span>Save card securely for future purchases</span>
                </label>

                {/* Submit Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold text-sm py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment…</span>
                    </div>
                  ) : (
                    <span>Pay ${grandTotal.toFixed(2)}</span>
                  )}
                </button>

              </form>
            ) : (
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 text-center space-y-4">
                <p className="text-xs text-gray-600">
                  You will be redirected to complete payment with <strong>{paymentMethod.toUpperCase()}</strong>.
                </p>
                <button
                  onClick={handlePayOrder}
                  disabled={isProcessing}
                  className="bg-black text-white text-xs font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800"
                >
                  Complete Order with {paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Link to="/checkout/shipping" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Shipping
              </Link>
            </div>

          </div>

          {/* ITEMIZATION ORDER SUMMARY SIDEBAR */}
          <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-200 h-fit">
            <h3 className="text-sm font-black text-black uppercase tracking-wider border-b border-gray-200 pb-3">
              Final Order Breakdown
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-100">
              {cart.map((item, i) => (
                <div key={i} className="pt-2 flex justify-between text-xs font-medium">
                  <div className="truncate pr-2">
                    <span className="font-bold text-black">{item.quantity}x</span> {item.id.replace(/-/g, ' ')}
                  </div>
                  <span className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-black">${cartSubtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({promoCode})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-black">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-black">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-gray-200">
                <span>Total Due</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
