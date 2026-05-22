"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Copy, Check, MousePointer, TrendingUp, DollarSign, Clock, LogOut, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { Affiliate, AffiliateConversion } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nine2five.nz";

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

  const cardBase = "rounded-2xl border p-5" as const;
  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)" };

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", color: "var(--foreground)" }}>

      {/* Nav */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "rgba(6,21,12,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 flex items-center justify-between" style={{ height: 64 }}>
          <Link href="/" className="font-display font-black text-xl tracking-tight text-white">
            NINE<span style={{ color: "var(--accent)" }}>2</span>FIVE
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-sm hidden sm:block" style={{ color: "var(--muted)" }}>{affiliate.name}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8 space-y-6">

        {/* Status banners */}
        {isPending && (
          <div className="rounded-2xl flex items-start gap-3 px-5 py-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <Clock style={{ width: 18, height: 18, color: "#EAB308", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#EAB308" }}>Application pending review</p>
              <p className="text-sm mt-0.5" style={{ color: "rgba(234,179,8,0.7)" }}>
                We&apos;ll approve your account within 24 hours. Your link is ready below — start preparing your content.
              </p>
            </div>
          </div>
        )}
        {isSuspended && (
          <div className="rounded-2xl flex items-start gap-3 px-5 py-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle style={{ width: 18, height: 18, color: "#EF4444", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#EF4444" }}>Account suspended</p>
              <p className="text-sm mt-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>Please contact us at info@nine2five.nz.</p>
            </div>
          </div>
        )}

        {/* Page header */}
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Your Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Track your clicks, sales, and earnings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Clicks",         value: affiliate.total_clicks.toLocaleString(),     icon: MousePointer, color: "#60A5FA" },
            { label: "Sales",          value: affiliate.total_conversions.toLocaleString(), icon: TrendingUp,   color: "var(--accent)" },
            { label: "Total Earned",   value: fmt(affiliate.total_commission_cents),        icon: DollarSign,   color: "#FBBF24" },
            { label: "Pending Payout", value: fmt(pendingPayout),                           icon: Clock,        color: "#A78BFA" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={cardBase} style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)", fontSize: 10 }}>{label}</p>
                <Icon style={{ width: 15, height: 15, color }} strokeWidth={1.8} />
              </div>
              <p className="font-display font-bold text-2xl text-white font-mono">{value}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className={cardBase} style={cardStyle}>
          <h2 className="font-display font-bold text-white mb-1">Your Referral Link</h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
            Share this anywhere. You earn <span className="text-white font-semibold">$5 for every sale</span> that comes through it.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 h-11 px-4 rounded-xl flex items-center overflow-hidden" style={{ background: "var(--surface-2, #132b19)", border: "1px solid var(--border)" }}>
              <code className="text-sm truncate font-mono" style={{ color: "var(--accent)" }}>{referralLink}</code>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-sm text-white shrink-0 transition-colors"
              style={{ background: copied ? "rgba(46,139,40,0.3)" : "var(--accent)" }}
            >
              {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
            Code: <code className="font-mono" style={{ color: "var(--muted)" }}>{affiliate.referral_code}</code>
            {" · "}30-day attribution window
          </p>
        </div>

        {/* How it works */}
        <div className={cardBase} style={cardStyle}>
          <h2 className="font-display font-bold text-white mb-5">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { n: "1", title: "Share your link", body: "Post it on TikTok, Instagram, YouTube — wherever your audience is." },
              { n: "2", title: "They buy socks",  body: "When someone clicks your link and places an order, it's tracked automatically." },
              { n: "3", title: "You get $5",      body: "We pay out monthly via bank transfer. No minimums, no fuss." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-3">
                <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--accent-light, rgba(46,139,40,0.12))", color: "var(--accent)", border: "1px solid rgba(46,139,40,0.2)" }}>
                  {n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission history */}
        <div className="rounded-2xl overflow-hidden" style={{ ...cardStyle, padding: 0 }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-display font-bold text-white">Commission History</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {conversions.length} sale{conversions.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          {conversions.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm" style={{ color: "var(--muted)" }}>No sales yet — share your link to start earning.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Date", "Order", "Earned", "Status"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < conversions.length - 1 ? "1px solid var(--border)" : undefined }}>
                      <td className="px-6 py-4 text-sm" style={{ color: "var(--muted)" }}>{fmtDate(c.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-white">
                        {c.orders ? `#${c.orders.order_number}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold font-mono" style={{ color: "var(--accent)" }}>
                        {fmt(c.commission_cents)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                          style={{
                            background: c.status === "paid" ? "rgba(46,139,40,0.15)" : "rgba(234,179,8,0.1)",
                            color: c.status === "paid" ? "var(--accent)" : "#EAB308",
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

        <p className="text-center text-xs pb-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          Questions? <a href="mailto:info@nine2five.nz" className="underline transition-colors" style={{ color: "var(--muted)" }}>info@nine2five.nz</a>
        </p>
      </main>
    </div>
  );
}
