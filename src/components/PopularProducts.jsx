import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useProducts } from '@/lib/useProducts';
import ProductActions from '@/components/ProductActions';

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
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const href = `/scheda-prodotto?id=${product.id}`;
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-[#f5f5f7]"
    >
      <div className="relative aspect-square overflow-hidden">
        <Link to={href} className="absolute inset-0 p-4" aria-label={`Scopri ${product.name}`}>
          <Image src={product.image} alt={product.name} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.025]" fittingType="fit" />
        </Link>
        {product.badge && <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#0071E3] px-2.5 py-1 text-xs font-semibold text-white">{product.badge}</div>}
        {product.category && <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#1d1d1f] backdrop-blur-sm">{product.category}</div>}
        <div className="absolute bottom-3 right-3 z-10 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <ProductActions product={product} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <p className={`mb-1 text-xs font-medium ${product.in_stock ? 'text-[#248a3d]' : 'text-[#d70015]'}`}>{product.in_stock ? 'Disponibile' : 'Esaurito'}</p>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-[#1d1d1f]">
          <Link to={href} className="hover:text-[#0066cc]">{product.name}</Link>
        </h3>
        <p className="mb-3 line-clamp-3 flex-1 text-xs leading-relaxed text-[#6e6e73]">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#1d1d1f]">{product.price}</p>
          <Link to={href} className="text-xs font-semibold text-[#0066cc] hover:underline">Scopri →</Link>
        </div>
      </div>
    </motion.article>
  );
}