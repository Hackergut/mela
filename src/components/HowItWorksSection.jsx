import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, Sparkles, Truck } from 'lucide-react';

const STEPS = [
  {
    icon: SlidersHorizontal,
    step: '01',
    title: 'Scegli',
    text: 'Confronta modelli e varianti con prezzi e disponibilità aggiornati in tempo reale.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'Configura',
    text: 'Colore, capacità e accessori: il bundle si assembla con te e lo sconto si calcola da solo.',
  },
  {
    icon: Truck,
    step: '03',
    title: 'Ricevi',
    text: 'Pagamento sicuro, spedizione tracciata in 24/48h e reso gratuito entro 14 giorni.',
  },
];

// Three-step purchase journey with a connecting line that draws itself when
// the section scrolls into view (a static line for reduced-motion users).
export default function HowItWorksSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="how-title" className="bg-white px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-[#0066cc]">Semplice per davvero</p>
          <h2 id="how-title" className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-6xl">
            Come funziona.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector: horizontal on desktop, vertical on mobile. */}
          <motion.div
            aria-hidden="true"
            initial={reduceMotion ? undefined : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-7 hidden h-0.5 origin-left bg-gradient-to-r from-[#0071e3] via-[#7d4fff] to-[#0071e3]/20 lg:block"
          />
          <motion.div
            aria-hidden="true"
            initial={reduceMotion ? undefined : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-8 left-7 top-8 w-0.5 origin-top bg-gradient-to-b from-[#0071e3] to-[#0071e3]/20 lg:hidden"
          />

          <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map(({ icon: Icon, step, title, text }, index) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: 0.15 + index * 0.2 }}
                className="flex gap-5 lg:flex-col lg:items-center lg:text-center"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#7d4fff] text-white shadow-[0_8px_24px_rgba(0,113,227,.35)]">
                    <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#86868b]">{step}</p>
                  <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-[#1d1d1f]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6e6e73]">{text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 text-center"
        >
          <Link to="/catalogo" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1d1d1f] px-7 text-sm font-semibold text-white transition hover:bg-[#0071e3]">
            Inizia ora dal catalogo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
