"use client";

import { useState, useRef, useEffect } from "react";
import type { DiscountCode } from "@/types/database";
import { Plus, X, Copy, Tag, Hash, BarChart2, MoreHorizontal, Check, Trash2 } from "lucide-react";
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
        className="h-7 w-7 rounded-lg flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all"
      >
        <MoreHorizontal style={{ width: 15, height: 15 }} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-44 bg-[#18181b] border border-white/[0.1] rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
          <button
            onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Copied"); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors text-left"
          >
            <Copy style={{ width: 13, height: 13 }} />
            Copy code
          </button>
          <button
            onClick={() => { onToggle(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors text-left"
          >
            {code.active
              ? <><X style={{ width: 13, height: 13 }} /> Deactivate</>
              : <><Check style={{ width: 13, height: 13, color: "#4ade80" }} /> Activate</>
            }
          </button>
          <div className="h-px bg-white/[0.06] my-1" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
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
          <h2 className="text-[24px] font-bold text-white tracking-tight leading-none">
            Discount Codes
          </h2>
          <p className="text-[14px] text-white/45 mt-2">
            Create and manage promo codes for your campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-black bg-[#4ade80] hover:bg-[#86efac] transition-all"
        >
          <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} />
          New Code
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Active Codes",  value: activeCodes.toString(),  sub: `${totalCodes} total`,                        icon: Tag,      iconColor: "#4ade80",  iconBg: "bg-[#4ade80]/[0.08]" },
          { label: "Total Uses",    value: totalUses.toString(),    sub: "across all codes",                            icon: BarChart2, iconColor: "#60a5fa",  iconBg: "bg-blue-400/[0.08]" },
          { label: "Total Codes",   value: totalCodes.toString(),   sub: `${codes.length - activeCodes} inactive`,      icon: Hash,     iconColor: "#a78bfa",  iconBg: "bg-violet-400/[0.08]" },
        ].map(({ label, value, sub, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="bg-[#111113] border border-white/[0.06] rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest leading-none">
                {label}
              </p>
              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                <Icon style={{ width: 15, height: 15, color: iconColor }} strokeWidth={1.8} />
              </div>
            </div>
            <p className="text-[30px] font-bold text-white tracking-tight leading-none mb-1.5 font-mono">
              {value}
            </p>
            <p className="text-[12px] text-white/40 font-medium">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111113] border border-white/[0.06] rounded-xl">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] rounded-t-xl">
          <div>
            <h3 className="text-[15px] font-semibold text-white leading-none">All Codes</h3>
            <p className="text-[12px] text-white/40 mt-1">{totalCodes} discount codes</p>
          </div>
        </div>

        {codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <Tag style={{ width: 22, height: 22, color: "rgba(244,244,245,0.2)" }} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-white/50">No discount codes yet</p>
            <p className="text-[13px] text-white/30 mt-1">Create your first code to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04] bg-[#111113]">
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
                  <th key={i} className={cn(h.cls, "text-white/40 text-xs font-medium uppercase tracking-wider whitespace-nowrap")}>
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
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: i < codes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    {/* Code */}
                    <td className="pl-6 pr-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-[13px] text-white tracking-wide">
                          {c.code}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}
                          className="text-white/20 hover:text-white/50 transition-colors"
                        >
                          <Copy style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-[13px] text-white/50 capitalize">
                        {c.type === "fixed" && c.value === 0 ? "Free shipping" : c.type}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-4 py-4">
                      <span className="text-[14px] font-semibold text-white font-mono">
                        {c.type === "fixed" && c.value === 0
                          ? <span className="text-blue-400">Free shipping</span>
                          : c.type === "percentage"
                            ? `${c.value}%`
                            : `$${(c.value / 100).toFixed(2)}`}
                      </span>
                    </td>

                    {/* Min order */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-[13px] text-white/50 font-mono">
                        {c.min_order_cents ? `$${(c.min_order_cents / 100).toFixed(0)}` : "—"}
                      </span>
                    </td>

                    {/* Uses */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-[13px] text-white/70 font-medium font-mono">
                        {c.uses}
                        {c.max_uses ? <span className="text-white/30 font-normal"> / {c.max_uses}</span> : ""}
                      </span>
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-[13px] text-white/50">
                        {c.expires_at
                          ? new Date(c.expires_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })
                          : <span className="text-white/30">Never</span>}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        active
                          ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                          : status === "Expired"
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                            : "bg-white/[0.06] text-white/50 border border-white/[0.08]"
                      )}>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] mr-1.5" />}
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

  const field = "w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#4ade80]/40 transition-all";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111113] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[16px] font-semibold text-white leading-none">New Discount Code</h2>
            <p className="text-[12px] text-white/40 mt-1">Create a promo code for your store</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-white/50 mb-1.5">Code</label>
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
              <label className="block text-[12px] font-medium text-white/50 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" | "free_shipping" }))} className={cn(field, "bg-[#18181b]")}>
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </select>
            </div>
            {form.type !== "free_shipping" && (
              <div>
                <label className="block text-[12px] font-medium text-white/50 mb-1.5">
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
              <label className="block text-[12px] font-medium text-white/50 mb-1.5">Min Order ($)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="0" className={field} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-white/50 mb-1.5">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" className={field} />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-white/50 mb-1.5">Expiry date (optional)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className={cn(field, "bg-[#18181b]")} />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-400/[0.08] border border-red-400/20 rounded-xl px-4 py-3">
              <X style={{ width: 14, height: 14, color: "#f87171", marginTop: 1, flexShrink: 0 }} />
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[13px] font-medium text-white/70 hover:bg-white/[0.1] hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-black bg-[#4ade80] hover:bg-[#86efac] transition-all disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
