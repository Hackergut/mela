import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCatalog } from '@/lib/useProducts';

// Dark Apple-style showcase: the featured product scales in while the
// section scrolls through the viewport, copy reveals with a stagger.
export default function SpotlightSection() {
  const { products } = useCatalog();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0.88, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['8%', '0%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 0.55]);

  const product = products.find(item => item.featured) || products[0];
  const image = product?.default_variant?.image || product?.image;
  const specs = Object.entries(product?.specs || {}).slice(0, 3);

  return (
    <section ref={sectionRef} aria-labelledby="spotlight-title" className="relative overflow-hidden bg-[#1d1d1f] px-5 py-24 text-white sm:px-8 md:py-32">
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#0071e3]/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#a1a1a6]"
        >
          <Sparkles size={13} aria-hidden="true" /> Lo spotlight
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.05 }}
          id="spotlight-title"
          className="mx-auto mt-6 max-w-4xl bg-gradient-to-r from-white via-[#bfdcff] to-[#c9b8ff] bg-clip-text text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-transparent sm:text-6xl md:text-7xl"
        >
          {product?.name || 'Tecnologia che si sente.'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#a1a1a6] sm:text-lg"
        >
          {product?.subtitle || 'Materiali, prestazioni e dettagli curati in ogni configurazione.'}
        </motion.p>

        {specs.length > 0 && (
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ staggerChildren: 0.1 }}
            className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5"
          >
            {specs.map(([key, value]) => (
              <motion.li
                key={key}
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm"
              >
                <span className="text-[#86868b]">{key}:</span> {value}
              </motion.li>
            ))}
          </motion.ul>
        )}

        <motion.div style={{ scale, y: imageY }} className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-5xl sm:mt-14">
          {image ? (
            <Image src={image} alt="" fittingType="fit" quality={90} className="h-full w-full" />
          ) : (
            <div className="h-full" />
          )}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] bottom-[-6%] h-14 rounded-full bg-[#0071e3]/30 blur-3xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10"
        >
          <Link
            to={product ? `/scheda-prodotto?id=${product.id}` : '/catalogo'}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
          >
            {product ? 'Configura il tuo' : 'Vai al catalogo'} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
