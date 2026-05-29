"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Truck, RotateCcw } from "lucide-react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import type { Product, ProductVariant } from "@/types/database";
import { getStaticProducts } from "@/lib/products";

type ColourOption = "black" | "white";

interface Props {
  black: { product: Product; variants: ProductVariant[] };
  white: { product: Product; variants: ProductVariant[] };
}

export function BasicProductClient({ black, white }: Props) {
  const [colour, setColour] = useState<ColourOption>("black");

  const active = colour === "black" ? black : white;
  const { product: p, variants: v } = active;
  const isOnSale = p.compare_at_price && p.compare_at_price > p.price;

  const otherDesigns = getStaticProducts()
    .filter((op) => op.slug !== "basic-black" && op.slug !== "basic-white" && op.image_urls?.[0])
    .slice(0, 6);

  return (
    <div style={{ backgroundColor: "#06150C", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(80px, 10vw, 128px) clamp(20px, 4vw, 48px) 96px" }}>
        <Link
          href="/shop"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.38)", textDecoration: "none", marginBottom: 40 }}
        >
          ← Back to Shop
        </Link>

        <style>{`
          .product-page-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr); gap: 64px; align-items: start; }
          @media (max-width: 900px) { .product-page-grid { grid-template-columns: 1fr; gap: 36px; } }
          .other-designs-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
          @media (max-width: 900px) { .other-designs-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
          @media (max-width: 640px) { .other-designs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          .other-design-card { border-radius: 14px; overflow: hidden; background: rgba(7,24,14,0.92); border: 1px solid rgba(255,255,255,0.10); cursor: pointer; transition: transform 0.25s ease, border-color 0.25s ease; text-decoration: none; display: block; }
          .other-design-card:hover { transform: translateY(-2px); border-color: #2f9b2f; }
          .colour-swatch { width: 36px; height: 36px; border-radius: 50%; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; border: 2px solid transparent; }
          .colour-swatch:hover { transform: scale(1.1); }
        `}</style>

        <div className="product-page-grid">
          {/* Left: Gallery */}
          <div>
            <ProductGallery
              key={colour}
              images={p.image_urls ?? []}
              name={p.name}
              isOnSale={!!isOnSale}
            />

            {otherDesigns.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
                  Other Designs
                </p>
                <div className="other-designs-grid">
                  {otherDesigns.map((od) => (
                    <Link key={od.slug} href={`/shop/${od.slug}`} className="other-design-card">
                      <div style={{ position: "relative", width: "100%", aspectRatio: "1/0.8", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={od.image_urls?.[0] ?? ""} alt={od.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "10px 10px 12px" }}>
                        <p style={{ color: "#fff", fontSize: 11, fontWeight: 800, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{od.name}</p>
                        <p style={{ color: "#2f9b2f", fontSize: 11, fontWeight: 800, margin: 0 }}>${(od.price / 100).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ maxWidth: 620 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#2E8B28", marginBottom: 12 }}>
              Grip Socks
            </p>

            <h1 className="font-display font-black text-white" style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: 1, marginBottom: 16 }}>
              Basic Grip Sock
            </h1>

            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#ffffff" }}>
                ${(p.price / 100).toFixed(2)} <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>NZD</span>
              </span>
              {isOnSale && (
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
                  ${(p.compare_at_price! / 100).toFixed(2)}
                </span>
              )}
            </div>

            <div style={{ marginBottom: 32, maxWidth: 600 }}>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 17, lineHeight: 1.7 }}>
                No frills. Pure performance. Reliable traction, compression fit, and built to last.
              </p>
            </div>

            {/* Colour picker */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
                Colour — <span style={{ color: "#fff", textTransform: "capitalize" }}>{colour === "black" ? "Black" : "White"}</span>
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Black swatch */}
                <button
                  onClick={() => setColour("black")}
                  className="colour-swatch"
                  style={{
                    background: "#111",
                    boxShadow: colour === "black" ? "0 0 0 3px #2f9b2f" : "0 0 0 2px rgba(255,255,255,0.18)",
                  }}
                  aria-label="Black"
                  title="Black"
                />
                {/* White swatch */}
                <button
                  onClick={() => setColour("white")}
                  className="colour-swatch"
                  style={{
                    background: "#f0f0f0",
                    boxShadow: colour === "white" ? "0 0 0 3px #2f9b2f" : "0 0 0 2px rgba(255,255,255,0.18)",
                  }}
                  aria-label="White"
                  title="White"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <AddToCart product={p} variants={v} />
              </div>
              <WishlistButton productId={p.id} />
            </div>

            <div style={{ marginTop: 32, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.07)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { icon: Truck, label: "NZ shipping", sub: "Fast delivery" },
                { icon: Shield, label: "Secure checkout", sub: "Stripe payments" },
                { icon: RotateCcw, label: "Easy returns", sub: "7-day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <Icon style={{ width: 20, height: 20, color: "#2E8B28", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#ffffff", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
