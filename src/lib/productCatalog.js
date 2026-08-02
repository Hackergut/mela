// Catalogo prodotti — ogni voce è verificata visivamente sull'asset reale.
// Ordine: per categoria, poi per modello (dal più recente/premium).

const IMG = 'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b';

// Sequenza fotografica standard, identica per ogni modello iPhone.
export const IPHONE_GALLERY = [
  `${IMG}/7d56fefdb_IMG_1342.jpeg`,
  `${IMG}/c933de856_IMG_1339.jpeg`,
  `${IMG}/b2b227688_IMG_1338.jpeg`,
  `${IMG}/3663c67ac_IMG_1391.jpeg`,
  `${IMG}/f50e646a3_IMG_1390.jpeg`,
  `${IMG}/c23ec71f1_IMG_1402.jpeg`,
  `${IMG}/0f331a081_IMG_1669.webp`,
  `${IMG}/b541b89c1_IMG_1620.jpeg`,
  `${IMG}/e1c117802_IMG_1618.jpeg`,
  `${IMG}/b9530564b_IMG_1670.jpeg`,
];

export const PRODUCT_CATALOG = [
  // ===== iPhone (un prodotto per modello, stessa sequenza fotografica) =====
  {
    id: 1,
    name: 'iPhone 17 Pro',
    price: '€1.199',
    badge: 'Nuovo',
    category: 'iPhone',
    image: IPHONE_GALLERY[0],
    images: IPHONE_GALLERY,
    description: 'iPhone 17 Pro con chip A19 Pro vapor-cooled, struttura in alluminio forgiato e display ProMotion da 6,3". Sistema fotocamera Pro con tripla lente 48MP e teleobiettivo 5x.',
  },
  {
    id: 2,
    name: 'iPhone 17 Air',
    price: '€999',
    badge: 'Nuovo',
    category: 'iPhone',
    image: IPHONE_GALLERY[0],
    images: IPHONE_GALLERY,
    description: 'iPhone 17 Air, il più sottile mai realizzato con soli 5,6 mm di spessore. Chip A19, display OLED da 6,6" e fotocamera 48MP in un corpo leggerissimo.',
  },
  {
    id: 3,
    name: 'iPhone 17',
    price: '€899',
    badge: 'Nuovo',
    category: 'iPhone',
    image: IPHONE_GALLERY[0],
    images: IPHONE_GALLERY,
    description: 'iPhone 17 con chip A19, doppia fotocamera da 48MP e display Super Retina XDR da 6,1". Disponibile in cinque colorazioni.',
  },
  {
    id: 4,
    name: 'iPhone 16',
    price: '€799',
    badge: null,
    category: 'iPhone',
    image: IPHONE_GALLERY[0],
    images: IPHONE_GALLERY,
    description: 'iPhone 16 con chip A18, Controllo Fotocamera dedicato e doppia fotocamera da 48MP. Display Super Retina XDR da 6,1" e batteria che dura tutto il giorno.',
  },

  // ===== Apple Watch Series 10 =====
  { id: 25, name: 'Apple Watch Series 10 — Nero', price: '€449', badge: 'Nuovo', category: 'Apple Watch', image: `${IMG}/f661dd828_IMG_1661.jpeg`,
    description: 'Apple Watch Series 10 con cassa in alluminio Nero. Display sempre attivo più grande e sottile di sempre.' },
  { id: 26, name: 'Apple Watch Series 10 — Blu', price: '€449', badge: null, category: 'Apple Watch', image: `${IMG}/2d8934003_IMG_1660.jpeg`,
    description: 'Apple Watch Series 10 in Blu scuro. Sensori sanitari avanzati e ricarica rapida.' },
  { id: 27, name: 'Apple Watch Series 10 — Argento al Polso', price: '€449', badge: null, category: 'Apple Watch', image: `${IMG}/db1a61bfe_IMG_1664.jpg`,
    description: 'Apple Watch Series 10 Argento indossato al polso. Comfort assoluto grazie allo spessore ridotto.' },
  { id: 28, name: 'Apple Watch Series 10 — Oro', price: '€449', badge: null, category: 'Apple Watch', image: `${IMG}/124b7c63f_IMG_1655.jpg`,
    description: 'Apple Watch Series 10 in alluminio Oro con cinturino bianco. Eleganza quotidiana e monitoraggio completo.' },
  { id: 29, name: 'Apple Watch Series 10 — Oro Cinturino Bianco', price: '€449', badge: null, category: 'Apple Watch', image: `${IMG}/985a98b88_IMG_1665.jpg`,
    description: 'Apple Watch Series 10 Oro con cinturino Sport bianco. Leggero, resistente all\'acqua, perfetto ogni giorno.' },
  { id: 30, name: 'Apple Watch Series 10 — Oro Rosa', price: '€449', badge: 'Nuovo', category: 'Apple Watch', image: `${IMG}/5819c7c2d_IMG_1657.jpeg`,
    description: 'Apple Watch Series 10 in Oro Rosa. Display ultra-luminoso e watchface completamente rinnovate.' },
  { id: 31, name: 'Apple Watch Series 10 — Cinturino Viola', price: '€449', badge: null, category: 'Apple Watch', image: `${IMG}/6594f9a7e_IMG_1663.jpeg`,
    description: 'Apple Watch Series 10 Oro con cinturino viola. Personalizza il tuo stile con centinaia di combinazioni.' },
  { id: 32, name: 'Apple Watch Series 10 — Cinturino Arancione', price: '€449', badge: null, category: 'Apple Watch', image: `${IMG}/f2bd4d78a_IMG_1659.jpeg`,
    description: 'Apple Watch Series 10 Oro con cinturino arancione. Un tocco di colore per gli allenamenti quotidiani.' },

  // ===== Apple Watch Series 9 =====
  { id: 33, name: 'Apple Watch Series 9 — Grigio', price: '€399', badge: null, category: 'Apple Watch', image: `${IMG}/b76136720_IMG_1656.jpg`,
    description: 'Apple Watch Series 9 grigio con cinturino intrecciato. Chip S9 e gesto Doppio Tocco.' },
  { id: 34, name: 'Apple Watch Series 9 — Loop Milanese', price: '€399', badge: null, category: 'Apple Watch', image: `${IMG}/7d50b1a27_IMG_1662.jpeg`,
    description: 'Apple Watch Series 9 con cinturino intrecciato grigio. Siri on-device e display sempre attivo.' },
  { id: 35, name: 'Apple Watch Series 9 — Cinturino Tessuto', price: '€399', badge: null, category: 'Apple Watch', image: `${IMG}/a86207ae7_IMG_1658.jpeg`,
    description: 'Apple Watch Series 9 grigio con cinturino in tessuto scuro. Comfort e stile per tutto il giorno.' },

  // ===== Apple Watch SE =====
  { id: 36, name: 'Apple Watch SE — Cinturino Verde', price: '€249', badge: null, category: 'Apple Watch', image: `${IMG}/2c75866bd_IMG_1708.png`,
    description: 'Apple Watch SE grigio con cinturino verde. Tutte le funzioni essenziali a un prezzo accessibile.' },

  // ===== AirPods =====
  { id: 37, name: 'AirPods Pro 3 — con Custodia', price: '€279', badge: 'Nuovo', category: 'AirPods', image: `${IMG}/4d51436f9_IMG_1689.jpeg`,
    description: 'AirPods Pro 3 nella custodia di ricarica. Cancellazione del rumore potenziata e ricarica USB-C.' },
  { id: 38, name: 'AirPods Pro 3', price: '€279', badge: 'Nuovo', category: 'AirPods', image: `${IMG}/7db828c51_IMG_1687.jpeg`,
    description: 'AirPods Pro 3 in primo piano. Driver ridisegnati, audio spaziale e adattamento automatico all\'orecchio.' },
  { id: 39, name: 'AirPods 4', price: '€149', badge: null, category: 'AirPods', image: `${IMG}/810651f55_IMG_1688.jpeg`,
    description: 'AirPods 4 con design semi-in-ear rivoluzionato. Comfort e qualità audio superiori senza gommini.' },

  // ===== AirPods Max =====
  { id: 40, name: 'AirPods Max — Blu Cielo', price: '€579', badge: 'Nuovo', category: 'AirPods Max', image: `${IMG}/5c4627e1c_IMG_1710.png`,
    description: 'AirPods Max nella finitura Blu Cielo. Audio spaziale con tracciamento dinamico della testa e ANC leader di categoria.' },
  { id: 41, name: 'AirPods Max — Tutte le Finiture', price: '€579', badge: null, category: 'AirPods Max', image: `${IMG}/a70b6b104_IMG_1709.png`,
    description: 'AirPods Max in tutte le colorazioni disponibili. Archetto in maglia intrecciata e cuscinetti in memory foam.' },

  // ===== iPad =====
  { id: 42, name: 'iPad Pro con Magic Keyboard — Bianco', price: '€1.099', badge: 'Nuovo', category: 'iPad', image: `${IMG}/4d118691e_IMG_1692.jpeg`,
    description: 'iPad Pro bianco con Magic Keyboard, vista dall\'alto. Chip M4 e display Ultra Retina XDR.' },
  { id: 43, name: 'iPad Pro con Magic Keyboard — Grigio Siderale', price: '€1.099', badge: null, category: 'iPad', image: `${IMG}/f35272caa_IMG_1693.jpeg`,
    description: 'iPad Pro Grigio Siderale con Magic Keyboard. Trackpad ampio e tastiera retroilluminata.' },
  { id: 44, name: 'iPad Pro con Magic Keyboard — Vista Frontale', price: '€1.099', badge: null, category: 'iPad', image: `${IMG}/0dc052de1_IMG_1694.jpeg`,
    description: 'iPad Pro bianco con Magic Keyboard in vista frontale. Il tablet più versatile mai realizzato.' },
  { id: 45, name: 'iPad Pro con Magic Keyboard — Profilo', price: '€1.099', badge: null, category: 'iPad', image: `${IMG}/21c121f53_IMG_1695.jpeg`,
    description: 'iPad Pro bianco visto di profilo con Magic Keyboard. Struttura sottile e cerniera flottante.' },
  { id: 46, name: 'iPad Pro con Magic Keyboard — Argento', price: '€1.099', badge: null, category: 'iPad', image: `${IMG}/1c7f85735_IMG_1696.jpeg`,
    description: 'iPad Pro Argento con Magic Keyboard, vista di profilo. Portabilità e potenza da laptop.' },
  { id: 47, name: 'iPad Pro con Magic Keyboard — Retro', price: '€1.099', badge: null, category: 'iPad', image: `${IMG}/57c940bf9_IMG_1697.jpeg`,
    description: 'iPad Pro bianco visto da dietro con Magic Keyboard. Alluminio riciclato e finitura opaca.' },
  { id: 48, name: 'iPad Pro con Magic Keyboard — Nero', price: '€1.199', badge: 'Nuovo', category: 'iPad', image: `${IMG}/17e4d98da_IMG_1698.jpeg`,
    description: 'iPad Pro nero con Magic Keyboard, vista dall\'alto. Il setup professionale definitivo.' },
  { id: 49, name: 'iPad Pro con Magic Keyboard — Nero Profilo', price: '€1.199', badge: null, category: 'iPad', image: `${IMG}/960bf9908_IMG_1699.jpeg`,
    description: 'iPad Pro nero con Magic Keyboard di profilo. Angolo di visione regolabile e digitazione confortevole.' },
  { id: 50, name: 'iPad Pro con Magic Keyboard — Nero Retro', price: '€1.199', badge: null, category: 'iPad', image: `${IMG}/4f2c4607d_IMG_1701.jpeg`,
    description: 'iPad Pro nero in vista posteriore angolata con Magic Keyboard. Design essenziale e materiali premium.' },

  // ===== Mac =====
  { id: 51, name: 'Mac mini', price: '€699', badge: 'Nuovo', category: 'Mac', image: `${IMG}/99e222047_IMG_1702.png`,
    description: 'Mac mini in alluminio argento, vista dall\'alto. Il desktop più compatto con la potenza del chip Apple silicon.' },
  { id: 52, name: 'Mac Studio con Studio Display', price: '€2.399', badge: null, category: 'Mac', image: `${IMG}/6eb07533c_IMG_1703.png`,
    description: 'Mac Studio abbinato a Studio Display. La postazione professionale definitiva per creativi e sviluppatori.' },

  // ===== Accessori =====
  { id: 53, name: 'Magic Keyboard per iPad — Nero', price: '€349', badge: null, category: 'Accessori', image: `${IMG}/e64ed3c7d_IMG_1700.jpeg`,
    description: 'Magic Keyboard per iPad in nero. Trackpad integrato, tasti retroilluminati e porta USB-C passante.' },
  { id: 54, name: 'MagSafe Battery Pack', price: '€109', badge: null, category: 'Accessori', image: `${IMG}/79fd2128e_IMG_1690.jpeg`,
    description: 'Batteria MagSafe bianca. Si aggancia magneticamente all\'iPhone per ricariche extra ovunque tu sia.' },
  { id: 55, name: 'Alimentatore USB-C 20W', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/d7f4e4986_IMG_1649.jpg`,
    description: 'Alimentatore Apple USB-C da 20W. Ricarica rapida per iPhone, iPad e AirPods.' },
  { id: 56, name: 'Alimentatore USB-C Compatto', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/9330a7561_IMG_1650.jpg`,
    description: 'Alimentatore Apple compatto con spinotto integrato. Design pieghevole e sicurezza certificata.' },
  { id: 57, name: 'Alimentatore USB-C — Vista Laterale', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/5c59fa55f_IMG_1651.jpg`,
    description: 'Alimentatore Apple bianco visto di lato. Materiali resistenti e efficienza energetica elevata.' },
  { id: 58, name: 'Alimentatore Apple 30W', price: '€39', badge: null, category: 'Accessori', image: `${IMG}/dbf9ebdb0_IMG_1691.jpeg`,
    description: 'Alimentatore Apple da 30W. Potenza superiore per ricaricare rapidamente iPad Pro e MacBook Air.' },
  { id: 59, name: 'Cavo USB-C 1m', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/65b3e0a90_IMG_1652.jpg`,
    description: 'Cavo Apple USB-C da 1 metro. Ricarica e trasferimento dati ad alta velocità.' },
  { id: 60, name: 'Cavo USB-C 2m', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/6af752a1f_IMG_1653.jpg`,
    description: 'Cavo Apple USB-C da 2 metri. Maggiore libertà di movimento durante la ricarica.' },
  { id: 61, name: 'Cavo di Ricarica Apple', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/62e7a836b_IMG_1654.jpg`,
    description: 'Cavo di ricarica Apple originale bianco. Compatibile con l\'intera gamma di dispositivi USB-C.' },
  { id: 62, name: 'Cavo USB-C Intrecciato', price: '€25', badge: null, category: 'Accessori', image: `${IMG}/07818d309_IMG_1672.jpg`,
    description: 'Cavo Apple USB-C con rivestimento intrecciato. Maggiore durata e resistenza alle piegature.' },

  // ===== Ecosistema =====
  { id: 63, name: 'Ecosistema Apple — Argento', price: '€1.499', badge: null, category: 'Ecosistema', image: `${IMG}/5b70b72a5_IMG_1666.png`,
    description: 'L\'ecosistema Apple in finitura argento: dispositivi che lavorano insieme con Handoff, AirDrop e iCloud.' },
  { id: 64, name: 'Ecosistema Apple — Completo', price: '€1.799', badge: null, category: 'Ecosistema', image: `${IMG}/3e4cbc97a_IMG_1667.png`,
    description: 'La gamma Apple al completo. Continuity, Universal Control e Family Sharing per un\'esperienza senza interruzioni.' },
];

export const CATEGORIES = ['Tutti', 'iPhone', 'Apple Watch', 'AirPods', 'AirPods Max', 'iPad', 'Mac', 'Accessori', 'Ecosistema'];