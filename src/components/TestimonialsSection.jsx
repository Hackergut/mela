import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const TESTIMONIALS = [
  { id: 1, text: "La qualità costruttiva è eccellente e l'esperienza generale è premium. La configurazione è stata semplice e tutto ha funzionato come previsto.", name: "Marco Rossi", role: "Direttore", avatar: "MR", color: "bg-blue-500" },
  { id: 2, text: "Tutto funziona come previsto e sembra curato nei minimi dettagli. La configurazione è stata facile e l'esperienza fluida.", name: "Giulia Bianchi", role: "Direttrice Creativa", avatar: "GB", color: "bg-purple-500" },
  { id: 3, text: "L'esperienza generale è equilibrata e curata. La configurazione ha richiesto solo pochi minuti e senza problemi.", name: "Luca Ferrari", role: "Designer", avatar: "LF", color: "bg-green-500" },
  { id: 4, text: "Si integra perfettamente in un setup esistente senza richiedere grandi adattamenti. Dopo una breve configurazione, era pronto all'uso.", name: "Sofia Romano", role: "Sound Designer", avatar: "SR", color: "bg-pink-500" },
  { id: 5, text: "La qualità si nota subito ed è un piacere usarlo. Tutto funziona fluidamente e l'esperienza è davvero soddisfacente.", name: "Davide Conti", role: "Music Producer", avatar: "DC", color: "bg-orange-500" },
  { id: 6, text: "Si capisce subito che è un prodotto ben fatto. Affidabile, curato nel design e piacevole da utilizzare ogni giorno.", name: "Chiara Esposito", role: "Ingegnere del Suono", avatar: "CE", color: "bg-teal-500" },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Testimonianze</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Cosa Dicono i Nostri<br />Clienti di Noi.
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            Leggi le recensioni reali di chi usa i nostri prodotti ogni giorno.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.id}
              {...staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FF6B35">
                    <path d="M8 1l1.9 3.9L14 5.6l-3 2.9.7 4.1L8 10.4l-3.7 2.2.7-4.1L2 5.6l4.1-.7L8 1z"/>
                  </svg>
                ))}
              </div>
              <p className="text-[#1d1d1f] text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#f5f5f7]">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{t.name}</p>
                  <p className="text-xs text-[#6e6e73]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}