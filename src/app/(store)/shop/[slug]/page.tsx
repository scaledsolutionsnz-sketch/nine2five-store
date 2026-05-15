import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import type { Product, ProductVariant } from "@/types/database";
import type { Metadata } from "next";
import { ChevronLeft, Shield, Truck, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_urls, price")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Product not found" };

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
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!product) notFound();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id);

  const p = product as Product;
  const v = (variants ?? []) as ProductVariant[];
  const isOnSale = p.compare_at_price && p.compare_at_price > p.price;

  return (
    <div className="pt-8 pb-24 px-6 md:px-10 max-w-6xl mx-auto">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-white transition-colors mb-8"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#141414]">
            {p.image_urls?.[0] ? (
              <Image
                src={p.image_urls[0]}
                alt={p.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[#1c1c1c] flex items-center justify-center">
                <span className="text-[#333] text-sm">No image</span>
              </div>
            )}
            {isOnSale && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#16a34a] text-white text-xs font-bold uppercase tracking-wider">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-2">
            Māori Grip Socks
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-3">
            {p.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display font-bold text-2xl text-white">
              ${(p.price / 100).toFixed(2)} NZD
            </span>
            {isOnSale && (
              <span className="text-lg text-[#525252] line-through">
                ${(p.compare_at_price! / 100).toFixed(2)}
              </span>
            )}
          </div>

          {p.description && (
            <p className="text-[#737373] leading-relaxed mb-8">{p.description}</p>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <AddToCart product={p} variants={v} />
            </div>
            <WishlistButton productId={p.id} />
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-8 border-t border-[#1e1e1e] grid grid-cols-3 gap-4">
            {[
              { icon: Truck, label: "Free NZ shipping", sub: "Orders over $75" },
              { icon: Shield, label: "Secure checkout", sub: "Stripe payments" },
              { icon: RotateCcw, label: "Easy returns", sub: "7-day policy" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center">
                <Icon className="h-5 w-5 text-[#16a34a] mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-xs text-[#525252] mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
