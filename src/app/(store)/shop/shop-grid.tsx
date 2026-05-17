"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product, ProductVariant } from "@/types/database";

export function ShopGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-white/30 text-lg">No products yet — check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => (
        <InteractiveCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function InteractiveCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [mode, setMode] = useState<"idle" | "picking" | "loading" | "done">("idle");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const img = product.image_urls?.[0];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

  async function openPicker(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (mode !== "idle") return;
    setMode("loading");
    const res = await fetch(`/api/products/${product.id}/variants`);
    const data: ProductVariant[] = res.ok ? await res.json() : [];
    setVariants(data);
    setSelectedSize(null);
    setMode("picking");
  }

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;
    const variant = variants.find((v) => v.size === selectedSize);
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      size: selectedSize,
      price: product.price,
      compareAtPrice: product.compare_at_price ?? null,
      imageUrl: img ?? null,
      quantity: 1,
    });
    setMode("done");
    setTimeout(() => setMode("idle"), 2000);
  }

  return (
    <div className="group relative rounded-xl overflow-hidden bg-[#111] border border-white/[0.07] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 transition-all duration-400 cursor-pointer">

      {/* Image */}
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-[#1a1a1a]">
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-108 transition-transform duration-600"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/15 text-xs font-medium">{product.name}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-400" />

          {/* Sale badge */}
          {isOnSale && (
            <span className="absolute top-2.5 left-2.5 bg-white text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              Sale
            </span>
          )}

          {/* Quick add button — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-2">
            {mode === "idle" && (
              <button
                onClick={openPicker}
                className="w-full flex items-center justify-center gap-2 bg-[#4ade80] text-black text-xs font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-[#86efac] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Quick Add
              </button>
            )}
            {mode === "loading" && (
              <div className="w-full flex items-center justify-center gap-2 bg-[#111]/90 backdrop-blur-sm border border-white/10 text-white/50 text-xs py-2.5 rounded-lg">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            )}
            {mode === "done" && (
              <div className="w-full flex items-center justify-center gap-2 bg-[#4ade80] text-black text-xs font-black uppercase tracking-widest py-2.5 rounded-lg">
                <Check className="h-3.5 w-3.5" /> Added!
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Size picker panel — slides in when picking */}
      {mode === "picking" && (
        <div className="absolute inset-0 bg-[#0d0d0d]/96 backdrop-blur-sm flex flex-col justify-end p-3 z-10">
          <button
            onClick={(e) => { e.preventDefault(); setMode("idle"); }}
            className="absolute top-2 right-2 text-white/30 hover:text-white text-xs"
          >
            ✕
          </button>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Select Size</p>
          {variants.length === 0 ? (
            <p className="text-white/30 text-xs mb-3">No sizes found.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={(e) => { e.preventDefault(); setSelectedSize(v.size); }}
                  disabled={v.stock_quantity !== null && v.stock_quantity <= 0}
                  className={`h-8 min-w-[2rem] px-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedSize === v.size
                      ? "bg-[#4ade80] text-black border-[#4ade80]"
                      : v.stock_quantity !== null && v.stock_quantity <= 0
                      ? "border-white/10 text-white/20 cursor-not-allowed"
                      : "border-white/15 text-white hover:border-[#4ade80]/50"
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={addToCart}
            disabled={!selectedSize}
            className="w-full bg-[#4ade80] text-black text-xs font-black uppercase tracking-widest py-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#86efac] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      )}

      {/* Info */}
      <Link href={`/shop/${product.slug}`}>
        <div className="px-3 py-3">
          <p className="font-semibold text-white text-sm leading-tight truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#4ade80] font-bold text-sm">${(product.price / 100).toFixed(2)}</span>
            {isOnSale && (
              <span className="text-white/25 line-through text-xs">${(product.compare_at_price! / 100).toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
