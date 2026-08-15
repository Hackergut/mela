import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCatalog } from '@/lib/useProducts';

const LINKS = [
  { label: 'Catalogo', to: '/catalogo' },
  { label: 'Preferiti', to: '/preferiti' },
  { label: 'Carrello', to: '/carrello' },
  { label: 'Account', to: '/login' },
];

export default function FooterSection() {
  const { settings } = useCatalog();
  const storeName = settings.store_name || 'TechMania';

  return (
    <footer className="border-t border-white/10 bg-[#1d1d1f] px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Link to="/" className="flex items-center gap-2.5 text-white" aria-label={`${storeName}, home`}>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10"><ShoppingBag size={16} aria-hidden="true" /></span>
          <span className="text-base font-semibold">{storeName}</span>
        </Link>

        <nav aria-label="Link del footer" className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {LINKS.map(link => (
            <Link key={link.label} to={link.to} className="text-sm text-[#a1a1a6] transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-[#86868b]">
          © {new Date().getFullYear()} {storeName}
        </p>
      </div>
    </footer>
  );
}
