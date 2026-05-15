"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function WishlistActions({ productId }: { productId: string }) {
  const router = useRouter();

  async function remove() {
    const res = await fetch(`/api/account/wishlist?product_id=${productId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Removed from wishlist"); router.refresh(); }
    else toast.error("Failed to remove");
  }

  return (
    <button
      onClick={remove}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-[#737373] hover:text-red-400 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
