import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import { Image } from '@/components/ui/image';
import { IPHONE_17_PRO_COLORS } from '@/lib/productCatalog';
import { ChevronRight, Sparkles, Cpu, Camera, Zap } from 'lucide-react';

const COLOR_SWATCHES = IPHONE_17_PRO_COLORS.map(c => ({ name: c.name, color: c.hex }));

const FLOAT_BADGES = [
  { icon: Cpu, label: 'A19 Pro', sub: 'Vapor-cooled', pos: 'top-6 -left-2 md:left-0', delay: 0.6 },
  { icon: Camera, label: 'Zoom 8x', sub: 'Sistema Pro', pos: 'top-1/3 -right-2 md:-right-4', delay: 0.75 },
  { icon: Zap, label: 'Alluminio', sub: 'Forgiato', pos: 'bottom-10 -left-2 md:left-2', delay: 0.9 },
];

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-[#08080a] pt-16 pb-0 px-6 lg:px-8 overflow-hidden">
      {/* Atmosfera: glow radiale + griglia sottile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#E85D2F]/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF6B35]/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 75%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center min-h-[78vh]">
          {/* Colonna testo */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <motion.div
              {...heroEntrance(0)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2F] animate-pulse" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E85D2F]">
                iPhone 17 Pro
              </span>
            </motion.div>

            <motion.h1
              {...heroEntrance(0.1)}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.02] tracking-tight mb-5"
            >
              Pro. Oltre ogni{' '}
              <span className="bg-gradient-to-r from-[#FF8A4C] via-[#E85D2F] to-[#FF6B35] bg-clip-text text-transparent">
                limite.
              </span>
            </motion.h1>

            <motion.p
              {...heroEntrance(0.2)}
              className="text-base md:text-lg text-white/60 max-w-md mx-auto lg:mx-0 mb-6 leading-relaxed"
            >
              Alluminio forgiato. A19 Pro vapor-cooled. Sistema fotocamera Pro con zoom 8x. Il più potente iPhone di sempre.
            </motion.p>

            {/* Prezzo in card glass */}
            <motion.div
              {...heroEntrance(0.25)}
              className="inline-flex items-baseline gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md mb-6"
            >
              <span className="text-xs text-white/50">Da</span>
              <span className="text-2xl font-bold text-white">€1.199</span>
              <span className="text-xs text-white/40">o €49,95/mese per 24 mesi</span>
            </motion.div>

            <motion.div {...heroEntrance(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <button
                onClick={() => scrollTo('products')}
                className="group px-7 py-3.5 bg-[#E85D2F] text-white text-sm font-semibold rounded-full hover:bg-[#d14e22] transition-all duration-200 shadow-[0_8px_30px_-8px_rgba(232,93,47,0.6)] flex items-center justify-center gap-2"
              >
                Acquista
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('categories')}
                className="px-7 py-3.5 bg-white/5 text-white text-sm font-semibold rounded-full border border-white/15 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-200"
              >
                Scopri di più ›
              </button>
            </motion.div>

            {/* Color swatches */}
            <motion.div {...heroEntrance(0.35)} className="flex items-center justify-center lg:justify-start gap-4">
              {COLOR_SWATCHES.map((swatch) => (
                <div key={swatch.name} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <span
                    className="w-7 h-7 rounded-full ring-1 ring-white/20 group-hover:ring-2 group-hover:ring-white/60 group-hover:scale-110 transition-all"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <span className="text-[10px] text-white/40 font-medium group-hover:text-white/70 transition-colors">{swatch.name}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Colonna immagine prodotto */}
          <motion.div
            {...heroEntrance(0.2)}
            className="relative order-1 lg:order-2 flex items-center justify-center"
          >
            <div className="relative" style={{ maxWidth: '520px' }}>
              {/* Aura dietro il prodotto */}
              <div className="absolute inset-0 -m-12 bg-gradient-to-b from-[#E85D2F]/30 to-transparent rounded-full blur-3xl" />
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <Image
                  src={IPHONE_17_PRO_COLORS[0].image}
                  alt="iPhone 17 Pro Arancione Cosmico"
                  className="w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                  fittingType="fit"
                />
              </motion.div>

              {/* Badge flottanti specifiche */}
              {FLOAT_BADGES.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: b.delay, duration: 0.5 }}
                  className={`absolute ${b.pos} flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md`}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-8 h-8 rounded-xl bg-[#E85D2F]/20 flex items-center justify-center flex-shrink-0"
                  >
                    <b.icon size={15} className="text-[#FF8A4C]" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white leading-tight">{b.label}</p>
                    <p className="text-[10px] text-white/50 leading-tight">{b.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Cues di scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center pb-6"
        >
          <div className="flex flex-col items-center gap-2 text-white/30">
            <Sparkles size={14} className="text-[#E85D2F]/50" />
            <span className="text-[10px] tracking-[0.2em] uppercase">Scorri per esplorare</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}