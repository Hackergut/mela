import Image from "next/image";
import Link from "next/link";
import { shopifyFetch } from "@/lib/shopify";
import { PRODUCTS_QUERY } from "@/lib/shopify-queries";
import type { Product } from "@/lib/shopify-types";
import { AddToCartButton } from "./add-to-cart-button";
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

export default async function HomePage() {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>(
    PRODUCTS_QUERY,
    { first: 12 }
  );

  const products = data?.products?.nodes || [];

  return (
    <main className="min-h-screen bg-white">
      
      {/* HERO SECTION */}
      <section className="bg-black text-white py-16 lg:py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400 block">
                Oltre Ogni Limite
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                IPHONE 15 PRO
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
                Fotocamera di livello professionale, chip A17 Pro ultraveloce e design in titanio di grado aerospaziale.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/products/iphone-15-pro-max"
                  className="inline-flex items-center gap-2 bg-white text-black font-extrabold text-sm px-8 py-4 rounded-full hover:bg-gray-200 transition-all shadow-xl"
                >
                  <span>Acquista Ora</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-md h-[360px] sm:h-[440px]">
                <Image
                  src="/assets/iphone-image-2619-2264.png"
                  alt="iPhone 15 Pro"
                  fill
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED 4-TILE GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tile 1: PlayStation 5 Slim */}
            <Link href="/products/playstation-5-slim" className="group bg-gray-50 rounded-3xl p-6 flex flex-col justify-between h-[340px] border border-gray-100 hover:border-gray-300 transition-all hover:shadow-xl">
              <div>
                <h3 className="text-xl font-black text-black tracking-tight group-hover:text-blue-600 transition-colors">PlayStation 5 Slim</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Grafica 4K & SSD Ultra-Veloce</p>
              </div>
              <div className="relative w-full h-44 my-auto">
                <Image src="/assets/playstation-2619-2204.png" alt="PS5 Slim" fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
            </Link>

            {/* Tile 2: AirPods Max */}
            <Link href="/products/airpods-max" className="group bg-black text-white rounded-3xl p-6 flex flex-col justify-between h-[340px] border border-gray-900 transition-all hover:shadow-xl">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">AirPods Max</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Audio ad Alta Fedeltà con ANC</p>
              </div>
              <div className="relative w-full h-44 my-auto">
                <Image src="/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png" alt="AirPods Max" fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
            </Link>

            {/* Tile 3: Apple Vision Pro */}
            <Link href="/products/apple-vision-pro" className="group bg-gray-50 rounded-3xl p-6 flex flex-col justify-between h-[340px] border border-gray-100 hover:border-gray-300 transition-all hover:shadow-xl">
              <div>
                <h3 className="text-xl font-black text-black tracking-tight group-hover:text-blue-600 transition-colors">Apple Vision Pro</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Il primo spatial computer al mondo</p>
              </div>
              <div className="relative w-full h-44 my-auto">
                <Image src="/assets/image-61-2619-1982.png" alt="Apple Vision Pro" fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
            </Link>

            {/* Tile 4: MacBook Pro 16" */}
            <Link href="/products/macbook-pro-16-m3" className="group bg-black text-white rounded-3xl p-6 flex flex-col justify-between h-[340px] border border-gray-900 transition-all hover:shadow-xl">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">MacBook Pro 16"</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">Potenza estrema con chip M3 Max</p>
              </div>
              <div className="relative w-full h-44 my-auto">
                <Image src="/assets/banner-2-2619-2128.png" alt="MacBook Pro 16" fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* SHOPIFY PRODUCTS GRID */}
      <section id="catalogo" className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-black text-black tracking-tight">Catalogo Prodotti Shopify</h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">Connesso alla Storefront API con carrello e checkout diretto</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all hover:border-gray-200"
              >
                <div>
                  {product.featuredImage && (
                    <Link href={`/products/${product.handle}`} className="block relative w-full h-48 bg-gray-50 rounded-xl p-4 mb-4">
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText ?? product.title}
                        fill
                        className="object-contain mix-blend-multiply"
                      />
                    </Link>
                  )}
                  <Link href={`/products/${product.handle}`}>
                    <h3 className="text-sm font-extrabold text-black hover:text-blue-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-lg font-black text-black mt-2">
                    €{parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  {product.variants?.nodes?.length > 0 && (
                    <AddToCartButton
                      variantId={product.variants.nodes[0].id}
                      availableForSale={product.availableForSale}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Spedizione Gratuita</h4>
                <p className="text-xs text-gray-500">Consegna espressa in 24/48h</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Garanzia 24 Mesi</h4>
                <p className="text-xs text-gray-500">Assistenza ufficiale diretta</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Reso Entro 30 Giorni</h4>
                <p className="text-xs text-gray-500">Rimborso completo garantito</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-black">Supporto H24</h4>
                <p className="text-xs text-gray-500">Assistenza tecnica in italiano</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
