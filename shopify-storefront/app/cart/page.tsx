import { getCart } from "@/lib/cart-actions";
import { CartLineItem } from "./cart-line-item";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-3xl font-black text-black tracking-tight mb-2">Il tuo carrello è vuoto</h1>
        <p className="text-sm text-gray-500 mb-8">Non hai ancora aggiunto prodotti al carrello TechMania.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black text-white font-extrabold text-xs px-8 py-4 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continua lo Shopping</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-black tracking-tight mb-8">Il Tuo Carrello TechMania</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table / List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">Prodotto</th>
                <th className="p-4">Prezzo</th>
                <th className="p-4">Quantità</th>
                <th className="p-4">Totale</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {cart.lines.nodes.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 h-fit space-y-6">
          <h2 className="text-base font-extrabold text-black uppercase tracking-wider">Riepilogo Ordine</h2>
          
          <div className="space-y-3 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Totale Parziale</span>
              <span className="font-extrabold text-black">
                €{parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)} {cart.cost.subtotalAmount.currencyCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Spedizione Express</span>
              <span className="text-emerald-600 font-extrabold">GRATIS</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-black uppercase">Totale</span>
            <span className="text-2xl font-black text-black">
              €{parseFloat(cart.cost.totalAmount.amount).toFixed(2)}
            </span>
          </div>

          <a
            href={cart.checkoutUrl}
            className="block w-full bg-black hover:bg-gray-800 text-white text-center font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg transition-colors"
          >
            Procedi al Checkout Shopify
          </a>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold justify-center pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pagamento 100% Sicuro con Shopify Checkout</span>
          </div>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs font-bold text-gray-600 hover:text-black">
              &larr; Continua lo Shopping
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
