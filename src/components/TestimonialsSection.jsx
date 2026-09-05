import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const REVIEWS = [
  { name: 'Marco T.', city: 'Milano', text: 'Ordine arrivato in 24 ore, configurazione esattamente come la vedevo sul sito. Imballaggio impeccabile.' },
  { name: 'Giulia R.', city: 'Roma', text: 'Mi sono trovata subito: confronto tra varianti chiarissimo e checkout in due minuti.' },
  { name: 'Alessandro B.', city: 'Torino', text: 'Assistenza rapida e preparata, mi hanno aiutato a scegliere la configurazione giusta per il lavoro.' },
  { name: 'Sara M.', city: 'Bologna', text: 'Prezzi trasparenti e tracciamento spedizione sempre aggiornato. Consigliato.' },
  { name: 'Luca P.', city: 'Napoli', text: 'Reso gestito in un giorno, rimborso puntuale. Serietà rara.' },
  { name: 'Chiara V.', city: 'Padova', text: 'Il prodotto era quello descritto, zero sorprese. Tornerò per il prossimo acquisto.' },
];

function ReviewCard({ review }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-[24px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.05)] sm:w-[340px]">
      <Quote size={20} className="mb-3 text-[#0071e3]/40" aria-hidden="true" />
      <blockquote className="text-sm leading-6 text-[#1d1d1f]">{review.text}</blockquote>
      <figcaption className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f]">{review.name}</p>
          <p className="text-xs text-[#86868b]">{review.city}</p>
        </div>
        <span className="flex gap-0.5" aria-label="Valutazione 5 stelle su 5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={12} className="fill-[#f5a623] text-[#f5a623]" aria-hidden="true" />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

export default function TestimonialsSection() {
  const strip = (hidden) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-4 px-2">
      {REVIEWS.map(review => (
        <li key={review.name}><ReviewCard review={review} /></li>
      ))}
    </ul>
  );

  return (
    <section aria-labelledby="testimonials-title" className="overflow-hidden bg-white py-20 md:py-24">
      <div className="mx-auto mb-10 max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-[#0066cc]">La parola ai clienti</p>
          <h2 id="testimonials-title" className="mt-3 text-3xl sm:text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-5xl">
            Scelti da chi conta.
          </h2>
        </motion.div>
      </div>

      <div className="marquee-hover-pause relative">
        <p className="sr-only">Recensioni dei clienti sulla loro esperienza di acquisto.</p>
        <div className="flex w-max animate-marquee-slow">
          {strip(false)}
          {strip(true)}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent sm:w-24" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent sm:w-24" />
      </div>
    </section>
  );
}
