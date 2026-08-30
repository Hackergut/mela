import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Watch, Camera, Headphones, Laptop, Gamepad2, ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones as HeadphonesIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Novità');
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => {
    if (activeTab === 'Novità') return p.isNew;
    if (activeTab === 'Più Venduti') return p.isBestseller;
    if (activeTab === 'In Evidenza') return p.isFeatured;
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
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-6 max-w-xl text-center md:text-left z-10"
          >
            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold bg-gray-900 px-3 py-1.5 rounded-full inline-block border border-gray-800">
              Oltre Ogni Limite
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              IPHONE 15 PRO
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              Creato per cambiare tutto in meglio. Design in titanio aerospaziale, chip A17 Pro, tasto Azione personalizzabile e fotocamera Pro da 48MP.
            </p>
            <div className="pt-2">
              <Link to="/products/iphone-15-pro-max">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-all text-sm tracking-wide shadow-lg group cursor-pointer"
                >
                  <span>Acquista Ora</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="relative w-full max-w-md md:max-w-lg flex items-center justify-center"
          >
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-gray-800/50 rounded-full blur-3xl -z-10" />
            <motion.img
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              src="/assets/iphone-image-2619-2264.png"
              alt="iPhone 15 Pro Max"
              className="max-h-[420px] object-contain drop-shadow-2xl"
            />
          </motion.div>

        </div>
      </section>

      {/* FEATURED BANNER GRID */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tile 1: PlayStation 5 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Gaming</span>
                <h3 className="text-xl font-extrabold text-black mt-1">PlayStation 5 Slim</h3>
                <p className="text-xs text-gray-500 mt-1">Potenza di nuova generazione</p>
              </div>
              <img
                src="/assets/playstation-2619-2204.png"
                alt="PS5"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/playstation-5-slim" className="text-xs font-bold text-black flex items-center gap-1 hover:underline z-10 mt-auto">
                Scopri PlayStation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Tile 2: AirPods Max */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Audio</span>
                <h3 className="text-xl font-extrabold text-black mt-1">AirPods Max</h3>
                <p className="text-xs text-gray-500 mt-1">Audio ad altissima fedeltà</p>
              </div>
              <img
                src="/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png"
                alt="AirPods Max"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/airpods-max" className="text-xs font-bold text-black flex items-center gap-1 hover:underline z-10 mt-auto">
                Scopri AirPods <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Tile 3: Apple Vision Pro */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-black text-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Calcolo Spaziale</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Apple Vision Pro</h3>
                <p className="text-xs text-gray-400 mt-1">Benvenuti nel futuro spaziale</p>
              </div>
              <img
                src="/assets/image-61-2619-1982.png"
                alt="Vision Pro"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/apple-vision-pro" className="text-xs font-bold text-white flex items-center gap-1 hover:underline z-10 mt-auto">
                Esplora Vision Pro <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Tile 4: MacBook Pro */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-2xl p-6 flex flex-col justify-between h-80 relative overflow-hidden group border border-gray-200 shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">Computer</span>
                <h3 className="text-xl font-extrabold text-black mt-1">MacBook Pro 16"</h3>
                <p className="text-xs text-gray-500 mt-1">Potenza straordinaria M3 Max</p>
              </div>
              <img
                src="/assets/banner-2-2619-2128.png"
                alt="MacBook Pro"
                className="w-36 h-36 object-contain absolute right-2 bottom-4 group-hover:scale-110 transition-transform duration-300"
              />
              <Link to="/products/macbook-pro-16-m3" className="text-xs font-bold text-black flex items-center gap-1 hover:underline z-10 mt-auto">
                Scopri MacBook <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-black tracking-tight">Esplora per Categoria</h2>
            <Link to="/products" className="text-sm font-bold text-black hover:underline flex items-center gap-1">
              Vedi Tutte <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                className="bg-gray-100 hover:bg-black hover:text-white text-black p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-colors duration-300 group cursor-pointer shadow-sm"
              >
                <div className="p-3 bg-white text-black rounded-xl group-hover:bg-gray-800 group-hover:text-white transition-colors">
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-sm font-bold">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS TAB GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 pb-4 mb-8 overflow-x-auto">
            {['Novità', 'Più Venduti', 'In Evidenza'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative text-base font-bold whitespace-nowrap transition-colors pb-2 -mb-4 ${
                    isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeHomeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid with AnimatePresence */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="text-center mt-12">
            <Link to="/products">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-center bg-black text-white font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-sm shadow-md cursor-pointer"
              >
                Vedi Tutti i Prodotti
              </motion.div>
            </Link>
          </div>

        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="bg-black text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-lg z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 bg-red-950/60 px-3 py-1 rounded-full border border-red-800">
              Offerta a Tempo Limitato
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Sconti Estivi Fino al 15% OFF
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Usa il codice sconto <span className="font-bold text-white bg-gray-800 px-2 py-0.5 rounded">CYBER10</span> al checkout per risparmiare subito su tutti i gadget e accessori.
            </p>
            <div>
              <Link to="/products">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm shadow-lg cursor-pointer"
                >
                  Acquista in Offerta
                </motion.div>
              </Link>
            </div>
          </div>

          <div className="relative z-10">
            <motion.img
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
              src="/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png"
              alt="Offerta Cuffie"
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
                <h4 className="text-sm font-bold text-black">Spedizione Gratuita</h4>
                <p className="text-xs text-gray-500">Consegna gratuita su ordini superiori a $100</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Garanzia 1 Anno</h4>
                <p className="text-xs text-gray-500">Prodotti originali garantiti al 100%</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Reso Entro 30 Giorni</h4>
                <p className="text-xs text-gray-500">Soddisfatti o rimborsati senza complicazioni</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm text-black border border-gray-200">
                <HeadphonesIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Assistenza 24/7</h4>
                <p className="text-xs text-gray-500">Team di supporto dedicato sempre disponibile</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
