import React from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const STATS = [
  { value: '50+', label: 'Partner Ufficiali' },
  { value: '12K+', label: 'Membri Community' },
  { value: '3K+', label: 'Ordini Questo Mese' },
  { value: '4.9★', label: 'Recensione Media' },
];

const VALUES = [
  {
    title: 'Prodotti Ben Progettati',
    desc: 'Ci concentriamo su prodotti dove forma, funzione e design si fondono armoniosamente.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 2l1.5 3h3.5l-2.5 2 1 3L10 8.5 6.5 10l1-3L5 5h3.5L10 2z"/>
      </svg>
    ),
  },
  {
    title: 'Selezione Tech Moderna',
    desc: 'Una gamma curata di prodotti tecnologici per uso quotidiano e flussi creativi.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="3" width="14" height="14" rx="2"/>
        <path d="M7 10h6M10 7v6"/>
      </svg>
    ),
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Chi Siamo</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Scopri di Più Su di Noi
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            La nostra storia, i nostri valori e ciò per cui ci battiamo ogni giorno.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl overflow-hidden h-96"
          >
            <Image
              src="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/87b8a282b_IMG_1368.jpg"
              alt="Ecosistema Apple"
              className="w-full h-full"
              fittingType="fill"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-6 mb-10">
              {VALUES.map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1d1d1f] mb-1">{v.title}</h3>
                    <p className="text-sm text-[#6e6e73] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <motion.div {...staggerContainer} className="grid grid-cols-2 gap-4">
              {STATS.map(({ value, label }) => (
                <motion.div
                  key={label}
                  {...staggerItem}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="bg-[#f5f5f7] rounded-2xl p-5"
                >
                  <p className="text-3xl font-bold text-[#1d1d1f] mb-1">{value}</p>
                  <p className="text-sm text-[#6e6e73] font-medium">{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}