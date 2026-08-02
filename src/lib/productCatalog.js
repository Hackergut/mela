// Catalogo prodotti — ogni voce è verificata visivamente sull'asset reale.
// Ordine: per categoria, poi per modello (dal più recente/premium).
// Ogni modello iPhone ha la propria sequenza fotografica per colore,
// con la vista frontale come immagine di copertina.

const IMG = 'https://media.base44.com/images/public/6a6d2bc9b1aeaa69d847a02b';

// Mappa numero IMG → hash filename (fonte: upload utente)
const F = {
  1295: '76aefad66_IMG_1295.jpg', 1296: '70e634c18_IMG_1296.jpg',
  1297: '5578b821e_IMG_1297.jpg', 1298: 'bbda7f8d5_IMG_1298.jpeg',
  1299: '0f962b8eb_IMG_1299.jpg', 1300: '64ae3c35e_IMG_1300.jpg',
  1301: 'dc3475c22_IMG_1301.jpg', 1302: '9e84bac97_IMG_1302.jpg',
  1303: '0b28684d1_IMG_1303.jpg', 1304: '6b5acdb0e_IMG_1304.jpg',
  1305: '2f06f22da_IMG_1305.jpg', 1306: '5bc54371d_IMG_1306.jpeg',
  1307: 'f906a9640_IMG_1307.jpeg', 1308: 'efe70b260_IMG_1308.jpeg',
  1309: 'c64ff6eb9_IMG_1309.jpeg', 1310: '35b3254b3_IMG_1310.jpeg',
  1311: 'd9504af1d_IMG_1311.jpeg', 1312: '553a20f77_IMG_1312.jpeg',
  1313: '886572deb_IMG_1313.jpeg', 1314: '26ebedd28_IMG_1314.jpg',
  1315: '52b0d0ff8_IMG_1315.jpg', 1316: 'c8e407410_IMG_1316.jpg',
  1317: '7ed40f2da_IMG_1317.jpeg', 1318: 'e9b66d117_IMG_1318.jpg',
  1319: '48d8e39a4_IMG_1319.jpg', 1320: '5ad39c962_IMG_1320.jpg',
  1321: '3633f9bbc_IMG_1321.jpg', 1322: 'c39c15cf5_IMG_1322.jpg',
  1323: '7df602220_IMG_1323.jpg', 1324: '1ec3dd18f_IMG_1324.jpg',
  1325: '3614dec72_IMG_1325.jpg', 1326: '6cae900b8_IMG_1326.jpeg',
  1327: '9bdade9d0_IMG_1327.jpg', 1328: '6d345261e_IMG_1328.jpeg',
  1329: '896a25809_IMG_1329.jpg', 1330: '38439f724_IMG_1330.jpeg',
  1331: '74c0cfb7d_IMG_1331.jpeg', 1332: '2c53614ff_IMG_1332.jpg',
  1333: 'ab83b610b_IMG_1333.jpeg', 1334: '8457cec8a_IMG_1334.jpeg',
  1335: '2d7a8a633_IMG_1335.jpg', 1336: '09e343186_IMG_1336.jpg',
  1337: 'f130cc7d4_IMG_1337.jpeg', 1338: '5454665f9_IMG_1338.jpg',
  1339: 'fb17e0932_IMG_1339.jpg', 1340: '746304ada_IMG_1340.jpeg',
  1341: '795d4c39f_IMG_1341.jpg', 1342: '663fe741b_IMG_1342.jpg',
  1343: '48b6cd12c_IMG_1343.jpg', 1344: '1f08fcde6_IMG_1344.jpg',
  1345: '9ad215d79_IMG_1345.jpeg',
  1366: '3cc84f946_IMG_1366.jpeg', 1367: '3d1fbbb50_IMG_1367.jpeg',
  1368: 'a76e0c071_IMG_1368.jpg', 1369: 'da91a4c6d_IMG_1369.jpeg',
  1370: '2899f9f34_IMG_1370.jpeg', 1371: '7e659ef35_IMG_1371.jpg',
  1372: 'f092dd142_IMG_1372.jpeg', 1373: '60d961e12_IMG_1373.jpeg',
  1374: '6ab2c7781_IMG_1374.jpeg', 1375: 'ddc2229bf_IMG_1375.jpg',
  1377: '79ac30b5a_IMG_1377.jpg', 1378: '1edb11828_IMG_1378.jpg',
  1379: '64f71c059_IMG_1379.jpg', 1380: '5989e89a6_IMG_1380.jpg',
  1381: '06d79399c_IMG_1381.jpg', 1382: 'f8d8a98e5_IMG_1382.jpg',
  1383: '79f29338d_IMG_1383.jpg', 1384: 'b2ae9d68b_IMG_1384.jpg',
  1385: 'b31d7cfaf_IMG_1385.jpg', 1386: '715822b05_IMG_1386.jpg',
  1387: 'b90f1bdac_IMG_1387.jpg', 1388: '7d53ac023_IMG_1388.jpg',
  1389: '721e5fbc6_IMG_1389.jpg', 1390: 'e268e6c68_IMG_1390.jpg',
  1391: '5d20d5c84_IMG_1391.jpg', 1392: '23ddfa8ac_IMG_1392.jpg',
  1393: '5929b1410_IMG_1393.jpeg', 1394: 'ad0cf005a_IMG_1394.jpeg',
  1395: '22def97db_IMG_1395.jpeg', 1396: 'f0906daee_IMG_1396.jpg',
  1398: 'bfa45b537_IMG_1398.jpg', 1399: '1787e55e5_IMG_1399.jpg',
  1400: 'f948c58fe_IMG_1400.jpg', 1401: 'f92494d57_IMG_1401.jpg',
  1402: '969de478d_IMG_1402.jpg', 1403: '172306ac8_IMG_1403.jpg',
  1406: 'bc7c6dcf3_IMG_1406.jpg', 1407: 'b498a429f_IMG_1407.jpg',
  1408: 'afa2a7b74_IMG_1408.jpg', 1409: '96ce7128d_IMG_1409.jpg',
  1410: 'e9c4070bd_IMG_1410.jpg', 1411: 'cb8866e12_IMG_1411.jpeg',
  1412: '61c6cad1c_IMG_1412.jpeg', 1413: 'cc62ba56e_IMG_1413.jpeg',
  1414: 'db0de4852_IMG_1414.jpg', 1415: 'ed33fa708_IMG_1415.jpg',
  1416: '7774be8ba_IMG_1416.jpg', 1417: '85d207e58_IMG_1417.jpeg',
  1418: 'ab902d7a8_IMG_1418.jpg', 1419: '156c18ea1_IMG_1419.jpeg',
  1420: '9d5e36de0_IMG_1420.jpeg', 1421: 'ecf6079ca_IMG_1421.jpg',
  1422: 'fc8d1b18e_IMG_1422.jpeg', 1423: '33078b2d7_IMG_1423.jpg',
  1424: 'dfad94ace_IMG_1424.jpg', 1425: '362ec38cc_IMG_1425.jpg',
  1426: '0b5f82c49_IMG_1426.jpeg', 1427: '69cce5fa8_IMG_1427.jpeg',
  1428: '341faaecd_IMG_1428.jpg', 1429: '47962cf13_IMG_1429.jpg',
  1430: 'da667bf7f_IMG_1430.jpg', 1433: '180a54ad0_IMG_1433.jpg',
  1434: '7f09dfff4_IMG_1434.jpg', 1435: '10a8359ce_IMG_1435.jpeg',
  1441: '360b75172_IMG_1441.jpg', 1442: '41a906479_IMG_1442.jpg',
  1443: '225bc9941_IMG_1443.jpeg', 1444: 'a96aaa24f_IMG_1444.jpg',
  1445: 'ab0695547_IMG_1445.jpeg', 1446: '91e35d76a_IMG_1446.jpg',
  1447: '16ca9e825_IMG_1447.jpg', 1448: '3dce44be8_IMG_1448.jpg',
  1449: '415fe602b_IMG_1449.jpg', 1450: 'ea2b34ef7_IMG_1450.jpeg',
  1612: '92a78542c_IMG_1612.jpeg', 1613: '2b7bb2285_IMG_1613.jpeg',
  1614: 'fcdab88ed_IMG_1614.jpeg', 1615: '1b1ae67d9_IMG_1615.jpeg',
  1616: 'ceaade948_IMG_1616.jpeg', 1618: '4a4308dc7_IMG_1618.jpeg',
  1619: '2d6075db4_IMG_1619.jpeg', 1620: '66fb62aaa_IMG_1620.jpeg',
  1621: '7995b7b7b_IMG_1621.jpeg', 1622: 'f19bf99fa_IMG_1622.jpeg',
  1623: 'ce3eafd4e_IMG_1623.jpeg', 1624: '27b1a4d33_IMG_1624.jpeg',
  1625: 'b4b83bd79_IMG_1625.jpeg', 1626: 'bf778e6ba_IMG_1626.jpeg',
  1627: 'b04deb1f3_IMG_1627.jpeg', 1628: '1862a2785_IMG_1628.jpeg',
  1629: '00ddc9eb1_IMG_1629.jpeg', 1630: '4b3c10e15_IMG_1630.jpeg',
  1631: '48e14150c_IMG_1631.jpeg', 1632: 'd9e612d81_IMG_1632.jpeg',
  1633: '3568bc7b8_IMG_1633.jpeg', 1634: '1fb9d2493_IMG_1634.jpeg',
  1635: '5845a5313_IMG_1635.jpeg', 1636: 'c060ebe5a_IMG_1636.jpeg',
  1637: '4a17a2b4a_IMG_1637.jpeg', 1638: '1a8e1a31a_IMG_1638.jpeg',
  1639: '337599b74_IMG_1639.jpeg', 1640: '2057a375a_IMG_1640.jpeg',
  1641: '35b98190d_IMG_1641.jpeg', 1643: '7a85da9b5_IMG_1643.jpeg',
  1644: 'd48047060_IMG_1644.jpeg', 1645: '1359a7e4c_IMG_1645.jpeg',
  1646: 'd8a3b2149_IMG_1646.jpeg',
  1668: 'f019257e4_IMG_1668.webp', 1680: 'ae641e019_IMG_1680.webp',
  1681: 'c70e8d070_IMG_1681.webp', 1682: '1f7ebcf94_IMG_1682.webp',
  1683: '6c5797e77_IMG_1683.webp',
};

