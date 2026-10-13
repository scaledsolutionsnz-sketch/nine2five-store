"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

type Result = { markedShipped?: number[]; markedDelivered?: number[]; trackingAdded?: number; error?: string };

/** Pulls shipped orders and delivery status back from NZ Post eShip (also runs hourly). */
export function EShipSyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/eship/sync", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as Result;
      if (!res.ok || data.error) {
        setMessage(data.error ?? "Couldn't reach NZ Post eShip. Try again in a minute.");
      } else {
        const shipped = data.markedShipped?.length ?? 0;
        const delivered = data.markedDelivered?.length ?? 0;
        setMessage(shipped || delivered
          ? `Updated from NZ Post: ${shipped} newly shipped, ${delivered} delivered.`
          : "Up to date with NZ Post.");
        router.refresh();
      }
    } catch {
      setMessage("Couldn't reach NZ Post eShip. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {message && <span role="status" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{message}</span>}
      <button
        type="button"
        onClick={sync}
        disabled={busy}
        title="Pull shipped and delivered orders from NZ Post eShip. This also runs every hour."
        style={{ height: 34, padding: "0 14px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", cursor: busy ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 7, opacity: busy ? 0.7 : 1 }}
      >
        {busy ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <RefreshCw style={{ width: 13, height: 13 }} />}
        {busy ? "Syncing…" : "Sync with NZ Post"}
      </button>
    </div>
  );
}
