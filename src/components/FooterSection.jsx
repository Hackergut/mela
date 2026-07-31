import React from 'react';

const LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Termini di Servizio', href: '#' },
  { label: 'Contatti', href: '#' },
  { label: 'Chi Siamo', href: '#' },
];

export default function FooterSection() {
  return (
    <footer className="bg-[#1d1d1f] border-t border-white/10 py-10 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="white">
            <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 2c5.523 0 10 4.477 10 10S19.523 24 14 24 4 19.523 4 14 8.477 4 14 4zm-2 4v12l8-6-8-6z"/>
          </svg>
          <span className="text-white font-semibold text-base">TechStore</span>
        </div>

        <nav className="flex flex-wrap gap-6 justify-center">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-[#6e6e73] text-sm hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-[#6e6e73] text-sm">
          © 2025 TechStore. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}