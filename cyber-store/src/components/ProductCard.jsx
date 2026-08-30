import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const navigate = useNavigate();

  const isWishlisted = wishlist.includes(product.id);

  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product.id, product.colors?.[0]?.name, product.storageOptions?.[0], 1);
  };

  return (
    <div className="group relative bg-[#F6F6F6] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-200">
      
      {/* Top bar: Badge & Wishlist button */}
      <div className="flex items-center justify-between z-10">
        <div>
          {product.discount > 0 ? (
            <span className="bg-black text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              -{product.discount}%
            </span>
          ) : product.tag ? (
            <span className="bg-gray-200 text-black text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.tag}
            </span>
          ) : null}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-2 rounded-full transition-all duration-200 ${
            isWishlisted
              ? 'bg-red-50 text-red-500 scale-110'
              : 'bg-white/80 text-gray-400 hover:text-black hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Image container */}
      <Link to={`/products/${product.id}`} className="my-4 block overflow-hidden rounded-xl">
        <div className="w-full h-48 flex items-center justify-center p-2">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // SVG fallback if image fails to load
              e.target.onerror = null;
              e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="flex text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
          </div>
          <span className="font-semibold text-black">{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-medium text-black text-sm sm:text-base line-clamp-2 hover:underline leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price & Buy Button */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="text-xl font-extrabold text-black">
              ${product.price}
            </div>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleBuyNow}
            className="bg-black hover:bg-gray-800 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buy</span>
          </button>
        </div>
      </div>

    </div>
  );
}
