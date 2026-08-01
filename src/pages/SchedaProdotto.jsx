import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Check, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem, heroEntrance } from '@/lib/motion';
import { PRODUCT_CATALOG } from '@/lib/productCatalog';
import { PRODUCT_KEY_SPECS } from '@/lib/productSpecs';

const SPECS_BY_CATEGORY = {
  'iPhone': [
    { label: 'Display', value: 'Super Retina XDR OLED, 120Hz ProMotion' },
    { label: 'Chip', value: 'Apple A19 Pro, 6-core CPU' },
    { label: 'Fotocamera', value: 'Sistema Pro tripla lente 48MP' },
    { label: 'Resistenza', value: 'IP68 (6 metri fino a 30 minuti)' },
    { label: 'Connettività', value: '5G, Wi-Fi 7, USB-C' },
    { label: 'Sicurezza', value: 'Face ID' },
  ],
  'Apple Watch': [
    { label: 'Display', value: 'Always-On Retina LTPO3 OLED' },
    { label: 'Cassa', value: 'Alluminio / Titanio' },
    { label: 'Sensori', value: 'ECG, SpO2, Temperatura, Cardiaco' },
    { label: 'Resistenza', value: 'WR50 (50 metri)' },
    { label: 'Connettività', value: 'GPS, Wi-Fi, Bluetooth 5.3' },
    { label: 'Autonomia', value: 'Fino a 18 ore (72h risparmio)' },
  ],
  'AirPods Max': [
    { label: 'Driver', value: 'Driver dinamico a bobina mobile da 40mm' },
    { label: 'Cancellazione rumore', value: 'Active Noise Cancellation adattiva' },
    { label: 'Audio', value: 'Audio spaziale con tracciamento testa' },
    { label: 'Autonomia', value: 'Fino a 20 ore con ANC attiva' },
    { label: 'Connettività', value: 'Bluetooth 5.3, chip Apple H2' },
    { label: 'Materiali', value: 'Alluminio anodizzato, memory foam' },
  ],
  'AirPods': [
    { label: 'Driver', value: 'Driver ad alta escursione personalizzato' },
    { label: 'Cancellazione rumore', value: 'ANC adattiva + Modalità Trasparenza' },
    { label: 'Audio', value: 'Audio spaziale personalizzato' },
    { label: 'Autonomia', value: 'Fino a 6 ore (30h con case)' },
    { label: 'Connettività', value: 'Bluetooth 5.3, chip Apple H2' },
    { label: 'Resistenza', value: 'IP54 (sudore e polvere)' },
  ],
  'Ecosistema': [
    { label: 'Dispositivi inclusi', value: 'iPhone, iPad, MacBook, Apple Watch' },
    { label: 'Integrazione', value: 'Handoff, AirDrop, Universal Clipboard' },
    { label: 'Cloud', value: 'iCloud+ con sincronizzazione automatica' },
    { label: 'Compatibilità', value: 'iOS 18, iPadOS 18, macOS Sequoia' },
    { label: 'Connettività', value: 'Wi-Fi 7, Bluetooth 5.3, 5G' },
    { label: 'Garanzia', value: 'AppleCare+ incluso 2 anni' },
  ],
};

const HIGHLIGHTS = [
  { icon: Truck, title: 'Spedizione Gratuita', desc: 'Consegna in 1-3 giorni' },
  { icon: Shield, title: '2 Anni Garanzia', desc: 'AppleCare+ disponibile' },
  { icon: RotateCcw, title: 'Reso Gratuito', desc: '14 giorni per cambio idea' },
  { icon: Headphones, title: 'Supporto Dedicato', desc: 'Assistenza esperti Apple' },
];

