import React from "react";
import PromoBanner from "@/components/PromoBanner";
import Navbar from "@/components/Navbar";

/**
 * @param {{
 *   icon?: React.ElementType,
 *   title: string,
 *   subtitle?: React.ReactNode,
 *   footer?: React.ReactNode,
 *   children?: React.ReactNode,
 * }} props
 */
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans flex flex-col">
      <PromoBanner />
      <Navbar />
      <main className="relative flex-1 flex items-center justify-center overflow-hidden bg-black px-4 py-16">
        {/* Glow ambientale */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#0071E3]/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#0071E3]/10 blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0071E3] mb-5 shadow-lg shadow-[#0071E3]/30">
              {Icon ? <Icon className="w-7 h-7 text-white" aria-hidden="true" /> : (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" className="text-white">
                  <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2zm0 2c5.523 0 10 4.477 10 10S19.523 24 14 24 4 19.523 4 14 8.477 4 14 4zm-2 4v12l8-6-8-6z"/>
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-white/60 mt-2 text-sm">{subtitle}</p>}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-8">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <p className="text-center text-sm text-white/60 mt-6 [&_a]:text-[#0071E3] [&_a]:font-medium [&_a]:hover:underline">
              {footer}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}