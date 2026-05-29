"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Minus, History, ChevronUp, AlertTriangle } from "lucide-react";
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
    qty === 0 ? "#b91c1c" :
    qty < 10  ? "#92400e" :
                "#111827";

  const inputBorderColor = dirty ? "#2f9b2f" : "#d8dee8";
  const inputBg = dirty ? "#f0fff4" : "#fff";

  return (
    <>
      <tr style={{ borderTop: showName ? "2px solid #e5e7eb" : "1px solid #e5e7eb" }}>
        {/* Product name */}
        <td style={{ padding: "13px 16px", color: "#111827", fontWeight: 800, fontSize: 14, verticalAlign: "middle" }}>
          {showName ? productName : ""}
        </td>

        {/* Size */}
        <td style={{ padding: "13px 16px", color: "#334155", fontSize: 14, verticalAlign: "middle" }}>
          {variant.size}
        </td>

        {/* SKU placeholder */}
        <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: 13, verticalAlign: "middle", fontFamily: "monospace" }}>
          —
        </td>

        {/* Stock input */}
        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="number" min={0}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              onBlur={save}
              onKeyDown={(e) => e.key === "Enter" && save()}
              style={{
                width: 80, height: 40, borderRadius: 10, border: `1px solid ${inputBorderColor}`,
                background: inputBg, color: dirty ? "#2f9b2f" : stockColor,
                fontWeight: 800, textAlign: "center", fontSize: 14, outline: "none",
              }}
            />
            {saving && <Loader2 style={{ width: 14, height: 14, color: "#6b7280" }} className="animate-spin" />}
          </div>
        </td>

        {/* Status badge */}
        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
          {qty === 0 && (
            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c", fontSize: 12, fontWeight: 800 }}>
              Out of stock
            </span>
          )}
          {qty > 0 && qty < 10 && (
            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 800 }}>
              Low stock
            </span>
          )}
          {qty >= 10 && (
            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 }}>
              In stock
            </span>
          )}
        </td>

        {/* Action buttons */}
        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <button
              onClick={() => setPanel(panel === "adjust" ? null : "adjust")}
              title="Adjust stock"
              style={{
                height: 32, width: 32, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: panel === "adjust" ? "#dcfce7" : "#f3f4f6",
                color: panel === "adjust" ? "#166534" : "#6b7280",
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={toggleHistory}
              title="Movement history"
              style={{
                height: 32, width: 32, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: panel === "history" ? "#dbeafe" : "#f3f4f6",
                color: panel === "history" ? "#1e40af" : "#6b7280",
              }}
            >
              {loadingHistory ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <History style={{ width: 14, height: 14 }} />}
            </button>
          </div>
        </td>
      </tr>

      {/* Adjust panel */}
      {panel === "adjust" && (
        <tr style={{ borderTop: "1px solid #e5e7eb" }}>
          <td colSpan={6} style={{ padding: "14px 16px", background: "#f0fff4" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setDelta(d => Math.max(1, d - 1))}
                  style={{ height: 36, width: 36, borderRadius: 8, background: "#fff", border: "1px solid #d8dee8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Minus style={{ width: 14, height: 14, color: "#6b7280" }} />
                </button>
                <input
                  type="number" min={1}
                  value={delta}
                  onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 64, height: 36, textAlign: "center", borderRadius: 8, border: "1px solid #d8dee8", background: "#fff", color: "#334155", fontSize: 13, fontWeight: 700, outline: "none" }}
                />
                <button
                  onClick={() => setDelta(d => d + 1)}
                  style={{ height: 36, width: 36, borderRadius: 8, background: "#fff", border: "1px solid #d8dee8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Plus style={{ width: 14, height: 14, color: "#6b7280" }} />
                </button>
              </div>

              <select
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as AdjType)}
                style={{ height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid #d8dee8", background: "#fff", fontSize: 13, color: "#334155", outline: "none" }}
              >
                {ADJUSTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>

              <input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "1px solid #d8dee8", background: "#fff", fontSize: 13, color: "#334155", outline: "none", width: 176 }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Remove → {Math.max(0, qty - delta)} &nbsp;·&nbsp; Add → {qty + delta}
                </span>
                <button
                  onClick={() => applyAdjustment(-1)}
                  disabled={applying}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: applying ? 0.5 : 1 }}
                >
                  {applying ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Minus style={{ width: 12, height: 12 }} />}
                  Remove
                </button>
                <button
                  onClick={() => applyAdjustment(1)}
                  disabled={applying}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", borderRadius: 999, background: "#2f9b2f", color: "#fff", border: "none", fontSize: 13, fontWeight: 900, cursor: "pointer", opacity: applying ? 0.5 : 1 }}
                >
                  {applying ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Plus style={{ width: 12, height: 12 }} />}
                  Add
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* History panel */}
      {panel === "history" && (
        <tr style={{ borderTop: "1px solid #e5e7eb" }}>
          <td colSpan={6} style={{ padding: "14px 16px", background: "#f8faff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Recent movements</p>
              <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                <ChevronUp style={{ width: 14, height: 14 }} />
              </button>
            </div>
            {!movements || movements.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6b7280" }}>No movements yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {movements.map((m) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 800,
                        background: m.quantity > 0 ? "#dcfce7" : "#fee2e2",
                        color: m.quantity > 0 ? "#166534" : "#b91c1c",
                      }}>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span>
                      <span style={{ color: "#334155", textTransform: "capitalize" }}>{m.type}</span>
                      {m.note && <span style={{ color: "#6b7280" }}>· {m.note}</span>}
                    </div>
                    <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 12 }}>
                      {new Date(m.created_at).toLocaleDateString("en-NZ")}
                    </span>
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
    <div>
      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ background: "#fff7d6", color: "#92400e", border: "1px solid #facc15", borderRadius: 16, padding: "14px 18px", marginBottom: 18, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
          <div>
            <span style={{ fontWeight: 800 }}>{lowStock.length} variant{lowStock.length !== 1 ? "s" : ""} need restocking</span>
            <span style={{ fontWeight: 500, fontSize: 13, display: "block", marginTop: 2, color: "#92400e", opacity: 0.8 }}>
              {lowStock.map((v) => `${v.product_name} (${v.size})`).join(" · ")}
            </span>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#eaf2fb" }}>
              <tr>
                {["Product", "Size", "SKU", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: h === "Actions" ? "right" : "left", padding: "12px 16px", fontWeight: 800, color: "#334155", whiteSpace: "nowrap" }}>{h}</th>
                ))}
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
    </div>
  );
}
