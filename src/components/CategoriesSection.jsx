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
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              {...staggerItem}
              className={index === 0 ? 'md:col-span-2 lg:col-span-2' : undefined}
            >
              <Link to={`/catalogo?categoria=${encodeURIComponent(cat.slug || cat.name)}`} className="block h-full">
                <CategoryCard cat={cat} featured={index === 0} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CategoryCard({ cat, featured = false }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative h-full cursor-pointer overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,.12)]"
      style={{ minHeight: featured ? '360px' : '340px' }}
    >
      <div className="absolute inset-0">
        <Image src={cat.image} alt={cat.name} className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.06]" fittingType="fill" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-all duration-300 group-hover:from-black/85" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
        <div>
          <p className="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">{cat.count}</p>
          <h3 className={`font-bold text-white mb-0 ${featured ? 'text-3xl sm:text-4xl tracking-[-0.02em]' : 'text-2xl'}`}>{cat.name}</h3>
        </div>
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 translate-x-2 place-items-center rounded-full bg-white/90 text-[#1d1d1f] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M8 3l5 5-5 5" />
          </svg>
        </span>
      </div>
    </motion.div>
  );
}