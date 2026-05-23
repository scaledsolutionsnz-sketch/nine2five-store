"use client";

import { useEffect, useState } from "react";
import { Radio, TrendingUp } from "lucide-react";

interface LiveData {
  live_now: number;
  sessions_today: number;
  orders_today: number;
  conversion_today: number;
  sessions_month: number;
  orders_month: number;
  conversion_month: number;
}

export function LiveStats({ initialOrdersToday, initialOrdersMonth }: { initialOrdersToday: number; initialOrdersMonth: number }) {
  const [data, setData] = useState<LiveData | null>(null);
  const [pulse, setPulse] = useState(false);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/live-stats");
      if (!res.ok) return;
      const json = await res.json() as LiveData;
      setData({ ...json, orders_today: initialOrdersToday, orders_month: initialOrdersMonth,
        conversion_today: json.sessions_today > 0 ? Math.round((initialOrdersToday / json.sessions_today) * 100 * 10) / 10 : 0,
        conversion_month: json.sessions_month > 0 ? Math.round((initialOrdersMonth / json.sessions_month) * 100 * 10) / 10 : 0,
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    } catch { /* silent */ }
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>

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
            <span style={{
              fontSize: 32, fontWeight: 900, color: "#ffffff",
              transition: "opacity 0.2s",
              opacity: pulse ? 0.6 : 1,
            }}>
              {data?.live_now ?? "—"}
            </span>
            {data && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                right now
              </span>
            )}
          </div>
          {data && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {data.sessions_today.toLocaleString()} unique today
            </p>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700,
            color: "#4ade80", background: "rgba(74,222,128,0.1)", borderRadius: 999,
            padding: "3px 8px", border: "1px solid rgba(74,222,128,0.15)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#4ade80",
              display: "inline-block",
              animation: "pulse-dot 2s infinite",
            }} />
            LIVE
          </span>
          <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
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
              {data ? `${data.conversion_today}%` : "—"}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>today</span>
          </div>
          {data && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {data.conversion_month}% this month · {data.orders_today} order{data.orders_today !== 1 ? "s" : ""} / {data.sessions_today} session{data.sessions_today !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
