import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const ALL_PRODUCTS = [
  // === IPHONE ===
  { id: 1, name: 'iPhone 17 Pro — Arancione Cosmico', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/987e67b20_IMG_1320.jpg' },
  { id: 2, name: 'iPhone 17 Pro — Colori', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/9b1c8739d_IMG_1321.jpg' },
  { id: 3, name: 'iPhone 17 Pro — Titanio', price: '€1.099', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/f7626e709_IMG_1322.jpg' },
  { id: 4, name: 'iPhone 17 Air — Azzurro', price: '€999', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/902e6c914_IMG_1323.jpg' },
  { id: 5, name: 'iPhone 17 Air — Bianco', price: '€999', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b6c80bf7a_IMG_1324.jpg' },
  { id: 6, name: 'iPhone 17 — Nero', price: '€899', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/38fcec1fe_IMG_1325.jpg' },
  { id: 7, name: 'iPhone 17 Pro Max — Arancione', price: '€1.199', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/85106ffd7_IMG_1326.jpeg' },
  { id: 8, name: 'iPhone 17 — Arancione', price: '€899', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/a8de021c7_IMG_1327.jpg' },
  { id: 9, name: 'iPhone 17 Pro — Vista Frontale', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/c2d17bc1a_IMG_1328.jpeg' },
  { id: 10, name: 'iPhone 16 — Lineup', price: '€799', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/82f41d207_IMG_1329.jpg' },
  { id: 11, name: 'iPhone 16 — Box', price: '€799', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/9e157e9a7_IMG_1330.jpeg' },
  { id: 12, name: 'iPhone 17 Pro — Macro Fotocamera', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/86e609ead_IMG_1331.jpeg' },
  { id: 13, name: 'iPhone 16 Pro — Blu Notte', price: '€999', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/6005b9642_IMG_1332.jpg' },
  { id: 14, name: 'iPhone 17 Pro — Lifestyle', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b135b47fa_IMG_1333.jpeg' },
  { id: 15, name: 'iPhone 17 Pro — Design', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/64eadd31f_IMG_1334.jpeg' },
  { id: 16, name: 'iPhone 17 Pro — Tre Colori', price: '€1.099', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/4d99b04a8_IMG_1335.jpg' },
  { id: 17, name: 'iPhone 17 — Mockup 3D', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/93b1d9923_IMG_1336.jpg' },
  { id: 60, name: 'iPhone 17 Pro — Dettaglio Fotocamera', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/66941e834_IMG_1306.jpeg' },
  { id: 61, name: 'iPhone 17 Pro — Tripla Fotocamera', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/9fa1393da_IMG_1307.jpeg' },
  { id: 62, name: 'iPhone 17 Pro Max — Lifestyle Arancione', price: '€1.199', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/8eb0b9a43_IMG_1308.jpeg' },
  { id: 63, name: 'iPhone 17 Pro — Doppio Arancione', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/44cb827b6_IMG_1309.jpeg' },
  { id: 64, name: 'iPhone 16 Pro — Dettaglio Fotocamera', price: '€999', badge: null, category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/04693dbc5_IMG_1310.jpeg' },
  { id: 65, name: 'iPhone 17 Pro — Concept Arancione', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/cbff64bba_IMG_1311.jpeg' },
  { id: 66, name: 'iPhone 17 Pro — Macro Obiettivo', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/551c5c011_IMG_1312.jpeg' },
  { id: 67, name: 'iPhone 17 Pro — Render 3D Arancione', price: '€1.099', badge: 'Nuovo', category: 'iPhone', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/83e9ec477_IMG_1313.jpeg' },

  // === APPLE WATCH ===
  { id: 18, name: 'Apple Watch Series 10 — Nero', price: '€449', badge: 'Nuovo', category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/5fde11a36_IMG_1337.jpeg' },
  { id: 19, name: 'Apple Watch Series 10 — Cinturino Sport', price: '€449', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/3f8d8853c_IMG_1338.jpg' },
  { id: 20, name: 'Apple Watch Ultra 2 — Ocean Band', price: '€799', badge: 'Nuovo', category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/04bd94a74_IMG_1339.jpg' },
  { id: 21, name: 'Apple Watch Ultra 2 — Arancione', price: '€799', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/4889f109c_IMG_1340.jpeg' },
  { id: 22, name: 'Apple Watch Series 9 — Cinturino Magnetico', price: '€399', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/1815b961a_IMG_1341.jpg' },
  { id: 23, name: 'Apple Watch Series 10 — Quadrante', price: '€449', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ebff287f2_IMG_1342.jpg' },
  { id: 24, name: 'Apple Watch Series 10 — Macro', price: '€449', badge: 'Nuovo', category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/97f593e8b_IMG_1343.jpg' },
  { id: 25, name: 'Apple Watch Series 10 — Laterale', price: '€449', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/752befcbf_IMG_1345.jpeg' },
  { id: 26, name: 'Apple Watch Series 7 — Colori', price: '€349', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/7b39eb065_IMG_1346.jpg' },
  { id: 27, name: 'Apple Watch Series 7 — Duo', price: '€349', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/060e71746_IMG_1347.jpg' },
  { id: 28, name: 'Apple Watch Series 4 — Vintage', price: '€249', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/5e6209b02_IMG_1348.jpg' },
  { id: 29, name: 'Apple Watch SE — Lineup', price: '€249', badge: 'Nuovo', category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/e8b634b39_IMG_1349.jpg' },
  { id: 30, name: 'Apple Watch Series 10 — Corona', price: '€449', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/48a093410_IMG_1350.jpg' },
  { id: 31, name: 'Apple Watch — Macro Frontale', price: '€449', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ce1849afb_IMG_1351.jpg' },
  { id: 32, name: 'Apple Watch — Quadrante Scuro', price: '€399', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/93cae8da7_IMG_1352.jpg' },
  { id: 33, name: 'Apple Watch — Frontale Minimal', price: '€399', badge: null, category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/a65b20978_IMG_1353.jpg' },
  { id: 34, name: 'Apple Watch Series 10 — Dettaglio', price: '€449', badge: 'Nuovo', category: 'Apple Watch', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/3373e6c2b_IMG_1354.jpeg' },

  // === AIRPODS MAX ===
  { id: 35, name: 'AirPods Max — Nero Mezzanotte', price: '€549', badge: 'Nuovo', category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b11fc911a_IMG_1355.jpg' },
  { id: 36, name: 'AirPods Max — Grigio Siderale', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/5d52b5aaa_IMG_1356.jpg' },
  { id: 37, name: 'AirPods Max — Blu Cielo', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/eee500ac1_IMG_1357.jpg' },
  { id: 38, name: 'AirPods Max — Verde Alpino', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/41e26955c_IMG_1358.jpg' },
  { id: 39, name: 'AirPods Max — Lifestyle Uomo', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/d3f22d22e_IMG_1359.jpg' },
  { id: 40, name: 'AirPods Max — Lifestyle Donna', price: '€549', badge: 'Nuovo', category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/244ea6718_IMG_1360.jpg' },
  { id: 41, name: 'AirPods Max — in Mano', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/f81dbb0ec_IMG_1361.jpg' },
  { id: 42, name: 'AirPods Max — Rosa Salmone', price: '€549', badge: 'Nuovo', category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/68dd967a3_IMG_1362.jpeg' },
  { id: 43, name: 'AirPods Max — Lifestyle Turchese', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/4eb5bebda_IMG_1363.jpg' },
  { id: 44, name: 'AirPods Max — Argento Frontale', price: '€549', badge: null, category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/ada52d8cc_IMG_1364.jpg' },
  { id: 45, name: 'AirPods Max — Lifestyle Blu', price: '€549', badge: 'Nuovo', category: 'AirPods Max', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/fb508f483_IMG_1365.jpg' },

  // === AIRPODS ===
  { id: 46, name: 'AirPods Pro 3 — Nuovo', price: '€279', badge: 'Nuovo', category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/0006a5bec_IMG_1366.jpeg' },
  { id: 47, name: 'AirPods Pro 3 — Macro', price: '€279', badge: 'Nuovo', category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/7a646286d_IMG_1367.jpeg' },
  { id: 48, name: 'AirPods Pro 3 — Floating', price: '€279', badge: 'Nuovo', category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/87b8a282b_IMG_1368.jpg' },
  { id: 49, name: 'AirPods 4 — Lifestyle Duo', price: '€149', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/c9eeee997_IMG_1295.jpg' },
  { id: 50, name: 'AirPods Pro 2 — Floating', price: '€249', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/686e66830_IMG_1296.jpg' },
  { id: 51, name: 'AirPods Pro 2 — Macro', price: '€249', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/9f8f7d08c_IMG_1297.jpg' },
  { id: 52, name: 'AirPods Pro 2 — con Case', price: '€249', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/4c97b75ec_IMG_1298.jpeg' },
  { id: 53, name: 'AirPods 2 — Lifestyle Rosso', price: '€129', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b03c50397_IMG_1299.jpg' },
  { id: 54, name: 'AirPods 3 — Lifestyle', price: '€169', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/b98484c73_IMG_1300.jpg' },
  { id: 55, name: 'AirPods 3 — Flatlay', price: '€169', badge: null, category: 'AirPods', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/08d132912_IMG_1301.jpg' },

  // === ECOSISTEMA ===
  { id: 56, name: 'Ecosistema Apple — Completo', price: '€1.499', badge: null, category: 'Ecosistema', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/81019e195_IMG_1302.jpg' },
  { id: 57, name: 'Ecosistema Apple — MacBook + iPad', price: '€1.299', badge: null, category: 'Ecosistema', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/1b7213724_IMG_1303.jpg' },
  { id: 58, name: 'Ecosistema Apple — Family', price: '€999', badge: null, category: 'Ecosistema', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/fbe6cdf5e_IMG_1304.jpg' },
  { id: 59, name: 'Ecosistema Apple — Argento', price: '€1.099', badge: null, category: 'Ecosistema', image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/4037e14c3_IMG_1305.jpg' },
];

const FILTERS = ['Tutti', 'iPhone', 'Apple Watch', 'AirPods Max', 'AirPods', 'Ecosistema'];
const PAGE_SIZE = 12;

export default function PopularProducts() {
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = activeFilter === 'Tutti'
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p => p.category === activeFilter);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleFilter = (f) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section id="products" className="py-20 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Prodotti Popolari</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Scopri i Prodotti<br />Più Popolari.
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            Esplora la tecnologia e il design che plasmano il mondo di domani.
          </p>
        </motion.div>

        {/* Filtri */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mt-8 mb-10 flex-wrap"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-[#1d1d1f] text-white'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Griglia prodotti */}
        <motion.div {...staggerContainer} layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((product) => (
              <motion.div
                key={product.id}
                layout
                {...staggerItem}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center"
          >
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="px-8 py-3.5 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-semibold rounded-full hover:bg-[#e8e8ed] transition-colors duration-200 border border-[#d2d2d7]"
            >
              Carica Altri ({filtered.length - visibleCount} restanti)
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-[#f5f5f7] rounded-2xl overflow-hidden cursor-pointer h-full"
    >
      <div className="relative overflow-hidden" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            fittingType="fill"
          />
        </div>
        {product.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">
            {product.badge}
          </div>
        )}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1d1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1v12M1 7h12"/>
          </svg>
        </div>
      </div>
      <div className="p-3 md:p-4">
        <p className="text-xs text-[#6e6e73] mb-1 font-medium uppercase tracking-wide">Disponibile</p>
        <h3 className="text-sm font-semibold text-[#1d1d1f] leading-snug line-clamp-2 mb-2">{product.name}</h3>
        <p className="text-sm font-bold text-[#1d1d1f]">{product.price}</p>
      </div>
    </motion.div>
  );
}