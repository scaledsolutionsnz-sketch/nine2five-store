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
    <div className="pt-24 pb-24 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#16a34a] mb-2">Collection</p>
        <h1 className="font-display font-black text-4xl md:text-5xl">All Products</h1>
        <p className="text-[#737373] mt-2">{products.length} designs available</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ShopCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-[#525252]">
          <p className="text-lg font-display">No products available yet.</p>
          <p className="text-sm mt-2">Check back soon — new drops incoming.</p>
        </div>
      )}
    </div>
  );
}

function ShopCard({ product }: { product: Product }) {
  const img = product.image_urls?.[0];
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] mb-3">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-[#1c1c1c] flex items-center justify-center">
            <span className="text-[#333] text-xs">No image</span>
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold uppercase tracking-wider">
            Sale
          </span>
        )}
      </div>
      <p className="font-display font-semibold text-sm text-white group-hover:text-[#16a34a] transition-colors truncate">
        {product.name}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-sm text-[#fafafa]">${(product.price / 100).toFixed(2)}</p>
        {isOnSale && (
          <p className="text-xs text-[#525252] line-through">${(product.compare_at_price! / 100).toFixed(2)}</p>
        )}
        <span className="text-xs text-[#525252]">NZD</span>
      </div>
    </Link>
  );
}
