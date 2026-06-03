"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, PackageCheck, RotateCcw, X } from "lucide-react";
import type { OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const UNFULFILLED = new Set(["pending", "processing"]);

export function OrderActions({
  orderId,
  currentStatus,
  trackingNumber,
  orderTotal,
  hasStripePayment,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  trackingNumber: string | null;
  orderTotal?: number;
  hasStripePayment?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [refundAmt, setRefundAmt] = useState(orderTotal ? (orderTotal / 100).toFixed(2) : "");
  const [refundReason, setRefundReason] = useState("requested_by_customer");

  const isUnfulfilled = UNFULFILLED.has(status);
  const canRefund = hasStripePayment && status !== "refunded" && status !== "cancelled";

  async function fulfill() {
    setFulfilling(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "shipped", updated_at: new Date().toISOString() })
      .eq("id", orderId);
    setFulfilling(false);
    if (error) { toast.error(error.message); return; }
    setStatus("shipped");
    toast.success("Order marked as shipped");
    router.refresh();
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, tracking_number: tracking || null, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Order updated");
    router.refresh();
  }

  async function submitRefund(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(refundAmt) * 100);
    if (isNaN(cents) || cents <= 0) { toast.error("Enter a valid amount"); return; }
    setRefunding(true);
    const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_cents: cents, reason: refundReason }),
    });
    setRefunding(false);
    if (!res.ok) {
      const d = await res.json() as { error: string };
      toast.error(d.error);
      return;
    }
    toast.success(`Refund of $${refundAmt} issued`);
    setShowRefund(false);
    setStatus("refunded");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        {isUnfulfilled && (
          <button
            onClick={fulfill}
            disabled={fulfilling}
            style={{
              height: 36, padding: "0 16px", borderRadius: 8,
              background: "#2f9b2f", color: "#fff",
              fontWeight: 800, fontSize: 13, border: "none",
              cursor: fulfilling ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 7,
              opacity: fulfilling ? 0.7 : 1, transition: "background 0.2s",
            }}
          >
            {fulfilling
              ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              : <PackageCheck style={{ width: 14, height: 14 }} />}
            {fulfilling ? "Fulfilling…" : "Fulfill Order"}
          </button>
        )}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#334155] focus:outline-none focus:border-[#116DFF]/50 transition-colors"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <input
          placeholder="Tracking number"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50 transition-colors w-48"
        />
        <button
          onClick={save}
          disabled={saving}
          className="h-9 px-4 rounded-full bg-[#116DFF] text-white text-sm font-semibold hover:bg-[#0D5FE0] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </button>
        {canRefund && (
          <button
            onClick={() => setShowRefund(true)}
            style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
            Refund
          </button>
        )}
      </div>

      {/* Refund modal */}
      {showRefund && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", margin: 0 }}>Issue Refund</h3>
              <button onClick={() => setShowRefund(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 4, display: "flex" }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={submitRefund} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Amount (NZD)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9CA3AF" }}>$</span>
                  <input
                    required type="number" step="0.01" min="0.01"
                    value={refundAmt}
                    onChange={e => setRefundAmt(e.target.value)}
                    style={{ width: "100%", height: 40, paddingLeft: 28, paddingRight: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                {orderTotal && (
                  <button type="button" onClick={() => setRefundAmt((orderTotal / 100).toFixed(2))}
                    style={{ marginTop: 5, fontSize: 11, color: "#116DFF", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Full refund (${(orderTotal / 100).toFixed(2)})
                  </button>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Reason</label>
                <select value={refundReason} onChange={e => setRefundReason(e.target.value)}
                  style={{ width: "100%", height: 40, padding: "0 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#334155", outline: "none" }}>
                  <option value="requested_by_customer">Requested by customer</option>
                  <option value="duplicate">Duplicate order</option>
                  <option value="fraudulent">Fraudulent</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowRefund(false)}
                  style={{ flex: 1, height: 40, borderRadius: 9999, border: "1px solid #E2E8F0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={refunding}
                  style={{ flex: 1, height: 40, borderRadius: 9999, border: "none", background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: refunding ? "not-allowed" : "pointer", opacity: refunding ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {refunding ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <RotateCcw style={{ width: 14, height: 14 }} />}
                  {refunding ? "Processing…" : "Issue Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