const u = (n) => `${IMG}/${F[n]}`;
const gallery = (...nums) => nums.map(u);

// ===== iPhone 17 Pro — 4 colori (copertina = vista frontale) =====
const PRO_ORANGE = gallery(1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1632,1633,1668);
const PRO_BLUE   = gallery(1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1634,1635,1680);
const PRO_SILVER = gallery(1315,1316,1317,1318,1319,1320,1321,1322,1323,1324,1636,1637,1681);
const PRO_BLACK  = gallery(1325,1326,1327,1328,1329,1330,1331,1332,1333,1334,1638,1639,1682);

const IPHONE_17_PRO_IMAGES = [...PRO_ORANGE, ...PRO_BLUE, ...PRO_SILVER, ...PRO_BLACK];
export const IPHONE_17_PRO_COLORS = [
  { name: 'Arancione Cosmico', hex: '#E85D2F', image: PRO_ORANGE[0] },
  { name: 'Blu', hex: '#3B5B7A', image: PRO_BLUE[0] },
  { name: 'Argento', hex: '#D8D8DC', image: PRO_SILVER[0] },
  { name: 'Nero Spazio', hex: '#2C2C2E', image: PRO_BLACK[0] },
];

// ===== iPhone 17 — 5 colori =====
const STD_BLUE   = gallery(1335,1336,1337,1338,1339,1340,1341,1342,1640,1683);
const STD_PINK   = gallery(1343,1344,1345,1366,1367,1368,1369,1370);
const STD_GREEN  = gallery(1371,1372,1373,1374,1375,1377,1378,1379);
const STD_YELLOW = gallery(1380,1381,1382,1383,1384,1385,1386,1387);
const STD_SILVER = gallery(1388,1389,1390,1391,1392,1393,1394,1395);

