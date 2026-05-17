import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  const products = (data ?? []) as Product[];

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-24 pb-24 px-6 sm:px-10 md:px-16 lg:px-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#4ade80] mb-2">Collection</p>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white">All Products</h1>
          <p className="text-white/35 mt-2 text-sm">{products.length} designs available</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <ShopCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg font-display text-white/50">No products available yet.</p>
            <p className="text-sm mt-2 text-white/30">Check back soon — new drops incoming.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopCard({ product }: { product: Product }) {
  const img = product.image_urls?.[0];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group rounded-[18px] overflow-hidden bg-white/[0.06] border border-white/[0.09] hover:bg-white/[0.10] hover:border-white/[0.18] hover:shadow-lg hover:shadow-[#4ade80]/[0.05] transition-all duration-300"
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 95%, rgba(74,222,128,0.16) 0%, rgba(17,17,17,0.95) 65%)' }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-5">
            <div className="w-14 h-2 rounded-full bg-[#4ade80]/20 blur-sm mb-2" />
            <span className="text-white/20 text-[11px] text-center px-3">No image</span>
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#4ade80] text-[#0a1a0e] text-[10px] font-bold uppercase tracking-wider">
            Sale
          </span>
        )}
      </div>
      <div className="px-3.5 py-3">
        <p className="font-display font-semibold text-sm text-white/85 group-hover:text-[#4ade80] transition-colors truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm font-bold text-[#4ade80]">${(product.price / 100).toFixed(2)}</p>
          {isOnSale ? (
            <p className="text-xs text-white/25 line-through">${(product.compare_at_price! / 100).toFixed(2)}</p>
          ) : (
            <span className="text-xs text-white/30">NZD</span>
          )}
        </div>
      </div>
    </Link>
  );
}
