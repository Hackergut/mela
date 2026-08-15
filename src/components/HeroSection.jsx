import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useCatalog } from '@/lib/useProducts';

export default function HeroSection() {
  const { products } = useCatalog();
  const product = products.find(item => item.featured) || products[0];
  const title = product?.name || 'Il meglio della tecnologia.';
  const subtitle = product?.subtitle || 'Scelto con cura. Configurato da te.';
  const image = product?.default_variant?.image || product?.image;

  return (
    <section className="relative overflow-hidden bg-black px-5 pb-4 pt-14 text-white sm:px-8 sm:pt-20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-[#f5f5f7]" />
      <div className="relative mx-auto max-w-6xl text-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: .4 }} className="text-sm font-semibold text-[#f5f5f7]/70">In evidenza</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: .45, delay: .04 }} className="mx-auto mt-3 max-w-5xl text-5xl font-semibold leading-[.98] tracking-[-0.055em] sm:text-7xl lg:text-[88px]">{title}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: .45, delay: .08 }} className="mx-auto mt-5 max-w-2xl text-xl font-medium tracking-[-0.02em] text-[#f5f5f7]/75 sm:text-2xl">{subtitle}</motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .35, delay: .15 }} className="mt-8 flex items-center justify-center gap-4">
          {product && <Link to={`/scheda-prodotto?id=${product.id}`} className="rounded-full bg-[#0071e3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0077ed]">Acquista</Link>}
          <Link to="/catalogo" className="rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">Scopri lo Store</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0, duration: .75, delay: .12 }} className="relative mx-auto mt-8 aspect-[16/8] w-full max-w-5xl sm:mt-12">
          {image ? <Image src={image} alt={product?.name || ''} fittingType="fit" quality={92} loading="eager" fetchPriority="high" className="h-full w-full" /> : <div className="h-full" />}
        </motion.div>
      </div>
    </section>
  );
}
