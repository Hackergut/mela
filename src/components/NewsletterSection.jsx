import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section id="newsletter" className="py-20 px-6 lg:px-8 bg-[#1d1d1f] relative overflow-hidden">
      {/* Decorazione sfondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#FF6B35]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FF6B35]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-4">Resta Aggiornato</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Iscriviti alla Newsletter
        </h2>
        <p className="text-[#a1a1a6] mb-10 text-base">
          Ricevi notifiche su nuovi aggiornamenti e offerte esclusive.
        </p>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-2xl px-8 py-6"
            >
              <p className="text-[#FF6B35] font-semibold text-lg">Iscrizione completata! 🎉</p>
              <p className="text-[#a1a1a6] text-sm mt-1">Ti terremo aggiornato con le migliori offerte.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Inserisci la tua email"
                required
                className="flex-1 px-5 py-3.5 rounded-full bg-white/10 text-white placeholder-[#6e6e73] border border-white/10 focus:outline-none focus:border-[#FF6B35] text-sm transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-full hover:bg-[#e55a28] transition-colors whitespace-nowrap"
              >
                Iscriviti
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}