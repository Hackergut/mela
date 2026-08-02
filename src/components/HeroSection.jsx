import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import { Image } from '@/components/ui/image';
import { IPHONE_17_PRO_COLORS } from '@/lib/productCatalog';
import { ChevronRight, ArrowDown } from 'lucide-react';

const IMG = 'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b';
const HERO_LINEUP = `${IMG}/64ae3c35e_IMG_1300.jpg`;   // tre telefoni (argento, arancione, navy)
const HERO_DYNAMIC = `${IMG}/f019257e4_IMG_1668.webp`; // due telefoni schermi luminosi

const COLOR_SWATCHES = IPHONE_17_PRO_COLORS.map(c => ({ name: c.name, color: c.hex }));

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-[#08080a] pt-20 pb-0 px-6 lg:px-8 overflow-hidden">
      {/* Atmosfera */}
      <div className="absolute inset-0 pointer-events-none">
        {/* glow radiale arancione */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[#E85D2F]/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF6B35]/10 rounded-full blur-[120px]" />
        {/* griglia sottile con maschera radiale */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%, #000 25%, transparent 75%)',
          }}
        />
        {/* immagine dinamica ambientale in basso a destra, sfocata e tenue */}
        <div className="absolute -bottom-10 -right-10 w-[480px] h-[480px] opacity-[0.12] blur-sm">
          <Image src={HERO_DYNAMIC} alt="" className="w-full h-full object-contain" fittingType="fit" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 text-center">
        {/* Eyebrow */}
        <motion.div
          {...heroEntrance(0)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2F] animate-pulse" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E85D2F]">iPhone 17 Pro</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...heroEntrance(0.1)}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.02] tracking-tight mb-5"
        >
          Pro. Oltre ogni{' '}
          <span className="bg-gradient-to-r from-[#FF8A4C] via-[#E85D2F] to-[#FF6B35] bg-clip-text text-transparent">
            limite.
          </span>
        </motion.h1>

        <motion.p {...heroEntrance(0.2)} className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-7 leading-relaxed">
          Alluminio forgiato. A19 Pro vapor-cooled. Sistema fotocamera Pro con zoom 8x. Il più potente iPhone di sempre.
        </motion.p>

        {/* CTA */}
        <motion.div {...heroEntrance(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
          <button
            onClick={() => scrollTo('products')}
            className="group px-8 py-3.5 bg-[#E85D2F] text-white text-sm font-semibold rounded-full hover:bg-[#d14e22] transition-all duration-200 shadow-[0_8px_30px_-8px_rgba(232,93,47,0.6)] flex items-center justify-center gap-2"
          >
            Acquista
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => scrollTo('categories')}
            className="px-8 py-3.5 bg-white/[0.06] text-white text-sm font-semibold rounded-full border border-white/15 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-200"
          >
            Scopri di più ›
          </button>
        </motion.div>

        {/* Showcase prodotto */}
        <motion.div {...heroEntrance(0.25)} className="relative">
          {/* aura posteriore */}
          <div className="absolute inset-x-0 top-1/4 bottom-0 bg-gradient-to-b from-[#E85D2F]/25 via-[#E85D2F]/10 to-transparent rounded-full blur-3xl" />
          {/* riflesso pavimento */}
          <div className="absolute inset-x-0 -bottom-2 h-24 bg-gradient-to-t from-[#E85D2F]/15 to-transparent rounded-full blur-2xl" />

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mx-auto"
            style={{ maxWidth: '820px' }}
          >
            <Image
              src={HERO_LINEUP}
              alt="iPhone 17 Pro — Argento, Arancione Cosmico, Blu"
              className="w-full h-auto drop-shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
              fittingType="fit"
            />

            {/* Card prezzo flottante */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute left-2 md:left-6 bottom-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E85D2F]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#FF8A4C] text-sm font-bold">€</span>
              </div>
              <div>
                <p className="text-[10px] text-white/50 leading-tight">A partire da</p>
                <p className="text-lg font-bold text-white leading-tight">€1.199</p>
                <p className="text-[10px] text-white/40 leading-tight">o €49,95/mese per 24 mesi</p>
              </div>
            </motion.div>

            {/* Badge "Nuovo" flottante */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute right-2 md:right-8 top-6 px-3 py-1.5 rounded-full bg-white text-[#1d1d1f] text-xs font-bold shadow-lg"
            >
              Nuovo
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Color swatches */}
        <motion.div {...heroEntrance(0.4)} className="flex items-center justify-center gap-5 mt-8 mb-10">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-2 group cursor-pointer">
              <span
                className="w-6 h-6 rounded-full ring-1 ring-white/20 group-hover:ring-2 group-hover:ring-white/60 group-hover:scale-110 transition-all"
                style={{ backgroundColor: swatch.color }}
              />
              <span className="text-[10px] text-white/40 font-medium group-hover:text-white/70 transition-colors">{swatch.name}</span>
            </div>
          ))}
        </motion.div>

        {/* Cue di scroll */}
        <motion.button
          onClick={() => scrollTo('categories')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors pb-6 mx-auto"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Scorri per esplorare</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown size={14} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}