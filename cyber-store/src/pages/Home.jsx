import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Shield, Zap, Sparkles, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { productsList } = useStore();

  const featuredProducts = productsList.filter(p => p.badge === 'Bestseller' || p.badge === 'Nuovo').slice(0, 4);
  const discountProducts = productsList.filter(p => p.originalPrice).slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Banner Section */}
      <section className="bg-black text-white min-h-[600px] flex items-center relative overflow-hidden py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-gray-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Sconti Estivi TechMania Fino al 15% OFF • Codice: TECHMANIA10</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              IPHONE 15 PRO <br />
              <span className="text-gray-400">TITANIO NATURALE</span>
            </h1>

            <p className="text-base text-gray-400 max-w-md leading-relaxed">
              Incontra la nuova era della tecnologia mobile con il chip A17 Pro ultra-veloce, design in titanio di grado aerospaziale e fotocamera principale da 48 MP.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products/iphone-15-pro-max"
                className="px-8 py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-gray-200 transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2 text-sm"
              >
                <span>Acquista Ora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="px-8 py-4 border border-gray-700 text-white font-extrabold rounded-2xl hover:bg-white/10 transition-all text-sm"
              >
                Esplora Catalogo
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center"
          >
            <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 absolute opacity-50 blur-3xl" />
            <img
              src="/assets/Iphone15pro.png"
              alt="iPhone 15 Pro Max TechMania"
              className="relative z-10 max-h-[480px] object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform duration-500"
            />
          </motion.div>

        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">Categorie Popolari</h2>
            <p className="text-xs text-gray-500">Trova rapidamente i migliori dispositivi per le tue esigenze</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
            Vedi tutte <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: 'Smartphone', img: '/assets/Iphone15pro.png', count: '12 Modelli', category: 'Smartphones' },
            { name: 'Cuffie & Audio', img: '/assets/airpodsmax.png', count: '8 Modelli', category: 'Audio' },
            { name: 'Console & Gaming', img: '/assets/ps5.png', count: '5 Modelli', category: 'Gaming' },
            { name: 'Smartwatch', img: '/assets/applewatch.png', count: '6 Modelli', category: 'Wearables' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat.category)}`}
              className="group bg-gray-50 hover:bg-black hover:text-white p-6 rounded-3xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-2xl"
            >
              <div className="w-28 h-28 flex items-center justify-center">
                <img src={cat.img} alt={cat.name} className="max-h-24 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-black group-hover:text-white">{cat.name}</h3>
                <p className="text-[11px] text-gray-400 group-hover:text-gray-300">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">Prodotti In Evidenza</h2>
            <p className="text-xs text-gray-500">I dispositivi più acquistati e amati dai clienti TechMania</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
            Sfoglia tutti <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-gray-200 relative overflow-hidden">
          <div className="space-y-4 z-10">
            <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-full">
              Sconto Esclusivo TechMania
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              PlayStation 5 Slim Digital Edition
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md">
              Vivi il gioco senza limiti. Grafica 4K a 120 FPS, SSD ad altissima velocità e feedback aptico avanzato DualSense.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <span className="text-3xl font-black text-black">$449.00</span>
              <span className="text-sm font-bold text-gray-400 line-through">$499.00</span>
              <Link
                to="/products/playstation-5-digital"
                className="ml-auto px-6 py-3 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors text-xs flex items-center gap-2"
              >
                <span>Acquista Ora</span>
                <ShoppingBag className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex justify-center items-center z-10">
            <img src="/assets/ps5.png" alt="PlayStation 5 TechMania" className="max-h-72 object-contain hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* Special Deals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">Offerte e Sconti</h2>
            <p className="text-xs text-gray-500">Risparmia subito sui migliori prodotti tecnologici dell'anno</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
            Vedi Offerte <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}
