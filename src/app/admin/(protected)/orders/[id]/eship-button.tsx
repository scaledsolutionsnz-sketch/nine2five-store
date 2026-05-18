"use client";

import { useState } from "react";
import { Loader2, Package, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

type Result = {
  starshipitOrderId: number;
  dashboardUrl: string;
  carrier: string;
  service: string;
  weightKg: number;
};

export function EShipButton({ orderId, existingTracking }: {
  orderId: string;
  existingTracking: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function createShipment() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/eship`, { method: "POST" });
      const data = await res.json() as Result & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "eShip request failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="p-5 rounded-xl bg-white border border-[#E2E7EF] space-y-3" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#166B3B]" />
          <h2 className="text-sm font-semibold text-[#1F2937]">Order sent to eShip</h2>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Carrier</span>
            <span className="text-[#334155]">{result.carrier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Service</span>
            <span className="text-[#334155]">{result.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Weight</span>
            <span className="text-[#334155]">{result.weightKg}kg</span>
          </div>
        </div>

        <p className="text-xs text-[#6B7280]">
          Open eShip, select this order, and print the label to get your tracking number.
        </p>

        <a
          href={result.dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-full bg-[#116DFF] text-white text-sm font-semibold hover:bg-[#0D5FE0] transition-colors"
        >
          <Package className="h-4 w-4" />
          Print Label in eShip
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  if (existingTracking && !result) {
    return (
      <div className="p-5 rounded-xl bg-white border border-[#E2E7EF] space-y-3" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">NZ Post eShip</h2>
        <p className="text-sm text-[#6B7280]">Shipment already created. Re-send to eShip?</p>
        <div className="flex gap-2">
          <button
            onClick={createShipment}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#E2E7EF] text-[#334155] text-xs font-medium hover:bg-[#F6FAFF] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            Re-send
          </button>
        </div>
        {error && <p className="text-xs text-[#991B1B]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E2E7EF] space-y-3" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">NZ Post eShip</h2>
        <span className="text-[10px] text-[#6B7280] bg-[#F3F5F8] border border-[#E2E7EF] rounded-full px-2 py-0.5">
          Auto weight
        </span>
      </div>

      <p className="text-xs text-[#6B7280]">
        Sends this order to your eShip account. Open eShip to print the label and get a tracking number.
      </p>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5]">
          <AlertCircle className="h-3.5 w-3.5 text-[#991B1B] mt-0.5 shrink-0" />
          <p className="text-xs text-[#991B1B]">{error}</p>
        </div>
      )}

      <button
        onClick={createShipment}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full h-10 rounded-full bg-[#116DFF] text-white text-sm font-semibold hover:bg-[#0D5FE0] transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending to eShip…
          </>
        ) : (
          <>
            <Package className="h-4 w-4" />
            Send to eShip
          </>
        )}
      </button>
    </div>
  );
}
