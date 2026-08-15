import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { fadeUp } from '@/lib/motion';

export default function NewsletterSection() {
  return (
    <section id="newsletter" className="bg-[#f5f5f7] px-5 py-24 sm:px-8 md:py-32">
      <motion.div
        {...fadeUp}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-[#1d1d1f] px-6 py-16 text-center text-white sm:px-12 md:py-24"
      >
        <div className="pointer-events-none absolute inset-x-1/4 -top-32 h-64 rounded-full bg-[#0071e3]/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-[#64a8ff]">Il tuo spazio personale</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
            Riprendi da dove<br />hai lasciato.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#a1a1a6]">
            Salva i prodotti che preferisci, ritrova il carrello e accedi al tuo account in pochi tocchi.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/preferiti" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#1d1d1f] hover:bg-[#f5f5f7]">
              <Heart size={17} /> Preferiti
            </Link>
            <Link to="/carrello" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 text-sm font-semibold text-white hover:bg-[#0077ed]">
              <ShoppingBag size={17} /> Vai al carrello <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
