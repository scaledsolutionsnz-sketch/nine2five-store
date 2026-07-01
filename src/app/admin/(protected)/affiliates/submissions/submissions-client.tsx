"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Copy, ArrowLeft, Banknote } from "lucide-react";
import { fmtMoney, payoutFields, type SubmissionRow } from "./subm-shared";

const SITE_URL = "https://nine2five.nz";

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  active: { background: "rgba(47,155,47,0.2)", color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)" },
  pending: { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" },
  suspended: { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" },
};

function Copyable({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const empty = !value || value === "—";
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: "0 0 3px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: empty ? "rgba(255,255,255,0.3)" : "#fff", fontFamily: mono ? "monospace" : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {empty ? "—" : value}
        </span>
        {!empty && (
          <button
            onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} copied`); }}
            title={`Copy ${label}`}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0, display: "flex", flexShrink: 0 }}
          >
            <Copy style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}

export function SubmissionsClient({ rows }: { rows: SubmissionRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "#f8f8f2" }}>
      {/* Header */}
      <div>
        <Link href="/admin/affiliates" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 10 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Affiliates
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>Ambassador Submissions</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 4, marginBottom: 0 }}>
          Everything each ambassador has entered, including full payout details. {rows.length} ambassador{rows.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {rows.length === 0 && (
        <div style={{ padding: "64px 18px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14 }}>
          No ambassadors yet.
        </div>
      )}

      {rows.map(({ affiliate: a, discountCode }) => {
        const link = `${SITE_URL}?ref=${a.referral_code}`;
        const pending = a.total_commission_cents - a.total_paid_cents;
        const { method, fields } = payoutFields(a);
        const hasPayout = a.payout_method != null;

        return (
          <div key={a.id} style={{ background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: 22 }}>
            {/* Top: identity + status */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{a.name}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>{a.email}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{a.country ?? "NZ"} · {a.commission_rate}%</span>
                <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, textTransform: "capitalize", ...(STATUS_STYLE[a.status] ?? {}) }}>{a.status}</span>
              </div>
            </div>

            {/* Codes + link */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
              <Copyable label="Referral code" value={a.referral_code} />
              <Copyable label="Referral link" value={link} />
              <Copyable label="Discount code" value={discountCode ?? "—"} />
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 12, marginBottom: 18, paddingBottom: 0 }}>
              {[
                ["Clicks", a.total_clicks.toLocaleString()],
                ["Sales", a.total_conversions.toLocaleString()],
                ["Earned", fmtMoney(a.total_commission_cents)],
                ["Paid", fmtMoney(a.total_paid_cents)],
                ["Owed", fmtMoney(pending)],
              ].map(([label, value]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, fontFamily: "monospace", color: "#fff", margin: "2px 0 0" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Payout details */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Banknote style={{ width: 15, height: 15, color: "#A78BFA" }} />
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  Payout · {method}
                </p>
              </div>
              {hasPayout ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  {fields.map(([label, value]) => (
                    <Copyable key={label} label={label} value={value} mono={!label.toLowerCase().includes("name")} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  No payout details submitted yet — the ambassador adds these in their portal.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
