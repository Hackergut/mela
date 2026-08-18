import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Clock, Mail } from 'lucide-react';
import { COMPANY, SUPPORT_EMAIL, whatsappLink, WhatsAppIcon } from '@/lib/contact';

// Dedicated support section: the WhatsApp channel and the official email are
// promoted on the homepage, not only in the floating button and footer.
export default function SupportSection() {
  return (
    <section aria-labelledby="support-title" className="bg-[#f5f5f7] px-5 py-24 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-[#0066cc]">Siamo con te</p>
          <h2 id="support-title" className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] md:text-5xl">
            Supporto dedicato.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#6e6e73]">
            Una domanda su un ordine, una configurazione o una spedizione? Il nostro team risponde in fretta.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.a
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
            href={whatsappLink('Ciao! Ho una domanda su TechMania.')}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-[28px] bg-[#25D366] p-7 text-white shadow-[0_12px_36px_rgba(37,211,102,.35)] transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <WhatsAppIcon size={24} />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">WhatsApp</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/85">
              <Clock size={13} aria-hidden="true" /> Risposta rapida in orario lavorativo
            </p>
            <p className="mt-4 text-2xl font-semibold tracking-tight" dir="ltr">+39 351 255 1866</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
              Apri la chat
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </motion.a>

          <motion.a
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Richiesta assistenza TechMania')}`}
            className="group flex flex-col rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,.05)] transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]">
              <Mail size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#1d1d1f]">Email ufficiale</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#6e6e73]">
              <Clock size={13} aria-hidden="true" /> Risposta entro un giorno lavorativo
            </p>
            <p className="mt-4 break-all text-lg font-semibold tracking-tight text-[#1d1d1f]">{SUPPORT_EMAIL}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0071e3]">
              Scrivi ora
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex flex-col rounded-[28px] bg-[#1d1d1f] p-7 text-white"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
              <Building2 size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{COMPANY.legalName}</h3>
            <p className="mt-1.5 text-sm leading-6 text-[#a1a1a6]">
              {COMPANY.registeredOffice}
              <br />
              C.F. {COMPANY.taxCode} · REA {COMPANY.rea}
            </p>
            <Link
              to="/informazioni-legali"
              className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#64a8ff] hover:underline"
            >
              Informazioni societarie <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
