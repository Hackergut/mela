export const categories = [
  { id: 'smartphones', name: 'Smartphone', icon: 'Smartphone' },
  { id: 'watches', name: 'Smartwatch', icon: 'Watch' },
  { id: 'cameras', name: 'Fotocamere', icon: 'Camera' },
  { id: 'headphones', name: 'Cuffie & Audio', icon: 'Headphones' },
  { id: 'computers', name: 'Computer & Laptop', icon: 'Laptop' },
  { id: 'gaming', name: 'Gaming & Console', icon: 'Gamepad2' },
  { id: 'tablets', name: 'Tablet', icon: 'Tablet' },
  { id: 'accessories', name: 'Accessori', icon: 'Plug' },
];

export const brands = [
  'Apple',
  'Samsung',
  'Sony',
  'Bose',
  'Canon',
  'Asus',
  'Nintendo',
  'Logitech',
  'DJI',
  'Anker',
];

export const products = [
  {
    id: 'iphone-15-pro-max',
    name: 'Apple iPhone 15 Pro Max',
    category: 'smartphones',
    brand: 'Apple',
    price: 1199,
    originalPrice: 1299,
    discount: 8,
    rating: 4.9,
    reviewCount: 142,
    tag: 'Più Venduto',
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: '/assets/iphone-image-2619-2264.png',
    images: [
      '/assets/iphone-image-2619-2264.png',
      '/assets/iphone-14-pro-1-I2619-1866-378-3037.png',
      '/assets/iphone-14-pro-1-I2619-1867-378-3037.png',
      '/assets/iphone-14-pro-1-I2619-1869-378-3037.png'
    ],
    colors: [
      { name: 'Titanio Naturale', hex: '#BEBDB8' },
      { name: 'Titanio Nero', hex: '#3B3B3D' },
      { name: 'Titanio Bianco', hex: '#F2F1EC' },
      { name: 'Titanio Blu', hex: '#2C353F' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    specs: {
      Schermo: '6.7" Super Retina XDR OLED 120Hz ProMotion',
      Processore: 'A17 Pro (3nm)',
      Fotocamera: '48MP Principale + 12MP Ultra-grandangolo + 12MP Teleobiettivo 5x',
      Batteria: 'Fino a 29 ore di riproduzione video',
      RAM: '8 GB',
      SistemaOperativo: 'iOS 17'
    },
    description: 'iPhone 15 Pro Max è forgiato nel titanio di grado aerospaziale, leggerissimo e incredibilmente resistente. È dotato del rivoluzionario chip A17 Pro, del tasto Azione personalizzabile e del sistema di fotocamere più potente mai visto su iPhone con zoom ottico 5x.',
    reviews: [
      { id: 1, author: 'Alessandro Rossi', rating: 5, date: '14/02/2026', comment: 'La scocca in titanio fa una differenza enorme nel peso. Il teleobiettivo 5x è eccezionale!' },
      { id: 2, author: 'Sara Bianchi', rating: 5, date: '28/01/2026', comment: 'Prestazioni e durata della batteria incredibili. Il chip A17 Pro fa girare i giochi come una console.' }
    ]
  },
  {
    id: 'airpods-max',
    name: 'Apple AirPods Max',
    category: 'headphones',
    brand: 'Apple',
    price: 549,
    originalPrice: 599,
    discount: 8,
    rating: 4.8,
    reviewCount: 89,
    tag: 'In Evidenza',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png',
    images: [
      '/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png',
      '/assets/image-56-I2619-1813-330-3100-330-3062.png',
      '/assets/image-56-I2619-1815-330-3100-330-3062.png'
    ],
    colors: [
      { name: 'Grigio Spaziale', hex: '#4B4B4D' },
      { name: 'Argento', hex: '#E2E3E5' },
      { name: 'Celeste', hex: '#A8C3D8' },
      { name: 'Rosa', hex: '#E8C5C8' }
    ],
    specs: {
      Driver: 'Driver dinamico da 40mm progettato da Apple',
      Chip: 'Chip Apple H1 in ciascun padiglione',
      CancellazioneRumore: 'Cancellazione Attiva del Rumore & Modalità Trasparenza',
      Batteria: 'Fino a 20 ore di ascolto continuo',
      Peso: '384.8 grammi',
      Connettivita: 'Bluetooth 5.0'
    },
    description: 'Le AirPods Max reinventano le cuffie circumaurali. Un driver dinamico progettato da Apple garantisce un audio ad alta fedeltà ad altissima definizione. Ogni dettaglio, dall\'archetto ai cuscinetti, è stato studiato per una calzabilità impeccabile.',
    reviews: [
      { id: 1, author: 'Davide Conti', rating: 5, date: '01/02/2026', comment: 'L\'audio spaziale con tracciamento della testa fa sembrare di stare al cinema.' }
    ]
  },
  {
    id: 'apple-watch-series-9',
    name: 'Apple Watch Series 9 GPS 45mm',
    category: 'watches',
    brand: 'Apple',
    price: 399,
    originalPrice: 429,
    discount: 7,
    rating: 4.7,
    reviewCount: 65,
    tag: 'Novità',
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    image: '/assets/image-2619-1979.png',
    images: [
      '/assets/image-2619-1979.png',
      '/assets/image-57-2619-1981.png'
    ],
    colors: [
      { name: 'Mezzanotte', hex: '#232931' },
      { name: 'Galassia', hex: '#ECE8DF' },
      { name: 'Argento', hex: '#E2E3E5' }
    ],
    storageOptions: ['64GB'],
    specs: {
      Schermo: 'Display Retina Always-On fino a 2000 nits',
      Processore: 'SiP S9 con Neural Engine 4-core',
      Gesti: 'Controllo con doppio tap delle dita',
      Sensori: 'ECG, Ossigeno nel Sangue, Cardiofrequenzimetro, Rilevamento Incidenti',
      Batteria: 'Fino a 18 ore di autonomia normale / 36 ore in risparmio energetico',
      Impermeabilita: 'Resistente all\'acqua fino a 50m'
    },
    description: 'Più intelligente, più luminoso e più potente. Il SiP S9 offre uno schermo ultra-luminoso e un nuovo modo magico per interagire rapidamente con il tuo Apple Watch senza nemmeno toccare lo schermo.',
    reviews: [
      { id: 1, author: 'Elena Marino', rating: 5, date: '15/01/2026', comment: 'La funzione doppio tap è comodissima quando hai le mani occupate!' }
    ]
  },
  {
    id: 'macbook-pro-16-m3',
    name: 'Apple MacBook Pro 16" M3 Max',
    category: 'computers',
    brand: 'Apple',
    price: 2499,
    originalPrice: 2699,
    discount: 7,
    rating: 4.95,
    reviewCount: 210,
    tag: 'Più Venduto',
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: '/assets/banner-2-2619-2128.png',
    images: [
      '/assets/banner-2-2619-2128.png',
      '/assets/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'Nero Spaziale', hex: '#2C2C2E' },
      { name: 'Argento', hex: '#E2E3E5' }
    ],
    storageOptions: ['512GB', '1TB', '2TB'],
    specs: {
      Schermo: '16.2" Liquid Retina XDR (3456 x 2234)',
      Processore: 'Apple M3 Max CPU 14-core / GPU 30-core',
      RAM: '36GB Memoria Unificata',
      Batteria: 'Fino a 22 ore di autonomia',
      Porte: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3',
      SistemaOperativo: 'macOS Sonoma'
    },
    description: 'MacBook Pro sfreccia a tutta velocità con il chip M3 Max, un mostro di potenza progettato per i flussi di lavoro più intensi. Dotato di splendido display Liquid Retina XDR e finitura Nero Spaziale.',
    reviews: [
      { id: 1, author: 'Marco Verdi', rating: 5, date: '10/02/2026', comment: 'Esporta video 8K in Final Cut in un attimo. La colorazione Nero Spaziale è fantastica.' }
    ]
  },
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Cuffie Wireless',
    category: 'headphones',
    brand: 'Sony',
    price: 348,
    originalPrice: 399,
    discount: 13,
    rating: 4.85,
    reviewCount: 312,
    tag: 'Più Venduto',
    isNew: false,
    isBestseller: true,
    isFeatured: true,
    image: '/assets/image-36-2619-2199.png',
    images: [
      '/assets/image-36-2619-2199.png',
      '/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png'
    ],
    colors: [
      { name: 'Nero', hex: '#1C1C1C' },
      { name: 'Argento', hex: '#E0E0E0' },
      { name: 'Blu Notte', hex: '#1B263B' }
    ],
    specs: {
      Driver: 'Driver di precisione da 30mm',
      Chip: 'Processore Integrato V1 & HD Noise Cancelling QN1',
      Batteria: 'Fino a 30 ore con ANC attivo',
      Microfoni: '8 microfoni per cancellazione rumore e chiamate nitide',
      Peso: '250g',
      Connettivita: 'Bluetooth 5.2 / Supporto LDAC'
    },
    description: 'La cancellazione del rumore leader del settore riscritta con due processori e otto microfoni. L\'ottimizzatore automatico Auto NC Optimizer adatta la cancellazione in base all\'ambiente.',
    reviews: [
      { id: 1, author: 'Roberto Galli', rating: 5, date: '05/02/2026', comment: 'Migliore cancellazione del rumore nei viaggi in aereo. Incredibilmente leggere.' }
    ]
  },
  {
    id: 'samsung-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 5G',
    category: 'smartphones',
    brand: 'Samsung',
    price: 1299,
    originalPrice: 1419,
    discount: 8,
    rating: 4.8,
    reviewCount: 178,
    tag: 'In Evidenza',
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/iphone-14-pro-1-I2619-2070-378-3037.png',
    images: [
      '/assets/iphone-14-pro-1-I2619-2070-378-3037.png',
      '/assets/iphone-14-pro-1-I2619-2072-378-3037.png'
    ],
    colors: [
      { name: 'Grigio Titanio', hex: '#7E8085' },
      { name: 'Nero Titanio', hex: '#2B2B2C' },
      { name: 'Viola Titanio', hex: '#584E69' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    specs: {
      Schermo: '6.8" Dynamic AMOLED 2X 120Hz (2600 nits di picco)',
      Processore: 'Snapdragon 8 Gen 3 per Galaxy',
      Fotocamera: '200MP Principale + 50MP Periscopio 5x + 10MP Tele 3x + 12MP Ultra-grandangolo',
      Batteria: '5000 mAh (Ricarica rapida 45W)',
      Pennino: 'S Pen integrata inclusa',
      SistemaOperativo: 'Android 14 / One UI 6.1'
    },
    description: 'Benvenuti nell\'era dell\'Intelligenza Artificiale mobile. Galaxy S24 Ultra offre funzionalità Galaxy AI avanzate come la traduzione live delle chiamate, Cerchia e Cerca, scocca in titanio e fotocamera da 200MP.',
    reviews: [
      { id: 1, author: 'Chiara Moretti', rating: 5, date: '30/01/2026', comment: 'Lo schermo antiriflesso con 2600 nits di luminosità è spettacolare sotto il sole.' }
    ]
  },
  {
    id: 'ipad-pro-12-m2',
    name: 'Apple iPad Pro 12.9" M2 Wi-Fi',
    category: 'tablets',
    brand: 'Apple',
    price: 1099,
    originalPrice: 1199,
    discount: 8,
    rating: 4.9,
    reviewCount: 95,
    tag: 'In Evidenza',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/image-64-2640-1488.png',
    images: [
      '/assets/image-64-2640-1488.png',
      '/assets/image-36-2619-2199.png'
    ],
    colors: [
      { name: 'Grigio Spaziale', hex: '#4B4B4D' },
      { name: 'Argento', hex: '#E2E3E5' }
    ],
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    specs: {
      Schermo: '12.9" Liquid Retina XDR Mini-LED (1600 nits picco)',
      Processore: 'Apple M2 CPU 8-core / GPU 10-core',
      Fotocamera: '12MP Grandangolo + 10MP Ultra-grandangolo + Scanner LiDAR',
      Batteria: 'Fino a 10 ore di navigazione Wi-Fi',
      Pennino: 'Supporta Apple Pencil (2ª gen) con funzione di sorvolo',
      SistemaOperativo: 'iPadOS 17'
    },
    description: 'Prestazioni strabilianti. Display incredibilmente avanzato. Connettività wireless ultraveloce. Nuove funzionalità per Apple Pencil e tutta la potenza di iPadOS.',
    reviews: [
      { id: 1, author: 'Christian Neri', rating: 5, date: '20/01/2026', comment: 'Ha sostituito del tutto la mia tavoletta grafica. Il chip M2 fa volare Procreate.' }
    ]
  },
  {
    id: 'playstation-5-slim',
    name: 'PlayStation 5 Digital Edition Slim',
    category: 'gaming',
    brand: 'Sony',
    price: 449,
    originalPrice: 499,
    discount: 10,
    rating: 4.9,
    reviewCount: 450,
    tag: 'Più Venduto',
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: '/assets/playstation-2619-2204.png',
    images: [
      '/assets/playstation-2619-2204.png',
      '/assets/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'Bianco', hex: '#F0F0F0' }
    ],
    storageOptions: ['1TB SSD'],
    specs: {
      Processore: 'AMD Ryzen Zen 2 personalizzato (8 Core / 16 Thread)',
      Grafica: 'AMD Radeon RDNA 2 con Ray Tracing',
      Archiviazione: 'SSD NVMe Ultra-Veloce da 1TB',
      Audio: 'Tempest 3D AudioTech',
      UscitaVideo: '4K 120Hz, 8K, supporto VRR',
      Controller: 'Controller Wireless DualSense incluso'
    },
    description: 'Sperimenta caricamenti fulminei grazie all\'SSD ad altissima velocità, un coinvolgimento profondo con il feedback aptico, grilletti adattivi, audio 3D e una nuova generazione di straordinari giochi per PlayStation.',
    reviews: [
      { id: 1, author: 'GamerItalia', rating: 5, date: '12/02/2026', comment: 'Molto più compattabile della versione originale! L\'SSD da 1TB offre tantissimo spazio.' }
    ]
  },
  {
    id: 'apple-vision-pro',
    name: 'Apple Vision Pro Spatial Computer',
    category: 'gaming',
    brand: 'Apple',
    price: 3499,
    originalPrice: 3499,
    discount: 0,
    rating: 4.7,
    reviewCount: 42,
    tag: 'Novità',
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/image-61-2619-1982.png',
    images: [
      '/assets/image-61-2619-1982.png',
      '/assets/image-62-2619-1983.png'
    ],
    colors: [
      { name: 'Fascia Solo Knit', hex: '#A1A1A1' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    specs: {
      Schermo: 'Display Micro-OLED 3D ad altissima risoluzione con 23 milioni di pixel',
      Processori: 'Doppio chip: Apple M2 + Apple R1 per l\'elaborazione in tempo reale',
      Controllo: 'Controllato tramite occhi, mani e voce',
      Audio: 'Audio Spaziale con pod audio a doppio driver',
      Batteria: 'Pacco batteria esterno fino a 2.5 ore di riproduzione video',
      SistemaOperativo: 'visionOS'
    },
    description: 'Benvenuti nell\'era del calcolo spaziale. Apple Vision Pro fonde perfettamente i contenuti digitali con il tuo spazio fisico, permettendoti di navigare semplicemente usando occhi, mani e voce.',
    reviews: [
      { id: 1, author: 'Matteo Ferrari', rating: 5, date: '18/02/2026', comment: 'Guardare i film in modalità cinema spaziale è come avere un cinema privato fluttuante nella stanza!' }
    ]
  },
  {
    id: 'canon-eos-r6-ii',
    name: 'Canon EOS R6 Mark II Fotocamera Mirrorless',
    category: 'cameras',
    brand: 'Canon',
    price: 2299,
    originalPrice: 2499,
    discount: 8,
    rating: 4.8,
    reviewCount: 68,
    tag: 'In Evidenza',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/image-63-2619-1984.png',
    images: [
      '/assets/image-63-2619-1984.png'
    ],
    colors: [
      { name: 'Nero', hex: '#1C1C1C' }
    ],
    specs: {
      Sensore: 'Sensore CMOS Full-Frame da 24.2 MP',
      Processore: 'Processore d\'immagine DIGIC X',
      Video: 'Video 4K60p a 10-bit interno con oversampling da 6K',
      ScattoContinuo: 'Fino a 40 fps con otturatore elettronico',
      Autofocus: 'Dual Pixel CMOS AF II con tracciamento soggetti tramite IA',
      Stabilizzazione: 'Stabilizzazione dell\'immagine a 5 assi fino a 8 stop'
    },
    description: 'Non scendere a compromessi sulla qualità delle foto o dei video. EOS R6 Mark II fissa nuovi standard di prestazioni con scatti fino a 40 fps, tracciamento del soggetto avanzato e straordinari video 4K 60p.',
    reviews: [
      { id: 1, author: 'FotografoPro', rating: 5, date: '11/01/2026', comment: 'L\'autofocus con tracciamento per veicoli, animali e persone è impareggiabile.' }
    ]
  },
  {
    id: 'asus-rog-zephyrus-g16',
    name: 'Asus ROG Zephyrus G16 Laptop da Gaming',
    category: 'computers',
    brand: 'Asus',
    price: 1899,
    originalPrice: 2099,
    discount: 10,
    rating: 4.75,
    reviewCount: 84,
    tag: 'Novità',
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    image: '/assets/banner-2-2619-2128.png',
    images: [
      '/assets/banner-2-2619-2128.png'
    ],
    colors: [
      { name: 'Grigio Eclissi', hex: '#323232' },
      { name: 'Bianco Platino', hex: '#EAEAEA' }
    ],
    storageOptions: ['1TB SSD', '2TB SSD'],
    specs: {
      Schermo: '16" ROG Nebula OLED 2.5K 240Hz 0.2ms',
      Processore: 'Intel Core Ultra 9 185H (16 Core)',
      SchedaGrafica: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      RAM: '32GB LPDDR5X 7467MHz',
      Peso: '1.85 kg / Scocca Unibody in Alluminio CNC',
      SistemaOperativo: 'Windows 11 Home'
    },
    description: 'La potenza incontra la precisione nel nuovo ROG Zephyrus G16. Caratterizzato da uno chassis in alluminio CNC sottilissimo, uno schermo ROG Nebula OLED da 240Hz e processore Intel Core Ultra 9.',
    reviews: [
      { id: 1, author: 'Luca Santoro', rating: 5, date: '08/02/2026', comment: 'Il pannello OLED è pazzesco! I neri assoluti rendono i giochi di una bellezza incredibile.' }
    ]
  },
  {
    id: 'bose-quietcomfort-ultra',
    name: 'Bose QuietComfort Ultra Cuffie Over-Ear',
    category: 'headphones',
    brand: 'Bose',
    price: 379,
    originalPrice: 429,
    discount: 12,
    rating: 4.7,
    reviewCount: 120,
    tag: 'In Evidenza',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png',
    images: [
      '/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png'
    ],
    colors: [
      { name: 'Nero', hex: '#1C1C1C' },
      { name: 'Fumo Bianco', hex: '#E8E8E8' },
      { name: 'Sabbia', hex: '#D2C2B0' }
    ],
    specs: {
      Audio: 'Bose Immersive Audio per un ascolto spazializzato',
      CancellazioneRumore: 'Tecnologia CustomTune che personalizza suono e ANC',
      Modalita: 'Modalità Silenzio, Consapevolezza, Immersione',
      Batteria: 'Fino a 24 ore di riproduzione (18 ore con Audio Immersivo)',
      Connettivita: 'Bluetooth 5.3 / Snapdragon Sound',
      Controlli: 'Comandi touch sul padiglione destro'
    },
    description: 'Ascolto di prim\'ordine e cancellazione del rumore di livello mondiale. Bose Immersive Audio sposta i confini dell\'ascolto rendendo il suono incredibilmente naturale e reale.',
    reviews: [
      { id: 1, author: 'Simona Pellegrini', rating: 5, date: '25/01/2026', comment: 'I morbidi cuscinetti sono ultra-comodi. CustomTune adatta l\'audio perfettamente al mio orecchio.' }
    ]
  },
  {
    id: 'galaxy-watch-6-classic',
    name: 'Samsung Galaxy Watch 6 Classic 47mm',
    category: 'watches',
    brand: 'Samsung',
    price: 329,
    originalPrice: 399,
    discount: 18,
    rating: 4.6,
    reviewCount: 110,
    tag: 'Più Venduto',
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    image: '/assets/image-2619-1979.png',
    images: [
      '/assets/image-2619-1979.png'
    ],
    colors: [
      { name: 'Nero', hex: '#232323' },
      { name: 'Argento', hex: '#DCDCDC' }
    ],
    specs: {
      Schermo: '1.5" Super AMOLED con Vetro in Cristallo di Zaffiro',
      Ghiera: 'Ghiera rotante fisica classica',
      Processore: 'Exynos W930 Dual-Core 1.4GHz',
      Sensori: 'Sensore BioActive (Cardio, ECG, BIA), Sensore di Temperatura',
      Batteria: '425 mAh con Ricarica Rapida Wireless WPC',
      SistemaOperativo: 'Wear OS Powered by Samsung'
    },
    description: 'Il ritorno dell\'iconica ghiera rotante fisica! Monitora il sonno, le zone di frequenza cardiaca, la composizione corporea BIA e i tuoi allenamenti con massima precisione.',
    reviews: [
      { id: 1, author: 'Gabriele Rinaldi', rating: 5, date: '02/02/2026', comment: 'La ghiera rotante è una comodità unica. Sembra un vero orologio di lusso.' }
    ]
  },
  {
    id: 'dji-mini-4-pro',
    name: 'DJI Mini 4 Pro Fly More Combo',
    category: 'cameras',
    brand: 'DJI',
    price: 1099,
    originalPrice: 1159,
    discount: 5,
    rating: 4.9,
    reviewCount: 156,
    tag: 'Novità',
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/image-63-2619-1984.png',
    images: [
      '/assets/image-63-2619-1984.png'
    ],
    colors: [
      { name: 'Grigio', hex: '#8C8C8C' }
    ],
    specs: {
      Peso: 'Inferiore a 249 g (Nessun patentino richiesto in molte categorie)',
      Video: '4K/60fps HDR & 4K/100fps Slow Motion',
      Sensori: 'Rilevamento ostacoli omnidirezionale',
      Trasmissione: 'DJI O4 20km Trasmissione Video FHD',
      AutonomiaVolo: 'Fino a 34 minuti per batteria (3 batterie incluse nel Fly More Combo)',
      Radiocomando: 'DJI RC 2 con schermo integrato FHD da 5.5 pollici'
    },
    description: 'Vola leggero, crea in grande. DJI Mini 4 Pro integra rilevamento ostacoli omnidirezionale, trasmissione video O4, ripresa 4K/60fps HDR e riprese verticali native.',
    reviews: [
      { id: 1, author: 'PilotaDrone', rating: 5, date: '16/02/2026', comment: 'I sensori anti-ostacolo danno una tranquillità totale quando si vola nei boschi.' }
    ]
  },
  {
    id: 'nintendo-switch-oled',
    name: 'Nintendo Switch Modello OLED',
    category: 'gaming',
    brand: 'Nintendo',
    price: 319,
    originalPrice: 349,
    discount: 9,
    rating: 4.85,
    reviewCount: 520,
    tag: 'Più Venduto',
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    image: '/assets/cover-I2619-2245-601-122.png',
    images: [
      '/assets/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'Bianco', hex: '#FFFFFF' },
      { name: 'Rosso Neon/Blu Neon', hex: '#FF3B30' }
    ],
    storageOptions: ['64GB'],
    specs: {
      Schermo: 'Schermo OLED da 7.0 pollici con colori vividi',
      Supporto: 'Ampio stand regolabile per la modalità da tavolo',
      Base: 'Porta LAN con cavo integrata nella base',
      Archiviazione: '64 GB di memoria interna + slot per scheda MicroSD',
      Audio: 'Altoparlanti con audio migliorato per la modalità portatile',
      Batteria: 'Da 4.5 a 9 ore a seconda del gioco'
    },
    description: 'Godi di colori brillanti e contrasti elevati quando giochi dove vuoi. Scopri la differenza che fa lo schermo OLED, sia che tu stia gareggiando a tutta velocità o sfidando i tuoi nemici.',
    reviews: [
      { id: 1, author: 'FanDiMario', rating: 5, date: '09/01/2026', comment: 'Zelda Tears of the Kingdom su questo schermo OLED è uno spettacolo!' }
    ]
  },
  {
    id: 'logitech-mx-master-3s',
    name: 'Logitech MX Master 3S Mouse Wireless',
    category: 'accessories',
    brand: 'Logitech',
    price: 89,
    originalPrice: 99,
    discount: 10,
    rating: 4.9,
    reviewCount: 680,
    tag: 'Più Venduto',
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    image: '/assets/image-36-2619-2199.png',
    images: [
      '/assets/image-36-2619-2199.png'
    ],
    colors: [
      { name: 'Grafite', hex: '#383838' },
      { name: 'Grigio Chiaro', hex: '#E2E2E2' }
    ],
    specs: {
      Sensore: 'Sensore di precisione Darkfield da 8.000 DPI (funziona anche sul vetro)',
      Click: 'Click silenziosi (90% di rumore in meno)',
      Scorrimento: 'Scorrimento elettromagnetico MagSpeed (1000 righe al secondo)',
      Connettivita: 'Bluetooth Low Energy o Ricevitore Logi Bolt',
      Batteria: 'Fino a 70 giorni con una carica completa (3 ore con 1 minuto di ricarica)',
      Ergonomia: 'Silhouette ergonomica sagomata sulla mano'
    },
    description: 'Scopri MX Master 3S, un mouse iconico rimasterizzato. Senti ogni momento del tuo flusso di lavoro con ancora più precisione e risposta tattile grazie ai click silenziosi e al sensore da 8.000 DPI.',
    reviews: [
      { id: 1, author: 'DesignerMilano', rating: 5, date: '11/02/2026', comment: 'La rotellina del pollice e i click silenziosi rendono il lavoro notturno un piacere.' }
    ]
  },
  {
    id: 'anker-maggo-3in1',
    name: 'Anker MagGo Stazione di Ricarica Wireless 3-in-1',
    category: 'accessories',
    brand: 'Anker',
    price: 99,
    originalPrice: 109,
    discount: 9,
    rating: 4.7,
    reviewCount: 95,
    tag: 'Novità',
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    image: '/assets/image-56-I2619-1813-330-3100-330-3062.png',
    images: [
      '/assets/image-56-I2619-1813-330-3100-330-3062.png'
    ],
    colors: [
      { name: 'Nero', hex: '#1C1C1C' },
      { name: 'Bianco', hex: '#FFFFFF' }
    ],
    specs: {
      Potenza: 'Ricarica Wireless Ultra-Rapida Certificata Qi2 da 15W',
      Dispositivi: 'Ricarica contemporaneamente iPhone, Apple Watch e AirPods',
      Design: 'Struttura pieghevole ultra-compatta ideale per i viaggi',
      Sicurezza: 'Monitoraggio della temperatura ActiveShield 2.0',
      Accessori: 'Include cavo USB-C da 1.5m & Caricatore PD da 40W'
    },
    description: 'Ricarica 3 dispositivi contemporaneamente con velocità MagSafe Qi2 da 15W ufficiale. Si piega nelle dimensioni di un mazzo di carte per un facile trasporto in viaggio.',
    reviews: [
      { id: 1, author: 'Viaggiatore22', rating: 5, date: '29/01/2026', comment: 'Ha sostituito tre caricatori diversi sul mio comodino e nella borsa.' }
    ]
  },
  {
    id: 'dualsense-edge-controller',
    name: 'Sony DualSense Edge Controller Wireless',
    category: 'gaming',
    brand: 'Sony',
    price: 199,
    originalPrice: 219,
    discount: 9,
    rating: 4.8,
    reviewCount: 140,
    tag: 'In Evidenza',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/assets/cover-I2619-2245-601-122.png',
    images: [
      '/assets/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'Bianco/Nero', hex: '#ECECEC' }
    ],
    specs: {
      Personalizzazione: 'Tasti rimappabili, cappucci levetta e tasti posteriori intercambiabili',
      Grilletti: 'Corsa e zone morte dei grilletti regolabili',
      Profili: 'Salva profili di controllo personalizzati e scambiali al volo',
      Aptica: 'Include tutte le caratteristiche DualSense (feedback aptico, grilletti adattivi)',
      Custodia: 'Custodia rigida per trasportare controller, cavi e accessori'
    },
    description: 'Ottieni un vantaggio competitivo nel gioco creando controlli personalizzati in base al tuo stile di gioco. Progettato pensando alle alte prestazioni e alla personalizzazione.',
    reviews: [
      { id: 1, author: 'ProGamerIT', rating: 5, date: '03/02/2026', comment: 'I paddle posteriori e il blocco della corsa dei grilletti danno un vantaggio enorme nei giochi FPS.' }
    ]
  }
];
