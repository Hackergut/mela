// Specifiche tecniche chiave per confronto tra prodotti simili
// Chiave = id prodotto, valore = coppie etichetta/valore differenzianti

const IPHONE_17_PRO = { Schermo: '6,3" ProMotion 120Hz', Chip: 'A19 Pro', Fotocamera: 'Tripla 48MP + 5x', Materiale: 'Alluminio forgiato' };
const IPHONE_17 = { Schermo: '6,1" Super Retina XDR', Chip: 'A19', Fotocamera: 'Doppia 48MP', Materiale: 'Alluminio' };
const IPHONE_17_AIR = { Schermo: '6,6" OLED 120Hz', Chip: 'A19', Fotocamera: 'Singola 48MP', Materiale: 'Titanio 5,6mm' };
const IPHONE_16 = { Schermo: '6,1" Super Retina XDR', Chip: 'A18', Fotocamera: 'Doppia 48MP', Materiale: 'Alluminio' };
const WATCH_10 = { Cassa: 'Alluminio 42mm', Display: 'Always-On LTPO3', Autonomia: '18 ore', Resistenza: 'WR50 + IP6X' };
const WATCH_9 = { Cassa: 'Alluminio 45mm', Display: 'Always-On LTPO2', Autonomia: '18 ore', Resistenza: 'WR50 + IP6X' };
const WATCH_SE = { Cassa: 'Alluminio 44mm', Display: 'Retina LTPO', Autonomia: '18 ore', Resistenza: 'WR50' };
const AIRPODS_PRO = { Modello: 'Pro 3', ANC: 'Sì adattiva', Autonomia: '6 ore (30h case)', Ricarica: 'USB-C / MagSafe' };
const AIRPODS_4 = { Modello: 'AirPods 4', ANC: 'Opzionale', Autonomia: '5 ore (30h case)', Ricarica: 'USB-C' };
const AIRPODS_MAX = { Driver: '40mm dinamico', ANC: 'Sì adattiva', Autonomia: '20 ore', Ricarica: 'USB-C' };
const IPAD_PRO = { Schermo: '13" Ultra Retina XDR', Chip: 'M4', Accessorio: 'Magic Keyboard', Connettività: 'Wi-Fi 6E + USB-C' };
const MAC_MINI = { Chip: 'M4', Memoria: '16GB unificata', Archiviazione: '256GB SSD', Porte: 'Thunderbolt 4 x3' };
const MAC_STUDIO = { Chip: 'M4 Max', Memoria: '36GB unificata', Archiviazione: '512GB SSD', Display: 'Studio Display 27"' };
const ACCESSORIO = { Compatibilità: 'Dispositivi USB-C Apple', Garanzia: '1 anno', Origine: 'Apple originale' };
const ECOSISTEMA = { Dispositivi: 'iPhone + iPad + Mac + Watch', Integrazione: 'Continuity / Handoff', Cloud: 'iCloud+', Condivisione: 'Family Sharing' };

export const PRODUCT_KEY_SPECS = {
  // iPhone
  1: IPHONE_17_PRO,
  2: IPHONE_17_AIR,
  3: IPHONE_17,
  4: IPHONE_16,
  // Apple Watch
  25: WATCH_10, 26: WATCH_10, 27: WATCH_10, 28: WATCH_10, 29: WATCH_10,
  30: WATCH_10, 31: WATCH_10, 32: WATCH_10,
  33: WATCH_9, 34: WATCH_9, 35: WATCH_9,
  36: WATCH_SE,
  // AirPods
  37: AIRPODS_PRO, 38: AIRPODS_PRO, 39: AIRPODS_4,
  40: AIRPODS_MAX, 41: AIRPODS_MAX,
  // iPad
  42: IPAD_PRO, 43: IPAD_PRO, 44: IPAD_PRO, 45: IPAD_PRO, 46: IPAD_PRO,
  47: IPAD_PRO, 48: IPAD_PRO, 49: IPAD_PRO, 50: IPAD_PRO,
  // Mac
  51: MAC_MINI, 52: MAC_STUDIO,
  // Accessori
  53: ACCESSORIO, 54: ACCESSORIO, 55: ACCESSORIO, 56: ACCESSORIO, 57: ACCESSORIO,
  58: ACCESSORIO, 59: ACCESSORIO, 60: ACCESSORIO, 61: ACCESSORIO, 62: ACCESSORIO,
  // Ecosistema
  63: ECOSISTEMA, 64: ECOSISTEMA,
};