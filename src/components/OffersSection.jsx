import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useCatalog } from '@/lib/useProducts';
import { formatPriceCents } from '@/lib/catalog';

// Active deals: products whose default variant has a real compare-at price
// above the selling price. Fully data-driven — the section hides itself when
// the catalog has no active savings.
export default function OffersSection() {
  const { products } = useCatalog();

  const deals = products
    .map((product) => {
      const variant = product.default_variant;
      const price = Number(variant?.price_cents ?? product.price_cents) || 0;
      const compareAt = Number(variant?.compare_at_cents) || 0;
      if (price < 50 || compareAt <= price) return null;
      return {
        product,
        price,
        compareAt,
        percent: Math.round((1 - price / compareAt) * 100),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);

  if (deals.length === 0) return null;

  return (
    <section aria-labelledby="offers-title" className="bg-[#f5f5f7] px-5 py-20 sm:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold text-[#bf4800]">Risparmia ora</p>
            <h2 id="offers-title" className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-5xl">
              Offerte attive.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#6e6e73]">Sconti reali sul prezzo di listino, mentre scorte lo permettono.</p>
          </div>
          <Link to="/catalogo" className="text-sm font-semibold text-[#0066cc] hover:underline">Vedi tutto →</Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.08 }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {deals.map(({ product, price, compareAt, percent }) => (
            <motion.article
              key={product.id}
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }}
              className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,.1)]"
            >
              <Link to={`/scheda-prodotto?id=${product.id}`} className="relative block aspect-square overflow-hidden p-4" aria-label={`Offerta: ${product.name}`}>
                <Image src={product.image} alt={product.name} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" fittingType="fit" />
                <motion.span
                  aria-hidden="true"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-3 top-3 rounded-full bg-[#d70015] px-2.5 py-1 text-xs font-bold text-white shadow-sm"
                >
                  −{percent}%
                </motion.span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#1d1d1f]">
                  <Link to={`/scheda-prodotto?id=${product.id}`} className="hover:text-[#0066cc]">{product.name}</Link>
                </h3>
                <div className="mt-auto pt-3">
                  <p className="text-xs text-[#86868b] line-through">{formatPriceCents(compareAt)}</p>
                  <p className="text-lg font-semibold tracking-tight text-[#bf4800]">{formatPriceCents(price)}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
