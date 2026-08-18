import React from 'react';
import { Headset, Lock, RefreshCcw, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const PROPS = [
  { icon: Truck, label: 'Spedizione rapida 24/48h' },
  { icon: ShieldCheck, label: 'Garanzia inclusa' },
  { icon: RefreshCcw, label: 'Reso entro 14 giorni' },
  { icon: Lock, label: 'Pagamento sicuro Stripe' },
  { icon: Headset, label: 'Assistenza dedicata' },
  { icon: Sparkles, label: 'Configurazioni su misura' },
];

export default function ValueMarquee() {
  const strip = (hidden) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-10 px-5"
    >
      {PROPS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-[#424245]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
            <Icon size={15} aria-hidden="true" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="I vantaggi dello store" className="marquee-hover-pause relative overflow-hidden border-b border-black/[0.06] bg-white py-4">
      <p className="sr-only">Spedizione rapida 24/48h, garanzia inclusa, reso entro 14 giorni, pagamento sicuro, assistenza dedicata e configurazioni su misura.</p>
      <div className="flex w-max animate-marquee">
        {strip(false)}
        {strip(true)}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
    </section>
  );
}
