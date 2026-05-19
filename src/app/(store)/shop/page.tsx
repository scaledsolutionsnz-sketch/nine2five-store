import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getStaticProducts } from "@/lib/products";
import { ShopGrid } from "./shop-grid";

export const dynamic = "force-dynamic";

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

  return (
    <div className="bg-[#112016] min-h-screen">
      <div className="px-4 sm:px-8 md:px-16 lg:px-20 pt-20 pb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#3a7722] mb-2">Collection</p>
        <h1 className="font-display font-black text-4xl md:text-5xl text-white leading-none">All Products</h1>
        <p className="text-white/30 mt-2 text-sm">{products.length} designs available</p>
      </div>
      <div className="px-4 sm:px-8 md:px-16 lg:px-20 pb-24">
        <ShopGrid products={products} />
      </div>
    </div>
  );
}
