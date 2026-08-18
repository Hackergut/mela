import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, MessageCircle } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { COMPANY, SUPPORT_EMAIL, whatsappLink, WhatsAppIcon } from '@/lib/contact';

const ROWS = [
  ['Denominazione', COMPANY.legalName],
  ['Forma giuridica', COMPANY.legalForm],
  ['Sede legale', COMPANY.registeredOffice],
  ['Codice fiscale / iscr. Registro Imprese', COMPANY.taxCode],
  ['Numero REA', COMPANY.rea],
  ['PEC / Domicilio digitale', COMPANY.pec],
  ['Amministratore Unico', COMPANY.soleDirector],
];

export default function InfoLegali() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <PromoBanner />
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#6e6e73] transition-colors hover:bg-white hover:text-[#1d1d1f]">
          ← Home
        </Link>
        <div className="mb-8 mt-4">
          <p className="text-sm font-semibold text-[#0066cc]">Trasparenza</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Informazioni societarie.</h1>
          <p className="mt-4 text-sm leading-7 text-[#6e6e73]">
            TechMania è un servizio gestito da <strong>{COMPANY.legalName}</strong>. Qui trovi i dati identificativi
            dell'operatore, come previsto dalla normativa vigente per il commercio elettronico.
          </p>
        </div>

        <section aria-labelledby="company-data" className="rounded-[32px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03)] sm:p-8">
          <h2 id="company-data" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Building2 size={19} className="text-[#0071e3]" aria-hidden="true" /> Dati anagrafici
          </h2>
          <dl className="mt-5 divide-y divide-[#d2d2d7]">
            {ROWS.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3.5 sm:grid-cols-2 sm:gap-4">
                <dt className="text-sm text-[#6e6e73]">{label}</dt>
                <dd className="break-words text-sm font-medium text-[#1d1d1f]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="company-contacts" className="mt-6 rounded-[32px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.03)] sm:p-8">
          <h2 id="company-contacts" className="text-lg font-semibold tracking-tight">Contatti ufficiali</h2>
          <p className="mt-2 text-sm text-[#6e6e73]">Per assistenza su ordini, prodotti e spedizioni.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#25D366]/10 px-4 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#25D366]/20"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon size={18} /></span>
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5"><MessageCircle size={13} aria-hidden="true" /> WhatsApp</span>
                <span className="font-normal text-[#6e6e73]" dir="ltr">+39 351 255 1866</span>
              </span>
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex min-h-12 items-center gap-3 rounded-2xl bg-[#0071e3]/10 px-4 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#0071e3]/20"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0071e3] text-white"><Mail size={17} aria-hidden="true" /></span>
              <span className="flex flex-col text-left">
                <span>Email ufficiale</span>
                <span className="break-all font-normal text-[#6e6e73]">{SUPPORT_EMAIL}</span>
              </span>
            </a>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[#86868b]">
            Le comunicazioni formali e la posta certificata (PEC) vanno inviate a <span className="font-medium">{COMPANY.pec}</span>.
          </p>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
