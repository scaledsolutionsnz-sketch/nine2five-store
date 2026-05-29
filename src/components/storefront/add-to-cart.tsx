"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import type { Product, ProductVariant } from "@/types/database";
import { BackInStockForm } from "./back-in-stock-form";

export function AddToCart({ product, variants }: { product: Product; variants: ProductVariant[] }) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const sizes = ["6-9", "10-13"] as const;

  function getVariant(size: string) {
    return variants.find((v) => v.size === size);
  }

  const selectedVariant = selectedSize ? getVariant(selectedSize) : null;
  const selectedOutOfStock = selectedVariant ? selectedVariant.stock_quantity < 1 : false;

  function handleAdd() {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (!selectedVariant || selectedVariant.stock_quantity < 1) { toast.error("This size is out of stock"); return; }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @media (max-width: 640px) {
          .qty-stepper { width: 100% !important; }
          .qty-stepper .qty-btn { flex: 1; }
          .qty-stepper .qty-num { flex: 1; }
        }
      `}</style>

      {/* Size selector */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
          Select Size
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {sizes.map((size) => {
            const variant = getVariant(size);
            const outOfStock = !variant || variant.stock_quantity < 1;
            const selected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{
                  flex: 1, height: 48, borderRadius: 10,
                  border: `1px solid ${selected ? "#2E8B28" : outOfStock ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.16)"}`,
                  background: selected ? "rgba(46,139,40,0.12)" : "transparent",
                  color: outOfStock ? "rgba(255,255,255,0.22)" : selected ? "#2E8B28" : "#F7F7F2",
                  fontSize: 14, fontWeight: 700,
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  position: "relative", transition: "all 0.15s",
                }}
              >
                {size}
                {outOfStock && (
                  <span style={{ position: "absolute", top: -8, right: 4, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Out
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Shoe sizes US</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.5 }}>
            Size 6–9 fits US 6 – 10.5 &nbsp;·&nbsp; Size 10–13 fits US 11 – 14
          </p>
        </div>
      </div>

      {/* Back in stock form if out of stock */}
      {selectedSize && selectedOutOfStock && selectedVariant && (
        <BackInStockForm productId={product.id} variantId={selectedVariant.id} size={selectedSize} />
      )}

      {/* Quantity + Add button */}
      {(!selectedSize || !selectedOutOfStock) && (
        <>
          {/* Quantity */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
              Quantity
            </p>
            <div className="qty-stepper" style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10 }}>
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: quantity <= 1 ? "rgba(255,255,255,0.2)" : "#F7F7F2", borderRadius: "9px 0 0 9px",
                }}
              >
                <Minus style={{ width: 14, height: 14 }} />
              </button>
              <span className="qty-num" style={{ width: 36, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#F7F7F2", userSelect: "none" }}>
                {quantity}
              </span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                style={{
                  width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#F7F7F2", borderRadius: "0 9px 9px 0",
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            style={{
              width: "100%", height: 58,
              background: selectedSize ? "#2E8B28" : "rgba(255,255,255,0.06)",
              color: selectedSize ? "#ffffff" : "rgba(255,255,255,0.38)",
              border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: selectedSize ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (selectedSize) e.currentTarget.style.background = "#36A832"; }}
            onMouseLeave={(e) => { if (selectedSize) e.currentTarget.style.background = "#2E8B28"; }}
          >
            <ShoppingBag style={{ width: 18, height: 18 }} />
            {selectedSize
              ? `Add to Cart — $${((product.price * quantity) / 100).toFixed(2)} NZD`
              : "Select a Size"}
          </button>
        </>
      )}
    </div>
  );
}