const IPHONE_17_IMAGES = [...STD_BLUE, ...STD_PINK, ...STD_GREEN, ...STD_YELLOW, ...STD_SILVER];
export const IPHONE_17_COLORS = [
  { name: 'Blu', hex: '#5B7DA0', image: STD_BLUE[0] },
  { name: 'Rosa', hex: '#E7B5C0', image: STD_PINK[0] },
  { name: 'Verde', hex: '#4E6B54', image: STD_GREEN[0] },
  { name: 'Giallo', hex: '#E8C547', image: STD_YELLOW[0] },
  { name: 'Argento', hex: '#D8D8DC', image: STD_SILVER[0] },
];

// ===== iPhone 17 Air — 3 colori =====
const AIR_BLUE  = gallery(1396,1398,1399,1400,1401,1402,1403,1406,1641,1643);
const AIR_WHITE = gallery(1407,1408,1409,1410,1411,1412,1413,1414);
const AIR_GOLD  = gallery(1415,1416,1417,1418,1419,1420,1421,1422);

const IPHONE_17_AIR_IMAGES = [...AIR_BLUE, ...AIR_WHITE, ...AIR_GOLD];
export const IPHONE_17_AIR_COLORS = [
  { name: 'Azzurro', hex: '#7BA7C9', image: AIR_BLUE[0] },
  { name: 'Bianco', hex: '#E8E8EC', image: AIR_WHITE[0] },
  { name: 'Oro Scuro', hex: '#8B7355', image: AIR_GOLD[0] },
];

