"use client";

import { useState } from "react";
import type { DiscountCode } from "@/types/database";
import { Plus, X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props { codes: DiscountCode[] }

export function DiscountsClient({ codes: initial }: Props) {
  const [codes, setCodes] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);

  const inputClass = "w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors"
        >
          <Plus className="h-4 w-4" /> New Code
        </button>
      </div>

      <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#525252]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {codes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[#525252]">No discount codes yet</td>
              </tr>
            )}
            {codes.map((c) => {
              const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
              const isMaxed = c.max_uses !== null && c.uses >= c.max_uses;
              const active = c.active && !isExpired && !isMaxed;
              return (
                <tr key={c.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-white">{c.code}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}
                        className="text-[#525252] hover:text-white"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#737373] capitalize">{c.type}</td>
                  <td className="px-4 py-3 font-display font-semibold text-white">
                    {c.type === "percentage" ? `${c.value}%` : `$${(c.value / 100).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 text-[#737373]">
                    {c.min_order_cents ? `$${(c.min_order_cents / 100).toFixed(0)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#737373]">
                    {c.uses}{c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[#737373]">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-NZ") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      active
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {active ? "Active" : isExpired ? "Expired" : isMaxed ? "Maxed" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateDiscountModal
          onClose={() => setShowCreate(false)}
          onCreate={(code) => { setCodes((p) => [code, ...p]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function CreateDiscountModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: DiscountCode) => void;
}) {
  const [form, setForm] = useState({
    code: "", type: "percentage" as "percentage" | "fixed",
    value: "", min_order: "", max_uses: "", expires_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: form.type === "percentage" ? parseInt(form.value) : Math.round(parseFloat(form.value) * 100),
        min_order_cents: form.min_order ? Math.round(parseFloat(form.min_order) * 100) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json() as { error: string };
      setError(d.error);
      setLoading(false);
      return;
    }
    const created = await res.json() as DiscountCode;
    onCreate(created);
    toast.success("Discount code created");
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="font-display font-bold text-base">New Discount Code</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-[#525252]" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Code</label>
            <input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))} placeholder="SUMMER20" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#737373] mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "fixed" }))} className={inputClass}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-1.5">
                {form.type === "percentage" ? "Discount %" : "Amount ($)"}
              </label>
              <input required type="number" min="1" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder={form.type === "percentage" ? "20" : "10.00"} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#737373] mb-1.5">Min Order ($)</label>
              <input type="number" value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-1.5">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Expires (optional)</label>
            <input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} className={inputClass} />
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-lg border border-[#262626] text-sm text-[#737373] hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
