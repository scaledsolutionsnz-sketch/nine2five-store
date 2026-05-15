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
  draft:      { label: "Draft",      color: "text-[#737373] bg-[#737373]/10", icon: FileText },
  ordered:    { label: "Ordered",    color: "text-blue-400 bg-blue-400/10",   icon: Package },
  in_transit: { label: "In Transit", color: "text-amber-400 bg-amber-400/10", icon: Truck },
  received:   { label: "Received",   color: "text-[#16a34a] bg-[#16a34a]/10", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "text-rose-400 bg-rose-400/10",   icon: AlertCircle },
};

const NEXT_STATUS: Partial<Record<PurchaseOrderStatus, { status: PurchaseOrderStatus; label: string }>> = {
  draft:      { status: "ordered",    label: "Mark Ordered" },
  ordered:    { status: "in_transit", label: "Mark In Transit" },
  in_transit: { status: "in_transit", label: "Receive Stock" }, // special — uses receive endpoint
};

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-[#0e0e0e] border border-[#262626] text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

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
      <div className="w-full max-w-xl bg-[#141414] border border-[#1e1e1e] rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#1e1e1e]">
          <h2 className="font-display font-bold text-lg">New Purchase Order</h2>
          <button onClick={onClose} className="text-[#525252] hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#525252] mb-1.5">Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={cn(inputClass, "appearance-none")}>
                <option value="">No supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#525252] mb-1.5">Expected by</label>
              <input type="date" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label className="block text-xs text-[#525252] mb-2">Line Items</label>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_28px] gap-2 items-center">
                  <select
                    value={line.variant_id}
                    onChange={(e) => setLine(i, "variant_id", e.target.value)}
                    className={cn(inputClass, "appearance-none text-xs")}
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
                    className={cn(inputClass, "text-center text-xs")}
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252] text-xs">$</span>
                    <input
                      type="number" min={0} step={0.01} placeholder="Unit cost"
                      value={line.unit_cost_cents / 100 || ""}
                      onChange={(e) => setLine(i, "unit_cost_cents", Math.round(parseFloat(e.target.value) * 100) || 0)}
                      className={cn(inputClass, "pl-6 text-xs")}
                    />
                  </div>
                  <button
                    onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={lines.length === 1}
                    className="h-10 w-7 flex items-center justify-center text-[#525252] hover:text-rose-400 disabled:opacity-20 transition-colors"
                  >✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setLines((prev) => [...prev, { variant_id: "", quantity_ordered: 1, unit_cost_cents: 0 }])}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#16a34a] hover:opacity-80 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Add line
            </button>
          </div>

          <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />

          <div className="flex items-center justify-between pt-2 border-t border-[#1e1e1e]">
            <p className="text-sm text-[#737373]">
              Total: <span className="text-white font-semibold">${(totalCents / 100).toFixed(2)}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={onClose} className="h-9 px-4 rounded-lg bg-[#1e1e1e] text-sm text-[#737373] hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors"
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
      // Receive stock
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
    <div className="rounded-xl bg-[#141414] border border-[#1e1e1e] overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", cfg.color)}>
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
            <span className="text-xs text-[#525252] font-mono">{po.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#737373]">
            <span>{po.suppliers?.name ?? "No supplier"}</span>
            <span>{po.purchase_order_items.length} item{po.purchase_order_items.length !== 1 ? "s" : ""}</span>
            {po.total_cost_cents ? <span>${(po.total_cost_cents / 100).toFixed(2)}</span> : null}
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
                  ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                  : "bg-[#1e1e1e] text-white hover:bg-[#262626]"
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
              className="h-7 px-2.5 rounded-lg text-xs text-[#525252] hover:text-rose-400 hover:bg-rose-500/5 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 flex items-center justify-center text-[#525252] hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#1e1e1e] bg-[#0e0e0e] px-4 py-3">
          {po.purchase_order_items.length === 0 ? (
            <p className="text-xs text-[#525252]">No line items.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#525252] border-b border-[#1a1a1a]">
                  <th className="text-left pb-2">Variant</th>
                  <th className="text-right pb-2">Ordered</th>
                  <th className="text-right pb-2">Received</th>
                  <th className="text-right pb-2">Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {po.purchase_order_items.map((item) => (
                  <tr key={item.id} className="border-b border-[#1a1a1a] last:border-0">
                    <td className="py-2 text-[#d4d4d4]">
                      {item.product_variants?.products?.name ?? "Unknown"} · Size {item.product_variants?.size ?? "—"}
                    </td>
                    <td className="py-2 text-right">{item.quantity_ordered}</td>
                    <td className="py-2 text-right text-[#737373]">{item.quantity_received}</td>
                    <td className="py-2 text-right text-[#737373]">
                      {item.unit_cost_cents ? `$${(item.unit_cost_cents / 100).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {po.notes && <p className="mt-3 text-xs text-[#525252]">Note: {po.notes}</p>}
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

  function handleSaved(po: PO) {
    setOrders((prev) => [po, ...prev]);
  }
  function handleUpdated(po: PO) {
    setOrders((prev) => prev.map((o) => o.id === po.id ? po : o));
  }

  const open = orders.filter((o) => o.status !== "received" && o.status !== "cancelled");
  const closed = orders.filter((o) => o.status === "received" || o.status === "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors"
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#404040] mb-3">
            Completed / Cancelled
          </p>
          <div className="space-y-3 opacity-60">
            {closed.map((po) => <PORow key={po.id} po={po} onUpdate={handleUpdated} />)}
          </div>
        </div>
      )}

      {orders.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl bg-[#141414] border border-[#1e1e1e]">
          <Package className="h-10 w-10 text-[#404040] mb-4" />
          <p className="text-[#525252] text-sm">No purchase orders yet.</p>
          <p className="text-[#404040] text-xs mt-1">Create one to track stock orders from suppliers.</p>
        </div>
      )}
    </div>
  );
}
