import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import { Image } from '@/components/ui/image';

const COLOR_SWATCHES = [
  { name: 'Arancione Cosmico', color: '#E85D2F' },
  { name: 'Blu', color: '#3B5B7A' },
  { name: 'Argento', color: '#D8D8DC' },
];

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-black pt-16 pb-0 px-6 lg:px-8 overflow-hidden">
      {/* Glow arancione cosmico */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#E85D2F]/15 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.p {...heroEntrance(0)} className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E85D2F] mb-5">
          iPhone 17 Pro
        </motion.p>
        <motion.h1
          {...heroEntrance(0.1)}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.02] tracking-tight mb-5"
        >
          Pro. Oltre ogni<br />limite.
        </motion.h1>
        <motion.p {...heroEntrance(0.2)} className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-6 leading-relaxed">
          Alluminio forgiato. A19 Pro vapor-cooled. Sistema fotocamera Pro con zoom 8x. Il più potente iPhone di sempre.
        </motion.p>

        {/* Prezzo stile Apple */}
        <motion.p {...heroEntrance(0.25)} className="text-sm text-white/50 mb-8">
          Da <span className="text-white font-semibold">€1.199</span> o €49,95/mese per 24 mesi
        </motion.p>

        <motion.div {...heroEntrance(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={() => scrollTo('products')}
            className="px-8 py-3.5 bg-[#E85D2F] text-white text-sm font-semibold rounded-full hover:bg-[#d14e22] transition-colors duration-200"
          >
            Acquista
          </button>
          <button
            onClick={() => scrollTo('categories')}
            className="px-8 py-3.5 bg-transparent text-white text-sm font-semibold rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition-colors duration-200"
          >
            Scopri di più ›
          </button>
        </motion.div>

        {/* Color swatches */}
        <motion.div {...heroEntrance(0.35)} className="flex items-center justify-center gap-4 mb-12">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-2">
              <span
                className="w-6 h-6 rounded-full ring-1 ring-white/20 cursor-pointer hover:ring-white/60 transition-all"
                style={{ backgroundColor: swatch.color }}
              />
              <span className="text-[10px] text-white/40 font-medium">{swatch.name}</span>
            </div>
          ))}
        </motion.div>

        {/* Immagine prodotto hero stile Apple */}
        <motion.div
          {...heroEntrance(0.4)}
          className="relative -mb-px"
        >
          <div className="relative mx-auto" style={{ maxWidth: '900px' }}>
            <Image
              src="https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b/f731cdad5_IMG_1704.png"
              alt="iPhone 17 Pro Arancione Cosmico"
              className="w-full h-auto"
              fittingType="fit"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}