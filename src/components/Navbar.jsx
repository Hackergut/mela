import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const goCatalog = () => {
    navigate('/catalogo');
    setMenuOpen(false);
  };

  const goHomeAndScroll = (id) => {
    navigate('/');
    setTimeout(() => scrollTo(id), 100);
    setMenuOpen(false);
  };

  const NAV_LINKS = [
    { label: 'Catalogo', action: goCatalog },
    { label: 'Categorie', action: () => goHomeAndScroll('categories') },
    { label: 'Prodotti', action: () => goHomeAndScroll('products') },
    { label: 'Blog', action: () => goHomeAndScroll('blogs') },
    { label: 'Newsletter', action: () => goHomeAndScroll('newsletter') },
  ];

  const iconColor = scrolled ? 'text-[#1d1d1f] hover:bg-gray-100' : 'text-white hover:bg-white/10';
  const Badge = ({ count }) => count > 0 ? (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>
  ) : null;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-black'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-[#1d1d1f]' : 'text-white'}`}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
              <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 2c5.523 0 10 4.477 10 10S19.523 24 14 24 4 19.523 4 14 8.477 4 14 4zm-2 4v12l8-6-8-6z"/>
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              className={`px-4 py-2 text-sm transition-colors duration-200 rounded-full font-medium ${scrolled ? 'text-[#1d1d1f] hover:text-[#FF6B35] hover:bg-gray-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA + Azioni carrello/preferiti/account */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/preferiti" className={`relative p-2 rounded-full transition-colors ${iconColor}`} aria-label="Preferiti">
            <Heart size={20} />
            <Badge count={wishlistCount} />
          </Link>
          <Link to="/carrello" className={`relative p-2 rounded-full transition-colors ${iconColor}`} aria-label="Carrello">
            <ShoppingBag size={20} />
            <Badge count={cartCount} />
          </Link>
          <button
            onClick={() => scrollTo('newsletter')}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${scrolled ? 'text-white bg-[#1d1d1f] hover:bg-[#FF6B35]' : 'text-black bg-white hover:bg-white/90'}`}
          >
            Iscriviti
          </button>
          <Link
            to="/login"
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${scrolled ? 'text-[#1d1d1f] border-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white' : 'text-white border-white hover:bg-white hover:text-black'}`}
          >
            Accedi
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1">
          <Link to="/preferiti" className={`relative p-2 rounded-full transition-colors ${scrolled ? 'text-[#1d1d1f]' : 'text-white'}`} aria-label="Preferiti">
            <Heart size={20} />
            <Badge count={wishlistCount} />
          </Link>
          <Link to="/carrello" className={`relative p-2 rounded-full transition-colors ${scrolled ? 'text-[#1d1d1f]' : 'text-white'}`} aria-label="Carrello">
            <ShoppingBag size={20} />
            <Badge count={cartCount} />
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 transition-all duration-200 ${scrolled ? 'bg-[#1d1d1f]' : 'bg-white'} ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 transition-all duration-200 ${scrolled ? 'bg-[#1d1d1f]' : 'bg-white'} ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 transition-all duration-200 ${scrolled ? 'bg-[#1d1d1f]' : 'bg-white'} ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden border-t overflow-hidden ${scrolled ? 'bg-white border-gray-100' : 'bg-black border-white/10'}`}
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${scrolled ? 'text-[#1d1d1f] hover:text-[#FF6B35] hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => goHomeAndScroll('newsletter')}
                className={`mt-2 w-full px-4 py-3 text-sm font-medium rounded-full transition-colors ${scrolled ? 'text-white bg-[#1d1d1f] hover:bg-[#FF6B35]' : 'text-black bg-white hover:bg-white/90'}`}
              >
                Iscriviti
              </button>
              <div className={`pt-3 mt-3 border-t grid grid-cols-2 gap-2 ${scrolled ? 'border-gray-100' : 'border-white/10'}`}>
                <Link to="/carrello" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${scrolled ? 'text-[#1d1d1f] hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>Carrello ({cartCount})</Link>
                <Link to="/preferiti" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${scrolled ? 'text-[#1d1d1f] hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>Preferiti ({wishlistCount})</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${scrolled ? 'text-[#1d1d1f] hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>Accedi</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${scrolled ? 'text-[#1d1d1f] hover:bg-gray-50' : 'text-white hover:bg-white/10'}`}>Registrati</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}