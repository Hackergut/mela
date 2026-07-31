import React, { useState, useEffect } from 'react';

export default function Navbar() {
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

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#1d1d1f] font-bold text-xl tracking-tight">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
              <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 2c5.523 0 10 4.477 10 10S19.523 24 14 24 4 19.523 4 14 8.477 4 14 4zm-2 4v12l8-6-8-6z"/>
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Categories', id: 'categories' },
            { label: 'Products', id: 'products' },
            { label: 'Blogs', id: 'blogs' },
            { label: 'Newsletter', id: 'newsletter' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="px-4 py-2 text-sm text-[#1d1d1f] hover:text-[#FF6B35] transition-colors duration-200 rounded-full hover:bg-gray-50 font-medium"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => scrollTo('newsletter')}
            className="px-5 py-2 text-sm font-medium text-white bg-[#1d1d1f] rounded-full hover:bg-[#FF6B35] transition-colors duration-200"
          >
            Join Newsletter
          </button>
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-[#1d1d1f] transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-[#1d1d1f] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-[#1d1d1f] transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
          {[
            { label: 'Categories', id: 'categories' },
            { label: 'Products', id: 'products' },
            { label: 'Blogs', id: 'blogs' },
            { label: 'Newsletter', id: 'newsletter' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left px-4 py-3 text-sm text-[#1d1d1f] hover:text-[#FF6B35] font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => scrollTo('newsletter')}
            className="mt-2 w-full px-4 py-3 text-sm font-medium text-white bg-[#1d1d1f] rounded-full hover:bg-[#FF6B35] transition-colors"
          >
            Join Newsletter
          </button>
        </div>
      )}
    </header>
  );
}