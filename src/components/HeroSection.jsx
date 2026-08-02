import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import { Image } from '@/components/ui/image';
import { IPHONE_17_PRO_COLORS } from '@/lib/productCatalog';

// Ordine nello showcase: argento · arancione · blu (come nel riferimento)
const SHOWCASE = [
  { img: IPHONE_17_PRO_COLORS[2].image, alt: 'iPhone 17 Pro Argento', rot: 'rotateY(11deg) rotate(3deg)', delay: 0.15, scale: 'md:scale-[0.82]' },
  { img: IPHONE_17_PRO_COLORS[0].image, alt: 'iPhone 17 Pro Arancione Cosmico', rot: 'rotateY(0deg) rotate(0deg)', delay: 0.05, scale: 'md:scale-100' },
  { img: IPHONE_17_PRO_COLORS[1].image, alt: 'iPhone 17 Pro Blu', rot: 'rotateY(-11deg) rotate(-3deg)', delay: 0.25, scale: 'md:scale-[0.82]' },
];

// Maschera radiale per far sparire lo sfondo bianco delle foto studio sul nero
const PHONE_MASK =
  'radial-gradient(ellipse 72% 90% at 50% 50%, #000 62%, transparent 100%)';

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-black pt-6 pb-0 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Sub-nav prodotto a pillola */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-md mb-12 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#161616] border border-white/5"
        >
          <span className="text-sm font-semibold text-white pl-1">iPhone 17 Pro</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo('categories')}
              className="px-4 py-1.5 rounded-full border border-white/25 text-white text-xs font-medium hover:bg-white/10 transition-colors"
            >
              Esplora
            </button>
            <button
              onClick={() => scrollTo('products')}
              className="px-4 py-1.5 rounded-full bg-[#0071E3] text-white text-xs font-medium hover:bg-[#0077ED] transition-colors"
            >
              Acquista
            </button>
          </div>
        </motion.div>

        {/* Pre-titolo */}
        <motion.p
          {...heroEntrance(0)}
          className="text-center text-base md:text-lg font-medium text-[#FF9500] mb-3"
        >
          Tutta la famiglia
        </motion.p>

        {/* Headline due righe */}
        <motion.h1
          {...heroEntrance(0.08)}
          className="text-center text-4xl md:text-6xl lg:text-7xl font-bold text-[#F5F5F7] leading-[1.05] tracking-tight mb-16"
        >
          Tutto l'indispensabile.
          <br />
          Tutto su iPhone.
        </motion.h1>

        {/* Showcase tre telefoni flottanti */}
        <div className="relative" style={{ perspective: '1400px' }}>
          <div className="flex items-end justify-center gap-1 md:gap-2">
            {SHOWCASE.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: p.delay, duration: 0.7, ease: 'easeOut' }}
                className={`relative w-[34%] md:w-[31%] ${p.scale} transition-transform duration-700`}
                style={{ transform: p.rot }}
              >
                <div
                  className="relative"
                  style={{
                    WebkitMaskImage: PHONE_MASK,
                    maskImage: PHONE_MASK,
                  }}
                >
                  <Image
                    src={p.img}
                    alt={p.alt}
                    className="w-full h-auto"
                    fittingType="fit"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cue di scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-1.5 pt-10 pb-8 text-white/30"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Scorri per esplorare</span>
          <motion.svg
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </motion.svg>
        </motion.div>
      </div>
    </section>
  );
}