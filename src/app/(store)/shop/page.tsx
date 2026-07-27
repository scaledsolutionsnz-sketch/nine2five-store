import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getStaticProducts } from "@/lib/products";
import { ShopGrid } from "./shop-grid";
import { ArrowUpRight } from "lucide-react";

export const revalidate = 0;

export default async function ShopPage() {
  let products: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });
    products = ((data ?? []) as Product[]);
  } catch { /* ignore */ }
  if (!products.length) products = getStaticProducts();

  // Merge basic-black and basic-white into a single "Basic" card
  const hasBasicBlack = products.some((p) => p.slug === "basic-black");
  const hasBasicWhite = products.some((p) => p.slug === "basic-white");
  if (hasBasicBlack || hasBasicWhite) {
    const blackProduct = products.find((p) => p.slug === "basic-black");
    const whiteProduct = products.find((p) => p.slug === "basic-white");
    const mergedBasic: Product = {
      id: "basic",
      name: "Basic Grip Sock",
      slug: "basic",
      description: "No frills. Pure performance. Available in Black and White.",
      price: (blackProduct ?? whiteProduct)!.price,
      compare_at_price: (blackProduct ?? whiteProduct)!.compare_at_price,
      image_urls: ["/products/basic-black/2.webp"],
      active: true,
      created_at: (blackProduct ?? whiteProduct)!.created_at,
    };
    products = [
      mergedBasic,
      ...products.filter((p) => p.slug !== "basic-black" && p.slug !== "basic-white"),
    ];
  }

  return (
    <>
      <style>{`
        .shop-page { width: 100%; overflow-x: hidden; background: #06150c; min-height: 100vh; }
        .shop-container { max-width: 1280px; margin: 0 auto; padding: 56px 48px 90px; }
        .shop-header { margin-bottom: 32px; }
        .shop-label { color: #2E8B28; font-size: 12px; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 10px; }
        .shop-title { font-size: clamp(48px, 6vw, 86px); line-height: 0.95; margin: 0 0 10px; color: #ffffff; font-weight: 800; font-family: "Outfit", sans-serif; }
        .shop-count { color: rgba(255,255,255,0.55); font-size: 18px; margin: 0; }
        @media (max-width: 1024px) { .shop-container { padding: 48px 32px 80px; } }
        @media (max-width: 640px) {
          .shop-container { padding: 36px 20px 64px; }
          .shop-title { font-size: clamp(42px, 14vw, 58px); }
          .shop-count { font-size: 16px; }
        }
      `}</style>

      <div className="shop-page">
        <div className="shop-container">

          {/* Header */}
          <div className="shop-header">
            <p className="shop-label">Collection</p>
            <h1 className="shop-title">All Products</h1>
            <p className="shop-count">{products.length} designs available · returns on unwashed pairs</p>
          </div>

          {/* Guarantee bar */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "center",
            background: "#0d1f12", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "16px 24px", marginBottom: 44,
          }}>
            {[
              "✦  Returns on Unwashed Pairs",
              "⚡  Ships in 24 Hours",
              "🛡  Secure Checkout",
              "✦  NZ-Owned & Made",
            ].map((item) => (
              <span key={item} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, whiteSpace: "nowrap" }}>{item}</span>
            ))}
          </div>

          {/* All products */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#2E8B28", textTransform: "uppercase", marginBottom: 20 }}>All Designs — $25 each</p>
          <ShopGrid products={products} />

          {/* Club CTA */}
          <div style={{
            marginTop: 64, padding: "40px 36px",
            background: "rgba(46,139,40,0.06)", border: "1px solid rgba(46,139,40,0.2)",
            borderRadius: 20, display: "flex", flexWrap: "wrap",
            gap: 24, alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#2E8B28", textTransform: "uppercase", marginBottom: 10 }}>Clubs &amp; Teams</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 8 }}>Ordering for a team or club?</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 440 }}>
                Custom design free. MOQ 50 pairs. Your club keeps the margin — we send a free mockup first, no commitment required.
              </p>
            </div>
            <Link
              href="/clubs"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#2E8B28", color: "#fff",
                fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "0 28px", height: 52, borderRadius: 9999,
                textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              Get a Free Mockup <ArrowUpRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
