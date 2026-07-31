import React from 'react';
import { motion } from 'framer-motion';

export default function PromoBanner() {
  const text = "Ottieni uno sconto del 20%  USA IL CODICE 20PD   •   ";
  const repeated = text.repeat(10);

  return (
    <div className="bg-[#1d1d1f] text-white overflow-hidden py-2.5">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <span className="text-xs tracking-widest uppercase font-medium">
          {repeated}
        </span>
        <span className="text-xs tracking-widest uppercase font-medium" aria-hidden="true">
          {repeated}
        </span>
      </motion.div>
    </div>
  );
}