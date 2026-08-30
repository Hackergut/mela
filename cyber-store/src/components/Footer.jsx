import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-16 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Spedizione Gratuita</h4>
              <p className="text-xs text-gray-400">Su tutti gli ordini superiori a $50</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Garanzia Ufficiale</h4>
              <p className="text-xs text-gray-400">2 Anni di Garanzia TechMania</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Reso Facile 30 Giorni</h4>
              <p className="text-xs text-gray-400">Soddisfatti o rimborsati</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Supporto 24/7</h4>
              <p className="text-xs text-gray-400">Assistenza clienti in italiano</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-widest text-white uppercase">
              <span className="bg-white text-black px-2.5 py-1 rounded-xl text-lg font-black tracking-tight">TM</span>
              <span className="font-extrabold text-xl tracking-wider">TechMania</span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              TechMania è la tua destinazione di riferimento per l'elettronica di consumo premium, smartphone, laptop, audio hi-fi e gadget tecnologici di ultima generazione.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#twitter" aria-label="Twitter" className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#facebook" aria-label="Facebook" className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#instagram" aria-label="Instagram" className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Servizi</h5>
            <ul className="space-[#0.5rem] space-y-2 text-xs text-gray-400">
              <li><a href="#bonus" className="hover:text-white transition-colors">Programma Fedeltà</a></li>
              <li><a href="#gift" className="hover:text-white transition-colors">Carte Regalo TechMania</a></li>
              <li><a href="#credit" className="hover:text-white transition-colors">Pagamento a Rate Klarna / Stripe</a></li>
              <li><a href="#trade" className="hover:text-white transition-colors">Permuta Usato TechMania</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Assistenza</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#orders" className="hover:text-white transition-colors">Traccia il Tuo Ordine</a></li>
              <li><a href="#shipping" className="hover:text-white transition-colors">Costi di Spedizione</a></li>
              <li><a href="#returns" className="hover:text-white transition-colors">Centro Resi e Garanzie</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Domande Frequenti (FAQ)</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Informazioni Legali</h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#privacy" className="hover:text-white transition-colors">Informativa Privacy GDPR</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Termini e Condizioni d'Uso</a></li>
              <li><a href="#cookies" className="hover:text-white transition-colors">Gestione Cookie</a></li>
              <li><a href="#corporate" className="hover:text-white transition-colors">Dati Societari TechMania SRL</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 TECHMANIA Store. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-6">
            <span>Metodi di Pagamento Sicuri:</span>
            <div className="flex items-center gap-2 text-white font-bold tracking-tight">
              <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">Stripe</span>
              <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">Visa</span>
              <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">Mastercard</span>
              <span className="px-2 py-0.5 bg-white/10 rounded text-[10px]">Apple Pay</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
