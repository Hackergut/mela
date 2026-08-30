import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Header() {
  const { cartCount, wishlist, user, loginUser, registerUser, logoutUser, productsList } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Auth Form State
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const searchResults = searchQuery.trim()
    ? productsList.filter(p =>
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

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authTab === 'login') {
      if (email && password) {
        loginUser(email, password);
        setIsAuthModalOpen(false);
        setEmail('');
        setPassword('');
      }
    } else {
      if (name && email && password) {
        registerUser(name, email, password);
        setIsAuthModalOpen(false);
        setEmail('');
        setPassword('');
        setName('');
      }
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
        
        {/* Brand Logo TechMania */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-black tracking-widest text-black uppercase hover:opacity-80 transition-opacity"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-1.5">
            <span className="bg-black text-white px-2.5 py-1 rounded-xl text-lg font-black tracking-tight">TM</span>
            <span className="font-extrabold text-xl tracking-wider">TechMania</span>
          </motion.div>
        </Link>

        {/* Center Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cerca prodotti TechMania, marchi, accessori..."
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

        {/* Right Action Icons */}
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

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (user) {
                  setIsUserMenuOpen(!isUserMenuOpen);
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="p-2 text-black hover:opacity-70 transition-opacity flex items-center gap-2"
              title={user ? user.name : "Accedi o Registrati"}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <User className={`w-6 h-6 ${user ? 'text-emerald-600' : 'text-black'}`} />
              </motion.div>
              {user && (
                <span className="text-xs font-bold text-black hidden xl:block max-w-[100px] truncate">
                  {user.name}
                </span>
              )}
            </button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 space-y-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-xs font-bold text-black">{user.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Disconnetti
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

      {/* Mobile Drawer */}
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
                placeholder="Cerca prodotti TechMania..."
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

      {/* Auth Modal (Login / Register) */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAuthModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-black" />
                  <h3 className="text-xl font-black text-black">Account TechMania</h3>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-gray-400 hover:text-black font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    authTab === 'login' ? 'bg-black text-white' : 'text-gray-600'
                  }`}
                >
                  Accedi
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    authTab === 'register' ? 'bg-black text-white' : 'text-gray-600'
                  }`}
                >
                  Registrati
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome e Cognome</label>
                    <input
                      type="text"
                      required
                      placeholder="Mario Rossi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="mario.rossi@email.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-black focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-xs"
                >
                  {authTab === 'login' ? 'Accedi a TechMania' : 'Crea Account TechMania'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </header>
  );
}
