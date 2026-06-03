"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyRow {
  month: string;
  revenue_cents: number;
  order_count: number;
  refund_cents: number;
  discount_cents: number;
}

interface StripeBalance {
  available_cents: number;
  pending_cents: number;
  currency: string;
  payouts: {
    id: string;
    amount: number;
    currency: string;
    arrival_date: number;
    status: string;
    description: string | null;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dollars(cents: number): string { return `$${(cents / 100).toFixed(2)}`; }
function gst(cents: number): number     { return Math.round(cents * 3 / 23); }
function exGst(cents: number): number   { return cents - gst(cents); }

// ─── Stripe Balance Panel ─────────────────────────────────────────────────────

function StripePanel() {
  const [balance, setBalance] = useState<StripeBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/accounting/stripe-balance");
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setBalance(data);
  }

  useEffect(() => { load(); }, []);

  const statusStyle: Record<string, React.CSSProperties> = {
    paid:       { background: "rgba(47,155,47,0.2)",   color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)" },
    in_transit: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
    pending:    { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" },
    failed:     { background: "rgba(239,68,68,0.15)",  color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" },
    canceled:   { background: "rgba(239,68,68,0.15)",  color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" },
  };

  return (
    <div style={{
      padding: 24,
      borderRadius: 14,
      background: "rgba(8,28,16,0.92)",
      border: "1px solid rgba(255,255,255,0.09)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 14, color: "#ffffff", margin: 0 }}>Stripe Account</h2>
        <button
          onClick={load}
          disabled={loading}
          style={{
            height: 28,
            width: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            background: "transparent",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.4 : 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <RefreshCw style={{ width: 14, height: 14, ...(loading ? { animation: "spin 1s linear infinite" } : {}) }} />
        </button>
      </div>

      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "#f87171",
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.25)",
          padding: "8px 12px",
          borderRadius: 10,
          marginBottom: 16,
        }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          {error === "Unauthorized" ? "Not authorised" : "Could not load Stripe balance — check your STRIPE_SECRET_KEY env var"}
        </div>
      )}

      {balance && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 16,
            }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 4px 0" }}>Available</p>
              <p style={{ fontWeight: 700, fontSize: 24, color: "#4ade80", fontFamily: "monospace", margin: 0 }}>
                {dollars(balance.available_cents)}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2, textTransform: "uppercase" }}>
                {balance.currency}
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 16,
            }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 4px 0" }}>Pending</p>
              <p style={{ fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", margin: 0 }}>
                {dollars(balance.pending_cents)}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Clearing</p>
            </div>
          </div>

          {balance.payouts.length > 0 && (
            <>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 12,
              }}>
                Recent Payouts
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {balance.payouts.map((p, i) => (
                  <div key={p.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: i < balance.payouts.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff", fontFamily: "monospace", margin: 0 }}>
                        {dollars(p.amount)}{" "}
                        <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>
                          {p.currency}
                        </span>
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                        {new Date(p.arrival_date * 1000).toLocaleDateString("en-NZ")}
                      </p>
                    </div>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      ...(statusStyle[p.status] ?? { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }),
                    }}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {balance.payouts.length === 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>No payouts yet.</p>
          )}
        </>
      )}

      {loading && !balance && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
          <Loader2 style={{ width: 20, height: 20, color: "rgba(255,255,255,0.35)", animation: "spin 1s linear infinite" }} />
        </div>
      )}
    </div>
  );
}

// ─── Monthly Revenue Table ────────────────────────────────────────────────────

function MonthlyTable({ rows }: { rows: MonthlyRow[] }) {
  const total = rows.reduce((s, r) => s + r.revenue_cents, 0);
  const headers = ["Month", "Orders", "Revenue (incl. GST)", "GST (15%)", "Revenue (excl. GST)", "Refunds", "Discounts"];

  return (
    <div style={{
      padding: 24,
      borderRadius: 14,
      background: "rgba(8,28,16,0.92)",
      border: "1px solid rgba(255,255,255,0.09)",
    }}>
      <h2 style={{ fontWeight: 600, fontSize: 14, color: "#ffffff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <TrendingUp style={{ width: 16, height: 16, color: "#4ade80" }} />
        Monthly Revenue — last 12 months
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {headers.map((h) => (
                <th key={h} style={{
                  textAlign: "left",
                  padding: "0 18px",
                  height: 44,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const gstAmt   = gst(r.revenue_cents);
              const exGstAmt = exGst(r.revenue_cents);
              return (
                <tr
                  key={r.month}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "default" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "14px 18px", fontWeight: 500, color: "#ffffff", whiteSpace: "nowrap" }}>
                    {new Date(r.month).toLocaleDateString("en-NZ", { month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 18px", color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{r.order_count}</td>
                  <td style={{ padding: "14px 18px", fontWeight: 500, color: "#4ade80", fontFamily: "monospace" }}>{dollars(r.revenue_cents)}</td>
                  <td style={{ padding: "14px 18px", color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{dollars(gstAmt)}</td>
                  <td style={{ padding: "14px 18px", color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{dollars(exGstAmt)}</td>
                  <td style={{ padding: "14px 18px", color: r.refund_cents > 0 ? "#f87171" : "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "monospace" }}>
                    {r.refund_cents > 0 ? dollars(r.refund_cents) : "—"}
                  </td>
                  <td style={{ padding: "14px 18px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "monospace" }}>
                    {r.discount_cents > 0 ? dollars(r.discount_cents) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "#ffffff" }}>Total</td>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>{rows.reduce((s, r) => s + r.order_count, 0)}</td>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "#4ade80", fontFamily: "monospace" }}>{dollars(total)}</td>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>{dollars(gst(total))}</td>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>{dollars(exGst(total))}</td>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "#f87171", fontFamily: "monospace" }}>{dollars(rows.reduce((s, r) => s + r.refund_cents, 0))}</td>
              <td style={{ padding: "14px 18px", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{dollars(rows.reduce((s, r) => s + r.discount_cents, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Export Panel ─────────────────────────────────────────────────────────────

const FORMATS = [
  { value: "orders", label: "Orders CSV",      desc: "All order data — works with any software" },
  { value: "gst",    label: "GST Report",      desc: "NZ GST summary for filing" },
  { value: "myob",   label: "MYOB / Xero CSV", desc: "Sales journal import format" },
] as const;

type ExportFormat = typeof FORMATS[number]["value"];

function ExportPanel() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [from, setFrom]     = useState(firstOfMonth);
  const [to, setTo]         = useState(today);
  const [format, setFormat] = useState<ExportFormat>("orders");
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounting/export?from=${from}&to=${to}&format=${format}`);
      if (!res.ok) { toast.error("Export failed. Please try again."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("content-disposition")?.split('filename="')[1]?.replace('"', "") ?? "export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      padding: 24,
      borderRadius: 14,
      background: "rgba(8,28,16,0.92)",
      border: "1px solid rgba(255,255,255,0.09)",
    }}>
      <h2 style={{ fontWeight: 600, fontSize: 14, color: "#ffffff", margin: "0 0 4px 0" }}>Export</h2>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 20px 0" }}>
        Download accounting data for MYOB, Xero, or your accountant. All amounts in NZD.
      </p>

      {/* Format selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {FORMATS.map((f) => {
          const selected = format === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              style={{
                padding: 16,
                borderRadius: 12,
                border: selected ? "1px solid rgba(47,155,47,0.3)" : "1px solid rgba(255,255,255,0.08)",
                background: selected ? "rgba(47,155,47,0.15)" : "rgba(255,255,255,0.04)",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", margin: "0 0 4px 0", lineHeight: 1.3 }}>
                {f.label}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Date range */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{
              width: "100%",
              height: 40,
              padding: "0 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{
              width: "100%",
              height: 40,
              padding: "0 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <button
            onClick={download}
            disabled={loading || !from || !to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 20px",
              borderRadius: 9999,
              background: "#2f9b2f",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: loading || !from || !to ? "not-allowed" : "pointer",
              opacity: loading || !from || !to ? 0.5 : 1,
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
              : <Download style={{ width: 16, height: 16 }} />}
            Download
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
        GST calculated at 15% (tax-inclusive) · NZ GST formula: amount × 3/23
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AccountingClient({ monthlyData }: { monthlyData: MonthlyRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <MonthlyTable rows={monthlyData} />
        <StripePanel />
      </div>
      <ExportPanel />
    </div>
  );
}
