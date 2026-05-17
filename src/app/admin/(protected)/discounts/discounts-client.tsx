"use client";

import { useState, useRef, useEffect } from "react";
import type { DiscountCode } from "@/types/database";
import { Plus, X, Copy, Tag, Hash, BarChart2, MoreHorizontal, Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(c: DiscountCode) {
  if (!c.active) return false;
  if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
  if (c.max_uses !== null && c.uses >= c.max_uses) return false;
  return true;
}

function statusLabel(c: DiscountCode) {
  if (!c.active) return "Inactive";
  if (c.expires_at && new Date(c.expires_at) < new Date()) return "Expired";
  if (c.max_uses !== null && c.uses >= c.max_uses) return "Maxed";
  return "Active";
}

// ─── Action menu ─────────────────────────────────────────────────────────────

function ActionMenu({ code, onToggle, onDelete }: {
  code: DiscountCode;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
      >
        <MoreHorizontal style={{ width: 15, height: 15 }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <button
            onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Copied"); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Copy style={{ width: 13, height: 13, color: "#6b7280" }} />
            Copy code
          </button>
          <button
            onClick={() => { onToggle(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            {code.active
              ? <><X style={{ width: 13, height: 13, color: "#6b7280" }} /> Deactivate</>
              : <><Check style={{ width: 13, height: 13, color: "#16a34a" }} /> Activate</>
            }
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 style={{ width: 13, height: 13 }} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DiscountsClient({ codes: initial }: { codes: DiscountCode[] }) {
  const [codes, setCodes] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);

  const activeCodes = codes.filter(isActive).length;
  const totalUses   = codes.reduce((sum, c) => sum + c.uses, 0);
  const totalCodes  = codes.length;

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    if (res.ok) {
      setCodes(cs => cs.map(c => c.id === id ? { ...c, active: !current } : c));
      toast.success(!current ? "Code activated" : "Code deactivated");
    }
  }

  async function deleteCode(id: string) {
    const res = await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes(cs => cs.filter(c => c.id !== id));
      toast.success("Code deleted");
    } else {
      const d = await res.json() as { error?: string };
      toast.error(d.error ?? `Delete failed (${res.status})`);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">
            Discount Codes
          </h2>
          <p className="text-[14px] text-gray-400 mt-2">
            Create and manage promo codes for your campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#16a34a" }}
        >
          <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} />
          New Code
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Active Codes",  value: activeCodes.toString(),  sub: `${totalCodes} total`,                        icon: Tag,      iconBg: "bg-emerald-50", iconColor: "#16a34a" },
          { label: "Total Uses",    value: totalUses.toString(),    sub: "across all codes",                            icon: BarChart2, iconBg: "bg-blue-50",    iconColor: "#3b82f6" },
          { label: "Total Codes",   value: totalCodes.toString(),   sub: `${codes.length - activeCodes} inactive`,      icon: Hash,     iconBg: "bg-violet-50",  iconColor: "#7c3aed" },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-200/80 p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none">
                {label}
              </p>
              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                <Icon style={{ width: 15, height: 15, color: iconColor }} strokeWidth={1.8} />
              </div>
            </div>
            <p className="text-[30px] font-bold text-gray-900 tracking-tight leading-none mb-1.5">
              {value}
            </p>
            <p className="text-[12px] text-gray-400 font-medium">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div
        className="bg-white rounded-2xl border border-gray-200/80"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 rounded-t-2xl">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 leading-none">All Codes</h3>
            <p className="text-[12px] text-gray-400 mt-1">{totalCodes} discount codes</p>
          </div>
        </div>

        {codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <Tag style={{ width: 22, height: 22, color: "#d1d5db" }} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-gray-500">No discount codes yet</p>
            <p className="text-[13px] text-gray-400 mt-1">Create your first code to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ backgroundColor: "#fafafa" }}>
                {[
                  { label: "Code",      cls: "pl-6 pr-4 py-3.5 text-left" },
                  { label: "Type",      cls: "px-4 py-3.5 text-left hidden sm:table-cell" },
                  { label: "Value",     cls: "px-4 py-3.5 text-left" },
                  { label: "Min Order", cls: "px-4 py-3.5 text-left hidden md:table-cell" },
                  { label: "Uses",      cls: "px-4 py-3.5 text-left hidden md:table-cell" },
                  { label: "Expires",   cls: "px-4 py-3.5 text-left hidden lg:table-cell" },
                  { label: "Status",    cls: "px-4 py-3.5 text-left" },
                  { label: "",          cls: "pl-4 pr-6 py-3.5 text-right w-10" },
                ].map((h, i) => (
                  <th key={i} className={cn(h.cls, "text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap")}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => {
                const active  = isActive(c);
                const status  = statusLabel(c);
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/70 transition-colors"
                    style={{ borderBottom: i < codes.length - 1 ? "1px solid #f9fafb" : "none" }}
                  >
                    {/* Code */}
                    <td className="pl-6 pr-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-[13px] text-gray-900 tracking-wide">
                          {c.code}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}
                          className="text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          <Copy style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-[13px] text-gray-500 capitalize">
                        {c.type === "fixed" && c.value === 0 ? "Free shipping" : c.type}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-4 py-4">
                      <span className="text-[14px] font-semibold text-gray-900">
                        {c.type === "fixed" && c.value === 0
                          ? <span className="text-blue-600">Free shipping</span>
                          : c.type === "percentage"
                            ? `${c.value}%`
                            : `$${(c.value / 100).toFixed(2)}`}
                      </span>
                    </td>

                    {/* Min order */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-[13px] text-gray-500">
                        {c.min_order_cents ? `$${(c.min_order_cents / 100).toFixed(0)}` : "—"}
                      </span>
                    </td>

                    {/* Uses */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-[13px] text-gray-700 font-medium">
                        {c.uses}
                        {c.max_uses ? <span className="text-gray-400 font-normal"> / {c.max_uses}</span> : ""}
                      </span>
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-[13px] text-gray-500">
                        {c.expires_at
                          ? new Date(c.expires_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })
                          : <span className="text-gray-400">Never</span>}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={cn(
                        "inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full",
                        active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : status === "Expired"
                            ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200"
                            : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                      )}>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
                        {status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pl-4 pr-6 py-4 text-right">
                      <ActionMenu
                        code={c}
                        onToggle={() => toggleActive(c.id, c.active)}
                        onDelete={() => deleteCode(c.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(code) => { setCodes(p => [code, ...p]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: DiscountCode) => void }) {
  const [form, setForm] = useState({
    code: "", type: "percentage" as "percentage" | "fixed" | "free_shipping",
    value: "", min_order: "", max_uses: "", expires_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const field = "w-full h-10 px-3.5 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all";

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
        value: form.type === "free_shipping" ? 0 : form.type === "percentage" ? parseInt(form.value) : Math.round(parseFloat(form.value) * 100),
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900 leading-none">New Discount Code</h2>
            <p className="text-[12px] text-gray-400 mt-1">Create a promo code for your store</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Code</label>
            <input
              required
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))}
              placeholder="SUMMER20"
              className={cn(field, "font-mono tracking-widest")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" | "free_shipping" }))} className={field}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </select>
            </div>
            {form.type !== "free_shipping" && (
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                  {form.type === "percentage" ? "Discount %" : "Amount ($)"}
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "percentage" ? "20" : "10.00"}
                  className={field}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Min Order ($)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="0" className={field} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" className={field} />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Expiry date (optional)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className={field} />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <X style={{ width: 14, height: 14, color: "#ef4444", marginTop: 1, flexShrink: 0 }} />
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#16a34a" }}
            >
              {loading ? "Creating…" : "Create code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
