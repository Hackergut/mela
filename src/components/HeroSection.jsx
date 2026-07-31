import React from 'react';

export default function HeroSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="bg-white pt-16 pb-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-4">
          New Arrivals 2025
        </p>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1d1d1f] leading-[1.08] tracking-tight mb-6">
          Uncover{' '}
          <span className="text-[#FF6B35]">The Most</span>
          <br />
          Innovative Products.
        </h1>
        <p className="text-lg text-[#6e6e73] max-w-xl mx-auto mb-10 leading-relaxed">
          Exploring the tech and design shaping the world of tomorrow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => scrollTo('categories')}
            className="px-8 py-3.5 bg-[#1d1d1f] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B35] transition-colors duration-200"
          >
            Browse Categories
          </button>
          <button
            onClick={() => scrollTo('products')}
            className="px-8 py-3.5 bg-transparent text-[#1d1d1f] text-sm font-semibold rounded-full border border-[#d2d2d7] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors duration-200"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}