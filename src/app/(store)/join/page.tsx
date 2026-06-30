"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const BG = "#06150C";
const ACCENT = "#2f9b2f";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.35)";

const inputStyle: React.CSSProperties = {
  width: "100%", height: 52, padding: "0 18px",
  borderRadius: 14, fontSize: 14,
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#ffffff", outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: "auto",
  padding: "14px 18px",
  resize: "vertical",
  minHeight: 88,
  fontFamily: "inherit",
};

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [howPromote, setHowPromote] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          referral_code: referralCode.trim() || undefined,
          how_promote: howPromote.trim() || undefined,
          terms_accepted: termsAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong — please try again");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", color: "#ffffff" }}>

      {/* Background glow */}
      <div style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,155,47,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Nav */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 50, background: "rgba(6,21,12,0.88)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" className="font-display font-black" style={{ fontSize: 20, letterSpacing: "-0.03em", color: "#ffffff", textDecoration: "none" }}>
            NINE<span style={{ color: ACCENT }}>2</span>FIVE
          </Link>
          <Link href="/affiliate/login" style={{ fontSize: 13, color: MUTED, textDecoration: "none", transition: "color 0.2s" }}>
            Already an ambassador? Sign in
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px 80px", position: "relative" }}>

        {done ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(47,155,47,0.12)", border: "1px solid rgba(47,155,47,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle2 style={{ width: 28, height: 28, color: ACCENT }} />
            </div>
            <h1 className="font-display font-black" style={{ fontSize: 28, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: 12 }}>
              Application received!
            </h1>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, marginBottom: 32, maxWidth: 380, margin: "0 auto 32px" }}>
              Your application is now pending approval. We&apos;ll review it within 24 hours and email you as soon as you&apos;re approved — then you can sign in to access your dashboard and ambassador link.
            </p>
            <Link
              href="/affiliate/login"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: ACCENT, color: "#ffffff", fontWeight: 900, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", padding: "16px 36px", borderRadius: 999, textDecoration: "none" }}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,139,40,0.1)", border: "1px solid rgba(46,139,40,0.25)", borderRadius: 999, padding: "6px 16px", marginBottom: 24 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: ACCENT }}>
                  Ambassador Programme
                </span>
              </div>
              <h1 className="font-display font-black" style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: 16 }}>
                WEAR IT.<br />
                SHARE IT.<br />
                <span style={{ color: ACCENT }}>GET PAID.</span>
              </h1>
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                Earn 20% commission on every order you refer. Monthly payouts, no lock-in.
              </p>
            </div>

            {/* Form card */}
            <form onSubmit={handleSubmit} style={{ padding: 28, borderRadius: 22, backgroundColor: "rgba(7,24,14,0.9)", border: `1px solid ${BORDER}`, backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: 48 }}
                    onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0, display: "flex" }}
                  >
                    {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>
                  Referral Code <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>
                </label>
                <input
                  type="text"
                  placeholder={name ? name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_-]/g, "").slice(0, 20) || "your-code" : "e.g. yourname"}
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20))}
                  autoComplete="off"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 6 }}>
                  Your link will be: nine2five.nz?ref=<span style={{ color: MUTED }}>{referralCode || (name ? name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_-]/g, "").slice(0, 20) : "yourcode")}</span>
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>
                  How will you promote? <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>
                </label>
                <textarea
                  placeholder="e.g. TikTok fitness content, YouTube vlogs, Instagram lifestyle..."
                  value={howPromote}
                  onChange={e => setHowPromote(e.target.value)}
                  rows={3}
                  style={textareaStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>

              {/* T&C checkbox */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginTop: 4 }}>
                <div
                  onClick={() => setTermsAccepted(v => !v)}
                  style={{
                    flexShrink: 0, width: 20, height: 20, borderRadius: 6, marginTop: 1,
                    border: termsAccepted ? "2px solid " + ACCENT : "2px solid rgba(255,255,255,0.2)",
                    background: termsAccepted ? "rgba(47,155,47,0.2)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                >
                  {termsAccepted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#2f9b2f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <a href="/affiliate-terms" target="_blank" rel="noopener noreferrer" style={{ color: MUTED, textDecoration: "underline" }}>
                    Ambassador Terms & Conditions
                  </a>
                  , including disclosing paid partnerships when promoting Nine2Five.
                </span>
              </label>

              {error && (
                <p style={{ fontSize: 13, color: "#f87171", paddingLeft: 4 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !termsAccepted}
                style={{
                  width: "100%", height: 54, borderRadius: 999, border: "none",
                  fontSize: 13, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
                  backgroundColor: loading ? "rgba(47,155,47,0.4)" : ACCENT,
                  color: "#ffffff", cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s", marginTop: 4,
                }}
              >
                {loading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : "Apply Now"}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginTop: -2 }}>
                Applications are reviewed before approval. We&apos;ll email you once you&apos;re approved.
              </p>

              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: -2 }}>
                Already have an account?{" "}
                <Link href="/affiliate/login" style={{ color: MUTED, textDecoration: "underline" }}>
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
