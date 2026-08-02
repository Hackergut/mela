import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import { Image } from '@/components/ui/image';

const MOCKUP_URL =
  'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b/11c330036_IMG_1648.webp';

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
          className="text-center text-4xl md:text-6xl lg:text-7xl font-bold text-[#F5F5F7] leading-[1.05] tracking-tight mb-12"
        >
          Tutto l'indispensabile.
          <br />
          Tutto su iPhone.
        </motion.h1>

        {/* Mockup reale flottante */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.9, ease: 'easeOut' }}
          className="relative flex items-center justify-center"
        >
          {/* Piatto luminoso: fa fondere lo sfondo bianco della foto sul nero */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 52% 62% at 50% 46%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.82) 38%, rgba(255,255,255,0) 72%)',
            }}
          />
          <Image
            src={MOCKUP_URL}
            alt="iPhone 17 Pro — Arancione Cosmico e Blu"
            className="relative w-full max-w-2xl mix-blend-multiply"
            fittingType="fit"
          />
        </motion.div>

        {/* Cue di scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-1.5 pt-10 pb-8 text-white/30"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Scorri per esplorare</span>
          <motion.svg
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </motion.svg>
        </motion.div>
      </div>
    </section>
  );
}