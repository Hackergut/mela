import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import CheckoutSteps from '../components/CheckoutSteps';
import { useStore } from '../context/StoreContext';

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    discountPercent,
    selectedAddressId,
    setSelectedAddressId,
    showToast
  } = useStore();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      tag: 'HOME',
      name: 'John Doe',
      street: '2118 Thornridge Cir.',
      city: 'Syracuse',
      state: 'NY',
      zip: '35624',
      country: 'United States',
      phone: '+1 (555) 234-5678',
      isDefault: true,
    },
    {
      id: 'addr-2',
      tag: 'OFFICE',
      name: 'John Doe (Cyber Corp)',
      street: '1901 Thornridge Cir.',
      city: 'Shiloh',
      state: 'HI',
      zip: '81263',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefault: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddress] = useState({
    tag: 'HOME',
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
  });

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (newAddr.name && newAddr.street && newAddr.city) {
      const created = {
        ...newAddr,
        id: `addr-${Date.now()}`,
      };
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowAddForm(false);
      showToast('New shipping address saved!');
      setNewAddress({ tag: 'HOME', name: '', street: '', city: '', state: '', zip: '', country: 'United States', phone: '' });
    }
  };

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const shippingCost = cartSubtotal > 100 ? 0 : 8.50;
  const estimatedTax = (cartSubtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + estimatedTax);

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Steps Progress Bar */}
        <CheckoutSteps currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
          
          {/* STEP 1 MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight mb-2">Select Shipping Address</h1>
              <p className="text-xs text-gray-500">Choose where you would like your order delivered.</p>
            </div>

            {/* Saved Addresses Radio Cards */}
            <div className="space-y-4">
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-black/5 border-black ring-1 ring-black shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {addr.tag}
                        </span>
                        <h3 className="font-bold text-sm text-black">{addr.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 pt-1">
                        {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                      </p>
                      <p className="text-xs text-gray-500 font-mono pt-0.5">{addr.phone}</p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-black border-black text-white' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Address Toggle Button */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-xs font-bold text-gray-700 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-sm font-bold text-black">New Shipping Address</h3>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-bold text-gray-400 hover:text-black">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddress({ ...newAddr, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddress({ ...newAddr, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddress({ ...newAddr, street: e.target.value })}
                    placeholder="123 Cyber Street, Suite 400"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddress({ ...newAddr, city: e.target.value })}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddress({ ...newAddr, state: e.target.value })}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={newAddr.zip}
                      onChange={(e) => setNewAddress({ ...newAddr, zip: e.target.value })}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-black text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link to="/cart" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Cart
              </Link>

              <button
                onClick={() => navigate('/checkout/shipping')}
                className="bg-black text-white font-bold text-xs px-8 py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2 active:scale-98"
              >
                <span>Continue to Shipping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* ORDER SUMMARY SIDEBAR PREVIEW */}
          <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-200 h-fit">
            <h3 className="text-sm font-black text-black uppercase tracking-wider border-b border-gray-200 pb-3">
              Summary ({cart.length} items)
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
                <span>Shipping</span>
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
