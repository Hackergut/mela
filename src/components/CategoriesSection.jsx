import React from 'react';
import { Image } from '@/components/ui/image';

const CATEGORIES = [
  {
    id: 'outdoor',
    name: 'iPhone',
    count: '17 pcs',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/987e67b20_IMG_1320.jpg',
    span: 'col-span-1',
  },
  {
    id: 'sound',
    name: 'Sound Essentials',
    count: '14 pcs',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/9b1c8739d_IMG_1321.jpg',
    span: 'col-span-1',
  },
  {
    id: 'video',
    name: 'Apple Watch',
    count: '14 pcs',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/f7626e709_IMG_1322.jpg',
    span: 'col-span-1',
  },
  {
    id: 'bestsellers',
    name: 'Best Sellers',
    count: '20 pcs',
    image: 'https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/902e6c914_IMG_1323.jpg',
    span: 'col-span-1',
  },
];

export default function CategoriesSection() {
  return (
    <section id="categories" className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Explore</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Uncover <span className="text-[#FF6B35]">The Most</span><br />Innovative Products.
          </h2>
          <p className="mt-4 text-[#6e6e73] text-base max-w-md mx-auto">
            Exploring the tech and design shaping the world of tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white cursor-pointer"
      style={{ minHeight: '380px' }}
    >
      <div className="absolute inset-0">
        <Image
          src={cat.image}
          alt={cat.name}
          className="w-full h-full"
          fittingType="fill"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
        <p className="text-white/70 text-sm font-medium">{cat.count}</p>
      </div>
      <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <path d="M3 8h10M8 3l5 5-5 5"/>
          <path stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M3 8h10M8 3l5 5-5 5"/>
        </svg>
      </div>
    </div>
  );
}