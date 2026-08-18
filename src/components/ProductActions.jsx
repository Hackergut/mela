import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { useStore } from '@/lib/StoreContext';
import tracking from '@/lib/tracking';

export default function ProductActions({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const favorite = isInWishlist(product.id);
  const quickVariant = (product.default_variant?.stock || 0) > 0
    ? product.default_variant
    : product.variants?.find(variant => variant.status === 'active' && variant.stock > 0);
  const available = product.has_variants ? Boolean(quickVariant) : (product.stock ?? 0) > 0;

  return (
    <div className="flex gap-2">
      <button
        disabled={!available}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const variant = quickVariant || product.default_variant;
          addToCart(product, variant);
          tracking.addToCart(product, variant, 1);
        }}
        className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#1d1d1f] shadow-sm backdrop-blur-xl transition-colors hover:bg-[#0071e3] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={available ? `Aggiungi ${product.name} al carrello` : `${product.name} esaurito`}
      >
        <Plus size={16} />
      </button>
      <button
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist(product); }}
        className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur-xl transition-colors ${favorite ? 'text-[#0071e3]' : 'text-[#1d1d1f] hover:text-[#0071e3]'}`}
        aria-label={favorite ? `Rimuovi ${product.name} dai preferiti` : `Aggiungi ${product.name} ai preferiti`}
      >
        <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
