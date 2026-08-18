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
        <div aria-hidden="true" className="animate-drift pointer-events-none absolute -top-32 left-1/4 h-64 w-96 rounded-full bg-[#0071e3]/25 blur-3xl" />
        <div aria-hidden="true" className="animate-drift-slow pointer-events-none absolute -bottom-32 right-1/4 h-64 w-96 rounded-full bg-[#7d4fff]/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-[#64a8ff]">Il tuo spazio personale</p>
          <h2 className="mt-3 bg-gradient-to-r from-white via-[#bfdcff] to-[#c9b8ff] bg-clip-text text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-transparent sm:text-6xl">
            Riprendi da dove<br />hai lasciato.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#a1a1a6]">
            Salva i prodotti che preferisci, ritrova il carrello e accedi al tuo account in pochi tocchi.
          </p>
          <ul className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2" aria-label="Vantaggi dell'account">
            {['Preferiti sempre con te', 'Carrello salvato', 'Tracciamento ordini'].map(chip => (
              <li key={chip} className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/85">{chip}</li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/preferiti" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#1d1d1f] hover:bg-[#f5f5f7]">
              <Heart size={17} /> Preferiti
            </Link>
            <Link to="/carrello" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(0,113,227,.4)] hover:bg-[#0077ed]">
              <ShoppingBag size={17} /> Vai al carrello <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
