"use client";

import { useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { ShoppingBag, Loader2 } from "lucide-react";

export function AddToCartButton({
  variantId,
  availableForSale,
}: {
  variantId: string;
  availableForSale: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await addToCart(variantId);
      } catch (err) {
        console.error("Cart error:", err);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={!availableForSale || isPending}
      className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Aggiunta in corso...</span>
        </>
      ) : !availableForSale ? (
        "Esaurito"
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>Aggiungi al Carrello</span>
        </>
      )}
    </button>
  );
}
