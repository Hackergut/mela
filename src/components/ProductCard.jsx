import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import ProductActions from '@/components/ProductActions';

// Minimal Apple-style product tile: neutral canvas, product image, name and
// price. No long description clutter; quick-add reveals on hover on desktop.
export default function ProductCard({ product }) {
  const href = `/scheda-prodotto?id=${product.id}`;
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col rounded-[22px] bg-white"
    >
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#f5f5f7]">
        <Link to={href} className="absolute inset-0 block p-4 sm:p-6" aria-label={`Scopri ${product.name}`}>
          <Image
            src={product.image}
            alt={product.name}
            className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            fittingType="fit"
            quality={85}
          />
        </Link>

        {product.badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#0071e3] px-2.5 py-1 text-[11px] font-semibold text-white">
            {product.badge}
          </span>
        )}

        <div className="absolute bottom-3 right-3 z-10 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:focus-within:translate-y-0 sm:focus-within:opacity-100">
          <ProductActions product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#1d1d1f]">
          <Link to={href} className="transition-colors hover:text-[#0071e3]">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[13px] text-[#6e6e73]">{product.category}</p>
        <div className="mt-auto pt-3">
          <p className="text-[15px] font-semibold text-[#1d1d1f]">{product.price}</p>
        </div>
      </div>
    </motion.article>
  );
}
