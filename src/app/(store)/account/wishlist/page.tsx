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
        <h1 className="font-display font-bold text-2xl text-white">Wishlist</h1>
        <p className="text-sm text-[#737373] mt-1">{wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} saved</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl px-5 py-16 text-center">
          <Heart className="h-10 w-10 text-[#262626] mx-auto mb-4" />
          <p className="text-[#737373] mb-4">Your wishlist is empty</p>
          <Link href="/shop" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistItems.map((item) => {
            if (!item.products) return null;
            const p = item.products;
            const img = p.image_urls?.[0];
            const onSale = p.compare_at_price && p.compare_at_price > p.price;
            return (
              <div key={item.product_id} className="group relative">
                <Link href={`/shop/${p.slug}`}>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[#141414] mb-3">
                    {img && (
                      <Image
                        src={img} alt={p.name} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {onSale && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold uppercase">
                        Sale
                      </span>
                    )}
                  </div>
                  <p className="font-display font-semibold text-sm text-white group-hover:text-[#16a34a] transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-white">${(p.price / 100).toFixed(2)}</p>
                    {onSale && (
                      <p className="text-xs text-[#525252] line-through">${(p.compare_at_price! / 100).toFixed(2)}</p>
                    )}
                  </div>
                </Link>
                <WishlistActions productId={item.product_id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
