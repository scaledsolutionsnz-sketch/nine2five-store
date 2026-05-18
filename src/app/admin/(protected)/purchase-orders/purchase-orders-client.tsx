"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Loader2, ChevronDown, ChevronUp, Package,
  Truck, CheckCircle, AlertCircle, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

const STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft:      { label: "Draft",      color: "bg-white/[0.06] text-white/50 border border-white/[0.08]",          icon: FileText },
  ordered:    { label: "Ordered",    color: "bg-blue-400/10 text-blue-400 border border-blue-400/20",             icon: Package },
  in_transit: { label: "In Transit", color: "bg-amber-400/10 text-amber-400 border border-amber-400/20",          icon: Truck },
  received:   { label: "Received",   color: "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",          icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-400/10 text-red-400 border border-red-400/20",                icon: AlertCircle },
};

const NEXT_STATUS: Partial<Record<PurchaseOrderStatus, { status: PurchaseOrderStatus; label: string }>> = {
  draft:      { status: "ordered",    label: "Mark Ordered" },
  ordered:    { status: "in_transit", label: "Mark In Transit" },
  in_transit: { status: "in_transit", label: "Receive Stock" },
};

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4ade80]/40 transition-colors";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#111113] border border-white/[0.1] rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="font-semibold text-base text-white">New Purchase Order</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={cn(inputClass, "appearance-none bg-[#18181b]")}>
                <option value="">No supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Expected by</label>
              <input type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className={cn(inputClass, "bg-[#18181b]")} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Line Items</label>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_28px] gap-2 items-center">
                  <select
                    value={line.variant_id}
                    onChange={(e) => setLine(i, "variant_id", e.target.value)}
                    className={cn(inputClass, "appearance-none text-xs bg-[#18181b]")}
                  >
                    <option value="">Select variant…</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.product?.name ?? "Unknown"} · Size {v.size}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number" min={1} placeholder="Qty"
                    value={line.quantity_ordered}
                    onChange={(e) => setLine(i, "quantity_ordered", parseInt(e.target.value) || 1)}
                    className={cn(inputClass, "text-center text-xs font-mono")}
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                    <input
                      type="number" min={0} step={0.01} placeholder="Unit cost"
                      value={line.unit_cost_cents / 100 || ""}
                      onChange={(e) => setLine(i, "unit_cost_cents", Math.round(parseFloat(e.target.value) * 100) || 0)}
                      className={cn(inputClass, "pl-6 text-xs font-mono")}
                    />
                  </div>
                  <button
                    onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={lines.length === 1}
                    className="h-10 w-7 flex items-center justify-center text-white/30 hover:text-red-400 disabled:opacity-20 transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLines((prev) => [...prev, { variant_id: "", quantity_ordered: 1, unit_cost_cents: 0 }])}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#4ade80] hover:opacity-80 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Add line
            </button>
          </div>

          <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <p className="text-sm text-white/40">
              Total: <span className="text-white font-semibold font-mono">${(totalCents / 100).toFixed(2)}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="h-9 px-4 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#4ade80] text-black text-sm font-semibold hover:bg-[#86efac] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
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

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", cfg.color)}>
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
            <span className="text-xs text-white/30 font-mono">{po.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>{po.suppliers?.name ?? "No supplier"}</span>
            <span>{po.purchase_order_items.length} item{po.purchase_order_items.length !== 1 ? "s" : ""}</span>
            {po.total_cost_cents ? <span className="font-mono">${(po.total_cost_cents / 100).toFixed(2)}</span> : null}
            {po.expected_at && <span>Expected {new Date(po.expected_at).toLocaleDateString("en-NZ")}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {next && po.status !== "cancelled" && (
            <button
              onClick={advance}
              disabled={acting}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50",
                po.status === "in_transit"
                  ? "bg-[#4ade80] text-black hover:bg-[#86efac]"
                  : "bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.1]"
              )}
            >
              {acting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {po.status === "in_transit" ? "Receive Stock" : next.label}
            </button>
          )}
          {["draft", "ordered"].includes(po.status) && (
            <button
              onClick={cancel}
              disabled={acting}
              className="h-7 px-2.5 rounded-lg text-xs text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
          {po.purchase_order_items.length === 0 ? (
            <p className="text-xs text-white/30">No line items.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 border-b border-white/[0.06]">
                  <th className="text-left pb-2">Variant</th>
                  <th className="text-right pb-2">Ordered</th>
                  <th className="text-right pb-2">Received</th>
                  <th className="text-right pb-2">Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {po.purchase_order_items.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-2 text-white/60">
                      {item.product_variants?.products?.name ?? "Unknown"} · Size {item.product_variants?.size ?? "—"}
                    </td>
                    <td className="py-2 text-right text-white font-mono">{item.quantity_ordered}</td>
                    <td className="py-2 text-right text-white/40 font-mono">{item.quantity_received}</td>
                    <td className="py-2 text-right text-white/40 font-mono">
                      {item.unit_cost_cents ? `$${(item.unit_cost_cents / 100).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {po.notes && <p className="mt-3 text-xs text-white/30">Note: {po.notes}</p>}
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
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#4ade80] text-black text-sm font-semibold hover:bg-[#86efac] transition-colors"
        >
          <Plus className="h-4 w-4" /> New Order
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
        <div className="space-y-3">
          {open.map((po) => <PORow key={po.id} po={po} onUpdate={handleUpdated} />)}
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-3">
            Completed / Cancelled
          </p>
          <div className="space-y-3 opacity-50">
            {closed.map((po) => <PORow key={po.id} po={po} onUpdate={handleUpdated} />)}
          </div>
        </div>
      )}

      {orders.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111113] border border-white/[0.06] rounded-xl">
          <Package className="h-10 w-10 text-white/10 mb-4" />
          <p className="text-white/40 text-sm">No purchase orders yet.</p>
          <p className="text-white/25 text-xs mt-1">Create one to track stock orders from suppliers.</p>
        </div>
      )}
    </div>
  );
}
