"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setChecking(false); return; }
      setLoggedIn(true);
      // Check if already in wishlist
      const res = await fetch("/api/account/wishlist");
      if (res.ok) {
        const items = await res.json() as { product_id: string }[];
        setSaved(items.some((i) => i.product_id === productId));
      }
      setChecking(false);
    });
  }, [productId]);

  async function toggle() {
    if (!loggedIn) {
      router.push(`/account/login?next=/shop`);
      return;
    }
    setLoading(true);
    if (saved) {
      const res = await fetch(`/api/account/wishlist?product_id=${productId}`, { method: "DELETE" });
      if (res.ok) { setSaved(false); toast.success("Removed from wishlist"); }
    } else {
      const res = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (res.ok) { setSaved(true); toast.success("Added to wishlist"); }
    }
    setLoading(false);
  }

  if (checking) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "flex items-center justify-center h-10 w-10 rounded-xl border transition-colors",
        saved
          ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          : "border-[#262626] bg-[#141414] text-[#737373] hover:text-white hover:border-[#404040]"
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}
