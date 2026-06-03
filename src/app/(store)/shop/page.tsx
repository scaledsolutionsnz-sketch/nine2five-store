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

  const BUNDLES = [
    {
      label: null,
      title: "2 Pairs",
      subtitle: "Mix designs — one for training, one for game day.",
      perk: "$24 per pair — save $2",
      price: "$48",
      tag: "$24/pair — save $2",
      pairs: 2,
      href: "/shop",
    },
    {
      label: "MOST POPULAR",
      title: "3 Pairs",
      subtitle: "One for every session — never run out mid-week.",
      perk: "$23 per pair — save $6",
      price: "$69",
      tag: "$23/pair — save $6",
      pairs: 3,
      href: "/shop",
    },
    {
      label: "BEST VALUE",
      title: "5 Pairs",
      subtitle: "A pair for every sport. Stock up once, sorted for the season.",
      perk: "Free NZ shipping + priority dispatch + free design card",
      price: "$105",
      tag: "$21/pair — save $20",
      pairs: 5,
      href: "/shop",
    },
  ];

  return (
    <>
      <style>{`
        .shop-page { width: 100%; overflow-x: hidden; background: #06150c; min-height: 100vh; }
        .shop-container { max-width: 1280px; margin: 0 auto; padding: 56px 48px 90px; }
        .shop-header { margin-bottom: 32px; }
        .shop-label { color: #2E8B28; font-size: 12px; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 10px; }
        .shop-title { font-size: clamp(48px, 6vw, 86px); line-height: 0.95; margin: 0 0 10px; color: #ffffff; font-weight: 800; font-family: "Outfit", sans-serif; }
        .shop-count { color: rgba(255,255,255,0.55); font-size: 18px; margin: 0; }
        .bundle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 56px; }
        @media (max-width: 1024px) { .shop-container { padding: 48px 32px 80px; } }
        @media (max-width: 768px)  { .bundle-grid { grid-template-columns: 1fr; gap: 14px; } }
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

          {/* Bundle & Save */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#2E8B28", textTransform: "uppercase", marginBottom: 8 }}>Bundle &amp; Save</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>$25 a pair. The more you grab, the less each pair costs — free shipping on 5 pairs.</p>
          </div>
          <div className="bundle-grid">
            {BUNDLES.map(({ label, title, subtitle, perk, price, tag, href }) => (
              <Link
                key={title}
                href={href}
                style={{
                  display: "flex", flexDirection: "column",
                  background: label === "MOST POPULAR" ? "rgba(46,139,40,0.08)" : "#0d1f12",
                  border: `1px solid ${label === "MOST POPULAR" ? "rgba(46,139,40,0.35)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16, padding: "20px 22px",
                  textDecoration: "none", position: "relative",
                  transition: "border-color 0.2s",
                }}
              >
                {label && (
                  <span style={{
                    position: "absolute", top: -11, left: 20,
                    background: "#2E8B28", color: "#fff",
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
                    textTransform: "uppercase", padding: "3px 10px", borderRadius: 999,
                  }}>
                    {label}
                  </span>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", margin: 0 }}>{title}</p>
                  <span style={{ background: "rgba(46,139,40,0.15)", color: "#2E8B28", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 999 }}>{tag}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{subtitle}</p>
                <p style={{ fontSize: 11, color: "#2E8B28", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 10 }}>✦</span> {perk}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto" }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#2E8B28" }}>{price}</span>
                  <ArrowUpRight style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }} />
                </div>
              </Link>
            ))}
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
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#2E8B28", textTransform: "uppercase", marginBottom: 20 }}>Individual Pairs — $25 each</p>
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
