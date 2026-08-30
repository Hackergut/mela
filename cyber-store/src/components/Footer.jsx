import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useStore();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Thank you for subscribing to Cyber newsletter!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-3xl font-black tracking-widest text-white uppercase inline-block">
              cyber
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              We are a high-concept store offering cutting-edge gadgets, flagship smartphones, top-tier audio gear, and premium electronic accessories.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#twitter" aria-label="Twitter" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#facebook" aria-label="Facebook" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#instagram" aria-label="Instagram" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#youtube" aria-label="Youtube" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Services</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white transition-colors">Bonus program</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Gift cards</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Credit and payment</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Service contracts</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Non-cash account</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Payment</Link></li>
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Assistance</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/cart" className="hover:text-white transition-colors">Find an order</Link></li>
              <li><Link to="/checkout/shipping" className="hover:text-white transition-colors">Terms of delivery</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Exchange and return</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Guarantee</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Frequently asked questions</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Terms of use</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Subscribe</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Stay up to date with new arrivals, exclusive discounts, and product drops.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 CYBER Store. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-gray-400 transition-colors">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
