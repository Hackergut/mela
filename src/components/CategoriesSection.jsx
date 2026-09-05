import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useCatalog } from '@/lib/useProducts';

export default function CategoriesSection() {
  const { categories: catalogCategories, products } = useCatalog();

  // Pick a representative product image for each category (categories don't
  // carry their own cover image). Use the first product in the category,
  // falling back to the first featured product.
  const coverFor = (name) => {
    const inCategory = products.find((p) => (p.category_id ? false : p.category === name) || p.category === name);
    if (inCategory?.image) return inCategory.image;
    const any = products.find((p) => p.image);
    return any?.image || '';
  };

  const categories = catalogCategories
    .filter((category) => category.product_count > 0)
    .map((category) => ({
      ...category,
      image: category.image || coverFor(category.name),
      count: `${category.product_count} ${category.product_count === 1 ? 'prodotto' : 'prodotti'}`,
    }));

  return (
    <section id="categories" className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-sm font-semibold text-[#0066cc] mb-3">Esplora</p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-[1.02] text-[#1d1d1f] tracking-[-0.045em]">
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
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative h-full cursor-pointer overflow-hidden rounded-[28px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] ${
        featured ? 'min-h-[320px] sm:min-h-[420px] lg:min-h-[440px]' : 'min-h-[300px] sm:min-h-[400px] lg:min-h-[420px]'
      }`}
    >
      {/* Light, product-first background (Apple tile look) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f7] to-white" />
      <div className="absolute inset-x-0 top-0 h-[58%] sm:h-2/3">
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.name}
            className="h-full w-full object-contain p-5 sm:p-8 transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            fittingType="fit"
            quality={85}
          />
        ) : null}
      </div>

      {/* Copy anchored at the bottom, no heavy dark overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-center sm:p-8">
        <h3
          className={`font-semibold tracking-[-0.02em] text-[#1d1d1f] ${
            featured ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {cat.name}
        </h3>
        <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#0071e3] opacity-0 transition-all duration-300 group-hover:opacity-100">
          {cat.count}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 3l5 5-5 5" />
          </svg>
        </p>
      </div>
    </motion.div>
  );
}