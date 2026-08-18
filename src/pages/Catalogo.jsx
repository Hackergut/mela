import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowLeft, Loader2 } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';
import { useCatalog } from '@/lib/useProducts';
import ProductActions from '@/components/ProductActions';

export default function Catalogo() {
  const { products, categories: catalogCategories, loading } = useCatalog();
  const [params] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const categories = useMemo(() => ['Tutti', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  useEffect(() => {
    const requested = params.get('categoria');
    if (!requested) return;
    const match = catalogCategories.find(category => category.slug === requested || category.name === requested);
    if (match) setActiveFilter(match.name);
  }, [params, catalogCategories]);

  // Quick search from the navbar lands here with ?q=: keep the field in sync
  // when the query parameter changes (including back/forward navigation).
  useEffect(() => {
    const query = params.get('q') || '';
    setSearch(prev => (prev === query ? prev : query));
  }, [params]);

  const filtered = useMemo(() => {
    let result = activeFilter === 'Tutti'
      ? [...products]
      : products.filter(p => p.category === activeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, activeFilter, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />

      <section className="bg-white pt-12 pb-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#6e6e73] hover:bg-[#f5f5f7] hover:text-[#0066cc] transition-colors mb-5">
            <ArrowLeft size={16} /> Home
          </Link>
          <motion.div {...fadeUp}>
            <p className="text-sm font-semibold text-[#0066cc] mb-3">Catalogo</p>
            <h1 className="text-5xl md:text-7xl font-semibold leading-[.98] text-[#1d1d1f] tracking-[-0.05em]">Trova quello giusto.</h1>
            <p className="mt-5 text-[#6e6e73] leading-7 max-w-xl">
              {products.length} prodotti, configurazioni reali e disponibilità aggiornata. Cerca, confronta e scegli.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-14 z-40 bg-[#f5f5f7]/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca prodotti..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm text-[#1d1d1f] border border-gray-200 focus:border-[#0071E3] focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73] pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white rounded-full text-sm text-[#1d1d1f] border border-gray-200 focus:border-[#0071E3] focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="default">Ordine predefinito</option>
                <option value="price-asc">Prezzo crescente</option>
                <option value="price-desc">Prezzo decrescente</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-white text-[#1d1d1f] hover:bg-[#e8e8ed] border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto text-sm text-[#6e6e73] font-medium">{filtered.length} risultati</span>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0071E3]" size={28} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-[#1d1d1f] mb-1">Nessun prodotto trovato</p>
              <p className="text-sm text-[#6e6e73]">Prova a modificare i filtri o la ricerca.</p>
            </div>
          ) : (
            <motion.div {...staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <motion.div key={product.id} layout {...staggerItem} exit={{ opacity: 0, scale: 0.9 }}>
                    <CatalogCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

function CatalogCard({ product }) {
  const href = `/scheda-prodotto?id=${product.id}`;
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f7]">
        <Link to={href} className="absolute inset-0 p-4" aria-label={`Vedi ${product.name}`}>
          <Image src={product.image} alt={product.name} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.025]" fittingType="fit" />
        </Link>
        {product.badge && <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#0071E3] px-2.5 py-1 text-xs font-semibold text-white">{product.badge}</div>}
        {product.category && <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">{product.category}</div>}
        <div className="absolute bottom-3 right-3 z-10 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <ProductActions product={product} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <p className={`mb-1 text-xs font-medium ${product.in_stock ? 'text-[#248a3d]' : 'text-[#d70015]'}`}>{product.in_stock ? 'Disponibile' : 'Esaurito'}</p>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-[#1d1d1f]">
          <Link to={href} className="hover:text-[#0066cc]">{product.name}</Link>
        </h3>
        <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-[#6e6e73]">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#1d1d1f]">{product.price}</p>
          <Link to={href} className="text-xs font-semibold text-[#0071E3] hover:underline">Dettagli →</Link>
        </div>
      </div>
    </motion.article>
  );
}