import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { whatsappLink, WhatsAppIcon } from '@/lib/contact';

// Floating WhatsApp support button, visible on every storefront page.
// It pops in shortly after the page settles and stays out of the way of the
// bottom-right corner content; reduced-motion users get no entrance bounce.
export default function SupportChatButton() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), reduceMotion ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  if (!visible) return null;

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.5, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.45, duration: 0.6 }}
      className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6"
    >
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Assistenza su WhatsApp: avvia una chat con il nostro team"
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,.45)] transition-transform duration-300 hover:scale-110 focus-visible:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <WhatsAppIcon size={28} />
        <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[#25D366]/60" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-[#25D366] ring-2 ring-white" />
        </span>
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
          Serve aiuto? Chatta con noi
        </span>
      </a>
    </motion.div>
  );
}
