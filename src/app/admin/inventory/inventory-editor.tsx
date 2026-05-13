"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface Variant { id: string; size: string; stock_quantity: number; }
interface Product { id: string; name: string; product_variants: Variant[]; }

export function InventoryEditor({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState<string | null>(null);

  function updateStock(productId: string, variantId: string, value: number) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              product_variants: p.product_variants.map((v) =>
                v.id === variantId ? { ...v, stock_quantity: value } : v
              ),
            }
          : p
      )
    );
  }

  async function saveVariant(variantId: string, quantity: number) {
    setSaving(variantId);
    const supabase = createClient();
    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: quantity })
      .eq("id", variantId);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Stock updated");
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e]">
          <h3 className="font-display font-bold text-base mb-4">{product.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            {product.product_variants
              .sort((a, b) => a.size.localeCompare(b.size))
              .map((variant) => (
                <div key={variant.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1c1c1c] border border-[#262626]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#737373]">Size</p>
                    <p className="font-display font-bold text-sm mt-0.5">{variant.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-[#737373] mb-1">Stock</p>
                      <input
                        type="number"
                        min={0}
                        value={variant.stock_quantity}
                        onChange={(e) => updateStock(product.id, variant.id, parseInt(e.target.value) || 0)}
                        className="w-20 h-8 px-2 rounded bg-[#141414] border border-[#262626] text-sm text-center font-display font-bold focus:outline-none focus:border-[#16a34a]"
                      />
                    </div>
                    <button
                      onClick={() => saveVariant(variant.id, variant.stock_quantity)}
                      disabled={saving === variant.id}
                      className="mt-4 h-8 w-8 rounded bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center hover:bg-[#16a34a]/20 transition-colors disabled:opacity-50"
                    >
                      {saving === variant.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Save className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {variant.stock_quantity === 0 && (
                    <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Out</span>
                  )}
                  {variant.stock_quantity > 0 && variant.stock_quantity < 10 && (
                    <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Low</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
