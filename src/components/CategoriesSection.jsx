import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useCatalog } from '@/lib/useProducts';

export default function CategoriesSection() {
  const { categories: catalogCategories } = useCatalog();
  const categories = catalogCategories
    .filter(category => category.product_count > 0)
    .map(category => ({ ...category, count: `${category.product_count} ${category.product_count === 1 ? 'prodotto' : 'prodotti'}` }));

  return (
    <section id="categories" className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-sm font-semibold text-[#0066cc] mb-3">Esplora</p>
          <h2 className="text-4xl md:text-6xl font-semibold leading-[1.02] text-[#1d1d1f] tracking-[-0.045em]">
            Tutto al posto giusto.
          </h2>
          <p className="mt-5 text-[#6e6e73] text-base leading-7 max-w-xl mx-auto">
            Esplora le categorie e trova più velocemente la configurazione giusta.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <motion.div key={cat.id} {...staggerItem}>
              <Link to={`/catalogo?categoria=${encodeURIComponent(cat.slug || cat.name)}`} className="block h-full">
                <CategoryCard cat={cat} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CategoryCard({ cat }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl bg-white cursor-pointer h-full"
      style={{ minHeight: '340px' }}
    >
      <div className="absolute inset-0">
        <Image src={cat.image} alt={cat.name} className="w-full h-full transition-transform duration-500 group-hover:scale-105" fittingType="fill" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
        <p className="text-white/70 text-sm font-medium">{cat.count}</p>
      </div>
      <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h10M8 3l5 5-5 5" />
        </svg>
      </div>
    </motion.div>
  );
}