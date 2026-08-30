import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Watch, Camera, Headphones, Laptop, Gamepad2, ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones as HeadphonesIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';

export default function Home() {
  const [activeTab, setActiveTab] = useState('New Arrival');
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => {
    if (activeTab === 'New Arrival') return p.isNew;
    if (activeTab === 'Bestseller') return p.isBestseller;
    if (activeTab === 'Featured Products') return p.isFeatured;
    return true;
  }).slice(0, 8);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-8 h-8" />;
      case 'Watch': return <Watch className="w-8 h-8" />;
      case 'Camera': return <Camera className="w-8 h-8" />;
      case 'Headphones': return <Headphones className="w-8 h-8" />;
      case 'Laptop': return <Laptop className="w-8 h-8" />;
      case 'Gamepad2': return <Gamepad2 className="w-8 h-8" />;
      default: return <Smartphone className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* HERO SECTION */}
      <section className="bg-black text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="space-y-6 max-w-xl text-center md:text-left z-10">
            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold bg-gray-900 px-3 py-1.5 rounded-full inline-block">
              Pro.Beyond.
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              IPHONE 15 PRO
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              Created to change everything for the better. Titanium design, A17 Pro chip, customizable Action button, and 48MP Pro camera.
            </p>
            <div className="pt-2">
              <Link
                to="/products/iphone-15-pro-max"
                className="inline-flex items-center justify-center bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-all text-sm tracking-wide shadow-lg group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-md md:max-w-lg flex items-center justify-center">
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gray-800/50 rounded-full blur-3xl -z-10" />
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop"
              alt="iPhone 15 Pro"
              className="max-h-[420px] object-contain drop-shadow-2xl animate-pulse-subtle"
            />
          </div>

        </div>
      </section>

      {/* FEATURED BANNER GRID */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tile 1: PlayStation 5 */}
            <div className="bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Gaming</span>
                <h3 className="text-xl font-extrabold text-black mt-1">PlayStation 5 Slim</h3>
                <p className="text-xs text-gray-500 mt-1">Next-gen gaming power</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop"
                alt="PS5"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/playstation-5-slim" className="text-xs font-bold text-black flex items-center gap-1 hover:underline z-10 mt-auto">
                Shop PlayStation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tile 2: AirPods Max */}
            <div className="bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Audio</span>
                <h3 className="text-xl font-extrabold text-black mt-1">AirPods Max</h3>
                <p className="text-xs text-gray-500 mt-1">High-fidelity audio</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=600&auto=format&fit=crop"
                alt="AirPods Max"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/airpods-max" className="text-xs font-bold text-black flex items-center gap-1 hover:underline z-10 mt-auto">
                Shop AirPods <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tile 3: Apple Vision Pro */}
            <div className="bg-black text-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Spatial</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Apple Vision Pro</h3>
                <p className="text-xs text-gray-400 mt-1">Welcome to spatial computing</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=600&auto=format&fit=crop"
                alt="Vision Pro"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/apple-vision-pro" className="text-xs font-bold text-white flex items-center gap-1 hover:underline z-10 mt-auto">
                Explore Vision Pro <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tile 4: MacBook Pro */}
            <div className="bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Computers</span>
                <h3 className="text-xl font-extrabold text-black mt-1">MacBook Pro 16"</h3>
                <p className="text-xs text-gray-500 mt-1">Mind-blowing M3 Max power</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop"
                alt="MacBook Pro"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/macbook-pro-16-m3" className="text-xs font-bold text-black flex items-center gap-1 hover:underline z-10 mt-auto">
                Shop MacBook <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-black tracking-tight">Browse By Category</h2>
            <Link to="/products" className="text-sm font-bold text-black hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="bg-gray-100 hover:bg-black hover:text-white text-black p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group cursor-pointer"
              >
                <div className="p-3 bg-white text-black rounded-xl group-hover:bg-gray-800 group-hover:text-white transition-colors">
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-sm font-bold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS TAB GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 pb-4 mb-8 overflow-x-auto">
            {['New Arrival', 'Bestseller', 'Featured Products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-base font-bold whitespace-nowrap transition-colors pb-2 -mb-4 ${
                  activeTab === tab
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-black text-white font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-sm"
            >
              Explore All Products
            </Link>
          </div>

        </div>
      </section>

      {/* PROMO / BIG SALE BANNER */}
      <section className="bg-black text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-lg z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 bg-red-950/60 px-3 py-1 rounded-full border border-red-800">
              Limited Time Offer
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Big Summer Sale 15% OFF
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Use promo code <span className="font-bold text-white bg-gray-800 px-2 py-0.5 rounded">CYBER10</span> at checkout for instant savings on all gadgets and accessories.
            </p>
            <div>
              <Link
                to="/products"
                className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
              >
                Shop The Sale
              </Link>
            </div>
          </div>

          <div className="relative z-10">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
              alt="Headphones Sale"
              className="w-72 sm:w-96 object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION BADGES */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Free Delivery</h4>
                <p className="text-xs text-gray-500">Free shipping on all orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">1 Year Warranty</h4>
                <p className="text-xs text-gray-500">100% authentic original products</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">30 Days Return</h4>
                <p className="text-xs text-gray-500">Hassle-free 30-day money back</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <HeadphonesIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">24/7 Support</h4>
                <p className="text-xs text-gray-500">Dedicated support team online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
