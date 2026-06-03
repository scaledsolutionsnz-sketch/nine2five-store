"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Loader2, ChevronDown, ChevronUp, Package,
  Truck, CheckCircle, AlertCircle, FileText,
} from "lucide-react";
import type { PurchaseOrderStatus } from "@/types/database";

interface Variant { id: string; size: string; product: { name: string } | null; }
interface Supplier { id: string; name: string; }
interface POItem {
  id: string;
  variant_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost_cents: number | null;
  product_variants: { size: string; products: { name: string } | null } | null;
}
interface PO {
  id: string;
  status: PurchaseOrderStatus;
  expected_at: string | null;
  received_at: string | null;
  notes: string | null;
  total_cost_cents: number | null;
  created_at: string;
  suppliers: { name: string } | null;
  purchase_order_items: POItem[];
}

const STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; style: React.CSSProperties; icon: React.ElementType }> = {
  draft:      {
    label: "Draft",
    style: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" },
    icon: FileText,
  },
  ordered:    {
    label: "Ordered",
    style: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" },
    icon: Package,
  },
  in_transit: {
    label: "In Transit",
    style: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" },
    icon: Truck,
  },
  received:   {
    label: "Received",
    style: { background: "rgba(47,155,47,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" },
    icon: CheckCircle,
  },
  cancelled:  {
    label: "Cancelled",
    style: { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
    icon: AlertCircle,
  },
};

const NEXT_STATUS: Partial<Record<PurchaseOrderStatus, { status: PurchaseOrderStatus; label: string }>> = {
  draft:      { status: "ordered",    label: "Mark Ordered" },
  ordered:    { status: "in_transit", label: "Mark In Transit" },
  in_transit: { status: "in_transit", label: "Receive Stock" },
};

const darkInput: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  appearance: "none" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(255,255,255,0.55)",
  marginBottom: 6,
};

interface LineItemDraft { variant_id: string; quantity_ordered: number; unit_cost_cents: number; }

