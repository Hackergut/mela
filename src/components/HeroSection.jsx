import React from 'react';
import { motion } from 'framer-motion';
import { heroEntrance } from '@/lib/motion';
import { Image } from '@/components/ui/image';

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative bg-white pt-20 pb-24 px-6 lg:px-8 overflow-hidden">
      {/* Sfondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-[#FF6B35]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#1d1d1f]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.p {...heroEntrance(0)} className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-4">
          Nuovi Arrivi 2025
        </motion.p>
        <motion.h1 {...heroEntrance(0.1)} className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1d1d1f] leading-[1.05] tracking-tight mb-6">
          Scopri{' '}
          <span className="text-[#FF6B35]">i Più</span>
          <br />
          Innovativi Prodotti.
        </motion.h1>
        <motion.p {...heroEntrance(0.2)} className="text-lg text-[#6e6e73] max-w-xl mx-auto mb-10 leading-relaxed">
          Esplora la tecnologia e il design che plasmano il mondo di domani.
        </motion.p>
        <motion.div {...heroEntrance(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => scrollTo('categories')}
            className="px-8 py-3.5 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B35] transition-colors duration-200"
          >
            Esplora Categorie
          </button>
          <button
            onClick={() => scrollTo('products')}
            className="px-8 py-3.5 bg-transparent text-[#1d1d1f] text-sm font-semibold rounded-full border border-[#d2d2d7] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors duration-200"
          >
            Vedi Tutti i Prodotti
          </button>
        </motion.div>

        {/* Showcase immagine hero */}
        <motion.div
          {...heroEntrance(0.4)}
          className="mt-16 relative rounded-3xl overflow-hidden"
          style={{ maxHeight: '420px' }}
        >
          <div className="relative" style={{ paddingBottom: '40%' }}>
            <div className="absolute inset-0">
              <Image
                src="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/87b8a282b_IMG_1368.jpg"
                alt="Apple Ecosystem"
                className="w-full h-full"
                fittingType="fill"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-8">
            <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-2">In Evidenza</p>
            <h3 className="text-white text-2xl md:text-3xl font-bold">Ecosistema Apple Completo</h3>
          </div>
        </motion.div>
      </div>
    </section>
  );
}