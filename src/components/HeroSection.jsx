import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCatalog } from '@/lib/useProducts';

export default function HeroSection() {
  const { products } = useCatalog();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  // Product image drifts up slower than the copy while the hero scrolls away.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '18%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '34%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0]);

  const product = products.find(item => item.featured) || products[0];
  const title = product?.name || 'Il meglio della tecnologia.';
  const subtitle = product?.subtitle || 'Scelto con cura. Configurato da te.';
  const image = product?.default_variant?.image || product?.image;

  const entrance = (delay = 0) => ({
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', bounce: 0, duration: 0.7, delay },
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black px-5 pb-4 pt-14 text-white sm:px-8 sm:pt-20">
      {/* Animated aurora backdrop: two drifting gradient blobs kept behind the
          copy. Pure CSS animation, neutralized by prefers-reduced-motion. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -left-32 top-[-20%] h-[420px] w-[420px] rounded-full bg-[#0071e3]/25 blur-3xl sm:h-[560px] sm:w-[560px]" />
        <div className="animate-drift-slow absolute -right-32 top-[10%] h-[380px] w-[380px] rounded-full bg-[#7d4fff]/20 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#f5f5f7]" />
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.p {...entrance(0)} className="text-sm font-semibold text-[#f5f5f7]/70">In evidenza</motion.p>
        <motion.h1
          {...entrance(0.05)}
          style={{ y: copyY, opacity: copyOpacity }}
          className="mx-auto mt-3 max-w-5xl text-5xl font-semibold leading-[.98] tracking-[-0.055em] sm:text-7xl lg:text-[88px]"
        >
          {title}
        </motion.h1>
        <motion.p
          {...entrance(0.1)}
          style={{ y: copyY, opacity: copyOpacity }}
          className="mx-auto mt-5 max-w-2xl text-xl font-medium tracking-[-0.02em] text-[#f5f5f7]/75 sm:text-2xl"
        >
          {subtitle}
        </motion.p>

        <motion.div {...entrance(0.16)} style={{ y: copyY }} className="mt-8 flex flex-wrap items-center justify-center gap-3 px-2 sm:gap-4">
          {product && (
            <Link
              to={`/scheda-prodotto?id=${product.id}`}
              className="rounded-full bg-[#0071e3] px-7 py-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(0,113,227,.45)] transition hover:bg-[#0077ed]"
            >
              Acquista ora
            </Link>
          )}
          <Link to="/catalogo" className="rounded-full border border-white/35 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
            Scopri lo Store
          </Link>
        </motion.div>

        <motion.div
          {...entrance(0.12)}
          style={{ y: imageY }}
          className="relative mx-auto mt-8 aspect-[16/8] w-full max-w-5xl sm:mt-12"
        >
          {image ? (
            <motion.div
              className="h-full w-full"
              animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
              transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image src={image} alt={product?.name || ''} fittingType="fit" quality={92} loading="eager" fetchPriority="high" className="h-full w-full" />
            </motion.div>
          ) : (
            <div className="h-full" />
          )}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] bottom-[-8%] h-16 rounded-full bg-[#0071e3]/30 blur-3xl" />
        </motion.div>

        <motion.div
          {...entrance(0.4)}
          className="pointer-events-none absolute inset-x-0 -bottom-9 hidden justify-center sm:flex"
          aria-hidden="true"
        >
          <motion.div animate={reduceMotion ? undefined : { y: [0, 6, 0] }} transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown size={22} className="text-[#6e6e73]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
