import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Image } from '@/components/ui/image';
import { useStore } from '@/lib/StoreContext';

export default function Preferiti() {
  const { wishlist, toggleWishlist } = useStore();

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#FF6B35] transition-colors mb-4">
          <ArrowLeft size={16} /> Torna alla Home
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-8">I tuoi Preferiti</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-[#1d1d1f] mb-1">Nessun preferito</p>
            <p className="text-sm text-[#6e6e73] mb-6">Tocca il cuore su un prodotto per salvarlo qui.</p>
            <Link to="/catalogo" className="inline-block px-6 py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B35] transition-colors">
              Vai al Catalogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {wishlist.map(item => (
              <div key={item.id} className="group bg-white rounded-2xl overflow-hidden flex flex-col">
                <Link to={`/scheda-prodotto?id=${item.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                  <Image src={item.image} alt={item.name} className="w-full h-full transition-transform duration-500 group-hover:scale-105" fittingType="fill" />
                </Link>
                <div className="p-3 flex flex-col flex-1">
                  <Link to={`/scheda-prodotto?id=${item.id}`} className="text-sm font-semibold text-[#1d1d1f] line-clamp-2 mb-1 hover:text-[#FF6B35]">{item.name}</Link>
                  <p className="text-sm font-bold text-[#1d1d1f] mb-3">{item.price}</p>
                  <button onClick={() => toggleWishlist(item)} className="mt-auto flex items-center justify-center gap-1.5 text-xs font-semibold text-[#6e6e73] hover:text-red-500 py-2 border-t border-gray-100">
                    <Trash2 size={14} /> Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FooterSection />
    </div>
  );
}