import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SUPPORT_EMAIL, whatsappLink } from '@/lib/contact';

const FAQS = [
  {
    q: 'Quanto costa la spedizione e quanto impiega?',
    a: 'La spedizione standard è tracciata e arriva in 24/48h lavorative. È gratuita sopra la soglia indicata nel carrello; il costo esatto, se previsto, è sempre visibile prima del pagamento.',
  },
  {
    q: 'Posso pagare in sicurezza?',
    a: 'Sì: il pagamento è gestito interamente da Stripe su una pagina cifrata. Prezzi e disponibilità vengono ricontrollati sul server prima di aprire il checkout, senza mai condividere i dati della carta con lo store.',
  },
  {
    q: 'Come funziona il reso?',
    a: 'Hai 14 giorni dal ricevimento per richiedere il reso gratuito dell’acquisto. Avvia la richiesta dalla pagina di tracciamento ordine o contattaci: forniamo l’etichetta e il rimborso arriva dopo la verifica.',
  },
  {
    q: 'Che garanzia hanno i prodotti?',
    a: 'Tutti i prodotti godono della garanzia legale di conformità di 24 mesi per i consumatori, con assistenza dedicata via WhatsApp o email per qualsiasi necessità.',
  },
  {
    q: 'Posso tracciare il mio ordine?',
    a: 'Certo: dalla pagina “Traccia il tuo ordine” basta il numero ordine (TM-… dalla email di conferma) e l’email usata al checkout per vedere stato, spedizione e tracking del corriere in tempo reale.',
  },
  {
    q: 'Come posso contattarvi?',
    a: `Su WhatsApp al +39 351 255 1866 oppure via email a ${SUPPORT_EMAIL}. Per le comunicazioni formali usiamo la PEC indicata nelle informazioni societarie.`,
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section aria-labelledby="faq-title" className="bg-[#f5f5f7] px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold text-[#0066cc]">Domande frequenti</p>
          <h2 id="faq-title" className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-5xl">
            Tutto chiaro.
          </h2>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.07 }}
          className="space-y-3"
        >
          {FAQS.map((faq, index) => {
            const open = openIndex === index;
            return (
              <motion.li
                key={faq.q}
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]"
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${index}`}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#1d1d1f] transition-colors hover:text-[#0066cc] sm:text-base"
                  >
                    {faq.q}
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#6e6e73]"
                    >
                      <ChevronDown size={15} />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-7 text-[#6e6e73]">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center text-sm text-[#6e6e73]"
        >
          Non trovi la risposta?{' '}
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#25D366] hover:underline">Scrivici su WhatsApp</a>
          {' '}oppure{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#0066cc] hover:underline">via email</a>.
        </motion.div>
      </div>
    </section>
  );
}
