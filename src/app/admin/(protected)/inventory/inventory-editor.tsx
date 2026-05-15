"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Save, Loader2, Plus, Minus, History, ChevronDown, ChevronUp,
  AlertTriangle, XCircle,
} from "lucide-react";
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

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
      <XCircle className="h-3 w-3" /> Out
    </span>
  );
  if (qty < 10) return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
      <AlertTriangle className="h-3 w-3" /> Low
    </span>
  );
  return null;
}

function VariantCard({
  productId,
  variant,
  onUpdate,
}: {
  productId: string;
  variant: Variant;
  onUpdate: (productId: string, variantId: string, newQty: number) => void;
}) {
  const [qty, setQty] = useState(variant.stock_quantity);
  const [saving, setSaving] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [delta, setDelta] = useState(0);
  const [adjType, setAdjType] = useState<AdjType>("restock");
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function saveDirectEdit() {
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
    toast.success("Stock updated");
  }

  async function applyAdjustment() {
    if (delta === 0) { toast.error("Enter a non-zero amount"); return; }
    setApplying(true);
    const res = await fetch("/api/admin/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: variant.id, delta, type: adjType, note: note || null }),
    });
    const data = await res.json();
    setApplying(false);
    if (data.error) { toast.error(data.error); return; }
    onUpdate(productId, variant.id, data.newQuantity);
    setQty(data.newQuantity);
    setDelta(0);
    setNote("");
    setAdjusting(false);
    setMovements(null); // reset so history refreshes next open
    toast.success(`Stock ${delta > 0 ? "+" : ""}${delta} applied`);
  }

  async function loadHistory() {
    if (movements !== null) { setHistoryOpen(!historyOpen); return; }
    setLoadingHistory(true);
    const res = await fetch(`/api/admin/inventory/movements/${variant.id}`);
    const data = await res.json();
    setLoadingHistory(false);
    setMovements(data.movements ?? []);
    setHistoryOpen(true);
  }

  const inputClass = "h-8 px-2 rounded bg-[#0e0e0e] border border-[#262626] text-sm text-center font-display font-bold focus:outline-none focus:border-[#16a34a]";

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#262626] overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#525252]">Size</p>
          <p className="font-display font-bold text-lg mt-0.5">{variant.size}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-[#525252] mb-1">Stock</p>
          <input
            type="number" min={0}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className={cn(inputClass, "w-20")}
          />
        </div>

        <StockBadge qty={qty} />

        <div className="flex items-center gap-1.5">
          <button
            onClick={saveDirectEdit}
            disabled={saving || qty === variant.stock_quantity}
            title="Save"
            className="h-8 w-8 rounded bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center hover:bg-[#16a34a]/20 transition-colors disabled:opacity-30"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setAdjusting(!adjusting)}
            title="Adjust"
            className={cn(
              "h-8 w-8 rounded flex items-center justify-center transition-colors",
              adjusting ? "bg-white/10 text-white" : "bg-[#1e1e1e] text-[#737373] hover:text-white"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={loadHistory}
            title="History"
            className={cn(
              "h-8 w-8 rounded flex items-center justify-center transition-colors",
              historyOpen ? "bg-white/10 text-white" : "bg-[#1e1e1e] text-[#737373] hover:text-white"
            )}
          >
            {loadingHistory
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <History className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Adjustment panel */}
      {adjusting && (
        <div className="border-t border-[#262626] bg-[#141414] p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#525252]">Adjust Stock</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setDelta((d) => d - 1)} className="h-8 w-8 rounded bg-[#1e1e1e] hover:bg-[#262626] flex items-center justify-center transition-colors">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
              className={cn(inputClass, "w-20")}
            />
            <button onClick={() => setDelta((d) => d + 1)} className="h-8 w-8 rounded bg-[#1e1e1e] hover:bg-[#262626] flex items-center justify-center transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as AdjType)}
              className="h-8 px-2 rounded bg-[#0e0e0e] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#16a34a] flex-1"
            >
              {ADJUSTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-8 px-3 rounded bg-[#0e0e0e] border border-[#262626] text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#16a34a]"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#525252]">
              {delta !== 0
                ? `New total: ${Math.max(0, qty + delta)}`
                : "Enter +/- amount"}
            </p>
            <button
              onClick={applyAdjustment}
              disabled={applying || delta === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#16a34a] text-white text-xs font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-50"
            >
              {applying ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Movement history */}
      {historyOpen && movements !== null && (
        <div className="border-t border-[#262626] bg-[#0e0e0e] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#525252]">Recent movements</p>
            <button onClick={() => setHistoryOpen(false)} className="text-[#525252] hover:text-white">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
          {movements.length === 0 ? (
            <p className="text-xs text-[#525252]">No movements yet.</p>
          ) : (
            <div className="space-y-2">
              {movements.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                      m.quantity > 0 ? "bg-[#16a34a]/10 text-[#16a34a]" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </span>
                    <span className="text-[#737373] capitalize">{m.type}</span>
                    {m.note && <span className="text-[#525252]">· {m.note}</span>}
                  </div>
                  <span className="text-[#404040]">
                    {new Date(m.created_at).toLocaleDateString("en-NZ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
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
    <div className="space-y-8">
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="font-display font-bold text-sm text-amber-400">
              {lowStock.length} variant{lowStock.length !== 1 ? "s" : ""} need restocking
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lowStock.map((v) => (
              <div key={v.variant_id} className="px-3 py-2 rounded-lg bg-[#141414] border border-[#1e1e1e]">
                <p className="text-xs font-medium text-white truncate">{v.product_name}</p>
                <p className="text-xs text-[#737373]">Size {v.size}</p>
                <p className={cn("text-lg font-display font-bold mt-1", v.stock_quantity === 0 ? "text-rose-400" : "text-amber-400")}>
                  {v.stock_quantity}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-product stock */}
      {products.map((product) => (
        <div key={product.id}>
          <h3 className="font-display font-bold text-base mb-3 text-white">{product.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.product_variants
              .sort((a, b) => a.size.localeCompare(b.size))
              .map((variant) => (
                <VariantCard
                  key={variant.id}
                  productId={product.id}
                  variant={variant}
                  onUpdate={handleUpdate}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
