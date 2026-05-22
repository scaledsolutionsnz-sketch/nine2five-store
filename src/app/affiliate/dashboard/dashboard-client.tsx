"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Copy, Check, MousePointer, TrendingUp, DollarSign, Clock, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { Affiliate, AffiliateConversion } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nine2five.nz";

const STATUS_COLOURS: Record<string, string> = {
  pending:  "bg-[#FFF4CC] text-[#9A5B00]",
  approved: "bg-[#D5F1E2] text-[#166B3B]",
  paid:     "bg-[#D5F1E2] text-[#166B3B]",
  reversed: "bg-[#FEE2E2] text-[#991B1B]",
};

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

  return (
    <div className="bg-[#F1F5F9] min-h-screen">
      {/* Nav */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display font-black text-xl tracking-tight text-[#1F2937]">
            NINE2FIVE
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#6B7280]">{affiliate.name}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#334155] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Status banner */}
        {isPending && (
          <div className="bg-[#FFF4CC] border border-[#FDE68A] rounded-2xl px-6 py-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#9A5B00] mt-0.5 shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-[#9A5B00]">Application pending review</p>
              <p className="text-[13px] text-[#9A5B00]/80 mt-0.5">
                We&apos;ll approve your account within 24 hours and let you know by email.
                Your link is ready below so you can prepare your content.
              </p>
            </div>
          </div>
        )}
        {isSuspended && (
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-2xl px-6 py-4">
            <p className="text-[14px] font-semibold text-[#991B1B]">Account suspended</p>
            <p className="text-[13px] text-[#991B1B]/80 mt-0.5">Please contact us at info@nine2five.nz.</p>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-[22px] font-bold text-[#1F2937]">Your Dashboard</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Track your clicks, sales, and earnings in real time.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Clicks",  value: affiliate.total_clicks.toLocaleString(),      icon: MousePointer, color: "#1E40AF", bg: "bg-[#DBEAFE]" },
            { label: "Total Sales",   value: affiliate.total_conversions.toLocaleString(),  icon: TrendingUp,   color: "#166B3B", bg: "bg-[#D5F1E2]" },
            { label: "Total Earned",  value: fmt(affiliate.total_commission_cents),         icon: DollarSign,   color: "#92400E", bg: "bg-[#FEF3C7]" },
            { label: "Pending Payout",value: fmt(pendingPayout),                            icon: Clock,        color: "#7C3AED", bg: "bg-[#EDE9FE]" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-widest text-[#8A94A6]">{label}</p>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon style={{ width: 15, height: 15, color }} strokeWidth={1.8} />
                </div>
              </div>
              <p className="text-[24px] font-bold font-mono text-[#1F2937]">{value}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <h2 className="text-[14px] font-semibold text-[#1F2937] mb-1">Your Referral Link</h2>
          <p className="text-[13px] text-[#6B7280] mb-4">
            Share this link anywhere. You earn $5 for every sale that comes through it.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center">
              <code className="text-[13px] text-[#116DFF] font-mono truncate">{referralLink}</code>
            </div>
            <button
              onClick={copyLink}
              className="h-11 px-5 rounded-xl bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] transition-colors flex items-center gap-2 shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-[12px] text-[#8A94A6] mt-3">
            Your code: <code className="font-mono bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#334155]">{affiliate.referral_code}</code>
            {" · "}Tracks for 30 days after click
          </p>
        </div>

        {/* How it works */}
        <div className="bg-[#112016] rounded-2xl border border-white/[0.06] p-6">
          <h2 className="text-[14px] font-semibold text-white mb-4">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Share your link", desc: "Post it on TikTok, Instagram, YouTube — wherever your audience is." },
              { step: "2", title: "They buy socks", desc: "When someone clicks your link and places an order, it's tracked automatically." },
              { step: "3", title: "You get paid $5", desc: "We pay out monthly via bank transfer. No minimums." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-[#3a7722]/30 border border-[#3a7722]/40 flex items-center justify-center text-[12px] font-bold text-[#3a7722] shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="text-[12px] text-white/40 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commission history */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-[14px] font-semibold text-[#1F2937]">Commission History</h2>
            <p className="text-[12px] text-[#6B7280] mt-0.5">{conversions.length} sale{conversions.length !== 1 ? "s" : ""} tracked</p>
          </div>
          {conversions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[#8A94A6] text-[13px]">No sales yet — share your link to start earning.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {["Date", "Order", "You Earned", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {conversions.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 text-[13px] text-[#334155]">{fmtDate(c.created_at)}</td>
                    <td className="px-6 py-4 text-[13px] text-[#334155] font-mono">
                      {c.orders ? `#${c.orders.order_number}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-[#1F2937] font-mono">
                      {fmt(c.commission_cents)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium capitalize ${STATUS_COLOURS[c.status] ?? "bg-[#F1F5F9] text-[#6B7280]"}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-center text-[12px] text-[#8A94A6] pb-4">
          Questions? Email us at <a href="mailto:info@nine2five.nz" className="underline hover:text-[#334155]">info@nine2five.nz</a>
        </p>
      </main>
    </div>
  );
}
