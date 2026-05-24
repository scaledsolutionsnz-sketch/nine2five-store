"use client";

import { useEffect, useState } from "react";
import { Radio, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface LiveData {
  live_now: number;
  sessions_today: number;
  orders_today: number;
  conversion_today: number;
  sessions_month: number;
  orders_month: number;
  conversion_month: number;
  tracking_error: boolean;
}

export function LiveStats({ initialOrdersToday, initialOrdersMonth }: { initialOrdersToday: number; initialOrdersMonth: number }) {
  const [data, setData] = useState<LiveData | null>(null);
  const [pulse, setPulse] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/live-stats");
      if (!res.ok) { setFetchFailed(true); return; }
      const json = await res.json() as Omit<LiveData, "orders_today" | "orders_month" | "conversion_today" | "conversion_month">;
      const ordersToday = initialOrdersToday;
      const ordersMonth = initialOrdersMonth;
      setData({
        ...json,
        orders_today: ordersToday,
        orders_month: ordersMonth,
        conversion_today: json.sessions_today > 0
          ? Math.round((ordersToday / json.sessions_today) * 100 * 10) / 10
          : 0,
        conversion_month: json.sessions_month > 0
          ? Math.round((ordersMonth / json.sessions_month) * 100 * 10) / 10
          : 0,
      });
      setFetchFailed(false);
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    } catch {
      setFetchFailed(true);
    }
  }

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => clearInterval(id);
  }, []);

  const card: React.CSSProperties = {
    background: "#0e1f14",
    borderRadius: 16,
    padding: "18px 22px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  };

  // Show warning when tracking is broken: sessions=0 but we have orders
  const trackingDisconnected =
    data !== null &&
    data.sessions_today === 0 &&
    initialOrdersToday > 0 &&
    !data.tracking_error;

  const trackingError = fetchFailed || (data?.tracking_error ?? false);

  return (
    <>
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      <div className="live-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: trackingDisconnected || trackingError ? 12 : 24 }}>

        {/* Live viewers */}
        <div style={card}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(46,139,40,0.12)", border: "1px solid rgba(46,139,40,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
            <Radio style={{ width: 16, height: 16, color: "#4ade80" }} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
              Live on site
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#ffffff", transition: "opacity 0.2s", opacity: pulse ? 0.6 : 1 }}>
                {data?.live_now ?? "—"}
              </span>
              {data && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>right now</span>}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {data ? "updates every 30s" : "loading…"}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", borderRadius: 999, padding: "3px 8px", border: "1px solid rgba(74,222,128,0.15)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
              LIVE
            </span>
          </div>
        </div>

        {/* Visitors today */}
        <div style={card}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
            <Users style={{ width: 16, height: 16, color: "#60a5fa" }} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
              Visitors today
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: trackingDisconnected ? "#fbbf24" : "#ffffff" }}>
                {data ? data.sessions_today.toLocaleString() : "—"}
              </span>
              {data && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>unique sessions</span>}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {data ? `${data.sessions_month.toLocaleString()} this month` : "loading…"}
            </p>
          </div>
        </div>

        {/* Conversion rate */}
        <div style={card}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
            <TrendingUp style={{ width: 16, height: 16, color: "#fbbf24" }} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
              Conversion rate
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#ffffff" }}>
                {data ? (data.sessions_today > 0 ? `${data.conversion_today}%` : "—") : "—"}
              </span>
              {data && data.sessions_today > 0 && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>today</span>}
            </div>
            {data && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                {data.sessions_today > 0
                  ? `${data.conversion_month}% month · ${data.orders_today} order${data.orders_today !== 1 ? "s" : ""} / ${data.sessions_today} session${data.sessions_today !== 1 ? "s" : ""}`
                  : `${data.orders_today} order${data.orders_today !== 1 ? "s" : ""} · awaiting session data`
                }
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tracking error banner */}
      {trackingError && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 24 }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
          <p style={{ fontSize: 13, color: "#f87171", lineHeight: 1.5 }}>
            <strong>Tracking unavailable</strong> — could not reach the analytics API. Visitor counts may be inaccurate. Check your Supabase service key configuration.
          </p>
        </div>
      )}

      {/* Tracking disconnected warning */}
      {trackingDisconnected && !trackingError && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)", marginBottom: 24 }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "#fbbf24", flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
            <strong style={{ color: "#fbbf24" }}>Visitor tracking was recently restored.</strong> Sessions placed before today were not recorded — historical session data is unavailable. New sessions are being captured from now on.
          </p>
        </div>
      )}
    </>
  );
}
