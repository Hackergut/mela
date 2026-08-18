import React, { useMemo, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCatalog } from '@/lib/useProducts';

// Apple.com-style homepage: a stack of large promo "tiles". Each tile has a
// deliberate background, one product, headline and two quiet links.
export default function HeroSection() {
  const { products } = useCatalog();
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  const hero = useMemo(() => {
    const find = (re) => products.find((p) => re.test(p.name));
    const flagship = find(/iPhone 17 Pro/i) || products[0];
    const secondary = find(/MacBook|Mac (mini|Studio|Pro)|iPad Pro/i);
    const tertiary = find(/Apple Watch|AirPods/i);
    return { flagship, secondary, tertiary };
  }, [products]);

  const img = (p) => p?.default_variant?.image || p?.image;

  return (
    <section ref={sectionRef} className="bg-[#f5f5f7] px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-[1100px]">
        <Tile
          dark
          eyebrow="Nuovo"
          title={hero.flagship?.name || 'iPhone 17 Pro'}
          subtitle={hero.flagship?.subtitle || 'Progettato per essere leggendario.'}
          image={img(hero.flagship)}
          href={hero.flagship ? `/scheda-prodotto?id=${hero.flagship.id}` : '/catalogo'}
          imageY={imageY}
          reduceMotion={reduceMotion}
        />

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {hero.secondary && (
            <Tile
              eyebrow="Performance"
              title={hero.secondary.name.replace(/^Apple /, '')}
              subtitle="Potenza Apple silicon."
              image={img(hero.secondary)}
              href={`/scheda-prodotto?id=${hero.secondary.id}`}
              reduceMotion={reduceMotion}
              compact
            />
          )}
          {hero.tertiary && (
            <Tile
              dark
              eyebrow="Wearable"
              title={hero.tertiary.name.replace(/^Apple /, '')}
              subtitle="Tecnologia da polso."
              image={img(hero.tertiary)}
              href={`/scheda-prodotto?id=${hero.tertiary.id}`}
              reduceMotion={reduceMotion}
              compact
            />
          )}
        </div>
      </div>

      <div className="pointer-events-none flex justify-center py-6" aria-hidden="true">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={22} className="text-[#86868b]" />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * @param {object} props
 * @param {boolean} [props.dark]
 * @param {string} props.eyebrow
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} [props.image]
 * @param {string} props.href
 * @param {any} [props.imageY]
 * @param {boolean} [props.reduceMotion]
 * @param {boolean} [props.compact]
 */
function Tile({ dark = false, eyebrow, title, subtitle, image, href, imageY, reduceMotion, compact = false }) {
  const bg = dark ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#1d1d1f]';
  const subColor = dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]';
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-[28px] ${bg} ${compact ? 'min-h-[520px]' : 'min-h-[620px]'}`}
    >
      <div className="relative z-10 flex flex-col items-center px-6 pt-12 text-center sm:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0071e3]">{eyebrow}</p>
        <h2
          className={`mt-3 max-w-3xl font-semibold leading-[1.05] tracking-[-0.03em] ${
            compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl lg:text-6xl'
          }`}
        >
          {title}
        </h2>
        {subtitle && <p className={`mt-3 max-w-md text-base sm:text-lg ${subColor}`}>{subtitle}</p>}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm font-medium">
          <Link
            to={href}
            className="rounded-full bg-[#0071e3] px-6 py-2.5 text-white transition-colors hover:bg-[#0077ed]"
          >
            Acquista
          </Link>
          <Link to={href} className="inline-flex items-center gap-1 text-[#2997ff] hover:underline">
            Scopri di più
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 3l5 5-5 5" />
            </svg>
          </Link>
        </div>
      </div>

      {image && (
        <motion.div
          style={imageY ? { y: imageY } : undefined}
          className={`pointer-events-none absolute inset-x-0 flex justify-center ${compact ? 'bottom-[-4%] h-[62%]' : 'bottom-[-2%] h-[60%]'}`}
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={reduceMotion ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-full w-[88%] max-w-3xl"
          >
            <Image
              src={image}
              alt={title}
              fittingType="fit"
              quality={92}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full"
            />
          </motion.div>
          {dark && <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[60%] -translate-x-1/2 rounded-full bg-[#0071e3]/25 blur-3xl" />}
        </motion.div>
      )}
    </motion.div>
  );
}
