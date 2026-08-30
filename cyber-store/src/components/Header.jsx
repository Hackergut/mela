import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { products } from '../data/products';

export default function Header() {
  const { cartCount, wishlist } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Prodotti', path: '/products' },
    { name: 'Chi Siamo', path: '/#about' },
    { name: 'Contatti', path: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-black tracking-widest text-black uppercase hover:opacity-80 transition-opacity"
        >
          <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            cyber
          </motion.span>
        </Link>

        {/* Center Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cerca prodotti, marchi, accessori..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-gray-100 text-sm text-black placeholder-gray-500 rounded-xl pl-11 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs font-bold"
              >
                ✕
              </button>
            )}
          </form>

          {/* Animated Search Results Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Prodotti Trovati ({searchResults.length})
                </div>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/products/${item.id}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-md bg-gray-100 p-1" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-black truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{item.brand} • {item.category}</div>
                      </div>
                      <div className="text-sm font-bold text-black">${item.price}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2.5 bg-black text-white text-xs font-bold text-center hover:bg-gray-800 transition-colors"
                >
                  Vedi tutti i risultati
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="relative py-1 transition-colors text-gray-600 hover:text-black font-semibold"
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons with Spring Badges */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Wishlist */}
          <Link to="/products?tab=wishlist" className="relative p-2 text-black hover:opacity-70 transition-opacity" title="Preferiti">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Heart className="w-6 h-6" />
            </motion.div>
            <AnimatePresence>
              {wishlist.length > 0 && (
                <motion.span
                  key={wishlist.length}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Shopping Cart */}
          <Link to="/cart" className="relative p-2 text-black hover:opacity-70 transition-opacity" title="Carrello">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ShoppingBag className="w-6 h-6" />
            </motion.div>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User Account */}
          <button className="p-2 text-black hover:opacity-70 transition-opacity hidden sm:block" title="Account Utente">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <User className="w-6 h-6" />
            </motion.div>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-black lg:hidden hover:opacity-70 focus:outline-none"
            aria-label="Apri menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-4 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="relative mt-2">
              <input
                type="text"
                placeholder="Cerca prodotti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-sm text-black placeholder-gray-500 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </form>

            <nav className="flex flex-col space-y-3 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-gray-800 hover:text-black py-1 border-b border-gray-100"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
