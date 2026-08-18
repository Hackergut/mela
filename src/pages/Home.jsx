import React, { lazy, Suspense } from 'react';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ValueMarquee from '@/components/ValueMarquee';

// Below-the-fold sections stay in separate chunks: the hero paints with the
// eager bundle while everything else streams in as the user scrolls.
const CategoriesSection = lazy(() => import('@/components/CategoriesSection'));
const PopularProducts = lazy(() => import('@/components/PopularProducts'));
const SpotlightSection = lazy(() => import('@/components/SpotlightSection'));
const StatsSection = lazy(() => import('@/components/StatsSection'));
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
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
        <ValueMarquee />
        <Suspense fallback={<SectionFallback />}>
          <CategoriesSection />
          <PopularProducts />
          <SpotlightSection />
          <StatsSection />
          <FeaturesSection />
          <TestimonialsSection />
          <NewsletterSection />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <FooterSection />
      </Suspense>
    </div>
  );
}
