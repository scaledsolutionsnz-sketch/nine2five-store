"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { calculateShippingByPairs } from "@/lib/shipping";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count } = useCart();
  const { cost: shipping, isBulk, delivery } = calculateShippingByPairs(count, "NZ");

  if (count === 0) {
    return (
      <div className="bg-[#112016] min-h-screen flex flex-col items-center justify-center px-8 md:px-16 text-center">
        <ShoppingBag className="h-12 w-12 text-white/20 mx-auto mb-4" />
        <h1 className="font-display font-black text-3xl text-white mb-2">Your cart is empty</h1>
        <p className="text-white/50 mb-8">Add some grip socks to get started.</p>
        <Link
          href="/shop"
          className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#112016] min-h-screen max-w-screen-xl mx-auto px-4 sm:px-8 md:px-16 lg:px-20 pt-20 pb-24">
      <h1 className="font-display font-black text-4xl text-white mb-12">Your Cart</h1>

      <div className="grid md:grid-cols-[1fr_380px] gap-10">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="bg-[#192d1e] border border-white/[0.08] rounded-2xl p-5 flex gap-5"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[#1a1a1a]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{item.productName}</p>
                <p className="text-white/40 text-sm mt-0.5">Size {item.size}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="h-7 w-7 rounded-lg bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-display font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="h-7 w-7 rounded-lg bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center hover:border-white/20 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-white/25 hover:text-red-400 transition-colors"
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
        <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl p-8 h-fit">
          <h2 className="font-display font-bold text-xl text-white mb-8">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Subtotal ({count} items)</span>
              <span className="text-white">${(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Shipping (NZ)</span>
              <span className="text-white">
                {isBulk
                  ? <span className="text-red-400 text-xs">Contact us</span>
                  : `$${(shipping / 100).toFixed(2)}`}
              </span>
            </div>
            {!isBulk && delivery && (
              <p className="text-xs text-white/30">{delivery}</p>
            )}
            {isBulk && (
              <p className="text-xs text-red-400">
                Please contact us directly for bulk shipping rates.
              </p>
            )}
            {!isBulk && (
              <div className="border-t border-white/[0.08] pt-3 flex justify-between font-display font-black text-lg text-white">
                <span>Total</span>
                <span>${((total + shipping) / 100).toFixed(2)} NZD</span>
              </div>
            )}
          </div>
          {isBulk ? (
            <a
              href="mailto:nine2five.co.nz@gmail.com"
              className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 w-full mt-6 text-center block"
            >
              Contact Us for Bulk Rates
            </a>
          ) : (
            <Link
              href="/checkout"
              className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 w-full mt-6 text-center block"
            >
              Checkout
            </Link>
          )}
          <Link href="/shop" className="block text-center text-sm text-white/30 hover:text-white transition-colors mt-4">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
