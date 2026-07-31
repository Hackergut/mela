import React, { useState } from 'react';

const TESTIMONIALS = [
  {
    id: 1,
    text: "The build quality is excellent and the overall experience feels premium. Setup was straightforward and everything worked as expected.",
    name: "Ethan Brooks",
    role: "Director",
    avatar: "EB",
    color: "bg-blue-500",
  },
  {
    id: 2,
    text: "Everything works as expected and feels well put together. Setup was easy and the experience has been smooth so far.",
    name: "Ava Mitchell",
    role: "Creative Director",
    avatar: "AM",
    color: "bg-purple-500",
  },
  {
    id: 3,
    text: "The overall experience feels balanced and well executed. Setup took only a few minutes and worked without issues.",
    name: "Ethan Walker",
    role: "Brand Designer",
    avatar: "EW",
    color: "bg-green-500",
  },
  {
    id: 4,
    text: "It integrates well into an existing setup and doesn't require much adjustment. After a short setup, it was ready to use.",
    name: "Emily Collins",
    role: "Sound Designer",
    avatar: "EC",
    color: "bg-pink-500",
  },
  {
    id: 5,
    text: "The quality is immediately noticeable and it feels great to use. Everything works smoothly and the overall experience is genuinely satisfying.",
    name: "James Walker",
    role: "Music Producer",
    avatar: "JW",
    color: "bg-orange-500",
  },
  {
    id: 6,
    text: "You can tell right away that this is a well-made product. It feels reliable, thoughtfully designed, and enjoyable to use.",
    name: "Isabella Reed",
    role: "Audio Engineer",
    avatar: "IR",
    color: "bg-teal-500",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FF6B35] mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight">
            See what our customers<br />think about us.
          </h2>
          <p className="mt-4 text-[#6e6e73] max-w-md mx-auto">
            Read real reviews from people who use our products every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FF6B35">
                    <path d="M8 1l1.9 3.9L14 5.6l-3 2.9.7 4.1L8 10.4l-3.7 2.2.7-4.1L2 5.6l4.1-.7L8 1z"/>
                  </svg>
                ))}
              </div>
              <p className="text-[#1d1d1f] text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#f5f5f7]">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{t.name}</p>
                  <p className="text-xs text-[#6e6e73]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}