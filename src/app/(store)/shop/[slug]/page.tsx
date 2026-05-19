import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import type { Product, ProductVariant } from "@/types/database";
import type { Metadata } from "next";
import { Shield, Truck, RotateCcw } from "lucide-react";
import { getStaticProducts, SIZES } from "@/lib/products";

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
  const staticVariants: ProductVariant[] = SIZES.map((size, i) => ({
    id: `${slug}-${size}`,
    product_id: slug,
    size,
    stock_quantity: 30,
    sku: null,
  }));
  return { product: staticProduct, variants: staticVariants };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

  return (
    <div className="bg-[#112016] min-h-screen">
      <div className="pt-24 md:pt-32 pb-24 px-8 md:px-16 max-w-screen-xl mx-auto">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-10"
        >
          ← Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#192d1e]">
              {p.image_urls?.[0] ? (
                <Image
                  src={p.image_urls[0]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-[#192d1e] flex items-center justify-center">
                  <span className="text-white/20 text-sm">No image</span>
                </div>
              )}
              {isOnSale && (
                <span className="absolute top-4 left-4 bg-white text-black rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  Sale
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80] mb-2">
              Māori Grip Socks
            </p>
            <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-3">
              {p.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-black text-white">
                ${(p.price / 100).toFixed(2)} NZD
              </span>
              {isOnSale && (
                <span className="text-white/30 line-through ml-3">
                  ${(p.compare_at_price! / 100).toFixed(2)}
                </span>
              )}
            </div>

            {p.description && (
              <p className="text-white/50 leading-relaxed mb-8">{p.description}</p>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <AddToCart product={p} variants={v} />
              </div>
              <WishlistButton productId={p.id} />
            </div>

            {/* Trust badges */}
            <div className="mt-8 pt-8 border-t border-white/[0.08] grid grid-cols-3 gap-4">
              {[
                { icon: Truck, label: "Free NZ shipping", sub: "Orders over $75" },
                { icon: Shield, label: "Secure checkout", sub: "Stripe payments" },
                { icon: RotateCcw, label: "Easy returns", sub: "7-day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon className="h-5 w-5 text-[#4ade80] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