// ===== iPhone 16 — 5 colori =====
const I16_BLUE  = gallery(1423,1424,1425,1426,1427,1428,1429,1430,1644,1645,1646);
const I16_PINK  = gallery(1433,1434,1435,1441,1442,1443,1444,1445);
const I16_GREEN = gallery(1446,1447,1448,1449,1450,1612,1613,1614);
const I16_CREAM = gallery(1615,1616,1618,1619,1620,1621,1622,1623);
const I16_BLACK = gallery(1624,1625,1626,1627,1628,1629,1630,1631);

const IPHONE_16_IMAGES = [...I16_BLUE, ...I16_PINK, ...I16_GREEN, ...I16_CREAM, ...I16_BLACK];
export const IPHONE_16_COLORS = [
  { name: 'Blu', hex: '#5B7DA0', image: I16_BLUE[0] },
  { name: 'Rosa', hex: '#E7B5C0', image: I16_PINK[0] },
  { name: 'Verde', hex: '#4E6B54', image: I16_GREEN[0] },
  { name: 'Crema', hex: '#E5DCC8', image: I16_CREAM[0] },
  { name: 'Nero', hex: '#2C2C2E', image: I16_BLACK[0] },
];

// Alias per retrocompatibilità (componenti che importano IPHONE_GALLERY)
export const IPHONE_GALLERY = PRO_ORANGE;
export const IPHONE_17_PRO_GALLERY = PRO_ORANGE;

export const PRODUCT_CATALOG = [
  // ===== iPhone =====
  {
    id: 1,
    name: 'iPhone 17 Pro',
    price: '€1.199',
    badge: 'Nuovo',
    category: 'iPhone',
    image: PRO_ORANGE[0],
    images: IPHONE_17_PRO_IMAGES,
    colors: IPHONE_17_PRO_COLORS,
    description: 'iPhone 17 Pro con chip A19 Pro vapor-cooled, struttura in alluminio forgiato e display ProMotion da 6,3". Sistema fotocamera Pro con tripla lente 48MP e teleobiettivo 5x.',
  },
  {
    id: 2,
    name: 'iPhone 17 Air',
    price: '€999',
    badge: 'Nuovo',
    category: 'iPhone',
    image: AIR_BLUE[0],
    images: IPHONE_17_AIR_IMAGES,
    colors: IPHONE_17_AIR_COLORS,
    description: 'iPhone 17 Air, il più sottile mai realizzato con soli 5,6 mm di spessore. Chip A19, display OLED da 6,6" e fotocamera 48MP in un corpo leggerissimo.',
  },
  {
    id: 3,
    name: 'iPhone 17',
    price: '€899',
    badge: 'Nuovo',
    category: 'iPhone',
    image: STD_BLUE[0],
    images: IPHONE_17_IMAGES,
    colors: IPHONE_17_COLORS,
    description: 'iPhone 17 con chip A19, doppia fotocamera da 48MP e display Super Retina XDR da 6,1". Disponibile in cinque colorazioni.',
  },
  {
    id: 4,
    name: 'iPhone 16',
    price: '€799',
    badge: null,
    category: 'iPhone',
    image: I16_BLUE[0],
    images: IPHONE_16_IMAGES,
    colors: IPHONE_16_COLORS,
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