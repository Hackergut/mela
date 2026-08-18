import React from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: 'Configurazioni reali',
    desc: 'Colore, capacità, prezzo e immagini cambiano insieme quando scegli una variante.',
  },
  {
    icon: RefreshCw,
    title: 'Disponibilità aggiornata',
    desc: 'Lo stock mostrato nello Store è aggiornato dal catalogo ed è gestito per singola variante.',
  },
  {
    icon: ShieldCheck,
    title: 'Checkout verificato',
    desc: 'Prezzi e disponibilità vengono ricontrollati sul server prima di aprire il pagamento sicuro.',
  },
  {
    icon: Database,
    title: 'Un solo catalogo',
    desc: 'Prodotti, categorie e varianti condividono una fonte dati coerente in ogni pagina dello Store.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold text-[#0066cc]">Un'esperienza più semplice</p>
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-6xl">
            Quello che vedi<br />è quello che scegli.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6e6e73]">
            Informazioni chiare, configurazioni coerenti e meno passaggi tra la scelta e il checkout.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, index) => (
            <motion.article
              key={title}
              {...staggerItem}
              className={`group rounded-[28px] bg-[#f5f5f7] p-6 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,.08)] sm:p-7 ${index === 0 ? 'sm:col-span-2 bg-gradient-to-br from-[#e8f2ff] to-[#f5f5f7]' : ''}`}
            >
              <div className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${index === 0 ? 'bg-gradient-to-br from-[#0071e3] to-[#7d4fff] text-white' : 'bg-white text-[#0071e3] shadow-[0_1px_2px_rgba(0,0,0,.04)]'}`}>
                <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6e6e73]">{desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
