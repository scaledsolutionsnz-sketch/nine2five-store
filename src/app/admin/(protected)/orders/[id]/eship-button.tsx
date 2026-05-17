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
      <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-gray-900">Order sent to eShip</h2>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Carrier</span>
            <span className="text-gray-700">{result.carrier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span className="text-gray-700">{result.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Weight</span>
            <span className="text-gray-700">{result.weightKg}kg</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Open eShip, select this order, and print the label to get your tracking number.
        </p>

        <a
          href={result.dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors"
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
      <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">NZ Post eShip</h2>
        <p className="text-sm text-gray-500">Shipment already created. Re-send to eShip?</p>
        <div className="flex gap-2">
          <button
            onClick={createShipment}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            Re-send
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">NZ Post eShip</h2>
        <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
          Auto weight
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Sends this order to your eShip account. Open eShip to print the label and get a tracking number.
      </p>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={createShipment}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-60"
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
