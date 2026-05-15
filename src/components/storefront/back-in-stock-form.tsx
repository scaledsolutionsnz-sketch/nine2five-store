"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

interface Props {
  productId: string;
  variantId: string;
  size: string;
}

export function BackInStockForm({ productId, variantId, size }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/back-in-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, product_id: productId, variant_id: variantId }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json() as { error: string };
      setError(d.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20">
        <Check className="h-4 w-4 text-[#16a34a] shrink-0" />
        <p className="text-sm text-[#16a34a]">
          We&apos;ll email you when size {size} is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-[#737373]">
        <Bell className="h-4 w-4" />
        <span>Notify me when size {size} is back</span>
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 h-10 px-3 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 px-4 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Notify Me"}
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
