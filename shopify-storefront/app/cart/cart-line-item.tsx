"use client";

import { useTransition } from "react";
import { updateCartLine, removeFromCart } from "@/lib/cart-actions";
import type { CartLine } from "@/lib/shopify-types";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export function CartLineItem({ line }: { line: CartLine }) {
  const [isPending, startTransition] = useTransition();

  function handleUpdateQuantity(newQuantity: number) {
    startTransition(async () => {
      if (newQuantity <= 0) {
        await removeFromCart(line.id);
      } else {
        await updateCartLine(line.id, newQuantity);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(line.id);
    });
  }

  const imageUrl = line.merchandise.image?.url || "/assets/iphone-image-2619-2264.png";

  return (
    <tr className={`border-b border-gray-100 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
      <td className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-xl p-2 relative flex-shrink-0">
          <Image
            src={imageUrl}
            alt={line.merchandise.product.title}
            fill
            className="object-contain mix-blend-multiply"
          />
        </div>
        <div>
          <span className="font-bold text-sm text-black block">{line.merchandise.product.title}</span>
          {line.merchandise.title !== "Default Title" && (
            <span className="text-xs text-gray-500 font-semibold">{line.merchandise.title}</span>
          )}
        </div>
      </td>
      <td className="p-4 font-bold text-sm text-black">
        €{parseFloat(line.merchandise.price.amount).toFixed(2)}
      </td>
      <td className="p-4">
        <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
          <button
            onClick={() => handleUpdateQuantity(line.quantity - 1)}
            disabled={isPending}
            className="w-7 h-7 font-bold text-black hover:bg-gray-200 rounded-lg flex items-center justify-center"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-extrabold">{line.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(line.quantity + 1)}
            disabled={isPending}
            className="w-7 h-7 font-bold text-black hover:bg-gray-200 rounded-lg flex items-center justify-center"
          >
            +
          </button>
        </div>
      </td>
      <td className="p-4 font-extrabold text-sm text-black">
        €{parseFloat(line.cost.totalAmount.amount).toFixed(2)}
      </td>
      <td className="p-4 text-right">
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-gray-400 hover:text-red-500 p-2 transition-colors"
          title="Rimuovi"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
