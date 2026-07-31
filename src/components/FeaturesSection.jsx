import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2l2.5 6.5L23 9l-5 4.5L19 21l-5-3-5 3 1-7.5L5 9l6.5-.5L14 2z"/>
      </svg>
    ),
    title: 'Qualità Premium',
    desc: 'Prodotti originali selezionati con cura per offrire la massima eccellenza.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="20" height="16" rx="2"/>
        <path d="M4 12h20M10 6v16"/>
      </svg>
    ),
    title: 'Spedizione Rapida',
    desc: 'Consegna gratuita in 24-48 ore in tutta Italia con tracking in tempo reale.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2v4M14 22v4M2 14h4M22 14h4M5 5l3 3M20 20l3-3M5 23l3-3M20 8l3-3"/>
        <circle cx="14" cy="14" r="4"/>
      </svg>
    ),
    title: 'Supporto Dedicato',
    desc: 'Assistenza clienti disponibile 7 giorni su 7 per ogni tua necessità.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/>
        <path d="M5 18l9-9 9 9"/>
        <path d="M9 18v6h10v-6"/>
      </svg>
    ),
    title: 'Garanzia Estesa',
    desc: '2 anni di garanzia ufficiale su tutti i prodotti del nostro catalogo.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Perché Sceglierci</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Un'Esperienza <span className="text-[#FF6B35]">Senza Paragoni</span>
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            Ci impegniamo a offrire non solo prodotti eccezionali, ma anche un servizio di altissimo livello.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              {...staggerItem}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-[#f5f5f7] rounded-2xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-[#1d1d1f] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#6e6e73] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}