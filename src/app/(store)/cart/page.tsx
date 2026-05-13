"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { calculateShipping } from "@/lib/shipping";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const shipping = calculateShipping(total, "NZ");

  if (count === 0) {
    return (
      <div className="pt-32 pb-24 px-6 text-center max-w-md mx-auto">
        <ShoppingBag className="h-12 w-12 text-[#333] mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl mb-2">Your cart is empty</h1>
        <p className="text-[#737373] mb-8">Add some grip socks to get started.</p>
        <Link href="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 px-6 md:px-10 max-w-5xl mx-auto">
      <h1 className="font-display font-black text-3xl mb-10">Your Cart</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 p-4 rounded-xl bg-[#141414] border border-[#1e1e1e]"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#1c1c1c] shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[#262626]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm text-white truncate">{item.productName}</p>
                <p className="text-xs text-[#737373] mt-0.5">Size {item.size}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="h-7 w-7 rounded border border-[#262626] flex items-center justify-center hover:border-[#404040] transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-display font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="h-7 w-7 rounded border border-[#262626] flex items-center justify-center hover:border-[#404040] transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-sm">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-[#525252] hover:text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e] h-fit">
          <h2 className="font-display font-bold text-lg mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#737373]">Subtotal ({count} items)</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Shipping (NZ)</span>
              <span>{shipping === 0 ? <span className="text-[#16a34a]">Free</span> : `$${(shipping / 100).toFixed(2)}`}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-[#525252]">
                Free shipping on orders over $75
              </p>
            )}
            <div className="border-t border-[#262626] pt-3 flex justify-between font-display font-bold text-base">
              <span>Total</span>
              <span>${((total + shipping) / 100).toFixed(2)} NZD</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full mt-6 text-center block">
            Checkout
          </Link>
          <Link href="/shop" className="block text-center text-sm text-[#525252] hover:text-white transition-colors mt-4">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
