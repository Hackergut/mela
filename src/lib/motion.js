import { motion } from 'framer-motion';

// Animazione fade-up al scroll
export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

// Stagger container per griglie
export const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.08 },
  },
  viewport: { once: true, margin: '-60px' },
};

// Singolo item con stagger
export const staggerItem = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

// Hero entrance
export const heroEntrance = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

// Hover scale per card
export const hoverScale = {
  whileHover: { scale: 1.02 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export { motion };