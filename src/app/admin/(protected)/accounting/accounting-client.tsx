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
    paid:        "text-green-600 bg-green-50",
    in_transit:  "text-amber-600 bg-amber-50",
    pending:     "text-gray-500 bg-gray-100",
    failed:      "text-red-500 bg-red-50",
    canceled:    "text-red-500 bg-red-50",
  };

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-semibold text-sm text-gray-900">Stripe Account</h2>
        <button
          onClick={load}
          disabled={loading}
          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error === "Unauthorized" ? "Not authorised" : "Could not load Stripe balance — check your STRIPE_SECRET_KEY env var"}
        </div>
      )}

      {balance && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Available</p>
              <p className="font-display font-bold text-2xl text-gray-900">
                {dollars(balance.available_cents)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{balance.currency}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Pending</p>
              <p className="font-display font-bold text-2xl text-gray-500">
                {dollars(balance.pending_cents)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Clearing</p>
            </div>
          </div>

          {balance.payouts.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Recent Payouts
              </p>
              <div className="space-y-2">
                {balance.payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {dollars(p.amount)} <span className="text-gray-400 font-normal text-xs">{p.currency}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(p.arrival_date * 1000).toLocaleDateString("en-NZ")}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                      statusColor[p.status] ?? "text-gray-500 bg-gray-100"
                    )}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {balance.payouts.length === 0 && (
            <p className="text-sm text-gray-400">No payouts yet.</p>
          )}
        </>
      )}

      {loading && !balance && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
        </div>
      )}
    </div>
  );
}

// ─── Monthly Revenue Table ────────────────────────────────────────────────────

function MonthlyTable({ rows }: { rows: MonthlyRow[] }) {
  const total = rows.reduce((s, r) => s + r.revenue_cents, 0);

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
      <h2 className="font-display font-semibold text-sm text-gray-900 mb-5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#16a34a]" />
        Monthly Revenue — last 12 months
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Month", "Orders", "Revenue (incl. GST)", "GST (15%)", "Revenue (excl. GST)", "Refunds", "Discounts"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap first:pl-0 last:pr-0">
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
                <tr key={r.month} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap first:pl-0">
                    {new Date(r.month).toLocaleDateString("en-NZ", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-3 py-3 text-gray-500">{r.order_count}</td>
                  <td className="px-3 py-3 font-medium text-gray-900">{dollars(r.revenue_cents)}</td>
                  <td className="px-3 py-3 text-gray-500">{dollars(gstAmt)}</td>
                  <td className="px-3 py-3 text-gray-500">{dollars(exGstAmt)}</td>
                  <td className="px-3 py-3 text-red-500 text-xs">{r.refund_cents > 0 ? dollars(r.refund_cents) : "—"}</td>
                  <td className="px-3 py-3 text-gray-400 text-xs last:pr-0">{r.discount_cents > 0 ? dollars(r.discount_cents) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td className="px-3 py-3 font-bold text-gray-900 first:pl-0">Total</td>
              <td className="px-3 py-3 text-gray-500">{rows.reduce((s, r) => s + r.order_count, 0)}</td>
              <td className="px-3 py-3 font-bold text-[#16a34a]">{dollars(total)}</td>
              <td className="px-3 py-3 text-gray-500">{dollars(gst(total))}</td>
              <td className="px-3 py-3 text-gray-500">{dollars(exGst(total))}</td>
              <td className="px-3 py-3 text-red-500">{dollars(rows.reduce((s, r) => s + r.refund_cents, 0))}</td>
              <td className="px-3 py-3 text-gray-400 last:pr-0">{dollars(rows.reduce((s, r) => s + r.discount_cents, 0))}</td>
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

  const inputClass = "h-10 px-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#16a34a] transition-colors";

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
      <h2 className="font-display font-semibold text-sm text-gray-900 mb-1">Export</h2>
      <p className="text-xs text-gray-400 mb-5">
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
                ? "border-[#16a34a] bg-[#16a34a]/5"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
          >
            <p className={cn("text-sm font-semibold", format === f.value ? "text-[#16a34a]" : "text-gray-900")}>
              {f.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1.5">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={cn(inputClass, "w-full")} />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1.5">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={cn(inputClass, "w-full")} />
        </div>
        <div className="pt-5">
          <button
            onClick={download}
            disabled={loading || !from || !to}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />}
            Download
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400">
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
