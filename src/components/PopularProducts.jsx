import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useProducts } from '@/lib/useProducts';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 12;

export default function PopularProducts() {
  const { products, loading } = useProducts();
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filters = ['Tutti', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = activeFilter === 'Tutti'
    ? products
    : products.filter(p => p.category === activeFilter);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleFilter = (f) => { setActiveFilter(f); setVisibleCount(PAGE_SIZE); };

  return (
    <section id="products" className="py-20 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-8">
          <p className="text-sm font-semibold text-[#0066cc] mb-3">Lo Store</p>
          <h2 className="text-4xl md:text-6xl font-semibold leading-[1.02] text-[#1d1d1f] tracking-[-0.045em]">Scegli. Configura.<br />Fallo tuo.</h2>
          <p className="mt-5 text-[#6e6e73] text-base max-w-xl mx-auto leading-7">
            {products.length} prodotti con prezzi, configurazioni e disponibilità aggiornati direttamente dal catalogo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mt-8 mb-10 flex-wrap"
        >
          {filters.map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>
        ) : (
          <motion.div {...staggerContainer} layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            <AnimatePresence mode="popLayout">
              {visible.map((product) => (
                <motion.div key={product.id} layout {...staggerItem} exit={{ opacity: 0, scale: 0.9 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {hasMore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="px-8 py-3.5 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-full hover:bg-[#e8e8ed] transition-colors duration-200 border border-[#d2d2d7]"
            >
              Carica Altri ({filtered.length - visibleCount} restanti)
            </button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-10 text-center">
          <Link
            to="/catalogo"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1d1d1f] px-7 text-sm font-semibold text-white transition hover:bg-[#0071e3]"
          >
            Vedi tutto il catalogo
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
