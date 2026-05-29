import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ambassador Programme — Nine2Five",
  description: "Become a Nine2Five ambassador. Coming soon.",
};

export default function JoinPage() {
  return (
    <div style={{
      backgroundColor: "#06150C",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(100px, 12vw, 160px) clamp(20px, 4vw, 48px)",
      textAlign: "center",
    }}>

      {/* Coming soon tag */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(46,139,40,0.1)", border: "1px solid rgba(46,139,40,0.25)",
        borderRadius: 999, padding: "6px 16px", marginBottom: 40,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E8B28", display: "inline-block" }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2E8B28" }}>
          Coming Soon
        </span>
      </div>

      {/* Label */}
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
        Ambassador Programme
      </p>

      {/* Headline */}
      <h1
        className="font-display font-black"
        style={{
          fontSize: "clamp(3.5rem, 10vw, 8rem)",
          lineHeight: 0.92,
          letterSpacing: "-0.03em",
          color: "#ffffff",
          marginBottom: 32,
          maxWidth: 800,
        }}
      >
        WEAR IT.<br />
        SHARE IT.<br />
        <span style={{ color: "#2E8B28" }}>GET PAID.</span>
      </h1>

      {/* Sub */}
      <p style={{
        fontSize: "clamp(15px, 2vw, 18px)",
        color: "rgba(255,255,255,0.4)",
        lineHeight: 1.7,
        maxWidth: 480,
        marginBottom: 48,
      }}>
        The Nine2Five ambassador programme is launching soon. Get notified when applications open.
      </p>

      {/* Notify CTA */}
      <a
        href="mailto:nine2five.co.nz@gmail.com?subject=Ambassador%20Programme%20%E2%80%94%20Notify%20Me&body=Hey%2C%20I%27d%20love%20to%20be%20notified%20when%20the%20ambassador%20programme%20opens."
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#2E8B28", color: "#ffffff",
          fontWeight: 900, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "16px 36px", borderRadius: 999, textDecoration: "none",
          transition: "background 0.2s",
        }}
      >
        Notify Me When It Opens
      </a>

      {/* Hint */}
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", marginTop: 20 }}>
        No spam. One email when we launch.
      </p>

    </div>
  );
}
