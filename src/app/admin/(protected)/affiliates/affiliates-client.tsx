"use client";

import { useState, useTransition, useEffect } from "react";
import type { Affiliate, AffiliatePayout, AffiliateStatus } from "@/types/database";
import {
  Plus, Check, X, Pause, TrendingUp, Users,
  DollarSign, MousePointer, Copy, ChevronDown, Banknote, History, Trash2, AlertTriangle, Loader2, Tag
} from "lucide-react";
import { toast } from "sonner";

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS: Record<AffiliateStatus, { label: string; style: React.CSSProperties }> = {
  pending:   {
    label: "Pending",
    style: {
      background: "rgba(251,191,36,0.15)",
      color: "#fbbf24",
      border: "1px solid rgba(251,191,36,0.25)",
    },
  },
  active:    {
    label: "Active",
    style: {
      background: "rgba(47,155,47,0.2)",
      color: "#4ade80",
      border: "1px solid rgba(47,155,47,0.3)",
    },
  },
  suspended: {
    label: "Suspended",
    style: {
      background: "rgba(239,68,68,0.15)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.25)",
    },
  },
};

interface Props { affiliates: Affiliate[] }

export function AffiliatesClient({ affiliates: initial }: Props) {
  const [affiliates, setAffiliates] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Affiliate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Affiliate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [, startTransition] = useTransition();

  // Create a 10%-off discount code named the same as the ambassador's referral
  // code (so the webhook's code-based attribution credits them). Idempotent.
  async function generateCodes(affiliateId?: string) {
    setGenerating(true);
    const res = await fetch("/api/admin/affiliates/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(affiliateId ? { affiliate_id: affiliateId } : {}),
    });
    setGenerating(false);
    if (!res.ok) { toast.error("Failed to generate codes"); return; }
    const d = await res.json() as { created: string[]; skipped: string[] };
    if (affiliateId) {
      if (d.created.length) toast.success(`Created ${d.created[0]} — 10% off`);
      else toast(`${d.skipped[0] ?? "Code"} already exists`);
    } else {
      toast.success(
        `Created ${d.created.length} code${d.created.length !== 1 ? "s" : ""}` +
        (d.skipped.length ? ` · ${d.skipped.length} already existed` : "")
      );
    }
  }

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
    navigator.clipboard.writeText(`https://nine2five.nz?ref=${code}`);
    toast.success("Referral link copied");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/affiliates/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) { toast.error("Failed to archive affiliate"); return; }
    // Soft-delete: remove from the visible list (tracking data is preserved server-side).
    setAffiliates((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    toast.success(`Archived ${deleteTarget.name}`);
    setDeleteTarget(null);
  }

  void startTransition;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, background: "#06150C", color: "#f8f8f2", minHeight: "100%" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#ffffff", margin: 0 }}>Affiliates</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 0 }}>
            Manage referral partners and track commission.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => generateCodes()}
            disabled={generating}
            title="Create a 10% discount code (named after each referral code) for every active ambassador that doesn't have one"
            style={{
              display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 18px",
              borderRadius: 9999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: generating ? "default" : "pointer", opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <Tag style={{ width: 15, height: 15 }} />}
            Generate 10% codes
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 20px",
              borderRadius: 9999,
              background: "#2f9b2f",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Add Affiliate
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Total Clicks",    value: totals.clicks.toLocaleString(),               icon: MousePointer },
          { label: "Conversions",     value: totals.conversions.toLocaleString(),          icon: TrendingUp   },
          { label: "Commission Owed", value: fmt(totals.commission - totals.paid),         icon: DollarSign   },
          { label: "Affiliates",      value: affiliates.length.toString(),                 icon: Users        },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: "rgba(8,28,16,0.92)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                margin: 0,
              }}>
                {label}
              </p>
              <div style={{
                height: 32,
                width: 32,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(47,155,47,0.15)",
                border: "1px solid rgba(47,155,47,0.3)",
              }}>
                <Icon style={{ width: 15, height: 15, color: "#4ade80" }} strokeWidth={1.8} />
              </div>
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{
        borderRadius: 14,
        background: "rgba(8,28,16,0.92)",
        border: "1px solid rgba(255,255,255,0.09)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", lineHeight: 1, margin: 0 }}>All Affiliates</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 0 }}>
            {affiliates.length} affiliate{affiliates.length !== 1 ? "s" : ""}
          </p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Affiliate", "Code", "Status", "Clicks", "Conversions", "Commission", "Rate", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0 20px",
                    height: 46,
                    textAlign: "left",
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "64px 18px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 13,
                  }}
                >
                  No affiliates yet. Add your first referral partner.
                </td>
              </tr>
            )}
            {affiliates.map((a) => (
              <TableRow
                key={a.id}
                affiliate={a}
                onCopyLink={copyLink}
                onUpdateStatus={updateStatus}
                onSelect={setSelected}
                onDelete={setDeleteTarget}
                onCreateCode={generateCodes}
              />
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

      {/* Soft-delete (archive) confirm */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 440, background: "#0a1f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ height: 40, width: 40, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertTriangle style={{ width: 18, height: 18, color: "#f87171" }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>Archive affiliate?</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>{deleteTarget.name} · <code style={{ fontFamily: "monospace", color: "#4ade80" }}>{deleteTarget.referral_code}</code></p>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 14px" }}>
              This <strong style={{ color: "#fff" }}>archives</strong> the affiliate and hides them from the list. Their tracking data is <strong style={{ color: "#fff" }}>preserved</strong>, not deleted.
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>Clicks attached</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "monospace", margin: "2px 0 0" }}>{deleteTarget.total_clicks.toLocaleString()}</p>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>Conversions</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "monospace", margin: "2px 0 0" }}>{deleteTarget.total_conversions.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ height: 38, padding: "0 16px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: deleting ? "default" : "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 18px", borderRadius: 8, background: "#dc2626", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Trash2 style={{ width: 14, height: 14 }} />}
                {deleting ? "Archiving…" : "Archive affiliate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Extracted to allow hover state via React useState */
function TableRow({
  affiliate: a,
  onCopyLink,
  onUpdateStatus,
  onSelect,
  onDelete,
  onCreateCode,
}: {
  affiliate: Affiliate;
  onCopyLink: (code: string) => void;
  onUpdateStatus: (id: string, status: AffiliateStatus) => void;
  onSelect: (a: Affiliate) => void;
  onDelete: (a: Affiliate) => void;
  onCreateCode: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: hovered ? "rgba(255,255,255,0.02)" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: "18px 20px" }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff", margin: 0 }}>{a.name}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2, marginBottom: 0 }}>{a.email}</p>
      </td>
      <td style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <code style={{
            fontSize: 12,
            background: "rgba(47,155,47,0.15)",
            border: "1px solid rgba(47,155,47,0.3)",
            padding: "2px 8px",
            borderRadius: 4,
            color: "#4ade80",
            fontFamily: "monospace",
          }}>
            {a.referral_code}
          </code>
          <button
            title="Copy referral link"
            onClick={() => onCopyLink(a.referral_code)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(255,255,255,0.35)", display: "flex" }}
          >
            <Copy style={{ width: 12, height: 12 }} />
          </button>
        </div>
        <button
          onClick={() => onCopyLink(a.referral_code)}
          title="Copy referral link"
          style={{ background: "none", border: "none", padding: 0, marginTop: 6, cursor: "pointer", fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "left", display: "block" }}
        >
          nine2five.nz?ref={a.referral_code}
        </button>
      </td>
      <td style={{ padding: "18px 20px" }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          ...STATUS[a.status].style,
        }}>
          {STATUS[a.status].label}
        </span>
      </td>
      <td style={{ padding: "18px 20px", fontSize: 13, color: "#ffffff", fontFamily: "monospace" }}>
        {a.total_clicks.toLocaleString()}
      </td>
      <td style={{ padding: "18px 20px", fontSize: 13, color: "#ffffff", fontFamily: "monospace" }}>
        {a.total_conversions.toLocaleString()}
      </td>
      <td style={{ padding: "18px 20px" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80", fontFamily: "monospace" }}>
          {fmt(a.total_commission_cents)}
        </span>
        {a.total_paid_cents > 0 && (
          <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 400, marginTop: 2 }}>
            {fmt(a.total_paid_cents)} paid
          </span>
        )}
      </td>
      <td style={{ padding: "18px 20px", fontSize: 13, color: "#4ade80", fontFamily: "monospace" }}>
        {a.commission_rate}%
      </td>
      <td style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {a.status === "pending" && (
            <ActionButton
              title="Approve"
              onClick={() => onUpdateStatus(a.id, "active")}
              hoverBg="rgba(47,155,47,0.2)"
              hoverColor="#4ade80"
            >
              <Check style={{ width: 14, height: 14 }} />
            </ActionButton>
          )}
          {a.status === "active" && (
            <ActionButton
              title="Suspend"
              onClick={() => onUpdateStatus(a.id, "suspended")}
              hoverBg="rgba(239,68,68,0.15)"
              hoverColor="#f87171"
            >
              <Pause style={{ width: 14, height: 14 }} />
            </ActionButton>
          )}
          {a.status === "suspended" && (
            <ActionButton
              title="Reactivate"
              onClick={() => onUpdateStatus(a.id, "active")}
              hoverBg="rgba(47,155,47,0.2)"
              hoverColor="#4ade80"
            >
              <Check style={{ width: 14, height: 14 }} />
            </ActionButton>
          )}
          <ActionButton
            title={`Create 10% discount code "${a.referral_code}"`}
            onClick={() => onCreateCode(a.id)}
            hoverBg="rgba(167,139,250,0.2)"
            hoverColor="#A78BFA"
          >
            <Tag style={{ width: 14, height: 14 }} />
          </ActionButton>
          <ActionButton
            title="Details"
            onClick={() => onSelect(a)}
            hoverBg="rgba(255,255,255,0.06)"
            hoverColor="#ffffff"
          >
            <ChevronDown style={{ width: 14, height: 14 }} />
          </ActionButton>
          <ActionButton
            title="Archive (delete)"
            onClick={() => onDelete(a)}
            hoverBg="rgba(239,68,68,0.15)"
            hoverColor="#f87171"
          >
            <Trash2 style={{ width: 14, height: 14 }} />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  hoverBg,
  hoverColor,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  hoverBg: string;
  hoverColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 6,
        borderRadius: 8,
        background: hovered ? hoverBg : "transparent",
        color: hovered ? hoverColor : "rgba(255,255,255,0.35)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 14px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#0d1a12",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        width: "100%",
        maxWidth: 448,
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>New Affiliate</h2>
          <button
            onClick={onClose}
            style={{
              height: 32,
              width: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <form onSubmit={submit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
              Full Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, referral_code: autoCode(name) }));
              }}
              placeholder="Wiremu Bartlett"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="wiremu@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
              Referral Code
            </label>
            <input
              required
              value={form.referral_code}
              onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
              placeholder="wiremu10"
              style={{ ...inputStyle, fontFamily: "monospace" }}
            />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, marginBottom: 0 }}>
              Link: nine2five.nz?ref={form.referral_code || "code"}
            </p>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
              Commission Rate (%)
            </label>
            <input
              required
              type="number"
              min="1"
              max="50"
              value={form.commission_rate}
              onChange={(e) => setForm((f) => ({ ...f, commission_rate: e.target.value }))}
              style={inputStyle}
            />
          </div>
          {error && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              padding: "12px 16px",
            }}>
              <X style={{ width: 14, height: 14, color: "#f87171", marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>{error}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 36,
                padding: "0 16px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                height: 40,
                padding: "0 20px",
                borderRadius: 9999,
                background: "#2f9b2f",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
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
  const [tab, setTab] = useState<"overview" | "payout" | "history">("overview");
  const [payoutAmt, setPayoutAmt] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const pending = affiliate.total_commission_cents - affiliate.total_paid_cents;
  const link = `https://nine2five.nz?ref=${affiliate.referral_code}`;

  useEffect(() => {
    if (tab === "history") {
      setLoadingHistory(true);
      fetch(`/api/admin/affiliates/${affiliate.id}/payout`)
        .then(r => r.json())
        .then((d: AffiliatePayout[]) => { setPayouts(d); setLoadingHistory(false); })
        .catch(() => setLoadingHistory(false));
    }
  }, [tab, affiliate.id]);

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

  async function recordPayout(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(payoutAmt) * 100);
    if (isNaN(cents) || cents <= 0) { toast.error("Enter a valid amount"); return; }
    setPayoutLoading(true);
    const res = await fetch(`/api/admin/affiliates/${affiliate.id}/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_cents: cents, notes: payoutNotes || undefined }),
    });
    if (!res.ok) {
      const d = await res.json() as { error: string };
      toast.error(d.error);
      setPayoutLoading(false);
      return;
    }
    const { affiliate: updated } = await res.json() as { affiliate: Affiliate };
    onUpdate(updated);
    toast.success(`Payout of $${(cents / 100).toFixed(2)} recorded`);
    setPayoutAmt("");
    setPayoutNotes("");
    setPayoutLoading(false);
    setTab("history");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 14px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const tabBtn = (t: typeof tab, label: string, icon: React.ReactNode) => {
    const active = tab === t;
    return (
      <button
        key={t}
        onClick={() => setTab(t)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 12px",
          height: 32,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
          background: active ? "rgba(47,155,47,0.2)" : "transparent",
          color: active ? "#4ade80" : "rgba(255,255,255,0.55)",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {icon}{label}
      </button>
    );
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "#0d1a12",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        width: "100%",
        maxWidth: 512,
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: 0 }}>{affiliate.name}</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2, marginBottom: 0 }}>{affiliate.email}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              height: 32,
              width: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "16px 24px 0" }}>
          {tabBtn("overview", "Overview", <TrendingUp style={{ width: 12, height: 12 }} />)}
          {tabBtn("payout", `Pay Out${pending > 0 ? ` (${fmt(pending)})` : ""}`, <Banknote style={{ width: 12, height: 12 }} />)}
          {tabBtn("history", "History", <History style={{ width: 12, height: 12 }} />)}
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { label: "Clicks",      value: affiliate.total_clicks.toLocaleString() },
                  { label: "Conversions", value: affiliate.total_conversions.toLocaleString() },
                  { label: "Pending Pay", value: fmt(pending) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: 16,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 12,
                      textAlign: "center",
                    }}
                  >
                    <p style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      margin: "0 0 6px",
                    }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "monospace", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                  Referral Link
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <code style={{
                    flex: 1,
                    fontSize: 12,
                    color: "#4ade80",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                    minWidth: 0,
                  }}>
                    {link}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}
                    style={{
                      flexShrink: 0,
                      height: 28,
                      padding: "0 12px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                  Commission Rate (%)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    style={{ ...inputStyle, width: 96, fontFamily: "monospace" }}
                  />
                  <button
                    onClick={saveRate}
                    disabled={saving || parseInt(rate) === affiliate.commission_rate}
                    style={{
                      height: 40,
                      padding: "0 20px",
                      borderRadius: 9999,
                      background: "#2f9b2f",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: saving || parseInt(rate) === affiliate.commission_rate ? "not-allowed" : "pointer",
                      opacity: saving || parseInt(rate) === affiliate.commission_rate ? 0.5 : 1,
                    }}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                Joined {new Date(affiliate.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
                {affiliate.approved_at && ` · Approved ${new Date(affiliate.approved_at).toLocaleDateString("en-NZ")}`}
              </p>
            </>
          )}

          {/* PAYOUT TAB */}
          {tab === "payout" && (
            <form onSubmit={recordPayout} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.09)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div>
                  <p style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    margin: 0,
                  }}>
                    Commission pending
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: "#4ade80", marginTop: 4, marginBottom: 0 }}>
                    {fmt(pending)}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    margin: 0,
                  }}>
                    Total paid
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 0 }}>
                    {fmt(affiliate.total_paid_cents)}
                  </p>
                </div>
              </div>

              {pending <= 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center" }}>
                  <Check style={{ width: 32, height: 32, color: "#4ade80", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, margin: "0 0 4px" }}>All paid up</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>No pending commission for this affiliate.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                      Payout Amount (NZD)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.35)",
                        pointerEvents: "none",
                      }}>
                        $
                      </span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={(pending / 100).toFixed(2)}
                        value={payoutAmt}
                        onChange={(e) => setPayoutAmt(e.target.value)}
                        placeholder={(pending / 100).toFixed(2)}
                        style={{ ...inputStyle, paddingLeft: 28, fontFamily: "monospace" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPayoutAmt((pending / 100).toFixed(2))}
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        color: "#4ade80",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      Pay full amount ({fmt(pending)})
                    </button>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={payoutNotes}
                      onChange={(e) => setPayoutNotes(e.target.value)}
                      placeholder="e.g. Bank transfer 31 May"
                      style={inputStyle}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={payoutLoading}
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 9999,
                      background: "#2f9b2f",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: payoutLoading ? "not-allowed" : "pointer",
                      opacity: payoutLoading ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Banknote style={{ width: 16, height: 16 }} />
                    {payoutLoading ? "Recording…" : "Record Payout"}
                  </button>
                </>
              )}
            </form>
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            <div>
              {loadingHistory ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                  Loading…
                </div>
              ) : payouts.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                  No payouts recorded yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {payouts.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 16,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.09)",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: "#4ade80", margin: 0 }}>
                          {fmt(p.amount_cents)}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, marginBottom: 0 }}>
                          {new Date(p.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                          {p.notes && ` · ${p.notes}`}
                        </p>
                      </div>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        ...(p.status === "completed"
                          ? { background: "rgba(47,155,47,0.2)", color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)" }
                          : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }),
                      }}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "right", marginTop: 4 }}>
                    Total paid: {fmt(payouts.reduce((s, p) => s + (p.status === "completed" ? p.amount_cents : 0), 0))}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
