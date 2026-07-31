import React, { useState, useEffect, useRef } from 'react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoriesSection from '@/components/CategoriesSection';
import PopularProducts from '@/components/PopularProducts';
import TestimonialsSection from '@/components/TestimonialsSection';
import AboutSection from '@/components/AboutSection';
import BlogSection from '@/components/BlogSection';
import NewsletterSection from '@/components/NewsletterSection';
import FooterSection from '@/components/FooterSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <PopularProducts />
        <TestimonialsSection />
        <AboutSection />
        <BlogSection />
        <NewsletterSection />
      </main>
      <FooterSection />
    </div>
  );
}