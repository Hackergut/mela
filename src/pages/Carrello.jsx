import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Image } from '@/components/ui/image';
import { useStore } from '@/lib/StoreContext';

const parsePrice = (p) => Number(String(p).replace('€', '').replace(/\./g, '').replace(',', '.')) || 0;
const formatPrice = (n) => '€' + n.toLocaleString('it-IT');

export default function Carrello() {
  const { cart, updateQty, removeFromCart, clearCart } = useStore();
  const total = cart.reduce((s, i) => s + parsePrice(i.price) * (i.qty || 1), 0);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-8 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#FF6B35] transition-colors mb-4">
          <ArrowLeft size={16} /> Torna alla Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-8">Il tuo Carrello</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-[#1d1d1f] mb-1">Il carrello è vuoto</p>
            <p className="text-sm text-[#6e6e73] mb-6">Aggiungi prodotti per iniziare lo shopping.</p>
            <Link to="/catalogo" className="inline-block px-6 py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B35] transition-colors">
              Vai al Catalogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 items-center">
                  <Link to={`/scheda-prodotto?id=${item.id}`} className="w-24 h-24 rounded-xl overflow-hidden bg-[#f5f5f7] shrink-0">
                    <Image src={item.image} alt={item.name} className="w-full h-full" fittingType="fill" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/scheda-prodotto?id=${item.id}`} className="text-sm font-semibold text-[#1d1d1f] line-clamp-1 hover:text-[#FF6B35]">{item.name}</Link>
                    <p className="text-sm text-[#6e6e73] mt-1">{item.price}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button onClick={() => updateQty(item.id, (item.qty || 1) - 1)} className="w-8 h-8 flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f]" aria-label="Diminuisci"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty || 1}</span>
                        <button onClick={() => updateQty(item.id, (item.qty || 1) + 1)} className="w-8 h-8 flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f]" aria-label="Aumenta"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-sm text-[#6e6e73] hover:text-red-500 flex items-center gap-1"><Trash2 size={14} /> Rimuovi</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-sm text-[#6e6e73] hover:text-red-500">Svuota carrello</button>
            </div>
            <div className="bg-white rounded-2xl p-6 h-fit lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">Riepilogo</h2>
              <div className="flex justify-between text-sm text-[#6e6e73] mb-2">
                <span>Articoli</span><span>{cart.reduce((s, i) => s + (i.qty || 1), 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1d1d1f] pb-4 border-b border-gray-100">
                <span>Totale</span><span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-[#6e6e73] mt-4 mb-4">Per completare l'acquisto, vai alla scheda prodotto e usa "Acquista Ora" con pagamento sicuro Stripe.</p>
              <Link to="/catalogo" className="block text-center px-6 py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B35] transition-colors">Continua lo shopping</Link>
            </div>
          </div>
        )}
      </div>
      <FooterSection />
    </div>
  );
}