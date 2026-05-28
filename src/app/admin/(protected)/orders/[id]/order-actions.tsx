"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, PackageCheck } from "lucide-react";
import type { OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const UNFULFILLED = new Set(["pending", "processing"]);

export function OrderActions({
  orderId,
  currentStatus,
  trackingNumber,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);

  const isUnfulfilled = UNFULFILLED.has(status);

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

  return (
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
    </div>
  );
}
