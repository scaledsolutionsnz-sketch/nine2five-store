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
import { getStaticProducts, getProductExtras, SIZES } from "@/lib/products";
import { CollapsibleDescription } from "@/components/storefront/collapsible-description";
import { ProductReviews } from "@/components/storefront/product-reviews";

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
  const extras = getProductExtras(slug);

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
              style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: 1, marginBottom: 14 }}
            >
              {p.name}
            </h1>

            {/* Badges + scarcity */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
              {extras.badges.map((badge) => (
                <span key={badge} style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
                  background: badge === "Best Seller" ? "rgba(46,139,40,0.15)" : "rgba(255,255,255,0.06)",
                  color: badge === "Best Seller" ? "#2E8B28" : badge === "Limited Edition" ? "#f59e0b" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${badge === "Best Seller" ? "rgba(46,139,40,0.3)" : badge === "Limited Edition" ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}>
                  {badge}
                </span>
              ))}
              {extras.limitedStock && (
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                  Low Stock
                </span>
              )}
              {extras.soldCount && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                  {extras.soldCount} sold
                </span>
              )}
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#ffffff" }}>
                ${(p.price / 100).toFixed(2)} <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>NZD</span>
              </span>
              {isOnSale && (
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
                  ${(p.compare_at_price! / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <CollapsibleDescription text={p.description} />

            {/* Size guide */}
            <details style={{ marginBottom: 20, maxWidth: 600 }}>
              <summary style={{
                listStyle: "none", display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0", cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)",
              }}>
                <span>Size Guide</span>
                <span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.25)" }}>+</span>
              </summary>
              <div style={{ paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { size: "6–9", nz: "NZ/AU 6–9", eu: "EU 39–43", us: "US M 6–9 / W 7–10" },
                  { size: "10–13", nz: "NZ/AU 10–13", eu: "EU 44–48", us: "US M 10–13" },
                ].map(({ size, nz, eu, us }) => (
                  <div key={size} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{size}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>{nz}<br />{eu}<br />{us}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 10, lineHeight: 1.6 }}>
                Between sizes? Go up. The compression fit adjusts to your foot.
              </p>
            </details>

            {/* Specs & Care */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px",
                padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 14,
              }}>
                {extras.specs.map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
                Care: {extras.care.join(" · ")}
              </p>
            </div>

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
                { icon: Shield, label: "Returns accepted", sub: "Unworn & unwashed only" },
                { icon: RotateCcw, label: "Size exchanges", sub: "Unworn & unwashed only" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <Icon style={{ width: 20, height: 20, color: "#2E8B28", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#ffffff", marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Shipping + payment */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, margin: 0 }}>
                NZ shipping from <strong style={{ color: "rgba(255,255,255,0.5)" }}>$6.68</strong> · Australia from <strong style={{ color: "rgba(255,255,255,0.5)" }}>$15.00</strong>
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {["VISA", "MC", "AMEX", "Apple Pay", "Google Pay"].map((method) => (
                  <span key={method} style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                    color: "rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 5, padding: "3px 8px",
                  }}>
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ marginTop: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                Common Questions
              </p>
              <style>{`
                .pdp-faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center; padding: 14px 0; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.07); font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
                .pdp-faq summary::-webkit-details-marker { display: none; }
                .pdp-faq summary::after { content: "+"; font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.3); flex-shrink: 0; margin-left: 12px; }
                .pdp-faq details[open] summary::after { content: "−"; }
                .pdp-faq details[open] summary { color: #fff; }
                .pdp-faq .faq-answer { padding: 0 0 14px; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.7; }
              `}</style>
              <div className="pdp-faq">
                {[
                  { q: "Will the grip last after washing?", a: "Machine wash cold, tumble dry low — the silicone grip sole holds up well with proper care." },
                  { q: "How do I choose the right size?", a: "We offer two sizes: 6–9 and 10–13. If you're between sizes, go up. The compression fit adjusts to your foot." },
                  { q: "Are they machine washable?", a: "Yes — machine wash cold, tumble dry low. Don't iron the grip sole and avoid bleach. That's it." },
                  { q: "Do they work on turf, gym, and mats?", a: "Yes. The grip pattern is tested on all three — astro turf, rubber gym floors, and pilates/yoga mats." },
                  { q: "What's the compression like?", a: "Moderate compression around the arch with a relaxed fit through the toe box. Snug enough to stay put, comfortable enough for long sessions." },
                  { q: "Can I return or exchange them?", a: "Yes — as long as they haven't been washed. Once washed, we can't accept returns. If you ordered the wrong size and they're unworn and unwashed, contact us and we'll sort it." },
                ].map(({ q, a }) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p className="faq-answer">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews — full width below both columns */}
        <ProductReviews slug={slug} />

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
                      sizes="(max-width: 768px) 50vw, 220px"
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
