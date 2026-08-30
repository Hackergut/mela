import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, ChevronRight, Check } from 'lucide-react';
import { products } from '../data/products';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist, showToast } = useStore();

  const product = products.find(p => p.id === id) || products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedStorage, setSelectedStorage] = useState(product.storageOptions?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descrizione');

  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  const isWishlisted = wishlist.includes(product.id);
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product.id, selectedColor, selectedStorage, quantity);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReview.name && newReview.comment) {
      showToast('Grazie! La tua recensione è stata inviata con successo.', 'success');
      setNewReview({ name: '', rating: 5, comment: '' });
    }
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/products" className="hover:text-black">Prodotti</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/products?category=${product.category}`} className="capitalize hover:text-black">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-black truncate max-w-xs">{product.name}</span>
        </nav>

        {/* TOP SECTION: GALLERY + PRODUCT SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* IMAGE GALLERY */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[480px] py-1">
              {galleryImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-2xl bg-gray-100 p-2 border-2 transition-all overflow-hidden ${
                    selectedImage === idx ? 'border-black ring-2 ring-black/10' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </motion.button>
              ))}
            </div>

            {/* Main Preview with AnimatePresence */}
            <div className="flex-1 bg-gray-100 rounded-3xl p-8 flex items-center justify-center min-h-[380px] sm:min-h-[480px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  src={galleryImages[selectedImage] || product.image}
                  alt={product.name}
                  className="max-h-[380px] max-w-full object-contain mix-blend-multiply"
                />
              </AnimatePresence>

              {product.discount > 0 && (
                <span className="absolute top-6 left-6 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase">
                  -{product.discount}% SCONTO
                </span>
              )}
            </div>

          </div>

          {/* PRODUCT INFORMATION */}
          <div className="space-y-6">
            
            {/* Title & Brand */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{product.brand}</span>
              <h1 className="text-3xl font-black text-black tracking-tight mt-1">{product.name}</h1>
              
              {/* Rating & Stock */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-semibold">
                  <div className="flex">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <span className="text-black font-bold">{product.rating}</span>
                  <span className="text-gray-400">({product.reviewCount} recensioni)</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponibile in Magazzino
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100">
              <span className="text-3xl font-black text-black">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
              )}
            </div>

            {/* Color Swatch Picker */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Seleziona Colore: <span className="text-black font-extrabold">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <motion.button
                        key={c.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        style={{ backgroundColor: c.hex }}
                        className={`w-9 h-9 rounded-full border-2 transition-all relative ${
                          isSelected
                            ? 'ring-4 ring-black/20 border-black scale-110'
                            : 'border-white hover:scale-105'
                        }`}
                      >
                        {isSelected && (
                          <Check className={`w-4 h-4 absolute inset-0 m-auto ${c.hex === '#FFFFFF' || c.hex === '#F2F1EC' ? 'text-black' : 'text-white'}`} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage Picker */}
            {product.storageOptions && product.storageOptions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Seleziona Capacità:
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.storageOptions.map((opt) => {
                    const isSelected = selectedStorage === opt;
                    return (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedStorage(opt)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-gray-100 text-black border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Specs Grid Preview */}
            {product.specs && (
              <div className="grid grid-cols-2 gap-3 py-2">
                {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">{key}</span>
                    <span className="text-xs font-semibold text-black truncate block">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center text-black font-bold text-lg hover:bg-gray-200 rounded-lg transition-colors"
                >
                  -
                </motion.button>
                <span className="w-12 text-center text-sm font-bold text-black">{quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center text-black font-bold text-lg hover:bg-gray-200 rounded-lg transition-colors"
                >
                  +
                </motion.button>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddToCart}
                className="flex-1 w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Aggiungi al Carrello</span>
              </motion.button>

              {/* Wishlist Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWishlisted ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:text-black'
                }`}
                title="Aggiungi ai preferiti"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </motion.button>

            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center">
              <div className="flex flex-col items-center gap-1 p-2">
                <Truck className="w-5 h-5 text-gray-700" />
                <span className="text-[11px] font-semibold text-gray-600">Spedizione Gratuita</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
                <span className="text-[11px] font-semibold text-gray-600">Garanzia 1 Anno</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2">
                <RotateCcw className="w-5 h-5 text-gray-700" />
                <span className="text-[11px] font-semibold text-gray-600">Reso Entro 30 Giorni</span>
              </div>
            </div>

          </div>

        </div>

        {/* TABS SECTION */}
        <div className="border-t border-gray-200 pt-12 mb-16">
          
          <div className="flex border-b border-gray-200 gap-8 mb-8 overflow-x-auto">
            {['descrizione', 'specifiche', 'recensioni'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative text-base font-bold pb-4 -mb-px capitalize transition-colors ${
                    isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeDetailsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab 1: Descrizione */}
              {activeTab === 'descrizione' && (
                <div className="max-w-3xl space-y-4 text-gray-700 leading-relaxed text-sm">
                  <p className="text-base font-medium text-black">{product.description}</p>
                  <p>
                    Progettato con ingegneria di precisione per offrire la massima efficienza e resistenza. Sia per il lavoro professionale che per il gaming o l'uso quotidiano, questo dispositivo garantisce un'esperienza di classe superiore.
                  </p>
                </div>
              )}

              {/* Tab 2: Specifiche */}
              {activeTab === 'specifiche' && (
                <div className="max-w-3xl border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {product.specs && Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 p-4 bg-white hover:bg-gray-50 text-xs">
                      <span className="font-bold text-gray-500 uppercase">{key}</span>
                      <span className="col-span-2 font-medium text-black">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Recensioni */}
              {activeTab === 'recensioni' && (
                <div className="max-w-3xl space-y-8">
                  
                  {/* Summary */}
                  <div className="bg-gray-50 p-6 rounded-2xl flex items-center gap-8 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-black text-black">{product.rating}</div>
                      <div className="flex text-yellow-400 my-1">
                        <Star className="w-4 h-4 fill-yellow-400" />
                      </div>
                      <div className="text-xs text-gray-400">{product.reviewCount} Recensioni</div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                        <span>5 stelle</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-black h-full w-[90%]" />
                        </div>
                        <span>90%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                        <span>4 stelle</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-black h-full w-[10%]" />
                        </div>
                        <span>10%</span>
                      </div>
                    </div>
                  </div>

                  {/* Reviews list */}
                  <div className="space-y-4">
                    {product.reviews && product.reviews.map((rev) => (
                      <div key={rev.id} className="border border-gray-100 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-black">{rev.author}</span>
                          <span className="text-xs text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex text-yellow-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add review form */}
                  <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                    <h4 className="text-sm font-bold text-black">Scrivi una Recensione</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Il tuo nome"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        required
                        className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value={5}>5 Stelle - Eccellente</option>
                        <option value={4}>4 Stelle - Buono</option>
                        <option value={3}>3 Stelle - Nella media</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Condividi la tua esperienza con questo prodotto..."
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      className="bg-black text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Invia Recensione
                    </motion.button>
                  </form>

                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight mb-8">Prodotti Correlati</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