export default function SchedaProdotto() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'), 10);

  const product = useMemo(() => PRODUCT_CATALOG.find(p => p.id === productId), [productId]);

  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImage(0);
    setAdded(false);
  }, [productId]);

  // Galleria: prodotto corrente + prodotti correlati della stessa categoria
  const gallery = useMemo(() => {
    if (!product) return [];
    const related = PRODUCT_CATALOG
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    return [product, ...related].map(p => ({ url: p.image, name: p.name }));
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCT_CATALOG
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  const specs = product ? (SPECS_BY_CATEGORY[product.category] || []) : [];

  // Prodotti da confrontare: corrente + fino a 3 correlati della stessa categoria
  const compareProducts = useMemo(() => {
    if (!product) return [];
    const related = PRODUCT_CATALOG
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
    return [product, ...related];
  }, [product]);

  // Righe della tabella: etichette derivate dalle keySpecs
  const compareRows = useMemo(() => {
    if (compareProducts.length === 0) return [];
    const labels = Object.keys(PRODUCT_KEY_SPECS[compareProducts[0].id] || {});
    return ['Prezzo', ...labels, 'Categoria', 'Disponibilità'];
  }, [compareProducts]);

  const getCompareValue = (prod, label) => {
    if (label === 'Prezzo') return prod.price;
    if (label === 'Categoria') return prod.category;
    if (label === 'Disponibilità') return prod.badge || 'Disponibile';
    return PRODUCT_KEY_SPECS[prod.id]?.[label] || '—';
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] font-sans flex flex-col">
        <PromoBanner />
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1d1d1f] mb-3">Prodotto non trovato</h1>
            <p className="text-[#6e6e73] mb-6">Il prodotto richiesto non è disponibile.</p>
            <button
              onClick={() => navigate('/catalogo')}
              className="px-6 py-3 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B35] transition-colors"
            >
              Vai al Catalogo
            </button>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#FF6B35] transition-colors">
          <ArrowLeft size={16} /> Torna alla Home
        </Link>
        <div className="mt-2 text-xs text-[#6e6e73]">
          <Link to="/catalogo" className="hover:text-[#FF6B35]">Catalogo</Link>
          <span className="mx-2">/</span>
          <span>{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-[#1d1d1f] font-medium">{product.name}</span>
        </div>
      </div>

      {/* Dettaglio prodotto */}
      <section className="py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Galleria */}
          <motion.div {...heroEntrance(0)} className="lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl overflow-hidden mb-4" style={{ aspectRatio: '1 / 1' }}>
              <Image
                src={gallery[activeImage]?.url || product.image}
                alt={gallery[activeImage]?.name || product.name}
                className="w-full h-full"
                fittingType="fill"
              />
            </div>
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-[#FF6B35]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <Image src={img.url} alt={img.name} className="w-full h-full" fittingType="fill" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div {...heroEntrance(0.15)}>
            <div className="flex items-center gap-2 mb-3">
              {product.badge && (
                <span className="px-2.5 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">{product.badge}</span>
              )}
              <span className="px-2.5 py-1 bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold rounded-full">{product.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1d1d1f] tracking-tight leading-tight">{product.name}</h1>
            <p className="mt-4 text-lg text-[#6e6e73] leading-relaxed">{product.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1d1d1f]">{product.price}</span>
              <span className="text-sm text-[#6e6e73]">IVA inclusa</span>
            </div>

            {/* Azioni */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 2000); }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-semibold transition-all duration-200 ${
                  added ? 'bg-green-500 text-white' : 'bg-[#1d1d1f] text-white hover:bg-[#FF6B35]'
                }`}
              >
                {added ? <><Check size={18} /> Aggiunto al carrello</> : <><ShoppingCart size={18} /> Aggiungi al Carrello</>}
              </button>
              <button className="w-12 h-12 sm:w-auto sm:h-auto sm:px-4 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] text-[#1d1d1f] transition-colors">
                <Heart size={18} />
              </button>
              <button className="w-12 h-12 sm:w-auto sm:h-auto sm:px-4 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] text-[#1d1d1f] transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3 bg-white rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">{title}</p>
                    <p className="text-xs text-[#6e6e73]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Specifiche tecniche */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Specifiche Tecniche</h2>
              <div className="bg-white rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {specs.map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center px-5 py-4">
                    <span className="text-sm font-medium text-[#6e6e73] sm:w-40 flex-shrink-0 mb-1 sm:mb-0">{spec.label}</span>
                    <span className="text-sm text-[#1d1d1f]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabella comparazione tecnica */}
      {compareProducts.length > 1 && (
        <section className="py-16 px-6 lg:px-8 bg-[#f5f5f7]">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] tracking-tight">Confronta i Modelli Simili</h2>
              <p className="mt-2 text-[#6e6e73]">Confronta le specifiche tecniche del prodotto selezionato con altri modelli della categoria {product.category}.</p>
            </motion.div>

            <motion.div {...fadeUp} className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[640px]">
                <thead>
                  <tr>
                    <th className="bg-white p-4 text-left text-sm font-semibold text-[#6e6e73] rounded-tl-2xl sticky left-0 z-10 w-40">
                      Specifica
                    </th>
                    {compareProducts.map((p, i) => (
                      <th
                        key={p.id}
                        className={`bg-white p-4 text-center align-bottom ${i === 0 ? 'ring-2 ring-[#FF6B35] ring-inset' : ''} ${i === compareProducts.length - 1 ? 'rounded-tr-2xl' : ''}`}
                      >
                        <Link to={`/scheda-prodotto?id=${p.id}`} className="block group">
                          <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-[#f5f5f7]">
                            <Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" />
                          </div>
                          <p className="text-xs font-semibold text-[#1d1d1f] leading-snug line-clamp-2 group-hover:text-[#FF6B35] transition-colors">{p.name}</p>
                          {i === 0 && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">Selezionato</span>
                          )}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((label, rowIdx) => (
                    <tr key={label} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                      <td className={`p-4 text-left text-sm font-medium text-[#6e6e73] sticky left-0 z-10 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                        {label}
                      </td>
                      {compareProducts.map((p, i) => (
                        <td
                          key={p.id}
                          className={`p-4 text-center text-sm text-[#1d1d1f] ${i === 0 ? 'bg-[#FF6B35]/5 font-semibold ring-2 ring-[#FF6B35] ring-inset' : ''}`}
                        >
                          {getCompareValue(p, label)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="bg-white p-4 sticky left-0 z-10 rounded-bl-2xl"></td>
                    {compareProducts.map((p, i) => (
                      <td key={p.id} className={`bg-white p-4 text-center ${i === compareProducts.length - 1 ? 'rounded-br-2xl' : ''}`}>
                        <Link
                          to={`/scheda-prodotto?id=${p.id}`}
                          className={`inline-block px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                            i === 0 ? 'bg-[#FF6B35] text-white' : 'bg-[#1d1d1f] text-white hover:bg-[#FF6B35]'
                          }`}
                        >
                          {i === 0 ? 'Nel carrello' : 'Vedi dettagli'}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>
      )}

      {/* Prodotti correlati */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1d1d1f] tracking-tight">Potrebbero interessarti</h2>
              <p className="mt-2 text-[#6e6e73]">Altri prodotti della categoria {product.category}.</p>
            </motion.div>
            <motion.div {...staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((p) => (
                <motion.div key={p.id} {...staggerItem}>
                  <Link to={`/scheda-prodotto?id=${p.id}`}>
                    <div className="group bg-[#f5f5f7] rounded-2xl overflow-hidden cursor-pointer">
                      <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                        <Image src={p.image} alt={p.name} className="w-full h-full transition-transform duration-500 group-hover:scale-105" fittingType="fill" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-[#1d1d1f] line-clamp-2 mb-1">{p.name}</h3>
                        <p className="text-sm font-bold text-[#1d1d1f]">{p.price}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <FooterSection />
    </div>
  );
}