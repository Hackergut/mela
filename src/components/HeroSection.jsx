import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';

// Due iPhone 17 Pro (fronte) su sfondo bianco puro — si fonde con la hero chiara
const MOCKUP_URL =
  'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b/65125ecb4_image.png';

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-black pt-6 pb-0 px-4 lg:px-8 overflow-hidden">
      {/* Fade verso la sezione chiara successiva */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 md:h-48 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #f5f5f7 100%)' }}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Sub-nav prodotto a pillola */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-md mb-12 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#161616]/80 backdrop-blur-md border border-white/5"
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
          className="text-center text-4xl md:text-6xl lg:text-7xl font-bold text-[#F5F5F7] leading-[1.05] tracking-tight mb-8"
        >
          Tutto l'indispensabile.
          <br />
          Tutto su iPhone.
        </motion.h1>

        {/* Mockup referenza — sfondo bianco nativo che si fonde con la hero chiara */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9, ease: 'easeOut' }}
          className="relative flex justify-center w-full"
        >
          <img
            src={MOCKUP_URL}
            alt="iPhone 17 Pro — Arancione Cosmico e Blu"
            className="block w-full max-w-5xl h-auto"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}