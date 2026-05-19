"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const statusColor: Record<string, string> = {
    paid:        "bg-[#D5F1E2] text-[#166B3B]",
    in_transit:  "bg-[#FFF4CC] text-[#9A5B00]",
    pending:     "bg-[#F3F4F6] text-[#6B7280]",
    failed:      "bg-[#FEE2E2] text-[#991B1B]",
    canceled:    "bg-[#FEE2E2] text-[#991B1B]",
  };

  return (
    <div className="p-6 rounded-[14px] bg-white border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-sm text-[#1F2937]">Stripe Account</h2>
        <button
          onClick={load}
          disabled={loading}
          className="h-7 w-7 flex items-center justify-center text-[#6B7280] hover:text-[#334155] rounded hover:bg-[#F3F5F8] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] px-3 py-2 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error === "Unauthorized" ? "Not authorised" : "Could not load Stripe balance — check your STRIPE_SECRET_KEY env var"}
        </div>
      )}

      {balance && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-[14px] bg-[#F3F5F8] border border-[#E2E8F0]">
              <p className="text-xs text-[#6B7280] mb-1">Available</p>
              <p className="font-bold text-2xl text-[#1F2937] font-mono">
                {dollars(balance.available_cents)}
              </p>
              <p className="text-xs text-[#8A94A6] mt-0.5 uppercase">{balance.currency}</p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#F3F5F8] border border-[#E2E8F0]">
              <p className="text-xs text-[#6B7280] mb-1">Pending</p>
              <p className="font-bold text-2xl text-[#6B7280] font-mono">
                {dollars(balance.pending_cents)}
              </p>
              <p className="text-xs text-[#8A94A6] mt-0.5">Clearing</p>
            </div>
          </div>

          {balance.payouts.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-3">
                Recent Payouts
              </p>
              <div className="space-y-2">
                {balance.payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#E5EAF1] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1F2937] font-mono">
                        {dollars(p.amount)} <span className="text-[#8A94A6] font-normal text-xs uppercase">{p.currency}</span>
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(p.arrival_date * 1000).toLocaleDateString("en-NZ")}
                      </p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium",
                      statusColor[p.status] ?? "bg-[#F3F4F6] text-[#6B7280]"
                    )}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {balance.payouts.length === 0 && (
            <p className="text-sm text-[#6B7280]">No payouts yet.</p>
          )}
        </>
      )}

      {loading && !balance && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#C4CAD4]" />
        </div>
      )}
    </div>
  );
}

// ─── Monthly Revenue Table ────────────────────────────────────────────────────

function MonthlyTable({ rows }: { rows: MonthlyRow[] }) {
  const total = rows.reduce((s, r) => s + r.revenue_cents, 0);

  return (
    <div className="p-6 rounded-[14px] bg-white border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      <h2 className="font-semibold text-sm text-[#1F2937] mb-5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#116DFF]" />
        Monthly Revenue — last 12 months
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#EAF2FF", borderBottom: "1px solid #BBD3FF" }}>
              {["Month", "Orders", "Revenue (incl. GST)", "GST (15%)", "Revenue (excl. GST)", "Refunds", "Discounts"].map((h) => (
                <th key={h} className="text-left px-[18px] h-[52px] text-[13px] font-medium text-[#1F2D3D] whitespace-nowrap">
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
                <tr key={r.month} className="border-b border-[#E5EAF1] last:border-0 hover:bg-[#F6FAFF] transition-colors">
                  <td className="px-[18px] py-[14px] font-medium text-[#1F2937] whitespace-nowrap">
                    {new Date(r.month).toLocaleDateString("en-NZ", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-[18px] py-[14px] text-[#334155] font-mono">{r.order_count}</td>
                  <td className="px-[18px] py-[14px] font-medium text-[#1F2937] font-mono">{dollars(r.revenue_cents)}</td>
                  <td className="px-[18px] py-[14px] text-[#334155] font-mono">{dollars(gstAmt)}</td>
                  <td className="px-[18px] py-[14px] text-[#334155] font-mono">{dollars(exGstAmt)}</td>
                  <td className="px-[18px] py-[14px] text-[#991B1B] text-xs font-mono">{r.refund_cents > 0 ? dollars(r.refund_cents) : "—"}</td>
                  <td className="px-[18px] py-[14px] text-[#6B7280] text-xs font-mono">{r.discount_cents > 0 ? dollars(r.discount_cents) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid #BBD3FF" }}>
              <td className="px-[18px] py-[14px] font-bold text-[#1F2937]">Total</td>
              <td className="px-[18px] py-[14px] text-[#334155] font-mono">{rows.reduce((s, r) => s + r.order_count, 0)}</td>
              <td className="px-[18px] py-[14px] font-bold text-[#116DFF] font-mono">{dollars(total)}</td>
              <td className="px-[18px] py-[14px] text-[#334155] font-mono">{dollars(gst(total))}</td>
              <td className="px-[18px] py-[14px] text-[#334155] font-mono">{dollars(exGst(total))}</td>
              <td className="px-[18px] py-[14px] text-[#991B1B] font-mono">{dollars(rows.reduce((s, r) => s + r.refund_cents, 0))}</td>
              <td className="px-[18px] py-[14px] text-[#6B7280] font-mono">{dollars(rows.reduce((s, r) => s + r.discount_cents, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Export Panel ─────────────────────────────────────────────────────────────

const FORMATS = [
  { value: "orders", label: "Orders CSV",     desc: "All order data — works with any software" },
  { value: "gst",    label: "GST Report",     desc: "NZ GST summary for filing" },
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

  const inputClass = "h-10 px-3.5 rounded-lg bg-white border border-[#E2E8F0] text-[13px] text-[#334155] focus:outline-none focus:border-[#116DFF]/50 transition-colors";

  return (
    <div className="p-6 rounded-[14px] bg-white border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      <h2 className="font-semibold text-sm text-[#1F2937] mb-1">Export</h2>
      <p className="text-xs text-[#6B7280] mb-5">
        Download accounting data for MYOB, Xero, or your accountant. All amounts in NZD.
      </p>

      {/* Format selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            className={cn(
              "p-4 rounded-xl border text-left transition-colors",
              format === f.value
                ? "border-[#116DFF]/30 bg-[#EAF2FF]"
                : "border-[#E2E8F0] bg-white hover:border-[#116DFF]/20 hover:bg-[#F6FAFF]"
            )}
          >
            <p className={cn("text-[13px] font-semibold leading-snug", format === f.value ? "text-[#116DFF]" : "text-[#334155]")}>
              {f.label}
            </p>
            <p className="text-[12px] text-[#6B7280] mt-1 leading-snug">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="flex items-end gap-3 mb-5">
        <div className="flex-1">
          <label className="block text-[12px] font-medium text-[#6B7280] mb-2">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(inputClass, "w-full")} />
        </div>
        <div className="flex-1">
          <label className="block text-[12px] font-medium text-[#6B7280] mb-2">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={cn(inputClass, "w-full")} />
        </div>
        <div>
          <button
            onClick={download}
            disabled={loading || !from || !to}
            className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />}
            Download
          </button>
        </div>
      </div>

      <p className="text-xs text-[#8A94A6]">
        GST calculated at 15% (tax-inclusive) · NZ GST formula: amount × 3/23
      </p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AccountingClient({ monthlyData }: { monthlyData: MonthlyRow[] }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        <MonthlyTable rows={monthlyData} />
        <StripePanel />
      </div>
      <ExportPanel />
    </div>
  );
}
