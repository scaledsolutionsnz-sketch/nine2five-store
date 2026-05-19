import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { WishlistActions } from "./wishlist-actions";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("customers").select("id").eq("email", user!.email!).single();

  const { data: items } = await supabase
    .from("wishlists")
    .select("product_id, products(id, name, slug, price, compare_at_price, image_urls)")
    .eq("customer_id", customer?.id ?? "");

  type WishlistItem = {
    product_id: string;
    products: { id: string; name: string; slug: string; price: number; compare_at_price: number | null; image_urls: string[] } | null;
  };

  const wishlistItems = (items ?? []) as unknown as WishlistItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-white mb-8">Wishlist</h1>
        <p className="text-white/40 text-sm -mt-6">{wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} saved</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl px-5 py-16 text-center">
          <Heart className="h-10 w-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">Your wishlist is empty</p>
          <Link
            href="/shop"
            className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 inline-block"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistItems.map((item) => {
            if (!item.products) return null;
            const p = item.products;
            const img = p.image_urls?.[0];
            const onSale = p.compare_at_price && p.compare_at_price > p.price;
            return (
              <div key={item.product_id} className="group relative bg-[#192d1e] border border-white/[0.08] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#3a7722]/5 transition-all duration-500">
                <Link href={`/shop/${p.slug}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {img && (
                      <Image
                        src={img} alt={p.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    {onSale && (
                      <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-bold text-white text-base">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[#3a7722] font-bold">${(p.price / 100).toFixed(2)}</p>
                      {onSale && (
                        <p className="text-white/25 line-through text-sm">${(p.compare_at_price! / 100).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-4">
                  <WishlistActions productId={item.product_id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
