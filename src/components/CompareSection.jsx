import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { fadeUp } from '@/lib/motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductActions from '@/components/ProductActions';

const IMG = 'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b';

const MODELS = [
  {
    name: 'iPhone 17 Pro',
    tagline: 'Il più potente di sempre.',
    price: '€1.199',
    productId: 1,
    colors: [
      { name: 'Arancione Cosmico', hex: '#E85D2F', image: `${IMG}/a53ee8668_IMG_1669.webp` },
      { name: 'Argento', hex: '#D8D8DC', image: `${IMG}/5eced5370_IMG_1679.webp` },
      { name: 'Nero', hex: '#2C2C2E', image: `${IMG}/e0d184381_IMG_1648.webp` },
    ],
  },
  {
    name: 'iPhone 17 Air',
    tagline: 'Il più sottile mai realizzato.',
    price: '€999',
    productId: 14,
    colors: [
      { name: 'Azzurro', hex: '#7BA7C9', image: `${IMG}/ae167da00_IMG_1676.webp` },
      { name: 'Bianco', hex: '#E8E8EC', image: `${IMG}/dabbb9a2e_IMG_1682.webp` },
    ],
  },
  {
    name: 'iPhone 17',
    tagline: 'Potenza per tutti.',
    price: '€899',
    productId: 11,
    colors: [
      { name: 'Tutte le finiture', hex: '#8AB4F8', image: `${IMG}/37d4e3218_IMG_1673.webp` },
    ],
  },
  {
    name: 'iPhone 16',
    tagline: 'Il nuovo controllo fotocamera.',
    price: '€799',
    productId: 19,
    colors: [
      { name: 'Verde', hex: '#4E6B54', image: `${IMG}/bbc5ad376_IMG_1647.jpeg` },
      { name: 'Viola', hex: '#8C7BB0', image: `${IMG}/41f49baf1_IMG_1674.webp` },
      { name: 'Rosa', hex: '#E7B5C0', image: `${IMG}/bb0ae7c20_IMG_1646.jpeg` },
      { name: 'Crema', hex: '#E5DCC8', image: `${IMG}/4fd4fd8a0_IMG_1681.webp` },
    ],
  },
];

export default function CompareSection() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section id="compare" className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Confronta</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Confronta i Modelli <span className="text-[#FF6B35]">iPhone</span>
          </h2>
          <p className="mt-4 text-[#6e6e73] text-base max-w-md mx-auto">
            Scorri e scopri ogni modello con le sue finiture. Tocca un colore per cambiare vista.
          </p>
        </motion.div>

        {/* Header con frecce di scroll */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-[#6e6e73]">{MODELS.length} modelli a confronto</p>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="w-10 h-10 rounded-full bg-white border border-[#d2d2d7] flex items-center justify-center text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white hover:border-[#1d1d1f] transition-colors"
              aria-label="Precedente"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-10 h-10 rounded-full bg-white border border-[#d2d2d7] flex items-center justify-center text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white hover:border-[#1d1d1f] transition-colors"
              aria-label="Successivo"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scroll orizzontale */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth no-scrollbar"
        >
          {MODELS.map((model) => (
            <CompareCard key={model.name} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CompareCard({ model }) {
  const [activeColor, setActiveColor] = useState(0);
  const active = model.colors[activeColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-white rounded-3xl overflow-hidden flex flex-col"
    >
      {/* Immagine prodotto */}
      <div className="relative bg-[#f5f5f7]" style={{ aspectRatio: '1 / 1' }}>
        <Image
          src={active.image}
          alt={`${model.name} — ${active.name}`}
          className="w-full h-full"
          fittingType="fill"
        />
        <div className="absolute top-3 right-3 z-10">
          <ProductActions product={{ id: model.productId, name: model.name, price: model.price, image: active.image, category: 'iPhone' }} />
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight">{model.name}</h3>
        <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed flex-1">{model.tagline}</p>

        {/* Swatch colorazioni */}
        <div className="flex items-center gap-2.5 mt-4 mb-3">
          {model.colors.map((color, i) => (
            <button
              key={color.name}
              onClick={() => setActiveColor(i)}
              className={`w-6 h-6 rounded-full ring-1 transition-all ${
                activeColor === i ? 'ring-2 ring-offset-2 ring-[#1d1d1f] scale-110' : 'ring-black/10'
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
              title={color.name}
            />
          ))}
        </div>
        <p className="text-xs text-[#6e6e73] mb-4">{active.name}</p>

        {/* Prezzo + CTA */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-[#6e6e73] uppercase tracking-wide">A partire da</p>
            <p className="text-xl font-bold text-[#1d1d1f]">{model.price}</p>
          </div>
          <Link
            to={`/scheda-prodotto?id=${model.productId}`}
            className="px-4 py-2 bg-[#1d1d1f] text-white text-xs font-semibold rounded-full hover:bg-[#FF6B35] transition-colors"
          >
            Acquista
          </Link>
        </div>
      </div>
    </motion.div>
  );
}