"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/database";

export function AddToCart({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const sizes = ["6-9", "10-13"] as const;

  function getVariant(size: string) {
    return variants.find((v) => v.size === size);
  }

  function handleAdd() {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const variant = getVariant(selectedSize);
    if (!variant || variant.stock_quantity < 1) {
      toast.error("This size is out of stock");
      return;
    }
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      size: selectedSize,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      imageUrl: product.image_urls?.[0] ?? null,
      quantity,
    });
    toast.success(`${product.name} (Size ${selectedSize}) added to cart`);
  }

  return (
    <div className="space-y-5">
      {/* Size selector */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#737373] mb-3">
          Select Size
        </p>
        <div className="flex gap-3">
          {sizes.map((size) => {
            const variant = getVariant(size);
            const outOfStock = !variant || variant.stock_quantity < 1;
            return (
              <button
                key={size}
                onClick={() => !outOfStock && setSelectedSize(size)}
                disabled={outOfStock}
                className={cn(
                  "relative flex-1 h-12 rounded-lg border text-sm font-semibold font-display transition-all",
                  outOfStock && "opacity-30 cursor-not-allowed",
                  selectedSize === size && !outOfStock
                    ? "border-[#16a34a] bg-[#16a34a]/10 text-[#16a34a]"
                    : "border-[#262626] text-[#a3a3a3] hover:border-[#404040] hover:text-white"
                )}
              >
                {size}
                {outOfStock && (
                  <span className="absolute -top-2 right-1 text-[9px] font-bold uppercase tracking-wider text-[#525252]">
                    Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[#525252] mt-2">Shoe sizes NZ/AU</p>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#737373] mb-3">
          Quantity
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-9 w-9 rounded-lg border border-[#262626] flex items-center justify-center hover:border-[#404040] transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="font-display font-bold text-lg w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="h-9 w-9 rounded-lg border border-[#262626] flex items-center justify-center hover:border-[#404040] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="w-full btn-primary py-4 text-base gap-2"
      >
        <ShoppingBag className="h-5 w-5" />
        Add to Cart — ${((product.price * quantity) / 100).toFixed(2)} NZD
      </button>
    </div>
  );
}
