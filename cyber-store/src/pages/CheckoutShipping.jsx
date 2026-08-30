import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Zap, Clock, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import { useStore } from '../context/StoreContext';

export default function CheckoutShipping() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    discountPercent,
    selectedShippingId,
    setSelectedShippingId
  } = useStore();

  const shippingMethods = [
    {
      id: 'ship-free',
      name: 'Free Shipping',
      price: 0,
      time: '7-10 Business Days',
      desc: 'Standard postal delivery across all regions',
      icon: Truck,
    },
    {
      id: 'ship-standard',
      name: 'Standard Express',
      price: 8.50,
      time: '3-5 Business Days',
      desc: 'Tracked courier delivery directly to your door',
      icon: Truck,
    },
    {
      id: 'ship-priority',
      name: 'Priority Overnight',
      price: 15.00,
      time: '1-2 Business Days',
      desc: 'Fastest priority flight delivery with signature required',
      icon: Zap,
    },
    {
      id: 'ship-sameday',
      name: 'Same Day Delivery',
      price: 25.00,
      time: 'Delivered Today (by 8 PM)',
      desc: 'Local courier rush dispatch for urgent orders',
      icon: Clock,
    },
  ];

  const selectedMethod = shippingMethods.find(m => m.id === selectedShippingId) || shippingMethods[0];

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const shippingCost = selectedMethod.price;
  const estimatedTax = (cartSubtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + estimatedTax);

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Steps Progress Bar */}
        <CheckoutSteps currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          
          {/* STEP 2 MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight mb-2">Select Shipping Method</h1>
              <p className="text-xs text-gray-500">Choose how fast you want your order delivered.</p>
            </div>

            {/* Shipping Options Radio Cards */}
            <div className="space-y-4">
              {shippingMethods.map((method) => {
                const isSelected = selectedShippingId === method.id;
                const Icon = method.icon;

                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedShippingId(method.id)}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-black/5 border-black ring-1 ring-black shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-black">{method.name}</h3>
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {method.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-sm text-black">
                        {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-black border-black text-white' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link to="/checkout/address" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Address
              </Link>

              <button
                onClick={() => navigate('/checkout/payment')}
                className="bg-black text-white font-bold text-xs px-8 py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2 active:scale-98"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ORDER SUMMARY SIDEBAR PREVIEW */}
          <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-200 h-fit">
            <h3 className="text-sm font-black text-black uppercase tracking-wider border-b border-gray-200 pb-3">
              Order Summary
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
              <div className="flex justify-between">
                <span>Selected Method</span>
                <span className="font-bold text-black">{selectedMethod.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span className="font-bold text-black">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
