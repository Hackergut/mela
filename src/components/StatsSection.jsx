import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { CalendarClock, PackageCheck, RefreshCcw, Truck } from 'lucide-react';
import { useCatalog } from '@/lib/useProducts';

// Count-up that runs once when the tile enters the viewport.
function CountUp({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      setValue(to);
      return undefined;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: latest => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to, reduceMotion]);

  return <span ref={ref} className="tabular-nums">{value}{suffix}</span>;
}

export default function StatsSection() {
  const { products, categories } = useCatalog();
  const visibleCategories = categories.filter(category => category.product_count > 0);

  const tiles = [
    { icon: PackageCheck, value: <CountUp to={Math.max(products.length, 1)} />, label: 'prodotti in catalogo', note: 'configurazioni reali' },
    { icon: Truck, value: '24/48h', label: 'spedizione rapida', note: 'corrieri tracciati' },
    { icon: CalendarClock, value: <CountUp to={14} suffix=' giorni' />, label: 'per il reso', note: 'senza domande' },
    { icon: RefreshCcw, value: <CountUp to={Math.max(visibleCategories.length, 1)} />, label: 'categorie', note: 'sempre aggiornate' },
  ];

  return (
    <section aria-label="I numeri dello store" className="bg-[#f5f5f7] px-5 py-20 sm:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold text-[#0066cc]">Affidabilità</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-5xl">
            Numeri che parlano<br className="hidden sm:block" /> da soli.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.08 }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {tiles.map(({ icon: Icon, value, label, note }) => (
            <motion.article
              key={label}
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-[28px] bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-transform duration-300 hover:-translate-y-1 sm:p-8"
            >
              <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#7d4fff] text-white">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="text-3xl font-semibold tracking-tight text-[#1d1d1f] sm:text-4xl">{value}</p>
              <p className="mt-2 text-sm font-semibold text-[#1d1d1f]">{label}</p>
              <p className="mt-0.5 text-xs text-[#86868b]">{note}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
