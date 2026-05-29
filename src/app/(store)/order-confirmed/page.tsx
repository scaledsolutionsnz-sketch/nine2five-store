import Link from "next/link";
import { Suspense } from "react";
import { PurchaseEvent } from "@/components/analytics/purchase-event";

export default function OrderConfirmedPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#06150C" }}
    >
      <Suspense>
        <PurchaseEvent />
      </Suspense>

      {/* Animated tick */}
      <div
        style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(46,139,40,0.12)",
          border: "2px solid rgba(46,139,40,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#2E8B28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Label */}
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.4em", color: "#2E8B28", textTransform: "uppercase", marginBottom: 14 }}>
        Order Confirmed
      </p>

      {/* Heading */}
      <h1
        className="font-display font-black text-white"
        style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 20 }}
      >
        Ngā mihi nui!
      </h1>

      {/* Subtext */}
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 420, marginBottom: 10 }}>
        Your Nine2Five grip socks are on their way. A confirmation email is heading to your inbox now.
      </p>

      {/* Kaupapa line */}
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: 380, marginBottom: 40, fontStyle: "italic" }}>
        Thank you for supporting the kaupapa — every pair helps us back the next generation of NZ athletes.
      </p>

      {/* Divider */}
      <div style={{ width: 40, height: 2, background: "#2E8B28", borderRadius: 2, marginBottom: 40, opacity: 0.5 }} />

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
        <Link
          href="/account/orders"
          style={{
            background: "#2E8B28", color: "#fff", fontWeight: 800,
            fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "16px 32px", borderRadius: 999, textDecoration: "none",
            transition: "background 0.2s",
          }}
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          style={{
            border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.7)",
            fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "15px 32px", borderRadius: 999, textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
