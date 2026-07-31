import React from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

const BLOGS = [
  {
    id: 1,
    title: 'Il Tuo Setup Tecnologico',
    excerpt: 'Costruire un setup che funziona per te parte dalla chiarezza, non dalla complessità.',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/902e6c914_IMG_1323.jpg',
    tag: 'Lifestyle',
  },
  {
    id: 2,
    title: 'Design del Prodotto Moderno',
    excerpt: 'Dove la tecnologia incontra l\'intenzione, la semplicità e il valore a lungo termine.',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/97f593e8b_IMG_1343.jpg',
    tag: 'Design',
  },
  {
    id: 3,
    title: 'Sui Nostri Prodotti',
    excerpt: 'Uno sguardo trasparente sugli standard, il pensiero e la filosofia dietro i nostri prodotti.',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/87b8a282b_IMG_1368.jpg',
    tag: 'Brand',
  },
];

export default function BlogSection() {
  return (
    <section id="blogs" className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Blog</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
              Scopri il Nostro Blog
            </h2>
            <p className="mt-3 text-[#6e6e73] max-w-sm">
              Esplora storie, consigli e approfondimenti che contano.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            className="self-start md:self-auto px-6 py-3 text-sm font-semibold text-[#1d1d1f] border border-[#d2d2d7] rounded-full hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
          >
            Altri Articoli
          </motion.button>
        </motion.div>

        <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BLOGS.map((blog) => (
            <motion.article
              key={blog.id}
              {...staggerItem}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="group bg-white rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="relative overflow-hidden" style={{ paddingBottom: '66%' }}>
                <div className="absolute inset-0">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                    fittingType="fill"
                  />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#1d1d1f] rounded-full">
                    {blog.tag}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-[#1d1d1f] mb-2 group-hover:text-[#FF6B35] transition-colors">{blog.title}</h3>
                <p className="text-sm text-[#6e6e73] leading-relaxed">{blog.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}