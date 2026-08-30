import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, ChevronRight, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories, brands } from '../data/products';
import { useStore } from '../context/StoreContext';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist } = useStore();

  const queryCategory = searchParams.get('category') || 'all';
  const querySearch = searchParams.get('search') || '';
  const queryTab = searchParams.get('tab') || '';

  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 4000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (queryCategory) setSelectedCategory(queryCategory);
  }, [queryCategory]);

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange([0, 4000]);
    setMinRating(0);
    setSearchParams({});
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Wishlist tab
      if (queryTab === 'wishlist' && !wishlist.includes(p.id)) return false;

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      // Search query
      if (querySearch.trim()) {
        const term = querySearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesBrand = p.brand.toLowerCase().includes(term);
        const matchesCategory = p.category.toLowerCase().includes(term);
        if (!matchesName && !matchesBrand && !matchesCategory) return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

      // Price filter
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

      // Rating filter
      if (minRating > 0 && p.rating < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.isNew ? 1 : -1;
      return 0; // featured default
    });
  }, [selectedCategory, querySearch, queryTab, wishlist, selectedBrands, priceRange, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-white pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-black">
            {queryTab === 'wishlist' ? 'My Wishlist' : 'Products Catalog'}
          </span>
        </nav>

        {/* Header Title & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">
              {queryTab === 'wishlist' ? 'Your Wishlist' : 'All Products'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Selected products: <span className="font-bold text-black">{filteredProducts.length}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 text-black border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden bg-black text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Layout: Sidebar + Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8 pr-4 border-r border-gray-100">
            
            {/* Clear filters */}
            {(selectedCategory !== 'all' || selectedBrands.length > 0 || minRating > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all' ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wider mb-3">Brand</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="rounded border-gray-300 text-black focus:ring-black w-4 h-4 cursor-pointer"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wider mb-3">
                Max Price: ${priceRange[1]}
              </h3>
              <input
                type="range"
                min="0"
                max="4000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-semibold mt-1">
                <span>$0</span>
                <span>$4,000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="text-sm font-extrabold text-black uppercase tracking-wider mb-3">Minimum Rating</h3>
              <div className="space-y-1">
                {[0, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                      minRating === rating ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {rating === 0 ? (
                      <span>All Ratings</span>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{rating} Stars & Up</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="flex-1">
            
            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory !== 'all' && (
                <span className="bg-gray-100 text-black text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-200">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-red-500 font-bold">✕</button>
                </span>
              )}
              {selectedBrands.map(b => (
                <span key={b} className="bg-gray-100 text-black text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-gray-200">
                  {b}
                  <button onClick={() => toggleBrand(b)} className="hover:text-red-500 font-bold">✕</button>
                </span>
              ))}
            </div>

            {/* Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-12 text-center my-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-black mb-1">No products found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  We couldn't find any products matching your current filters. Try resetting your search filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-black text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                        currentPage === pNum
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                >
                  Next
                </button>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* MOBILE FILTERS DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-base font-bold text-black">Filter Products</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-black font-bold text-lg">✕</button>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-xs font-bold text-black uppercase mb-2">Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-100 p-2.5 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-xs font-bold text-black uppercase mb-2">Brands</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {brands.map(b => (
                  <label key={b} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-xs font-bold text-black uppercase mb-2">Max Price: ${priceRange[1]}</h3>
              <input
                type="range"
                min="0"
                max="4000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-black"
              />
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
