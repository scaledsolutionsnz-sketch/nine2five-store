"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Check, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product, ProductVariant } from "@/types/database";

export function HomepageCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isBasic = product.slug === "basic";

  // ── State ────────────────────────────────────────────────────────────────
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsFetched, setVariantsFetched] = useState(false);
  const [colour, setColour] = useState<"black" | "white" | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [addState, setAddState] = useState<"idle" | "loading" | "done">("idle");
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);   // drives the panel open/close
  const [imgIndex, setImgIndex] = useState(0);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Images ───────────────────────────────────────────────────────────────
  const allImages: string[] = isBasic
    ? ["/products/basic-black/2.webp", "/products/basic-white/2.webp"]
    : (product.image_urls ?? []).filter(Boolean);

  useEffect(() => {
    if (hovered && allImages.length > 1) {
      imgTimer.current = setInterval(() => setImgIndex(i => (i + 1) % allImages.length), 700);
    } else {
      if (imgTimer.current) clearInterval(imgTimer.current);
      if (!hovered) setImgIndex(0);
    }
    return () => { if (imgTimer.current) clearInterval(imgTimer.current); };
  }, [hovered, allImages.length]);

  // ── Fetch variants once on first hover ──────────────────────────────────
  const fetchVariants = useCallback(async () => {
    if (variantsFetched) return;
    const res = await fetch(`/api/products/${product.id}/variants`);
    const data: ProductVariant[] = res.ok ? await res.json() : [];
    setVariants(data);
    setVariantsFetched(true);
  }, [product.id, variantsFetched]);

  // ── Hover expand / collapse ──────────────────────────────────────────────
  function handleMouseEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
    setExpanded(true);
    if (!isBasic) fetchVariants();
  }

  function handleMouseLeave() {
    setHovered(false);
    // Small delay so user can move to the panel without it snapping shut
    leaveTimer.current = setTimeout(() => {
      if (addState !== "done") {
        setExpanded(false);
        if (addState === "idle") {
          setSelectedSize(null);
          setColour(null);
          setQty(1);
        }
      }
    }, 220);
  }

  // ── Add to cart ───────────────────────────────────────────────────────────
  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;
    const variant = variants.find(v => v.size === selectedSize);
    if (!variant) return;
    const productName = isBasic && colour
      ? `Basic Grip Sock (${colour === "black" ? "Black" : "White"})`
      : product.name;
    const imageUrl = isBasic && colour
      ? `/products/basic-${colour}/2.png`
      : (allImages[0] ?? null);
    addItem({ productId: product.id, variantId: variant.id, productName, size: selectedSize, price: product.price, compareAtPrice: product.compare_at_price ?? null, imageUrl, quantity: qty });
    setAddState("done");
    setTimeout(() => { setAddState("idle"); setExpanded(false); setSelectedSize(null); setQty(1); }, 2000);
  }

  async function pickColour(c: "black" | "white", e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setColour(c);
    if (!variantsFetched) {
      const res = await fetch(`/api/products/${product.id}/variants`);
      const data: ProductVariant[] = res.ok ? await res.json() : [];
      setVariants(data);
      setVariantsFetched(true);
    }
    setSelectedSize(null);
    setQty(1);
  }

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const showSizes = !isBasic || colour !== null;
  const expandPanel = expanded && addState !== "done";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#07180e",
        border: hovered ? "1px solid rgba(46,139,40,0.5)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        overflow: "visible",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(46,139,40,0.12)"
          : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        position: "relative",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <Link href={`/shop/${product.slug}`} style={{ display: "block", flexShrink: 0 }}>
        <div style={{ height: "clamp(160px, 18vw, 240px)", borderRadius: "13px 13px 0 0", backgroundColor: "#0e2314", overflow: "hidden", position: "relative" }}>
          {allImages.map((src, i) => (
            <div key={src} style={{ position: "absolute", inset: 0, backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center", opacity: i === imgIndex ? 1 : 0, transform: hovered && i === imgIndex ? "scale(1.05)" : "scale(1)", transition: "opacity 0.35s ease, transform 0.5s ease" }} />
          ))}
          {allImages.length === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 13, fontWeight: 900, textTransform: "uppercase" }}>{product.name}</span>
            </div>
          )}
          {isOnSale && (
            <span style={{ position: "absolute", top: 10, left: 10, background: "#2E8B28", color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 9999, textTransform: "uppercase", zIndex: 2 }}>Sale</span>
          )}
          {allImages.length > 1 && (
            <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4, zIndex: 2 }}>
              {allImages.map((_, i) => (
                <div key={i} style={{ width: i === imgIndex ? 14 : 5, height: 5, borderRadius: 9999, background: i === imgIndex ? "#2E8B28" : "rgba(255,255,255,0.35)", transition: "width 0.3s ease, background 0.3s ease" }} />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* ── Name + price ──────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 14px 10px" }}>
        <Link href={`/shop/${product.slug}`} style={{ textDecoration: "none" }}>
          <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: "#F7F7F2", margin: 0 }}>{product.name}</p>
        </Link>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#2E8B28" }}>${(product.price / 100).toFixed(2)}</span>
            {isOnSale && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", textDecoration: "line-through" }}>${(product.compare_at_price! / 100).toFixed(2)}</span>}
          </div>
          {addState === "done" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#2E8B28", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "5px 10px", borderRadius: 999 }}>
              <Check style={{ width: 11, height: 11 }} /> Added
            </span>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {hovered && !variantsFetched && !isBasic && (
                <Loader2 style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} className="animate-spin" />
              )}
              <Link href={`/shop/${product.slug}`} onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", textDecoration: "none", flexShrink: 0 }} title="View product">
                <ShoppingBag style={{ width: 13, height: 13, color: "rgba(255,255,255,0.6)" }} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Expandable quick-buy panel ─────────────────────────────────────── */}
      <div style={{
        overflow: "hidden",
        maxHeight: expandPanel ? 220 : 0,
        opacity: expandPanel ? 1 : 0,
        transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
      }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 14px 14px", borderRadius: "0 0 13px 13px" }}>

          {/* Colour step (Basic only) */}
          {isBasic && colour === null && (
            <>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Colour</p>
              <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                {(["black", "white"] as const).map(c => (
                  <button key={c} onClick={e => pickColour(c, e)}
                    style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", color: "#F7F7F2", fontSize: 12, fontWeight: 700, cursor: "pointer", paddingLeft: 10 }}>
                    <span style={{ width: 11, height: 11, borderRadius: "50%", background: c === "black" ? "#111" : "#f0f0f0", border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    {c === "black" ? "Black" : "White"}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Size picker */}
          {showSizes && (
            <>
              {isBasic && colour && (
                <button onClick={e => { e.preventDefault(); e.stopPropagation(); setColour(null); setSelectedSize(null); }}
                  style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  ← {colour === "black" ? "⚫ Black" : "⚪ White"}
                </button>
              )}
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 7 }}>Size</p>
              {variants.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Loader2 style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)" }} className="animate-spin" />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Loading…</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                  {variants.map(v => {
                    const oos = v.stock_quantity !== null && v.stock_quantity <= 0;
                    const sel = selectedSize === v.size;
                    return (
                      <button key={v.id}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); if (!oos) setSelectedSize(v.size); }}
                        disabled={oos}
                        style={{ height: 30, minWidth: 48, padding: "0 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: `1px solid ${sel ? "#2E8B28" : oos ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}`, background: sel ? "#2E8B28" : "transparent", color: oos ? "rgba(255,255,255,0.18)" : "#F7F7F2", cursor: oos ? "not-allowed" : "pointer", transition: "background 0.15s, border-color 0.15s" }}>
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Qty + Add */}
          {showSizes && variants.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Qty */}
              <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, flexShrink: 0 }}>
                <button onClick={e => { e.preventDefault(); e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
                  style={{ width: 28, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: qty <= 1 ? "rgba(255,255,255,0.2)" : "#F7F7F2" }}>
                  <Minus style={{ width: 10, height: 10 }} />
                </button>
                <span style={{ width: 26, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#F7F7F2", userSelect: "none" }}>{qty}</span>
                <button onClick={e => { e.preventDefault(); e.stopPropagation(); setQty(q => Math.min(10, q + 1)); }}
                  style={{ width: 28, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "#F7F7F2" }}>
                  <Plus style={{ width: 10, height: 10 }} />
                </button>
              </div>
              {/* Add */}
              <button onClick={handleAdd} disabled={!selectedSize}
                style={{ flex: 1, height: 30, background: selectedSize ? "#2E8B28" : "rgba(255,255,255,0.06)", color: selectedSize ? "#fff" : "rgba(255,255,255,0.3)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: selectedSize ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
                {selectedSize ? `Add${qty > 1 ? ` ${qty}×` : ""} to Cart` : "Pick a Size"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
