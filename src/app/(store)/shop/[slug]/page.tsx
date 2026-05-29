import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { ProductGallery } from "@/components/storefront/product-gallery";
import type { Product, ProductVariant } from "@/types/database";
import type { Metadata } from "next";
import { Shield, Truck, RotateCcw } from "lucide-react";
import { getStaticProducts, SIZES } from "@/lib/products";
import { CollapsibleDescription } from "@/components/storefront/collapsible-description";

export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<{ product: Product; variants: ProductVariant[] } | null> {
  try {
    const supabase = await createClient();
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();
    if (product) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", product.id);
      return { product: product as Product, variants: (variants ?? []) as ProductVariant[] };
    }
  } catch { /* ignore */ }

  const staticProduct = getStaticProducts().find((p) => p.slug === slug);
  if (!staticProduct) return null;
  const staticVariants: ProductVariant[] = SIZES.map((size) => ({
    id: `${slug}-${size}`,
    product_id: slug,
    size,
    stock_quantity: 30,
    sku: null,
  }));
  return { product: staticProduct, variants: staticVariants };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);
  if (!result) return { title: "Product not found" };
  const { product } = result;
  const price = `$${(product.price / 100).toFixed(2)} NZD`;
  const img = product.image_urls?.[0];
  return {
    title: product.name,
    description: product.description ?? `${product.name} — Māori inspired grip sock. ${price}.`,
    openGraph: {
      title: `${product.name} — Nine2Five`,
      description: product.description ?? `Māori inspired grip sock. ${price}.`,
      images: img ? [{ url: img, width: 800, height: 800, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProduct(slug);
  if (!result) notFound();
  const { product: p, variants: v } = result;
  const isOnSale = p.compare_at_price && p.compare_at_price > p.price;

  // Other designs — static list excluding current product
  const otherDesigns = getStaticProducts()
    .filter((op) => op.slug !== slug && op.image_urls && op.image_urls[0])
    .slice(0, 6);

  return (
    <div style={{ backgroundColor: "#06150C", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(80px, 10vw, 128px) clamp(20px, 4vw, 48px) 96px",
        }}
      >
        <Link
          href="/shop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "rgba(255,255,255,0.38)",
            textDecoration: "none",
            marginBottom: 40,
            transition: "color 0.2s",
          }}
          className="hover:text-white"
        >
          ← Back to Shop
        </Link>

        <style>{`
          .product-page-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr); gap: 64px; align-items: start; }
          @media (max-width: 900px) { .product-page-grid { grid-template-columns: 1fr; gap: 36px; } }
          .other-designs-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
          @media (max-width: 900px)  { .other-designs-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
          @media (max-width: 640px)  { .other-designs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          .other-design-card { border-radius: 14px; overflow: hidden; background: rgba(7,24,14,0.92); border: 1px solid rgba(255,255,255,0.10); cursor: pointer; transition: transform 0.25s ease, border-color 0.25s ease; text-decoration: none; display: block; }
          .other-design-card:hover { transform: translateY(-2px); border-color: #2f9b2f; }
        `}</style>
        <div className="product-page-grid">
          {/* ── Left: Image Gallery ── */}
          <div>
            <ProductGallery
              images={p.image_urls ?? []}
              name={p.name}
              isOnSale={!!isOnSale}
            />

          </div>

          {/* ── Right: Details ── */}
          <div style={{ maxWidth: 620 }}>
            {/* Category */}
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#2E8B28", marginBottom: 12 }}>
              Māori Grip Socks
            </p>

            {/* Title */}
            <h1
              className="font-display font-black text-white"
              style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: 1, marginBottom: 16 }}
            >
              {p.name}
            </h1>

            {/* Price */}
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

            {/* Bundle savings hint */}
            <div style={{ background: "rgba(46,139,40,0.08)", border: "1px solid rgba(46,139,40,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#2E8B28", fontSize: 13 }}>✦</span>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: "#2E8B28" }}>Buy 2, save $5.</strong> Add 2 pairs to your cart to unlock bundle pricing. Buy 3 for $65 — save $10.
              </p>
            </div>

            {/* Description */}
            <CollapsibleDescription text={p.description} />

            {/* Add to cart + wishlist */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <AddToCart product={p} variants={v} />
              </div>
              <WishlistButton productId={p.id} />
            </div>

            {/* Trust badges */}
            <div
              style={{
                marginTop: 32, paddingTop: 28,
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {[
                { icon: Truck, label: "Ships in 24 hrs", sub: "NZ 2–4 business days" },
                { icon: Shield, label: "30-Day Guarantee", sub: "Grip or we replace it" },
                { icon: RotateCcw, label: "Easy returns", sub: "Hassle-free exchanges" },
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

        {/* Other designs — below both columns */}
        {otherDesigns.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <p style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
              Other Designs
            </p>
            <div className="other-designs-grid">
              {otherDesigns.map((od) => (
                <Link key={od.slug} href={`/shop/${od.slug}`} className="other-design-card">
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1/0.8", overflow: "hidden" }}>
                    <Image
                      src={od.image_urls?.[0] ?? ""}
                      alt={od.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
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
    </div>
  );
}
