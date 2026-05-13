"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

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
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="h-9 px-3 rounded-lg bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#16a34a]"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <input
        placeholder="Tracking number"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        className="h-9 px-3 rounded-lg bg-[#141414] border border-[#262626] text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#16a34a] w-48"
      />
      <button
        onClick={save}
        disabled={saving}
        className="h-9 px-4 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </button>
    </div>
  );
}
