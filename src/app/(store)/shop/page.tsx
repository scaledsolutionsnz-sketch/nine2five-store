import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { ShopGrid } from "./shop-grid";

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
      <div className="pt-24 md:pt-32 pb-10 px-10 md:px-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4ade80] mb-2">Collection</p>
        <h1 className="font-display font-black text-4xl md:text-5xl text-white leading-none">All Products</h1>
        <p className="text-white/30 mt-2 text-sm">{products.length} designs available</p>
      </div>
      <div className="px-10 md:px-20 pb-24">
        <ShopGrid products={products} />
      </div>
    </div>
  );
}
