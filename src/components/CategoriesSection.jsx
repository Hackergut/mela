import React from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useProducts } from '@/lib/useProducts';
import { IPHONE_GALLERY } from '@/lib/productCatalog';

const IMG = 'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b';

const CATEGORY_DEFS = [
  { id: 'iPhone', name: 'iPhone', image: IPHONE_GALLERY[0] },
  { id: 'Apple Watch', name: 'Apple Watch', image: `${IMG}/f661dd828_IMG_1661.jpeg` },
  { id: 'iPad', name: 'iPad', image: `${IMG}/4d118691e_IMG_1692.jpeg` },
  { id: 'AirPods', name: 'AirPods', image: `${IMG}/4d51436f9_IMG_1689.jpeg` },
  { id: 'AirPods Max', name: 'AirPods Max', image: `${IMG}/a70b6b104_IMG_1709.png` },
  { id: 'Mac', name: 'Mac', image: `${IMG}/6eb07533c_IMG_1703.png` },
  { id: 'Accessori', name: 'Accessori', image: `${IMG}/79fd2128e_IMG_1690.jpeg` },
  { id: 'Ecosistema', name: 'Ecosistema Apple', image: `${IMG}/3e4cbc97a_IMG_1667.png` },
];

export default function CategoriesSection() {
  const { products } = useProducts();

  const categories = CATEGORY_DEFS.map(def => ({
    ...def,
    count: `${products.filter(p => p.category === def.id).length} ${def.id === 'iPhone' ? 'modelli' : 'pezzi'}`,
  })).filter(c => c.count.startsWith('0') === false || true);

  return (
    <section id="categories" className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Esplora</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Scopri le Nostre <span className="text-[#FF6B35]">Categorie</span>
          </h2>
          <p className="mt-4 text-[#6e6e73] text-base max-w-md mx-auto">
            Una selezione curata dei migliori prodotti tecnologici, organizzati per categoria.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <motion.div key={cat.id} {...staggerItem}>
              <CategoryCard cat={cat} />
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