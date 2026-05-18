"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Minus, History, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockMovement } from "@/types/database";

interface Variant { id: string; size: string; stock_quantity: number; }
interface Product { id: string; name: string; product_variants: Variant[]; }

const ADJUSTMENT_TYPES = [
  { value: "restock",    label: "Restock"    },
  { value: "damaged",    label: "Damaged"    },
  { value: "returned",   label: "Returned"   },
  { value: "adjustment", label: "Adjustment" },
] as const;
type AdjType = typeof ADJUSTMENT_TYPES[number]["value"];

function VariantRow({
  productId,
  productName,
  showName,
  variant,
  onUpdate,
}: {
  productId: string;
  productName: string;
  showName: boolean;
  variant: Variant;
  onUpdate: (productId: string, variantId: string, newQty: number) => void;
}) {
  const [qty, setQty] = useState(variant.stock_quantity);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"adjust" | "history" | null>(null);
  const [delta, setDelta] = useState(1);
  const [adjType, setAdjType] = useState<AdjType>("restock");
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const dirty = qty !== variant.stock_quantity;

  async function save() {
    if (!dirty) return;
    setSaving(true);
    const res = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: variant.id, delta: qty - variant.stock_quantity, type: "adjustment", note: "Manual edit" }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { toast.error(data.error); return; }
    onUpdate(productId, variant.id, data.newQuantity);
    toast.success("Saved");
  }

  async function applyAdjustment(sign: 1 | -1) {
    const amount = delta * sign;
    setApplying(true);
    const res = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: variant.id, delta: amount, type: adjType, note: note || null }),
    });
    const data = await res.json();
    setApplying(false);
    if (data.error) { toast.error(data.error); return; }
    onUpdate(productId, variant.id, data.newQuantity);
    setQty(data.newQuantity);
    setNote("");
    setMovements(null);
    setPanel(null);
    toast.success(`${sign > 0 ? "+" : "-"}${delta} applied`);
  }

  async function toggleHistory() {
    if (panel === "history") { setPanel(null); return; }
    setPanel("history");
    if (movements !== null) return;
    setLoadingHistory(true);
    const res = await fetch(`/api/admin/inventory/movements/${variant.id}`);
    const data = await res.json();
    setLoadingHistory(false);
    setMovements(data.movements ?? []);
  }

  const stockColor =
    qty === 0 ? "text-red-400" :
    qty < 10  ? "text-amber-400" :
                "text-white";

  return (
    <>
      <tr className={cn(
        "border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors",
        showName ? "border-t border-white/[0.06]" : ""
      )}>
        {/* Product name — only shown on first variant row */}
        <td className="py-3 px-4 font-semibold text-white align-top">
          {showName ? productName : ""}
        </td>

        {/* Size */}
        <td className="py-3 px-4 text-white/50 align-middle">{variant.size}</td>

        {/* Stock input */}
        <td className="py-3 px-4 align-middle">
          <div className="flex items-center gap-2">
            <input
              type="number" min={0}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              onBlur={save}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className={cn(
                "w-20 h-9 text-center rounded-lg border text-sm font-semibold focus:outline-none transition-colors font-mono",
                dirty
                  ? "border-[#4ade80] bg-[#4ade80]/5 text-[#4ade80]"
                  : "border-white/[0.08] bg-white/[0.04] text-white",
                !dirty && stockColor
              )}
            />
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/30" />}
            {!saving && qty === 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20">Out</span>
            )}
            {!saving && qty > 0 && qty < 10 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">Low</span>
            )}
          </div>
        </td>

        {/* Action buttons */}
        <td className="py-3 px-4 align-middle">
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => setPanel(panel === "adjust" ? null : "adjust")}
              title="Adjust stock"
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                panel === "adjust"
                  ? "bg-white/[0.1] text-white"
                  : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={toggleHistory}
              title="Movement history"
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                panel === "history"
                  ? "bg-white/[0.1] text-white"
                  : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
              )}
            >
              {loadingHistory ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <History className="h-3.5 w-3.5" />}
            </button>
          </div>
        </td>
      </tr>

      {/* Adjust panel */}
      {panel === "adjust" && (
        <tr className="bg-white/[0.02] border-b border-white/[0.04]">
          <td colSpan={4} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDelta(d => Math.max(1, d - 1))}
                  className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center"
                >
                  <Minus className="h-3.5 w-3.5 text-white/60" />
                </button>
                <input
                  type="number" min={1}
                  value={delta}
                  onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-8 text-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white text-sm font-semibold focus:outline-none focus:border-[#4ade80]/40 font-mono"
                />
                <button
                  onClick={() => setDelta(d => d + 1)}
                  className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center"
                >
                  <Plus className="h-3.5 w-3.5 text-white/60" />
                </button>
              </div>

              <select
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as AdjType)}
                className="h-8 px-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-white focus:outline-none focus:border-[#4ade80]/40"
              >
                {ADJUSTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>

              <input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-8 px-3 rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4ade80]/40 w-44"
              />

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-white/30">
                  Remove → {Math.max(0, qty - delta)} &nbsp;·&nbsp; Add → {qty + delta}
                </span>
                <button
                  onClick={() => applyAdjustment(-1)}
                  disabled={applying}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {applying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}
                  Remove
                </button>
                <button
                  onClick={() => applyAdjustment(1)}
                  disabled={applying}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4ade80] text-black text-xs font-semibold hover:bg-[#86efac] transition-colors disabled:opacity-50"
                >
                  {applying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Add
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* History panel */}
      {panel === "history" && (
        <tr className="bg-white/[0.02] border-b border-white/[0.04]">
          <td colSpan={4} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Recent movements</p>
              <button onClick={() => setPanel(null)} className="text-white/30 hover:text-white/60">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
            </div>
            {!movements || movements.length === 0 ? (
              <p className="text-xs text-white/30">No movements yet.</p>
            ) : (
              <div className="space-y-1.5">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold",
                        m.quantity > 0
                          ? "bg-[#4ade80]/10 text-[#4ade80]"
                          : "bg-red-400/10 text-red-400"
                      )}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span>
                      <span className="text-white/50 capitalize">{m.type}</span>
                      {m.note && <span className="text-white/30">· {m.note}</span>}
                    </div>
                    <span className="text-white/30 font-mono">{new Date(m.created_at).toLocaleDateString("en-NZ")}</span>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export function InventoryEditor({
  initialProducts,
  lowStock,
}: {
  initialProducts: Product[];
  lowStock: { variant_id: string; product_name: string; size: string; stock_quantity: number }[];
}) {
  const [products, setProducts] = useState(initialProducts);

  function handleUpdate(productId: string, variantId: string, newQty: number) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, product_variants: p.product_variants.map((v) => v.id === variantId ? { ...v, stock_quantity: newQty } : v) }
          : p
      )
    );
  }

  return (
    <div className="space-y-5">
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-400/[0.08] border border-amber-400/20">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">
              {lowStock.length} variant{lowStock.length !== 1 ? "s" : ""} need restocking
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {lowStock.map((v) => `${v.product_name} (${v.size})`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#111113] border-b border-white/[0.04]">
              <th className="text-left px-4 py-2.5 text-white/40 text-xs font-medium uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-2.5 text-white/40 text-xs font-medium uppercase tracking-wider">Size</th>
              <th className="text-left px-4 py-2.5 text-white/40 text-xs font-medium uppercase tracking-wider">Stock</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
              [...product.product_variants]
                .sort((a, b) => a.size.localeCompare(b.size))
                .map((variant, vi) => (
                  <VariantRow
                    key={variant.id}
                    productId={product.id}
                    productName={product.name}
                    showName={vi === 0}
                    variant={variant}
                    onUpdate={handleUpdate}
                  />
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
