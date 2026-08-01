import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { PRODUCT_CATALOG, CATEGORIES } from '@/lib/productCatalog';

export default function Catalogo() {
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const filtered = useMemo(() => {
    let result = activeFilter === 'Tutti'
      ? [...PRODUCT_CATALOG]
      : PRODUCT_CATALOG.filter(p => p.category === activeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => parseFloat(a.price.replace('€', '').replace('.', '')) - parseFloat(b.price.replace('€', '').replace('.', '')));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => parseFloat(b.price.replace('€', '').replace('.', '')) - parseFloat(a.price.replace('€', '').replace('.', '')));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [activeFilter, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />

      {/* Header */}
      <section className="bg-white pt-12 pb-8 px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#FF6B35] transition-colors mb-4">
            <ArrowLeft size={16} /> Torna alla Home
          </Link>
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Catalogo Completo</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
              Tutti i Prodotti Apple
            </h1>
            <p className="mt-3 text-[#6e6e73] max-w-lg">
              Esplora l'intero catalogo di {PRODUCT_CATALOG.length} prodotti. Usa i filtri e la ricerca per trovare quello perfetto per te.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Barra filtri */}
      <section className="sticky top-16 z-40 bg-[#f5f5f7]/95 backdrop-blur-md border-b border-gray-200 px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Ricerca + ordinamento */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca prodotti..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm text-[#1d1d1f] border border-gray-200 focus:border-[#FF6B35] focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73] pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white rounded-full text-sm text-[#1d1d1f] border border-gray-200 focus:border-[#FF6B35] focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="default">Ordine predefinito</option>
                <option value="price-asc">Prezzo crescente</option>
                <option value="price-desc">Prezzo decrescente</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          {/* Filtri categoria */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-white text-[#1d1d1f] hover:bg-[#e8e8ed] border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto text-sm text-[#6e6e73] font-medium">
              {filtered.length} risultati
            </span>
          </div>
        </div>
      </section>

      {/* Griglia */}
      <section className="py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-[#1d1d1f] mb-1">Nessun prodotto trovato</p>
              <p className="text-sm text-[#6e6e73]">Prova a modificare i filtri o la ricerca.</p>
            </div>
          ) : (
            <motion.div {...staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <motion.div key={product.id} layout {...staggerItem} exit={{ opacity: 0, scale: 0.9 }}>
                    <CatalogCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

function CatalogCard({ product }) {
  return (
    <Link to={`/scheda-prodotto?id=${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="group bg-white rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col"
      >
        <div className="relative overflow-hidden" style={{ paddingBottom: '100%' }}>
          <div className="absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
              fittingType="fill"
            />
          </div>
          {product.badge && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">
              {product.badge}
            </div>
          )}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            {product.category}
          </div>
        </div>
        <div className="p-3 md:p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-[#1d1d1f] leading-snug mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-xs text-[#6e6e73] leading-relaxed mb-3 line-clamp-2 flex-1">{product.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-sm font-bold text-[#1d1d1f]">{product.price}</p>
            <span className="text-xs font-semibold text-[#FF6B35] group-hover:underline">Vedi dettagli →</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}