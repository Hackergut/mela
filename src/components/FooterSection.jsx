import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShoppingBag } from 'lucide-react';
import { useCatalog } from '@/lib/useProducts';
import { COMPANY, SUPPORT_EMAIL, whatsappLink, WhatsAppIcon } from '@/lib/contact';

const LINKS = [
  { label: 'Catalogo', to: '/catalogo' },
  { label: 'Preferiti', to: '/preferiti' },
  { label: 'Carrello', to: '/carrello' },
  { label: 'Traccia ordine', to: '/traccia-ordine' },
  { label: 'Account', to: '/login' },
  { label: 'Informazioni societarie', to: '/informazioni-legali' },
];

export default function FooterSection() {
  const { settings } = useCatalog();
  const storeName = settings.store_name || 'TechMania';

  return (
    <footer className="border-t border-white/10 bg-[#1d1d1f] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Link to="/" className="flex items-center gap-2.5 text-white" aria-label={`${storeName}, home`}>
            <img src="/brand/logo.svg" alt="" className="h-8 w-auto brightness-0 invert" width="44" height="32" />
            <span className="sr-only">{storeName}</span>
          </Link>
          <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:gap-5 md:items-start">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-[#e8e8ed] transition hover:bg-[#25D366]/20 hover:text-white"
              aria-label="Assistenza WhatsApp +39 351 255 1866"
            >
              <span className="text-[#25D366]"><WhatsAppIcon size={15} /></span>
              <span dir="ltr">+39 351 255 1866</span>
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-[#e8e8ed] transition hover:bg-white/[0.14] hover:text-white"
            >
              <Mail size={14} className="text-[#64a8ff]" aria-hidden="true" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <nav aria-label="Link del footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-end">
          {LINKS.map(link => (
            <Link key={link.label} to={link.to} className="text-sm text-[#a1a1a6] transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-center md:text-left">
        <p className="text-xs leading-relaxed text-[#86868b]">
          © {new Date().getFullYear()} {storeName} — un servizio di <span className="text-[#a1a1a6]">{COMPANY.legalName}</span> ·
          C.F./P.IVA {COMPANY.taxCode} · REA {COMPANY.rea} · <Link to="/informazioni-legali" className="underline decoration-white/30 underline-offset-2 transition hover:text-white">informazioni societarie</Link>
        </p>
      </div>
    </footer>
  );
}
