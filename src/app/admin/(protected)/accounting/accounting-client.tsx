"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
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
    paid:        "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
    in_transit:  "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    pending:     "bg-white/[0.06] text-white/50 border border-white/[0.08]",
    failed:      "bg-red-400/10 text-red-400 border border-red-400/20",
    canceled:    "bg-red-400/10 text-red-400 border border-red-400/20",
  };

  return (
    <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-sm text-white">Stripe Account</h2>
        <button
          onClick={load}
          disabled={loading}
          className="h-7 w-7 flex items-center justify-center text-white/30 hover:text-white/70 rounded hover:bg-white/[0.06] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/[0.08] border border-amber-400/20 px-3 py-2 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error === "Unauthorized" ? "Not authorised" : "Could not load Stripe balance — check your STRIPE_SECRET_KEY env var"}
        </div>
      )}

      {balance && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-1">Available</p>
              <p className="font-bold text-2xl text-white font-mono">
                {dollars(balance.available_cents)}
              </p>
              <p className="text-xs text-white/30 mt-0.5 uppercase">{balance.currency}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-xs text-white/40 mb-1">Pending</p>
              <p className="font-bold text-2xl text-white/50 font-mono">
                {dollars(balance.pending_cents)}
              </p>
              <p className="text-xs text-white/30 mt-0.5">Clearing</p>
            </div>
          </div>

          {balance.payouts.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
                Recent Payouts
              </p>
              <div className="space-y-2">
                {balance.payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white font-mono">
                        {dollars(p.amount)} <span className="text-white/30 font-normal text-xs uppercase">{p.currency}</span>
                      </p>
                      <p className="text-xs text-white/30">
                        {new Date(p.arrival_date * 1000).toLocaleDateString("en-NZ")}
                      </p>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      statusColor[p.status] ?? "bg-white/[0.06] text-white/50 border border-white/[0.08]"
                    )}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {balance.payouts.length === 0 && (
            <p className="text-sm text-white/30">No payouts yet.</p>
          )}
        </>
      )}

      {loading && !balance && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-white/20" />
        </div>
      )}
    </div>
  );
}

// ─── Monthly Revenue Table ────────────────────────────────────────────────────

function MonthlyTable({ rows }: { rows: MonthlyRow[] }) {
  const total = rows.reduce((s, r) => s + r.revenue_cents, 0);

  return (
    <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl">
      <h2 className="font-semibold text-sm text-white mb-5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#4ade80]" />
        Monthly Revenue — last 12 months
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Month", "Orders", "Revenue (incl. GST)", "GST (15%)", "Revenue (excl. GST)", "Refunds", "Discounts"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-white/40 text-xs font-medium uppercase tracking-wider whitespace-nowrap first:pl-0 last:pr-0">
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
                <tr key={r.month} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3 font-medium text-white whitespace-nowrap first:pl-0">
                    {new Date(r.month).toLocaleDateString("en-NZ", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-3 py-3 text-white/50 font-mono">{r.order_count}</td>
                  <td className="px-3 py-3 font-medium text-white font-mono">{dollars(r.revenue_cents)}</td>
                  <td className="px-3 py-3 text-white/50 font-mono">{dollars(gstAmt)}</td>
                  <td className="px-3 py-3 text-white/50 font-mono">{dollars(exGstAmt)}</td>
                  <td className="px-3 py-3 text-red-400 text-xs font-mono">{r.refund_cents > 0 ? dollars(r.refund_cents) : "—"}</td>
                  <td className="px-3 py-3 text-white/30 text-xs font-mono last:pr-0">{r.discount_cents > 0 ? dollars(r.discount_cents) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.1]">
              <td className="px-3 py-3 font-bold text-white first:pl-0">Total</td>
              <td className="px-3 py-3 text-white/50 font-mono">{rows.reduce((s, r) => s + r.order_count, 0)}</td>
              <td className="px-3 py-3 font-bold text-[#4ade80] font-mono">{dollars(total)}</td>
              <td className="px-3 py-3 text-white/50 font-mono">{dollars(gst(total))}</td>
              <td className="px-3 py-3 text-white/50 font-mono">{dollars(exGst(total))}</td>
              <td className="px-3 py-3 text-red-400 font-mono">{dollars(rows.reduce((s, r) => s + r.refund_cents, 0))}</td>
              <td className="px-3 py-3 text-white/30 font-mono last:pr-0">{dollars(rows.reduce((s, r) => s + r.discount_cents, 0))}</td>
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
    const res = await fetch(`/api/admin/accounting/export?from=${from}&to=${to}&format=${format}`);
    setLoading(false);
    if (!res.ok) { return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.headers.get("content-disposition")?.split('filename="')[1]?.replace('"', "") ?? "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass = "h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#4ade80]/40 transition-colors";

  return (
    <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl">
      <h2 className="font-semibold text-sm text-white mb-1">Export</h2>
      <p className="text-xs text-white/40 mb-5">
        Download accounting data for MYOB, Xero, or your accountant. All amounts in NZD.
      </p>

      {/* Format selector */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            className={cn(
              "p-3 rounded-xl border text-left transition-colors",
              format === f.value
                ? "border-[#4ade80]/30 bg-[#4ade80]/[0.06]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
            )}
          >
            <p className={cn("text-sm font-semibold", format === f.value ? "text-[#4ade80]" : "text-white/80")}>
              {f.label}
            </p>
            <p className="text-xs text-white/30 mt-0.5">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-white/40 mb-1.5">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(inputClass, "w-full")} />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-white/40 mb-1.5">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={cn(inputClass, "w-full")} />
        </div>
        <div className="pt-5">
          <button
            onClick={download}
            disabled={loading || !from || !to}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#4ade80] text-black text-sm font-semibold hover:bg-[#86efac] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />}
            Download
          </button>
        </div>
      </div>

      <p className="text-xs text-white/30">
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
