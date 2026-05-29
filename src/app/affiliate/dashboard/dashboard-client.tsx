"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Copy, Check, MousePointer, TrendingUp, DollarSign, Clock, LogOut, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Affiliate, AffiliateConversion } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nine2five.nz";

const BG = "#06150C";
const SURFACE = "rgba(7,24,14,0.92)";
const BORDER = "rgba(255,255,255,0.08)";
const ACCENT = "#2f9b2f";
const MUTED = "rgba(255,255,255,0.35)";

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  affiliate: Affiliate;
  conversions: (AffiliateConversion & { orders: { order_number: number } | null })[];
}

export function AffiliateDashboardClient({ affiliate, conversions }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const referralLink = `${SITE_URL}?ref=${affiliate.referral_code}`;
  const pendingPayout = affiliate.total_commission_cents - affiliate.total_paid_cents;
  const isPending = affiliate.status === "pending";
  const isSuspended = affiliate.status === "suspended";

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/affiliate/login");
  }

  const card: React.CSSProperties = {
    borderRadius: 20,
    padding: 24,
    backgroundColor: SURFACE,
    border: `1px solid ${BORDER}`,
    backdropFilter: "blur(12px)",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#ffffff" }}>

      {/* Nav */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(6,21,12,0.88)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" className="font-display font-black" style={{ fontSize: 20, letterSpacing: "-0.03em", color: "#ffffff", textDecoration: "none" }}>
            NINE<span style={{ color: ACCENT }}>2</span>FIVE
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontSize: 14, color: MUTED }}>{affiliate.name}</span>
            <button
              onClick={signOut}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px 64px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Status banners */}
        {isPending && (
          <div style={{ borderRadius: 16, display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 20px", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <Clock style={{ width: 18, height: 18, color: "#EAB308", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#EAB308" }}>Application pending review</p>
              <p style={{ fontSize: 14, marginTop: 4, color: "rgba(234,179,8,0.7)" }}>
                We&apos;ll approve your account within 24 hours. Your link is ready below — start preparing your content.
              </p>
            </div>
          </div>
        )}
        {isSuspended && (
          <div style={{ borderRadius: 16, display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 20px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle style={{ width: 18, height: 18, color: "#EF4444", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>Account suspended</p>
              <p style={{ fontSize: 14, marginTop: 4, color: "rgba(239,68,68,0.7)" }}>Please contact us at info@nine2five.nz.</p>
            </div>
          </div>
        )}

        {/* Page header */}
        <div>
          <h1 className="font-display font-bold" style={{ fontSize: 28, color: "#ffffff", marginBottom: 6 }}>Your Dashboard</h1>
          <p style={{ fontSize: 14, color: MUTED }}>Track your clicks, sales, and earnings.</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Clicks",         value: affiliate.total_clicks.toLocaleString(),      icon: MousePointer, color: "#60A5FA" },
            { label: "Sales",          value: affiliate.total_conversions.toLocaleString(),  icon: TrendingUp,   color: ACCENT },
            { label: "Total Earned",   value: fmt(affiliate.total_commission_cents),          icon: DollarSign,   color: "#FBBF24" },
            { label: "Pending Payout", value: fmt(pendingPayout),                             icon: Clock,        color: "#A78BFA" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>{label}</p>
                <Icon style={{ width: 15, height: 15, color }} strokeWidth={1.8} />
              </div>
              <p className="font-display font-bold" style={{ fontSize: 26, color: "#ffffff" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div style={card}>
          <h2 className="font-display font-bold" style={{ fontSize: 18, color: "#ffffff", marginBottom: 6 }}>Your Referral Link</h2>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 18 }}>
            Share this anywhere. You earn <span style={{ color: "#ffffff", fontWeight: 600 }}>$5 for every sale</span> that comes through it.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0, height: 46, padding: "0 16px", borderRadius: 12, display: "flex", alignItems: "center", overflow: "hidden", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}` }}>
              <code style={{ fontSize: 13, color: ACCENT, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{referralLink}</code>
            </div>
            <button
              onClick={copyLink}
              style={{ display: "flex", alignItems: "center", gap: 8, height: 46, padding: "0 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, color: "#ffffff", flexShrink: 0, cursor: "pointer", border: "none", background: copied ? "rgba(46,139,40,0.3)" : ACCENT, transition: "background 0.2s" }}
            >
              {copied ? <Check style={{ width: 15, height: 15 }} /> : <Copy style={{ width: 15, height: 15 }} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p style={{ fontSize: 12, marginTop: 12, color: "rgba(255,255,255,0.22)" }}>
            Code: <code style={{ fontFamily: "monospace", color: MUTED }}>{affiliate.referral_code}</code>
            {" · "}30-day attribution window
          </p>
        </div>

        {/* How it works */}
        <div style={card}>
          <h2 className="font-display font-bold" style={{ fontSize: 18, color: "#ffffff", marginBottom: 22 }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { n: "1", title: "Share your link", body: "Post it on TikTok, Instagram, YouTube — wherever your audience is." },
              { n: "2", title: "They buy socks",  body: "When someone clicks your link and places an order, it's tracked automatically." },
              { n: "3", title: "You get $5",      body: "We pay out monthly via bank transfer. No minimums, no fuss." },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ display: "flex", gap: 14 }}>
                <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, background: "rgba(46,139,40,0.12)", color: ACCENT, border: "1px solid rgba(46,139,40,0.2)" }}>
                  {n}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{title}</p>
                  <p style={{ fontSize: 12, marginTop: 5, lineHeight: 1.6, color: MUTED }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission history */}
        <div style={{ borderRadius: 20, overflow: "hidden", backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
          <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <h2 className="font-display font-bold" style={{ fontSize: 18, color: "#ffffff" }}>Commission History</h2>
            <p style={{ fontSize: 12, marginTop: 4, color: MUTED }}>
              {conversions.length} sale{conversions.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          {conversions.length === 0 ? (
            <div style={{ padding: "56px 28px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: MUTED }}>No sales yet — share your link to start earning.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Date", "Order", "Earned", "Status"].map((h) => (
                      <th key={h} style={{ padding: "12px 28px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < conversions.length - 1 ? `1px solid ${BORDER}` : undefined }}>
                      <td style={{ padding: "16px 28px", fontSize: 14, color: MUTED }}>{fmtDate(c.created_at)}</td>
                      <td style={{ padding: "16px 28px", fontSize: 14, fontFamily: "monospace", color: "#ffffff" }}>
                        {c.orders ? `#${c.orders.order_number}` : "—"}
                      </td>
                      <td style={{ padding: "16px 28px", fontSize: 14, fontWeight: 600, fontFamily: "monospace", color: ACCENT }}>
                        {fmt(c.commission_cents)}
                      </td>
                      <td style={{ padding: "16px 28px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "capitalize",
                          background: c.status === "paid" ? "rgba(46,139,40,0.15)" : "rgba(234,179,8,0.1)",
                          color: c.status === "paid" ? ACCENT : "#EAB308",
                        }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          Questions?{" "}
          <a href="mailto:info@nine2five.nz" style={{ color: MUTED, textDecoration: "underline" }}>
            info@nine2five.nz
          </a>
        </p>
      </main>

      <style>{`
        @media (max-width: 700px) {
          .aff-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .aff-how { grid-template-columns: 1fr !important; }
          .aff-main { padding: 28px 20px 48px !important; }
          .aff-nav-inner { padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
}
