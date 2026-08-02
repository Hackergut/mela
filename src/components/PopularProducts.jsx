import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { PRODUCT_CATALOG, CATEGORIES } from '@/lib/productCatalog';
import ProductActions from '@/components/ProductActions';

const FILTERS = CATEGORIES;
const PAGE_SIZE = 12;

export default function PopularProducts() {
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = activeFilter === 'Tutti'
    ? PRODUCT_CATALOG
    : PRODUCT_CATALOG.filter(p => p.category === activeFilter);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleFilter = (f) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section id="products" className="py-20 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Catalogo Prodotti</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Esplora il Nostro<br />Catalogo Completo.
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            {PRODUCT_CATALOG.length} prodotti selezionati, organizzati per categoria con descrizioni dettagliate.
          </p>
        </motion.div>

        {/* Filtri */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mt-8 mb-10 flex-wrap"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Griglia prodotti */}
        <motion.div {...staggerContainer} layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((product) => (
              <motion.div
                key={product.id}
                layout
                {...staggerItem}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="px-8 py-3.5 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-full hover:bg-[#e8e8ed] transition-colors duration-200 border border-[#d2d2d7]"
            >
              Carica Altri ({filtered.length - visibleCount} restanti)
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={`/scheda-prodotto?id=${product.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="group bg-[#f5f5f7] rounded-2xl overflow-hidden cursor-pointer h-full flex flex-col"
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
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#1d1d1f] text-xs font-semibold rounded-full">
            {product.category}
          </div>
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ProductActions product={product} />
          </div>
        </div>
        <div className="p-3 md:p-4 flex flex-col flex-1">
          <p className="text-xs text-[#6e6e73] mb-1 font-medium uppercase tracking-wide">Disponibile</p>
          <h3 className="text-sm font-semibold text-[#1d1d1f] leading-snug mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-xs text-[#6e6e73] leading-relaxed mb-3 line-clamp-3 flex-1">{product.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-sm font-bold text-[#1d1d1f]">{product.price}</p>
            <span className="px-3 py-1.5 bg-[#1d1d1f] text-white text-xs font-semibold rounded-full group-hover:bg-[#FF6B35] transition-colors">
              Dettagli
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}