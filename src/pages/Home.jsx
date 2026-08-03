import React, { useState, useEffect, useRef } from 'react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import InteractiveSpecsSection from '@/components/InteractiveSpecsSection';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturesSection from '@/components/FeaturesSection';
import PopularProducts from '@/components/PopularProducts';
import CompareSection from '@/components/CompareSection';
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
        <InteractiveSpecsSection />
        <CategoriesSection />
        <FeaturesSection />
        <PopularProducts />
        <CompareSection />
        <TestimonialsSection />
        <AboutSection />
        <BlogSection />
        <NewsletterSection />
      </main>
      <FooterSection />
    </div>
  );
}