function CreatePOModal({
  suppliers,
  variants,
  onSave,
  onClose,
}: {
  suppliers: Supplier[];
  variants: Variant[];
  onSave: (po: PO) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [expectedAt, setExpectedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItemDraft[]>([
    { variant_id: "", quantity_ordered: 1, unit_cost_cents: 0 },
  ]);

  function setLine(i: number, k: keyof LineItemDraft, v: string | number) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  }

  const totalCents = lines.reduce((s, l) => s + l.quantity_ordered * l.unit_cost_cents, 0);

  async function save() {
    const validLines = lines.filter((l) => l.variant_id && l.quantity_ordered > 0);
    if (!validLines.length) { toast.error("Add at least one line item with a variant selected"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier_id: supplierId || null,
        expected_at: expectedAt || null,
        notes: notes || null,
        items: validLines,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { toast.error(data.error); return; }
    toast.success("Purchase order created");
    onSave({ ...data.order, suppliers: suppliers.find((s) => s.id === supplierId) ?? null, purchase_order_items: [] });
    onClose();
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 560,
        background: "#0d1a12",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        overflow: "hidden",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>New Purchase Order</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Create a stock order from a supplier</p>
          </div>
          <button
            onClick={onClose}
            style={{
              height: 32,
              width: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.55)",
              fontSize: 15,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} style={darkInput}>
                <option value="">No supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Expected by</label>
              <input type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} style={{
                ...darkInput,
                colorScheme: "dark",
              }} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label style={{ ...labelStyle, marginBottom: 8 }}>Line Items</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 28px", gap: 8, alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <select
                      value={line.variant_id}
                      onChange={(e) => setLine(i, "variant_id", e.target.value)}
                      style={darkInput}
                    >
                      <option value="">Select variant…</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.product?.name ?? "Unknown"} · Size {v.size}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input
                        type="number" min={1} placeholder="Qty"
                        value={line.quantity_ordered}
                        onChange={(e) => setLine(i, "quantity_ordered", parseInt(e.target.value) || 1)}
                        style={{ ...darkInput, textAlign: "center", fontFamily: "monospace" }}
                      />
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        height: 40,
                        padding: "0 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxSizing: "border-box",
                      }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", pointerEvents: "none", userSelect: "none", flexShrink: 0 }}>$</span>
                        <input
                          type="number" min={0} step={0.01} placeholder="Unit cost"
                          value={line.unit_cost_cents / 100 || ""}
                          onChange={(e) => setLine(i, "unit_cost_cents", Math.round(parseFloat(e.target.value) * 100) || 0)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 13,
                            fontFamily: "monospace",
                            background: "transparent",
                            color: "#fff",
                            border: "none",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={lines.length === 1}
                      style={{
                        height: 40,
                        width: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        cursor: lines.length === 1 ? "not-allowed" : "pointer",
                        opacity: lines.length === 1 ? 0.2 : 1,
                        fontSize: 14,
                      }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLines((prev) => [...prev, { variant_id: "", quantity_ordered: 1, unit_cost_cents: 0 }])}
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#4ade80",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Plus style={{ width: 13, height: 13 }} /> Add line
            </button>
          </div>

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <input placeholder="Any notes about this order…" value={notes} onChange={(e) => setNotes(e.target.value)} style={darkInput} />
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Total:{" "}
              <span style={{ color: "#ffffff", fontWeight: 600, fontFamily: "monospace" }}>
                ${(totalCents / 100).toFixed(2)}
              </span>
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={onClose}
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 20px",
                  borderRadius: 9999,
                  background: "#2f9b2f",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : null}
                Create PO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PORow({ po, onUpdate }: { po: PO; onUpdate: (po: PO) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const cfg = STATUS_CONFIG[po.status];
  const StatusIcon = cfg.icon;
  const next = NEXT_STATUS[po.status];

  async function advance() {
    if (!next) return;
    setActing(true);
    if (po.status === "in_transit") {
      if (!confirm("Receive stock? This will update inventory for all line items.")) { setActing(false); return; }
      const res = await fetch(`/api/admin/purchase-orders/${po.id}/receive`, { method: "POST" });
      const data = await res.json();
      setActing(false);
      if (data.error) { toast.error(data.error); return; }
      onUpdate({ ...po, status: "received" });
      toast.success("Stock received — inventory updated");
    } else {
      const res = await fetch(`/api/admin/purchase-orders/${po.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.status }),
      });
      const data = await res.json();
      setActing(false);
      if (data.error) { toast.error(data.error); return; }
      onUpdate({ ...po, ...data.order });
      toast.success(`Marked ${next.label}`);
    }
  }

  async function cancel() {
    if (!confirm("Cancel this purchase order?")) return;
    setActing(true);
    const res = await fetch(`/api/admin/purchase-orders/${po.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    const data = await res.json();
    setActing(false);
    if (data.error) { toast.error(data.error); return; }
    onUpdate({ ...po, status: "cancelled" });
    toast.success("Order cancelled");
  }

  const isReceiveAction = po.status === "in_transit";

  return (
    <div style={{
      borderRadius: 14,
      background: "rgba(8,28,16,0.92)",
      border: "1px solid rgba(255,255,255,0.09)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              ...cfg.style,
            }}>
              <StatusIcon style={{ width: 11, height: 11 }} />
              {cfg.label}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
              {po.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            <span>{po.suppliers?.name ?? "No supplier"}</span>
            <span>{po.purchase_order_items.length} item{po.purchase_order_items.length !== 1 ? "s" : ""}</span>
            {po.total_cost_cents ? (
              <span style={{ fontFamily: "monospace" }}>${(po.total_cost_cents / 100).toFixed(2)}</span>
            ) : null}
            {po.expected_at && (
              <span>Expected {new Date(po.expected_at).toLocaleDateString("en-NZ")}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {next && po.status !== "cancelled" && (
            <button
              onClick={advance}
              disabled={acting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 36,
                padding: "0 16px",
                borderRadius: 9999,
                border: isReceiveAction ? "none" : "1px solid rgba(255,255,255,0.15)",
                background: isReceiveAction ? "#2f9b2f" : "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: acting ? "not-allowed" : "pointer",
                opacity: acting ? 0.5 : 1,
              }}
            >
              {acting ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" /> : null}
              {isReceiveAction ? "Receive Stock" : next.label}
            </button>
          )}
          {["draft", "ordered"].includes(po.status) && (
            <button
              onClick={cancel}
              disabled={acting}
              style={{
                height: 36,
                padding: "0 12px",
                borderRadius: 9999,
                background: "transparent",
                border: "none",
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                cursor: acting ? "not-allowed" : "pointer",
                opacity: acting ? 0.4 : 1,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              height: 32,
              width: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.35)",
              cursor: "pointer",
            }}
          >
            {expanded
              ? <ChevronUp style={{ width: 16, height: 16 }} />
              : <ChevronDown style={{ width: 16, height: 16 }} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
          padding: "16px 20px",
        }}>
          {po.purchase_order_items.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>No line items.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ textAlign: "left", paddingBottom: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Variant</th>
                  <th style={{ textAlign: "right", paddingBottom: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Ordered</th>
                  <th style={{ textAlign: "right", paddingBottom: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Received</th>
                  <th style={{ textAlign: "right", paddingBottom: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {po.purchase_order_items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      {item.product_variants?.products?.name ?? "Unknown"} · Size {item.product_variants?.size ?? "—"}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: "#ffffff", fontFamily: "monospace" }}>{item.quantity_ordered}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>{item.quantity_received}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                      {item.unit_cost_cents ? `$${(item.unit_cost_cents / 100).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {po.notes && (
            <p style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Note: {po.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function PurchaseOrdersClient({
  initialOrders,
  suppliers,
  variants,
}: {
  initialOrders: PO[];
  suppliers: Supplier[];
  variants: Variant[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [creating, setCreating] = useState(false);

  function handleSaved(po: PO) { setOrders((prev) => [po, ...prev]); }
  function handleUpdated(po: PO) { setOrders((prev) => prev.map((o) => o.id === po.id ? po : o)); }

  const open = orders.filter((o) => o.status !== "received" && o.status !== "cancelled");
  const closed = orders.filter((o) => o.status === "received" || o.status === "cancelled");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Purchase Orders</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>Track stock orders from your suppliers.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 20px",
            borderRadius: 9999,
            background: "#2f9b2f",
            border: "none",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> New Order
        </button>
      </div>

      {creating && (
        <CreatePOModal
          suppliers={suppliers}
          variants={variants}
          onSave={handleSaved}
          onClose={() => setCreating(false)}
        />
      )}

      {open.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {open.map((po) => <PORow key={po.id} po={po} onUpdate={handleUpdated} />)}
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.35)",
            marginBottom: 12,
          }}>
            Completed / Cancelled
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 0.6 }}>
            {closed.map((po) => <PORow key={po.id} po={po} onUpdate={handleUpdated} />)}
          </div>
        </div>
      )}

      {orders.length === 0 && !creating && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 0",
          textAlign: "center",
          borderRadius: 14,
          background: "rgba(8,28,16,0.92)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}>
          <Package style={{ width: 40, height: 40, color: "rgba(255,255,255,0.15)", marginBottom: 16 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>No purchase orders yet.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Create one to track stock orders from suppliers.</p>
        </div>
      )}
    </div>
  );
}
