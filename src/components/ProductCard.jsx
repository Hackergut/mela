import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import ProductActions from '@/components/ProductActions';

export default function ProductCard({ product }) {
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
