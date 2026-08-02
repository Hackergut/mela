import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';

export default function ProductActions({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const fav = isInWishlist(product.id);

  return (
    <div className="flex gap-2">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
        className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white transition-colors"
        aria-label="Aggiungi al carrello"
        title="Aggiungi al carrello"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
        className={`w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-colors ${fav ? 'text-[#FF6B35]' : 'text-[#1d1d1f] hover:text-[#FF6B35]'}`}
        aria-label="Aggiungi ai preferiti"
        title="Aggiungi ai preferiti"
      >
        <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}