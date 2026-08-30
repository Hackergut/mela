import type { Metadata } from "next";
import Link from "next/link";
import { getCart } from "@/lib/cart-actions";
import { ShoppingBag } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechMania | Apple Cyber Store & Shopify Storefront",
  description: "E-commerce Apple premium con iPhone 15 Pro, PlayStation 5 Slim, AirPods Max e MacBook Pro.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getCart();
  const cartQuantity = cart?.totalQuantity || 0;

  return (
    <html lang="it">
      <body className="font-sans antialiased bg-white text-black flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm">T</span>
              <span className="text-xl font-black tracking-tight">TechMania</span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-xs font-bold text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/#catalogo" className="text-xs font-bold text-gray-300 hover:text-white transition-colors">Prodotti</Link>
              <Link href="/cart" className="text-xs font-bold text-gray-300 hover:text-white transition-colors">Carrello</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2 text-white"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-xs font-extrabold">{cartQuantity}</span>
              </Link>
            </div>

          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-black text-white pt-16 pb-8 border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm">T</span>
                  <span className="text-xl font-black text-white">TechMania</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Storefront Next.js integrata con Shopify Storefront API per prodotti Apple, gaming e hi-tech.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">Navigazione</h4>
                <ul className="space-y-2 text-xs font-semibold text-gray-400">
                  <li><Link href="/" className="hover:text-white">Home</Link></li>
                  <li><Link href="/cart" className="hover:text-white">Carrello</Link></li>
                  <li><Link href="/#catalogo" className="hover:text-white">Catalogo in Evidenza</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">Servizio Clienti</h4>
                <ul className="space-y-2 text-xs font-semibold text-gray-400">
                  <li>Spedizione Express 24h</li>
                  <li>Garanzia Ufficiale 24 Mesi</li>
                  <li>Reso Facile Entro 30 Giorni</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-4">Storefront API</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  Powered by Next.js App Router & Shopify GraphQL API.
                </p>
              </div>

            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
              <p>&copy; {new Date().getFullYear()} TechMania Inc. Tutti i diritti riservati.</p>
              <p>Next.js + Shopify Storefront Integration</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
