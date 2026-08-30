export const categories = [
  { id: 'smartphones', name: 'Smartphones', icon: 'Smartphone' },
  { id: 'watches', name: 'Smartwatches', icon: 'Watch' },
  { id: 'cameras', name: 'Cameras', icon: 'Camera' },
  { id: 'headphones', name: 'Headphones', icon: 'Headphones' },
  { id: 'computers', name: 'Computers', icon: 'Laptop' },
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2' },
  { id: 'tablets', name: 'Tablets', icon: 'Tablet' },
  { id: 'accessories', name: 'Accessories', icon: 'Plug' },
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
    tag: 'Bestseller',
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: '/images/iphone-image-2619-2264.png',
    images: [
      '/images/iphone-image-2619-2264.png',
      '/images/iphone-14-pro-1-I2619-1866-378-3037.png',
      '/images/iphone-14-pro-1-I2619-1867-378-3037.png',
      '/images/iphone-14-pro-1-I2619-1869-378-3037.png'
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#BEBDB8' },
      { name: 'Black Titanium', hex: '#3B3B3D' },
      { name: 'White Titanium', hex: '#F2F1EC' },
      { name: 'Blue Titanium', hex: '#2C353F' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    specs: {
      screen: '6.7" Super Retina XDR OLED 120Hz ProMotion',
      cpu: 'A17 Pro Chip (3nm)',
      camera: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
      battery: 'Up to 29 hours video playback',
      ram: '8 GB',
      os: 'iOS 17'
    },
    description: 'iPhone 15 Pro Max is forged in aerospace-grade titanium that is lightweight yet incredibly strong. Features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.',
    reviews: [
      { id: 1, author: 'Alex Rivera', rating: 5, date: '2024-02-14', comment: 'The titanium build makes a huge difference in weight. The 5x camera lens is mindblowing!' },
      { id: 2, author: 'Sarah Chen', rating: 5, date: '2024-01-28', comment: 'Incredible performance and battery life. A17 Pro runs games like a dedicated console.' }
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
    tag: 'Featured',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/images/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png',
    images: [
      '/images/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png',
      '/images/image-56-I2619-1813-330-3100-330-3062.png',
      '/images/image-56-I2619-1815-330-3100-330-3062.png'
    ],
    colors: [
      { name: 'Space Gray', hex: '#4B4B4D' },
      { name: 'Silver', hex: '#E2E3E5' },
      { name: 'Sky Blue', hex: '#A8C3D8' },
      { name: 'Pink', hex: '#E8C5C8' }
    ],
    specs: {
      driver: '40mm Dynamic Driver designed by Apple',
      chip: 'Apple H1 chip in each ear cup',
      noiseControl: 'Active Noise Cancellation & Transparency Mode',
      battery: 'Up to 20 hours listening time',
      weight: '384.8 grams',
      connectivity: 'Bluetooth 5.0'
    },
    description: 'AirPods Max reimagine over-ear headphones. An Apple-designed dynamic driver provides immersive high-fidelity audio. Every detail, from canopy to cushions, has been designed for an exceptional fit.',
    reviews: [
      { id: 1, author: 'David K.', rating: 5, date: '2024-02-01', comment: 'The spatial audio with dynamic head tracking feels like being in a movie theater.' }
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
    tag: 'New Arrival',
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    image: '/images/image-2619-1979.png',
    images: [
      '/images/image-2619-1979.png',
      '/images/image-57-2619-1981.png'
    ],
    colors: [
      { name: 'Midnight', hex: '#232931' },
      { name: 'Starlight', hex: '#ECE8DF' },
      { name: 'Silver', hex: '#E2E3E5' }
    ],
    storageOptions: ['64GB'],
    specs: {
      screen: 'Always-On Retina display up to 2000 nits',
      cpu: 'S9 SiP with 4-core Neural Engine',
      gestures: 'Double tap gesture control',
      sensors: 'ECG app, Blood Oxygen, Heart rate, Crash Detection',
      battery: 'Up to 18 hours normal use / 36 hrs Low Power',
      waterResistance: '50m water resistant'
    },
    description: 'Smarter, brighter, and mightier. The S9 SiP enables a super-bright display and a magical new way to quickly and easily interact with your Apple Watch without touching the screen.',
    reviews: [
      { id: 1, author: 'Jessica M.', rating: 5, date: '2024-01-15', comment: 'Double tap feature is super convenient when holding groceries or running!' }
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
    tag: 'Bestseller',
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: '/images/banner-2-2619-2128.png',
    images: [
      '/images/banner-2-2619-2128.png',
      '/images/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'Space Black', hex: '#2C2C2E' },
      { name: 'Silver', hex: '#E2E3E5' }
    ],
    storageOptions: ['512GB', '1TB', '2TB'],
    specs: {
      screen: '16.2" Liquid Retina XDR display (3456 x 2234)',
      cpu: 'Apple M3 Max 14-core CPU / 30-core GPU',
      ram: '36GB Unified Memory',
      battery: 'Up to 22 hours battery life',
      ports: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3',
      os: 'macOS Sonoma'
    },
    description: 'MacBook Pro blasts forward with M3 Max, a monster chip that drives extreme performance for intensive workflows. Features stunning Liquid Retina XDR display and Space Black finish.',
    reviews: [
      { id: 1, author: 'Marcus V.', rating: 5, date: '2024-02-10', comment: 'Renders 8K video in Final Cut like butter. Space Black looks gorgeous.' }
    ]
  },
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'headphones',
    brand: 'Sony',
    price: 348,
    originalPrice: 399,
    discount: 13,
    rating: 4.85,
    reviewCount: 312,
    tag: 'Bestseller',
    isNew: false,
    isBestseller: true,
    isFeatured: true,
    image: '/images/image-[36]-2619-2199.png',
    images: [
      '/images/image-36-2619-2199.png',
      '/images/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png'
    ],
    colors: [
      { name: 'Black', hex: '#1C1C1C' },
      { name: 'Silver', hex: '#E0E0E0' },
      { name: 'Midnight Blue', hex: '#1B263B' }
    ],
    specs: {
      driver: '30mm Precision Driver',
      chip: 'Integrated Processor V1 & HD Noise Cancelling QN1',
      battery: 'Up to 30 hours with ANC',
      microphones: '8 Microphones for noise cancelling & crystal clear calls',
      weight: '250g',
      bluetooth: 'Bluetooth 5.2 / LDAC support'
    },
    description: 'Industry-leading noise cancellation rewritten with two processors and eight microphones. Auto NC Optimizer automatically adjusts cancelling based on environment and wearing conditions.',
    reviews: [
      { id: 1, author: 'Brian T.', rating: 5, date: '2024-02-05', comment: 'Best noise cancellation on flights! Unbelievably lightweight and comfortable.' }
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
    tag: 'Featured',
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    image: '/images/iphone-14-pro-1-I2619-2070-378-3037.png',
    images: [
      '/images/iphone-14-pro-1-I2619-2070-378-3037.png',
      '/images/iphone-14-pro-1-I2619-2072-378-3037.png'
    ],
    colors: [
      { name: 'Titanium Gray', hex: '#7E8085' },
      { name: 'Titanium Black', hex: '#2B2B2C' },
      { name: 'Titanium Violet', hex: '#584E69' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    specs: {
      screen: '6.8" Dynamic AMOLED 2X 120Hz (2600 nits peak)',
      cpu: 'Snapdragon 8 Gen 3 for Galaxy',
      camera: '200MP Main + 50MP 5x Periscope + 10MP 3x + 12MP Ultra Wide',
      battery: '5000 mAh (45W Fast Charging)',
      spen: 'Built-in S Pen included',
      os: 'Android 14 / One UI 6.1'
    },
    description: 'Welcome to the era of mobile AI. Galaxy S24 Ultra features Galaxy AI live translate, Circle to Search, a titanium shield, and an astounding 200MP camera system.',
    reviews: [
      { id: 1, author: 'Elena R.', rating: 5, date: '2024-01-30', comment: 'The anti-reflective glass screen combined with 2600 nits brightness is astounding outdoors.' }
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
    tag: 'Featured',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/images/image-64-2640-1488.png',
    images: [
      '/images/image-64-2640-1488.png',
      '/images/image-36-2619-2199.png'
    ],
    colors: [
      { name: 'Space Gray', hex: '#4B4B4D' },
      { name: 'Silver', hex: '#E2E3E5' }
    ],
    storageOptions: ['128GB', '256GB', '512GB', '1TB'],
    specs: {
      screen: '12.9" Liquid Retina XDR Mini-LED (1600 nits peak)',
      cpu: 'Apple M2 8-core CPU / 10-core GPU',
      camera: '12MP Wide + 10MP Ultra Wide + LiDAR Scanner',
      battery: 'Up to 10 hours surf on Wi-Fi',
      pencil: 'Supports Apple Pencil (2nd gen) Hover',
      os: 'iPadOS 17'
    },
    description: 'Astonishing performance. Incredibly advanced displays. Superfast wireless connectivity. Next-level Apple Pencil capabilities. Powerful new features in iPadOS.',
    reviews: [
      { id: 1, author: 'Chris P.', rating: 5, date: '2024-01-20', comment: 'Replaced my drawing tablet and notebook completely. M2 chip handles Procreate effortlessly.' }
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
    tag: 'Bestseller',
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    image: '/images/playstation-2619-2204.png',
    images: [
      '/images/playstation-2619-2204.png',
      '/images/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'White', hex: '#F0F0F0' }
    ],
    storageOptions: ['1TB SSD'],
    specs: {
      cpu: 'Custom x86-64 AMD Ryzen Zen 2 (8 Cores / 16 Threads)',
      gpu: 'AMD Radeon RDNA 2-based graphics engine with Ray Tracing',
      storage: '1TB Custom Ultra-High Speed NVMe SSD',
      audio: 'Tempest 3D AudioTech',
      output: '4K 120Hz, 8K, VRR support',
      controller: 'DualSense Wireless Controller included'
    },
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio, and an all-new generation of incredible PlayStation games.',
    reviews: [
      { id: 1, author: 'GamerX', rating: 5, date: '2024-02-12', comment: 'Much smaller footprint than the original PS5! 1TB SSD gives plenty of storage.' }
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
    tag: 'New Arrival',
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    image: '/images/image-61-2619-1982.png',
    images: [
      '/images/image-61-2619-1982.png',
      '/images/image-62-2619-1983.png'
    ],
    colors: [
      { name: 'Solo Knit Band', hex: '#A1A1A1' }
    ],
    storageOptions: ['256GB', '512GB', '1TB'],
    specs: {
      display: '23 Million pixels ultra-high-resolution Micro-OLED 3D display',
      chips: 'Dual-chip design: Apple M2 + Apple R1 real-time processor',
      control: 'Controlled using eyes, hands, and voice',
      audio: 'Spatial Audio system with dual-driver audio pods',
      battery: 'External battery pack up to 2.5 hours video use',
      os: 'visionOS'
    },
    description: 'Welcome to spatial computing. Apple Vision Pro seamlessly blends digital content with your physical space, allowing you to navigate simply by using your eyes, hands, and voice.',
    reviews: [
      { id: 1, author: 'Tech Enthusiast', rating: 5, date: '2024-02-18', comment: 'Watching movies in spatial cinema mode is like having a movie theater floating in your room!' }
    ]
  },
  {
    id: 'canon-eos-r6-ii',
    name: 'Canon EOS R6 Mark II Mirrorless Camera',
    category: 'cameras',
    brand: 'Canon',
    price: 2299,
    originalPrice: 2499,
    discount: 8,
    rating: 4.8,
    reviewCount: 68,
    tag: 'Featured',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/images/image-63-2619-1984.png',
    images: [
      '/images/image-63-2619-1984.png'
    ],
    colors: [
      { name: 'Black', hex: '#1C1C1C' }
    ],
    specs: {
      sensor: '24.2MP Full-Frame CMOS Sensor',
      processor: 'DIGIC X Image Processor',
      video: '4K60p 10-bit internal video oversampled from 6K',
      fps: 'Up to 40 fps electronic shutter shooting',
      autofocus: 'Dual Pixel CMOS AF II with AI subject tracking',
      stabilization: '5-Axis In-Body Image Stabilizer up to 8 stops'
    },
    description: 'Never compromise on photo or video quality. The EOS R6 Mark II sets new standards for performance with up to 40 fps electronic shooting, advanced subject tracking, and stunning 4K 60p video.',
    reviews: [
      { id: 1, author: 'PhotoPro', rating: 5, date: '2024-01-11', comment: 'The autofocus subject tracking on horses, birds, and cars is unmatched.' }
    ]
  },
  {
    id: 'asus-rog-zephyrus-g16',
    name: 'Asus ROG Zephyrus G16 Gaming Laptop',
    category: 'computers',
    brand: 'Asus',
    price: 1899,
    originalPrice: 2099,
    discount: 10,
    rating: 4.75,
    reviewCount: 84,
    tag: 'New Arrival',
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    image: '/images/banner-2-2619-2128.png',
    images: [
      '/images/banner-2-2619-2128.png'
    ],
    colors: [
      { name: 'Eclipse Gray', hex: '#323232' },
      { name: 'Platinum White', hex: '#EAEAEA' }
    ],
    storageOptions: ['1TB SSD', '2TB SSD'],
    specs: {
      screen: '16" ROG Nebula OLED 2.5K 240Hz 0.2ms',
      cpu: 'Intel Core Ultra 9 185H (16 Cores)',
      gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      ram: '32GB LPDDR5X 7467MHz',
      weight: '1.85 kg / 4.07 lbs CNC Aluminum Unibody',
      os: 'Windows 11 Home'
    },
    description: 'Power meets precision in the all-new 2024 ROG Zephyrus G16. Featuring an ultra-thin CNC aluminum chassis, a groundbreaking ROG Nebula OLED 240Hz display, and Intel Core Ultra 9 processor.',
    reviews: [
      { id: 1, author: 'Liam S.', rating: 5, date: '2024-02-08', comment: 'The OLED panel is unreal! Color saturation and pitch blacks make games look futuristic.' }
    ]
  },
  {
    id: 'bose-quietcomfort-ultra',
    name: 'Bose QuietComfort Ultra Headphones',
    category: 'headphones',
    brand: 'Bose',
    price: 379,
    originalPrice: 429,
    discount: 12,
    rating: 4.7,
    reviewCount: 120,
    tag: 'Featured',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/images/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png',
    images: [
      '/images/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png'
    ],
    colors: [
      { name: 'Black', hex: '#1C1C1C' },
      { name: 'White Smoke', hex: '#E8E8E8' },
      { name: 'Sandstone', hex: '#D2C2B0' }
    ],
    specs: {
      audio: 'Bose Immersive Audio for spatialized listening',
      noiseCancelling: 'CustomTune technology personalizes sound & ANC',
      modes: 'Quiet Mode, Aware Mode, Immersion Mode',
      battery: 'Up to 24 hours playback (18 hrs with Immersive Audio)',
      connectivity: 'Bluetooth 5.3 / Snapdragon Sound',
      controls: 'Touch controls on right ear cup'
    },
    description: 'High-class listening meets world-class noise cancellation. Bose Immersive Audio pushes the boundary of what it means to listen, placing sound right in front of you.',
    reviews: [
      { id: 1, author: 'Rachel W.', rating: 5, date: '2024-01-25', comment: 'The plush ear cushions feel like pillows. CustomTune adjusts perfectly to my ears.' }
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
    tag: 'Bestseller',
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    image: '/images/image-2619-1979.png',
    images: [
      '/images/image-2619-1979.png'
    ],
    colors: [
      { name: 'Black', hex: '#232323' },
      { name: 'Silver', hex: '#DCDCDC' }
    ],
    specs: {
      screen: '1.5" Super AMOLED Sapphire Crystal Glass',
      bezel: 'Physical Rotating Bezel ring',
      cpu: 'Exynos W930 Dual-Core 1.4GHz',
      sensors: 'BioActive Sensor (HR, ECG, BIA), Temperature Sensor',
      battery: '425 mAh with WPC Fast Wireless Charging',
      os: 'Wear OS Powered by Samsung'
    },
    description: 'The return of the iconic physical rotating bezel! Track personalized sleep coaching, heart rate zones, BIA body composition, and exercise routines with precision.',
    reviews: [
      { id: 1, author: 'Kevin M.', rating: 5, date: '2024-02-02', comment: 'Rotating bezel is tactile perfection. Looks like a real luxury time piece.' }
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
    tag: 'New Arrival',
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    image: '/images/image-63-2619-1984.png',
    images: [
      '/images/image-63-2619-1984.png'
    ],
    colors: [
      { name: 'Gray', hex: '#8C8C8C' }
    ],
    specs: {
      weight: 'Under 249 g (No FAA registration required in many countries)',
      video: '4K/60fps HDR & 4K/100fps Slow Motion',
      sensing: 'Omnidirectional Obstacle Sensing',
      transmission: 'DJI O4 20km FHD Video Transmission',
      flightTime: 'Up to 34 minutes per battery (3 batteries in Fly More Combo)',
      controller: 'DJI RC 2 with built-in 5.5-inch FHD display'
    },
    description: 'Fly mini, create big. DJI Mini 4 Pro integrates omnidirectional obstacle sensing, flagship O4 video transmission, 4K/60fps HDR, and true vertical shooting.',
    reviews: [
      { id: 1, author: 'SkyFlyer', rating: 5, date: '2024-02-16', comment: 'The obstacle avoidance gives 100% peace of mind in forests and tight places.' }
    ]
  },
  {
    id: 'nintendo-switch-oled',
    name: 'Nintendo Switch OLED Model',
    category: 'gaming',
    brand: 'Nintendo',
    price: 319,
    originalPrice: 349,
    discount: 9,
    rating: 4.85,
    reviewCount: 520,
    tag: 'Bestseller',
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    image: '/images/cover-I2619-2245-601-122.png',
    images: [
      '/images/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Neon Red/Neon Blue', hex: '#FF3B30' }
    ],
    storageOptions: ['64GB'],
    specs: {
      screen: '7.0-inch OLED screen with vibrant colors',
      stand: 'Wide adjustable stand for tabletop mode',
      dock: 'Wired LAN port built into dock',
      storage: '64 GB internal storage + MicroSD expandability',
      audio: 'Enhanced audio speakers for handheld and tabletop play',
      battery: '4.5 to 9 hours depending on game'
    },
    description: 'Feast your eyes on vivid colors and crisp contrast when you play on the go. See the difference the vibrant OLED screen makes, whether you are racing at top speed or squaring off against enemies.',
    reviews: [
      { id: 1, author: 'MarioFan', rating: 5, date: '2024-01-09', comment: 'Zelda Tears of the Kingdom on this screen looks gorgeous!' }
    ]
  },
  {
    id: 'logitech-mx-master-3s',
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'accessories',
    brand: 'Logitech',
    price: 89,
    originalPrice: 99,
    discount: 10,
    rating: 4.9,
    reviewCount: 680,
    tag: 'Bestseller',
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    image: '/images/image-36-2619-2199.png',
    images: [
      '/images/image-36-2619-2199.png'
    ],
    colors: [
      { name: 'Graphite', hex: '#383838' },
      { name: 'Pale Gray', hex: '#E2E2E2' }
    ],
    specs: {
      sensor: '8,000 DPI Darkfield precision optical sensor (works on glass)',
      clicks: 'Quiet Clicks (90% less click noise)',
      scroll: 'MagSpeed Electromagnetic scrolling (1000 lines per sec)',
      connectivity: 'Bluetooth Low Energy or Logi Bolt Receiver',
      battery: 'Up to 70 days on a full charge (3 hrs use from 1 min charge)',
      ergonomics: 'Hand-crafted ergonomic silhouette'
    },
    description: 'Meet MX Master 3S – an iconic mouse remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks and an 8,000 DPI track-on-glass sensor.',
    reviews: [
      { id: 1, author: 'DesignerGuy', rating: 5, date: '2024-02-11', comment: 'The thumb scroll and silent clicks make working late at night a joy.' }
    ]
  },
  {
    id: 'anker-maggo-3in1',
    name: 'Anker MagGo Wireless Charging Station 3-in-1',
    category: 'accessories',
    brand: 'Anker',
    price: 99,
    originalPrice: 109,
    discount: 9,
    rating: 4.7,
    reviewCount: 95,
    tag: 'New Arrival',
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    image: '/images/image-56-I2619-1813-330-3100-330-3062.png',
    images: [
      '/images/image-56-I2619-1813-330-3100-330-3062.png'
    ],
    colors: [
      { name: 'Black', hex: '#1C1C1C' },
      { name: 'White', hex: '#FFFFFF' }
    ],
    specs: {
      power: '15W Qi2 Certified Ultra-Fast Wireless Charging',
      chargingPorts: 'Charges iPhone, Apple Watch, and AirPods simultaneously',
      design: 'Ultra-compact foldable tree structure for travel',
      safety: 'ActiveShield 2.0 temperature monitoring',
      cable: 'Includes 5ft USB-C to USB-C cable & 40W PD Charger'
    },
    description: 'Charge 3 devices at once with official Qi2 15W MagSafe-compatible speed. Folds into a compact deck of cards size for easy travel and nightstand minimalism.',
    reviews: [
      { id: 1, author: 'Traveler22', rating: 5, date: '2024-01-29', comment: 'Replaced all three of my chargers on my nightstand and in my bag.' }
    ]
  },
  {
    id: 'dualsense-edge-controller',
    name: 'Sony DualSense Edge Wireless Controller',
    category: 'gaming',
    brand: 'Sony',
    price: 199,
    originalPrice: 219,
    discount: 9,
    rating: 4.8,
    reviewCount: 140,
    tag: 'Featured',
    isNew: false,
    isBestseller: false,
    isFeatured: true,
    image: '/images/cover-I2619-2245-601-122.png',
    images: [
      '/images/cover-I2619-2245-601-122.png'
    ],
    colors: [
      { name: 'White/Black', hex: '#ECECEC' }
    ],
    specs: {
      customization: 'Remappable buttons, changeable stick caps & back buttons',
      triggers: 'Adjustable trigger stop distances and dead zones',
      profiles: 'Save custom control profiles and swap on the fly',
      haptics: 'Includes standard DualSense features (haptic feedback, adaptive triggers)',
      case: 'Carrying case holds controller, cable, and accessories'
    },
    description: 'Get an edge in gameplay by creating your own custom controls to fit your playstyle. Built with high performance and personalization in mind.',
    reviews: [
      { id: 1, author: 'CompetitivePro', rating: 5, date: '2024-02-03', comment: 'The back paddles and trigger locks give a noticeable advantage in Call of Duty.' }
    ]
  }
];
