import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCatalog } from '@/lib/useProducts';

// Apple-style hero: light canvas, large centered typography, one product on a
// soft radial glow, generous whitespace and two quiet CTAs.
export default function HeroSection() {
  const { products } = useCatalog();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '12%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0]);

  const product =
    products.find((item) => item.featured && /iPhone 17 Pro/i.test(item.name)) ||
    products.find((item) => item.featured) ||
    products[0];
  const title = product?.name || 'TechMania';
  const subtitle = product?.subtitle || 'La tecnologia che ami, al prezzo giusto.';
  const image = product?.default_variant?.image || product?.image;

  const entrance = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', bounce: 0, duration: 0.7, delay },
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#f5f5f7] px-5 pt-20 pb-0 sm:px-8 sm:pt-28">
      {/* Soft canvas: top vignette + product glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute left-1/2 top-[58%] h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0071e3]/10 blur-[120px] sm:h-[520px] sm:w-[1100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.p
          {...entrance(0)}
          className="text-sm font-semibold uppercase tracking-[0.08em] text-[#0071e3]"
        >
          Nuovo
        </motion.p>

        <motion.h1
          {...entrance(0.05)}
          style={{ opacity: copyOpacity }}
          className="mx-auto mt-3 max-w-5xl text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] sm:text-6xl lg:text-[80px]"
        >
          {title}
        </motion.h1>

        <motion.p
          {...entrance(0.1)}
          className="mx-auto mt-5 max-w-2xl text-xl font-medium tracking-[-0.01em] text-[#6e6e73] sm:text-2xl"
        >
          {subtitle}
        </motion.p>

        <motion.div
          {...entrance(0.16)}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {product && (
            <Link
              to={`/scheda-prodotto?id=${product.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-[#0071e3] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0077ed]"
            >
              Acquista
            </Link>
          )}
          <Link
            to="/catalogo"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 py-3 text-sm font-semibold text-[#0071e3] transition-colors hover:underline"
          >
            Scopri di più
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 3l5 5-5 5" />
            </svg>
          </Link>
        </motion.div>

        <motion.div
          {...entrance(0.2)}
          style={{ y: imageY }}
          className="relative mx-auto mt-10 w-full max-w-5xl"
        >
          {image ? (
            <motion.div
              className="relative mx-auto aspect-[16/9] w-full"
              animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
              transition={reduceMotion ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={image}
                alt={product?.name || 'Prodotto in evidenza'}
                fittingType="fit"
                quality={92}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.12)]"
              />
            </motion.div>
          ) : (
            <div className="aspect-[16/9]" />
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pointer-events-none flex justify-center pb-2"
        aria-hidden="true"
      >
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={22} className="text-[#86868b]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
