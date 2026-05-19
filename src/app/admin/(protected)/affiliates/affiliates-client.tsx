"use client";

import { useState, useTransition } from "react";
import type { Affiliate, AffiliateStatus } from "@/types/database";
import {
  Plus, Check, X, Pause, TrendingUp, Users,
  DollarSign, MousePointer, Copy, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS: Record<AffiliateStatus, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-[#FFF4CC] text-[#9A5B00]" },
  active:    { label: "Active",    cls: "bg-[#D5F1E2] text-[#166B3B]" },
  suspended: { label: "Suspended", cls: "bg-[#FEE2E2] text-[#991B1B]" },
};

interface Props { affiliates: Affiliate[] }

export function AffiliatesClient({ affiliates: initial }: Props) {
  const [affiliates, setAffiliates] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Affiliate | null>(null);
  const [, startTransition] = useTransition();

  const totals = affiliates.reduce(
    (acc, a) => ({
      clicks: acc.clicks + a.total_clicks,
      conversions: acc.conversions + a.total_conversions,
      commission: acc.commission + a.total_commission_cents,
      paid: acc.paid + a.total_paid_cents,
    }),
    { clicks: 0, conversions: 0, commission: 0, paid: 0 }
  );

  async function updateStatus(id: string, status: AffiliateStatus) {
    const res = await fetch(`/api/admin/affiliates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Failed to update"); return; }
    const updated = await res.json() as Affiliate;
    setAffiliates((prev) => prev.map((a) => a.id === id ? updated : a));
    toast.success(`Affiliate ${status}`);
  }

  function copyLink(code: string) {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://nine2five.co.nz"}?ref=${code}`);
    toast.success("Referral link copied");
  }

  void startTransition;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Affiliates</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Manage referral partners and track commission.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Affiliate
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clicks",    value: totals.clicks.toLocaleString(),                icon: MousePointer, color: "#1E40AF",  bg: "bg-[#DBEAFE]" },
          { label: "Conversions",     value: totals.conversions.toLocaleString(),           icon: TrendingUp,   color: "#166B3B",  bg: "bg-[#D5F1E2]" },
          { label: "Commission Owed", value: fmt(totals.commission - totals.paid),          icon: DollarSign,   color: "#92400E",  bg: "bg-[#FEF3C7]" },
          { label: "Affiliates",      value: affiliates.length.toString(),                  icon: Users,        color: "#7C3AED",  bg: "bg-[#EDE9FE]" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase tracking-widest text-[#8A94A6]">{label}</p>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", bg)}>
                <Icon style={{ width: 15, height: 15, color }} strokeWidth={1.8} />
              </div>
            </div>
            <p className="text-[24px] font-bold font-mono text-[#1F2937]">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[14px] font-semibold text-[#1F2937] leading-none">All Affiliates</h3>
          <p className="text-[12px] text-[#6B7280] mt-1">{affiliates.length} affiliate{affiliates.length !== 1 ? "s" : ""}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#EAF2FF", borderBottom: "1px solid #BBD3FF" }}>
              {["Affiliate", "Code", "Status", "Clicks", "Conversions", "Commission", "Rate", "Actions"].map((h) => (
                <th key={h} className="px-[18px] h-[52px] text-left text-[13px] font-medium text-[#1F2D3D] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAF1]">
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={8} className="px-[18px] py-16 text-center text-[#8A94A6] text-[13px]">
                  No affiliates yet. Add your first referral partner.
                </td>
              </tr>
            )}
            {affiliates.map((a) => (
              <tr key={a.id} className="hover:bg-[#F6FAFF] transition-colors">
                <td className="px-[18px] py-[14px]">
                  <p className="text-[13px] font-medium text-[#1F2937]">{a.name}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">{a.email}</p>
                </td>
                <td className="px-[18px] py-[14px]">
                  <div className="flex items-center gap-2">
                    <code className="text-[12px] bg-[#EAF2FF] border border-[#BBD3FF] px-2 py-0.5 rounded text-[#116DFF] font-mono">
                      {a.referral_code}
                    </code>
                    <button
                      onClick={() => copyLink(a.referral_code)}
                      className="text-[#C4CAD4] hover:text-[#6B7280] transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-[18px] py-[14px]">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium",
                    STATUS[a.status].cls
                  )}>
                    {STATUS[a.status].label}
                  </span>
                </td>
                <td className="px-[18px] py-[14px] text-[13px] text-[#334155] font-mono">{a.total_clicks.toLocaleString()}</td>
                <td className="px-[18px] py-[14px] text-[13px] text-[#334155] font-mono">{a.total_conversions.toLocaleString()}</td>
                <td className="px-[18px] py-[14px]">
                  <span className="text-[13px] font-semibold text-[#1F2937] font-mono">
                    {fmt(a.total_commission_cents)}
                  </span>
                  {a.total_paid_cents > 0 && (
                    <span className="block text-[11px] text-[#6B7280] font-normal mt-0.5">
                      {fmt(a.total_paid_cents)} paid
                    </span>
                  )}
                </td>
                <td className="px-[18px] py-[14px] text-[13px] text-[#334155] font-mono">{a.commission_rate}%</td>
                <td className="px-[18px] py-[14px]">
                  <div className="flex items-center gap-1">
                    {a.status === "pending" && (
                      <button
                        onClick={() => updateStatus(a.id, "active")}
                        title="Approve"
                        className="p-1.5 rounded-lg hover:bg-[#D5F1E2] text-[#6B7280] hover:text-[#166B3B] transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {a.status === "active" && (
                      <button
                        onClick={() => updateStatus(a.id, "suspended")}
                        title="Suspend"
                        className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#6B7280] hover:text-[#991B1B] transition-colors"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {a.status === "suspended" && (
                      <button
                        onClick={() => updateStatus(a.id, "active")}
                        title="Reactivate"
                        className="p-1.5 rounded-lg hover:bg-[#D5F1E2] text-[#6B7280] hover:text-[#166B3B] transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(a)}
                      className="p-1.5 rounded-lg hover:bg-[#F3F5F8] text-[#6B7280] hover:text-[#334155] transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateAffiliateModal
          onClose={() => setShowCreate(false)}
          onCreate={(a) => {
            setAffiliates((prev) => [a, ...prev]);
            setShowCreate(false);
          }}
        />
      )}

      {/* Detail drawer */}
      {selected && (
        <AffiliateDetailModal
          affiliate={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setAffiliates((prev) => prev.map((a) => a.id === updated.id ? updated : a));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}

function CreateAffiliateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (a: Affiliate) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", referral_code: "", commission_rate: "10" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function autoCode(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").slice(0, 15);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, commission_rate: parseInt(form.commission_rate) }),
    });
    if (!res.ok) {
      const d = await res.json() as { error: string };
      setError(d.error);
      setLoading(false);
      return;
    }
    const created = await res.json() as Affiliate;
    onCreate(created);
    toast.success("Affiliate created");
  }

  const inputClass = "w-full h-10 px-3.5 rounded-lg bg-white border border-[#E2E8F0] text-[13px] text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-md" style={{ boxShadow: "0 24px 48px rgba(15,23,42,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[14px] font-semibold text-[#1F2937]">New Affiliate</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-[#6B7280] hover:bg-[#F3F5F8] hover:text-[#334155] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, referral_code: autoCode(name) }));
              }}
              placeholder="Wiremu Bartlett"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="wiremu@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Referral Code</label>
            <input
              required
              value={form.referral_code}
              onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
              placeholder="wiremu10"
              className={cn(inputClass, "font-mono")}
            />
            <p className="text-[11px] text-[#8A94A6] mt-1.5">
              Link: nine2five.co.nz?ref={form.referral_code || "code"}
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Commission Rate (%)</label>
            <input
              required
              type="number"
              min="1"
              max="50"
              value={form.commission_rate}
              onChange={(e) => setForm((f) => ({ ...f, commission_rate: e.target.value }))}
              className={inputClass}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-3">
              <X style={{ width: 14, height: 14, color: "#991B1B", marginTop: 1, flexShrink: 0 }} />
              <p className="text-[12px] text-[#991B1B]">{error}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-9 px-4 rounded-full bg-white border border-[#D8E2F0] hover:bg-[#F4F8FF] text-[#27364A] text-[13px] font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 h-10 px-5 rounded-full bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create Affiliate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AffiliateDetailModal({
  affiliate,
  onClose,
  onUpdate,
}: {
  affiliate: Affiliate;
  onClose: () => void;
  onUpdate: (a: Affiliate) => void;
}) {
  const [rate, setRate] = useState(String(affiliate.commission_rate));
  const [saving, setSaving] = useState(false);

  async function saveRate() {
    setSaving(true);
    const res = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission_rate: parseInt(rate) }),
    });
    if (res.ok) {
      const updated = await res.json() as Affiliate;
      onUpdate(updated);
      toast.success("Commission rate updated");
    } else {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://nine2five.co.nz"}?ref=${affiliate.referral_code}`;
  const pending = affiliate.total_commission_cents - affiliate.total_paid_cents;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg" style={{ boxShadow: "0 24px 48px rgba(15,23,42,0.16)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-[14px] font-semibold text-[#1F2937]">{affiliate.name}</h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">{affiliate.email}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-[#6B7280] hover:bg-[#F3F5F8] hover:text-[#334155] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Clicks", value: affiliate.total_clicks.toLocaleString() },
              { label: "Conversions", value: affiliate.total_conversions.toLocaleString() },
              { label: "Pending Pay", value: fmt(pending) },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
                <p className="text-[11px] uppercase tracking-widest text-[#8A94A6] mb-1.5">{label}</p>
                <p className="text-[18px] font-bold text-[#1F2937] font-mono">{value}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Referral Link</label>
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-white border border-[#E2E8F0]">
              <code className="flex-1 text-[12px] text-[#116DFF] overflow-hidden text-ellipsis whitespace-nowrap font-mono min-w-0">
                {link}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}
                className="shrink-0 h-7 px-3 rounded-md border border-[#D8E2F0] bg-white text-[12px] text-[#27364A] hover:bg-[#F4F8FF] transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Commission rate */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Commission Rate (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-24 h-10 px-3.5 rounded-lg bg-white border border-[#E2E8F0] text-[13px] text-[#334155] focus:outline-none focus:border-[#116DFF]/50 font-mono"
              />
              <button
                onClick={saveRate}
                disabled={saving || parseInt(rate) === affiliate.commission_rate}
                className="h-10 px-5 rounded-full bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          {/* Joined */}
          <p className="text-[12px] text-[#8A94A6]">
            Joined {new Date(affiliate.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
            {affiliate.approved_at && ` · Approved ${new Date(affiliate.approved_at).toLocaleDateString("en-NZ")}`}
          </p>
        </div>
      </div>
    </div>
  );
}
