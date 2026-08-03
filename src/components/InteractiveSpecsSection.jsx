import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { PRODUCT_CATALOG } from '@/lib/productCatalog';
import { PRODUCT_KEY_SPECS } from '@/lib/productSpecs';

// Sezione interattiva: passando il mouse sulle immagini si rivelano i dettagli tecnici chiave.
const FEATURED_IDS = [1, 2, 3, 4]; // iPhone 17 Pro, Air, 17, 16

export default function InteractiveSpecsSection() {
  const [active, setActive] = useState(null);

  const items = FEATURED_IDS.map((id) => {
    const p = PRODUCT_CATALOG.find((x) => x.id === id);
    return p ? { ...p, specs: PRODUCT_KEY_SPECS[id] || {} } : null;
  }).filter(Boolean);

  return (
    <section id="interactive-specs" className="bg-[#f5f5f7] py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[#FF6B35] mb-3">
            Dettagli in primo piano
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Scorri. Soffermati. Scopri.
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#6e6e73] max-w-xl mx-auto">
            Passa il mouse su ogni modello per scoprirne le caratteristiche tecniche distintive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onMouseEnter={() => setActive(item.id)}
              onMouseLeave={() => setActive(null)}
              className="group relative rounded-3xl bg-white overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              {/* Immagine */}
              <div className="relative aspect-square bg-[#f5f5f7] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fittingType="fit"
                  quality={95}
                  className="w-full h-full transition-transform duration-500 group-hover:scale-[1.04]"
                />

                {/* Overlay dettagli tecnici */}
                <AnimatePresence>
                  {active === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent flex items-end p-5"
                    >
                      <ul className="w-full space-y-2">
                        {Object.entries(item.specs).map(([label, value]) => (
                          <li key={label} className="flex items-baseline justify-between gap-3 text-white">
                            <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                              {label}
                            </span>
                            <span className="text-sm font-semibold text-right leading-tight">
                              {value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FF6B35] text-white text-[11px] font-bold uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Footer prodotto */}
              <div className="px-5 py-4">
                <h3 className="text-base font-semibold text-[#1d1d1f] truncate">{item.name}</h3>
                <p className="mt-0.5 text-sm text-[#6e6e73]">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}