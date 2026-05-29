"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Loader2, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product, ProductVariant } from "@/types/database";

export function HomepageCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isBasic = product.slug === "basic";
  const [mode, setMode] = useState<"idle" | "colour" | "loading" | "picking" | "done">("idle");
  const [colour, setColour] = useState<"black" | "white" | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const img = isBasic ? "/products/basic-black/2.webp" : (product.image_urls?.[0] ?? null);
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

  async function pickColour(c: "black" | "white") {
    setColour(c);
    setMode("loading");
    const res = await fetch(`/api/products/${product.id}/variants`);
    const data: ProductVariant[] = res.ok ? await res.json() : [];
    setVariants(data);
    setSelectedSize(null);
    setQty(1);
    setMode("picking");
  }

  async function openPicker(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isBasic) {
      if (mode === "idle" || mode === "done") { setMode("colour"); setColour(null); setVariants([]); setSelectedSize(null); setQty(1); return; }
      if (mode === "colour" || mode === "picking") { setMode("idle"); return; }
      return;
    }
    if (mode === "picking") { setMode("idle"); return; }
    if (mode !== "idle") return;
    setMode("loading");
    const res = await fetch(`/api/products/${product.id}/variants`);
    const data: ProductVariant[] = res.ok ? await res.json() : [];
    setVariants(data);
    setSelectedSize(null);
    setQty(1);
    setMode("picking");
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;
    const variant = variants.find((v) => v.size === selectedSize);
    if (!variant) return;
    const productId = product.id;
    const productName = isBasic && colour ? `Basic Grip Sock (${colour === "black" ? "Black" : "White"})` : product.name;
    const imageUrl = isBasic && colour ? `/products/basic-${colour}/2.png` : (img ?? null);
    addItem({
      productId,
      variantId: variant.id,
      productName,
      size: selectedSize,
      price: product.price,
      compareAtPrice: product.compare_at_price ?? null,
      imageUrl,
      quantity: qty,
    });
    setMode("done");
    setTimeout(() => setMode("idle"), 2000);
  }

  return (
    <div
      className="group"
      style={{
        display: "flex", flexDirection: "column",
        background: "#07180e", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, overflow: "visible", textDecoration: "none",
        transition: "transform 0.3s ease", position: "relative",
      }}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} style={{ display: "block", flexShrink: 0 }}>
        <div
          className="relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500"
          style={{
            height: "clamp(220px, 25vw, 340px)",
            borderRadius: "17px 17px 0 0",
            backgroundColor: "#0e2314",
            backgroundImage: img ? `url('${img}')` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!img && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-black text-center px-4 leading-none" style={{ color: "rgba(255,255,255,0.12)", fontSize: 13 }}>
                {product.name.toUpperCase()}
              </span>
            </div>
          )}
          {isOnSale && (
            <span className="absolute top-3 left-3 font-black uppercase" style={{ background: "#2E8B28", color: "#fff", fontSize: 9, letterSpacing: "0.1em", padding: "0.25rem 0.65rem", borderRadius: 9999 }}>
              Sale
            </span>
          )}
        </div>
      </Link>

      {/* Info row */}
      <div style={{ padding: "14px 16px 10px" }}>
        <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none" }}>
          <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, color: "#F7F7F2", margin: 0 }}>
            {product.name}
          </p>
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#2E8B28" }}>
              ${(product.price / 100).toFixed(2)}
            </span>
            {isOnSale && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", textDecoration: "line-through" }}>
                ${(product.compare_at_price! / 100).toFixed(2)}
              </span>
            )}
          </div>

          {mode === "done" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#2E8B28", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "5px 10px", borderRadius: 999 }}>
              <Check style={{ width: 11, height: 11 }} /> Added
            </span>
          ) : mode === "loading" ? (
            <span style={{ display: "inline-flex", alignItems: "center", color: "rgba(255,255,255,0.3)" }}>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
            </span>
          ) : (
            <button
              onClick={openPicker}
              title="Quick Add"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: "50%",
                background: (mode === "picking" || mode === "colour") ? "rgba(255,255,255,0.1)" : "#2E8B28",
                border: "none", cursor: "pointer",
                transition: "background 0.2s, transform 0.2s",
                transform: (mode === "picking" || mode === "colour") ? "rotate(45deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            >
              <Plus style={{ width: 16, height: 16, color: "#fff" }} />
            </button>
          )}
        </div>
      </div>

      {/* Colour picker (Basic only) */}
      {mode === "colour" && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 16px 16px", borderRadius: "0 0 17px 17px" }}>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
            Colour
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); pickColour("black"); }}
              style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", color: "#F7F7F2", fontSize: 12, fontWeight: 700, cursor: "pointer", paddingLeft: 10 }}
            >
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#111", border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
              Black
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); pickColour("white"); }}
              style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", color: "#F7F7F2", fontSize: 12, fontWeight: 700, cursor: "pointer", paddingLeft: 10 }}
            >
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#f0f0f0", border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
              White
            </button>
          </div>
        </div>
      )}

      {/* Size + qty picker */}
      {mode === "picking" && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 16px 16px", borderRadius: "0 0 17px 17px" }}>
          {isBasic && colour && (
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "capitalize" }}>
              {colour === "black" ? "⚫" : "⚪"} {colour === "black" ? "Black" : "White"}
            </p>
          )}
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
            Size
          </p>
          {variants.length === 0 ? (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>No sizes available.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {variants.map((v) => {
                const outOfStock = v.stock_quantity !== null && v.stock_quantity <= 0;
                const selected = selectedSize === v.size;
                return (
                  <button
                    key={v.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!outOfStock) setSelectedSize(v.size); }}
                    disabled={outOfStock}
                    style={{
                      height: 34, minWidth: 56, padding: "0 12px",
                      borderRadius: 8, fontSize: 12, fontWeight: 700,
                      border: `1px solid ${selected ? "#2E8B28" : outOfStock ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.16)"}`,
                      background: selected ? "#2E8B28" : "transparent",
                      color: outOfStock ? "rgba(255,255,255,0.18)" : "#F7F7F2",
                      cursor: outOfStock ? "not-allowed" : "pointer",
                    }}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          )}

          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
            Qty
          </p>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10, width: "fit-content", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9 }}>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
              style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: qty <= 1 ? "rgba(255,255,255,0.2)" : "#F7F7F2", borderRadius: "8px 0 0 8px" }}>
              <Minus style={{ width: 12, height: 12 }} />
            </button>
            <span style={{ width: 34, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#F7F7F2", userSelect: "none" }}>{qty}</span>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQty(q => Math.min(10, q + 1)); }}
              style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "#F7F7F2", borderRadius: "0 8px 8px 0" }}>
              <Plus style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            style={{
              width: "100%", height: 38,
              background: selectedSize ? "#2E8B28" : "rgba(255,255,255,0.06)",
              color: selectedSize ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: 9,
              fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: selectedSize ? "pointer" : "not-allowed",
            }}
          >
            {selectedSize ? `Add ${qty > 1 ? `${qty}x ` : ""}to Cart` : "Select a Size"}
          </button>
        </div>
      )}
    </div>
  );
}
