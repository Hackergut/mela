import React, { lazy, Suspense } from 'react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';

const CategoriesSection = lazy(() => import('@/components/CategoriesSection'));
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const PopularProducts = lazy(() => import('@/components/PopularProducts'));
const NewsletterSection = lazy(() => import('@/components/NewsletterSection'));
const FooterSection = lazy(() => import('@/components/FooterSection'));

const SectionFallback = () => (
  <div className="min-h-64 animate-pulse bg-[#f5f5f7]" aria-hidden="true" />
);

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans">
      <PromoBanner />
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <CategoriesSection />
          <PopularProducts />
          <FeaturesSection />
          <NewsletterSection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <FooterSection />
      </Suspense>
    </div>
  );
}
