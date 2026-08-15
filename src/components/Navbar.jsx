import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import { useCatalog } from '@/lib/useProducts';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlistCount } = useStore();
  const { settings } = useCatalog();
  const storeName = settings.store_name || 'TechMania';
  const [menuOpen, setMenuOpen] = useState(false);

  const goToSection = (id) => {
    setMenuOpen(false);
    if (location.pathname === '/') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    else {
      navigate('/');
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
    }
  };
  const links = [
    { label: 'Store', to: '/catalogo' },
    { label: 'Categorie', section: 'categories' },
    { label: 'Prodotti', section: 'products' },
    { label: 'Scopri', section: 'features' },
    { label: 'Supporto', section: 'newsletter' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex min-h-10 items-center text-[17px] font-semibold tracking-[-0.025em] text-[#1d1d1f]" aria-label={`${storeName}, home`}>
          {storeName}
        </Link>

        <nav className="hidden items-center md:flex" aria-label="Navigazione principale">
          {links.map(link => link.to ? (
            <Link key={link.label} to={link.to} className="rounded-full px-3.5 py-2 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04] hover:text-[#0066cc]">{link.label}</Link>
          ) : (
            <button key={link.label} onClick={() => goToSection(link.section)} className="rounded-full px-3.5 py-2 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04] hover:text-[#0066cc]">{link.label}</button>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <NavIcon to="/preferiti" label="Preferiti" count={wishlistCount}><Heart size={18} /></NavIcon>
          <NavIcon to="/carrello" label="Carrello" count={cartCount}><ShoppingBag size={18} /></NavIcon>
          <Link to="/login" className="ml-2 hidden min-h-9 items-center rounded-full bg-[#1d1d1f] px-4 text-xs font-semibold text-white transition hover:bg-[#424245] sm:flex">Accedi</Link>
          <button onClick={() => setMenuOpen(open => !open)} className="ml-1 grid h-10 w-10 place-items-center rounded-full hover:bg-black/[0.05] md:hidden" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div id="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: .35 }} className="overflow-hidden border-t border-black/[0.06] bg-white/92 backdrop-blur-2xl md:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-5 py-4" aria-label="Navigazione mobile">
              {links.map(link => link.to ? (
                <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-base font-semibold tracking-tight hover:bg-[#f5f5f7]">{link.label}</Link>
              ) : (
                <button key={link.label} onClick={() => goToSection(link.section)} className="block w-full rounded-xl px-4 py-3 text-left text-base font-semibold tracking-tight hover:bg-[#f5f5f7]">{link.label}</button>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-4">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-full bg-[#1d1d1f] px-4 py-3 text-center text-sm font-semibold text-white">Accedi</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-full bg-[#e8f2ff] px-4 py-3 text-center text-sm font-semibold text-[#0066cc]">Registrati</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavIcon({ to, label, count, children }) {
  return (
    <Link to={to} className="relative grid h-10 w-10 place-items-center rounded-full text-[#1d1d1f] transition-colors hover:bg-black/[0.05]" aria-label={`${label}${count ? `, ${count}` : ''}`}>
      {children}
      {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#0071e3] px-1 text-[9px] font-bold text-white">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
