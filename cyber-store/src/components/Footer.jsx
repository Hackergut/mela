import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useStore();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      showToast('Grazie per esserti iscritto alla newsletter di Cyber!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-3xl font-black tracking-widest text-white uppercase inline-block">
              cyber
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Siamo uno store ad alto concetto tecnologico che offre gadget all'avanguardia, smartphone flagship, cuffie audio premium e accessori di massima qualità.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#twitter" aria-label="Twitter" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#facebook" aria-label="Facebook" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#instagram" aria-label="Instagram" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#youtube" aria-label="Youtube" className="p-2.5 rounded-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Servizi */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Servizi</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/products" className="hover:text-white transition-colors">Programma Fedeltà</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Carte Regalo</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Finanziamento e Pagamenti</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Contratti di Assistenza</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Account Aziendale</Link></li>
            </ul>
          </div>

          {/* Assistenza */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Assistenza</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/cart" className="hover:text-white transition-colors">Traccia il tuo Ordine</Link></li>
              <li><Link to="/checkout/shipping" className="hover:text-white transition-colors">Condizioni di Spedizione</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Resi e Sostituzioni</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Garanzia Prodotti</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Domande Frequenti (FAQ)</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Iscriviti</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Rimani aggiornato su nuove uscite, sconti esclusivi e lanci di prodotto.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Inserisci la tua email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-500 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Iscriviti"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 CYBER Store. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-gray-400 transition-colors">Informativa sulla Privacy</a>
            <a href="#terms" className="hover:text-gray-400 transition-colors">Termini di Servizio</a>
            <a href="#cookies" className="hover:text-gray-400 transition-colors">Gestione Cookie</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
