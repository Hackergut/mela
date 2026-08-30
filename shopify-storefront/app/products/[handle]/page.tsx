import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shopifyFetch } from "@/lib/shopify";
import { PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify-queries";
import type { Product } from "@/lib/shopify-types";
import { AddToCartButton } from "@/app/add-to-cart-button";
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  
  const data = await shopifyFetch<{ product: Product | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );

  const product = data?.product;

  if (!product) {
    notFound();
  }

  const imageUrl = product.featuredImage?.url || "/assets/iphone-image-2619-2264.png";
  const defaultVariant = product.variants?.nodes?.[0];

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/#catalogo" className="hover:text-black">Prodotti</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-black truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Main Image */}
          <div className="bg-gray-100 rounded-3xl p-8 flex items-center justify-center min-h-[420px] relative overflow-hidden">
            <div className="relative w-full h-[360px]">
              <Image
                src={imageUrl}
                alt={product.featuredImage?.altText ?? product.title}
                fill
                priority
                className="object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block">TechMania Storefront</span>
              <h1 className="text-3xl font-black text-black tracking-tight mt-1">{product.title}</h1>
            </div>

            <div className="pb-4 border-b border-gray-100">
              <span className="text-3xl font-black text-black">
                €{parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)} {product.priceRange.minVariantPrice.currencyCode}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Options */}
            {product.variants?.nodes?.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Varianti Disponibili:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.nodes.map((v) => (
                    <span
                      key={v.id}
                      className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-black border border-gray-200"
                    >
                      {v.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="pt-4">
              {defaultVariant && (
                <AddToCartButton
                  variantId={defaultVariant.id}
                  availableForSale={product.availableForSale}
                />
              )}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-100 text-center">
              <div className="p-2">
                <Truck className="w-5 h-5 text-gray-700 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-700 block">Spedizione Express</span>
              </div>
              <div className="p-2">
                <ShieldCheck className="w-5 h-5 text-gray-700 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-700 block">Garanzia 24 Mesi</span>
              </div>
              <div className="p-2">
                <RotateCcw className="w-5 h-5 text-gray-700 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-700 block">Reso 30 Giorni</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
