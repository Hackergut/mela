import React from 'react';
import { Image } from '@/components/ui/image';

const STATS = [
  { value: '50+', label: 'Official Partners' },
  { value: '12K+', label: 'Community Members' },
  { value: '3K+', label: 'Orders This Month' },
  { value: '4.9★', label: 'Average Review' },
];

export default function AboutSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">About Us</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            Learn More About Us
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            Discover our story, values, and what we stand for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden aspect-video lg:aspect-auto lg:h-96">
            <Image
              src="https://media.base44.com/images/public/user_6a6d2ae9b2386fa15db72587/9b1c8739d_IMG_1321.jpg"
              alt="Apple team ecosystem"
              className="w-full h-full"
              fittingType="fill"
            />
          </div>

          <div>
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M9 2l1.5 3h3.5l-2.5 2 1 3L9 8.5 6.5 10l1-3L5 5h3.5L9 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f] mb-1">Well-Designed Products</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">We focus on products where form, function, and thoughtful design come together.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="12" height="12" rx="2"/>
                    <path d="M6 9h6M9 6v6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f] mb-1">Modern Tech Selection</h3>
                  <p className="text-sm text-[#6e6e73] leading-relaxed">A curated range of tech products built for everyday use and creative workflows.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {STATS.map(({ value, label }) => (
                <div key={label} className="bg-[#f5f5f7] rounded-2xl p-5">
                  <p className="text-3xl font-bold text-[#1d1d1f] mb-1">{value}</p>
                  <p className="text-sm text-[#6e6e73] font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}