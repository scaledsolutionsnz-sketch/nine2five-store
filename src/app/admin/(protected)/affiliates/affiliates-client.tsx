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

const STATUS: Record<AffiliateStatus, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  active: { label: "Active", class: "bg-green-500/10 text-green-400 border-green-500/20" },
  suspended: { label: "Suspended", class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

interface Props {
  affiliates: Affiliate[];
}

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
    navigator.clipboard.writeText(`https://nine2five.co.nz?ref=${code}`);
    toast.success("Referral link copied");
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clicks", value: totals.clicks.toLocaleString(), icon: MousePointer },
          { label: "Conversions", value: totals.conversions.toLocaleString(), icon: TrendingUp },
          { label: "Commission Owed", value: fmt(totals.commission - totals.paid), icon: DollarSign },
          { label: "Affiliates", value: affiliates.length.toString(), icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#737373]">{label}</p>
              <Icon className="h-4 w-4 text-[#404040]" />
            </div>
            <p className="font-display font-bold text-xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#737373]">{affiliates.length} affiliate{affiliates.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Affiliate
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {["Affiliate", "Code", "Status", "Clicks", "Conversions", "Commission", "Rate", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#525252]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[#525252]">
                  No affiliates yet. Add your first referral partner.
                </td>
              </tr>
            )}
            {affiliates.map((a) => (
              <tr key={a.id} className="hover:bg-[#1a1a1a] transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{a.name}</p>
                  <p className="text-xs text-[#525252]">{a.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-[#1e1e1e] px-2 py-0.5 rounded text-[#16a34a]">
                      {a.referral_code}
                    </code>
                    <button
                      onClick={() => copyLink(a.referral_code)}
                      className="text-[#525252] hover:text-white transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    STATUS[a.status].class
                  )}>
                    {STATUS[a.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#a3a3a3]">{a.total_clicks.toLocaleString()}</td>
                <td className="px-4 py-3 text-[#a3a3a3]">{a.total_conversions.toLocaleString()}</td>
                <td className="px-4 py-3 font-display font-semibold text-white">
                  {fmt(a.total_commission_cents)}
                  {a.total_paid_cents > 0 && (
                    <span className="block text-[10px] text-[#525252] font-normal">
                      {fmt(a.total_paid_cents)} paid
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#a3a3a3]">{a.commission_rate}%</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {a.status === "pending" && (
                      <button
                        onClick={() => updateStatus(a.id, "active")}
                        title="Approve"
                        className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#525252] hover:text-green-400 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {a.status === "active" && (
                      <button
                        onClick={() => updateStatus(a.id, "suspended")}
                        title="Suspend"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#525252] hover:text-red-400 transition-colors"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {a.status === "suspended" && (
                      <button
                        onClick={() => updateStatus(a.id, "active")}
                        title="Reactivate"
                        className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#525252] hover:text-green-400 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(a)}
                      className="p-1.5 rounded-lg hover:bg-[#262626] text-[#525252] hover:text-white transition-colors"
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

  const inputClass = "w-full h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="font-display font-bold text-base">New Affiliate</h2>
          <button onClick={onClose} className="text-[#525252] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Full Name</label>
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
            <label className="block text-xs text-[#737373] mb-1.5">Email</label>
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
            <label className="block text-xs text-[#737373] mb-1.5">Referral Code</label>
            <input
              required
              value={form.referral_code}
              onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
              placeholder="wiremu10"
              className={inputClass}
            />
            <p className="text-[10px] text-[#525252] mt-1">
              Link: nine2five.co.nz?ref={form.referral_code || "code"}
            </p>
          </div>
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Commission Rate (%)</label>
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
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-lg border border-[#262626] text-sm text-[#737373] hover:text-white hover:border-[#404040] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors">
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

  const link = `https://nine2five.co.nz?ref=${affiliate.referral_code}`;
  const pending = affiliate.total_commission_cents - affiliate.total_paid_cents;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <div>
            <h2 className="font-display font-bold text-base">{affiliate.name}</h2>
            <p className="text-xs text-[#525252]">{affiliate.email}</p>
          </div>
          <button onClick={onClose} className="text-[#525252] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Clicks", value: affiliate.total_clicks.toLocaleString() },
              { label: "Conversions", value: affiliate.total_conversions.toLocaleString() },
              { label: "Pending Pay", value: fmt(pending) },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#1e1e1e] text-center">
                <p className="text-xs text-[#737373] mb-1">{label}</p>
                <p className="font-display font-bold text-base text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Referral Link</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-[#1a1a1a] border border-[#262626] px-3 py-2 rounded-lg text-[#16a34a] overflow-hidden overflow-ellipsis whitespace-nowrap">
                {link}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}
                className="px-3 py-2 rounded-lg border border-[#262626] text-xs text-[#737373] hover:text-white hover:border-[#404040] transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Commission rate */}
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Commission Rate (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-24 h-10 px-3 rounded-lg bg-[#1a1a1a] border border-[#262626] text-white text-sm focus:outline-none focus:border-[#16a34a]"
              />
              <button
                onClick={saveRate}
                disabled={saving || parseInt(rate) === affiliate.commission_rate}
                className="px-4 h-10 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          {/* Joined */}
          <p className="text-xs text-[#525252]">
            Joined {new Date(affiliate.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
            {affiliate.approved_at && ` · Approved ${new Date(affiliate.approved_at).toLocaleDateString("en-NZ")}`}
          </p>
        </div>
      </div>
    </div>
  );
}
