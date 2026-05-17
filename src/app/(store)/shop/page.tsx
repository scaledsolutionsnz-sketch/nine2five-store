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
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="pt-24 md:pt-32 pb-12 px-8 md:px-16 max-w-screen-xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#4ade80] mb-2">Collection</p>
        <h1 className="font-display font-black text-4xl md:text-5xl text-white">All Products</h1>
        <p className="text-white/30 mt-2 text-sm">{products.length} designs available</p>
      </div>

      {/* Grid */}
      <div className="px-8 md:px-16 max-w-screen-xl mx-auto pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
      className="group rounded-2xl overflow-hidden bg-[#111] border border-white/[0.08] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#4ade80]/5 transition-all duration-500"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
            <span className="text-white/20 text-sm">No image</span>
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Sale
          </span>
        )}
      </div>
      <div className="px-5 py-4">
        <p className="font-bold text-white text-base">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[#4ade80] font-bold">${(product.price / 100).toFixed(2)}</p>
          {isOnSale ? (
            <p className="text-white/25 line-through text-sm">${(product.compare_at_price! / 100).toFixed(2)}</p>
          ) : (
            <span className="text-white/25 text-sm">NZD</span>
          )}
        </div>
      </div>
    </Link>
  );
}
