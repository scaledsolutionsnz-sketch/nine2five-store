"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError("Incorrect email or password"); return; }
    router.push("/affiliate/dashboard");
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/affiliate/reset-password`,
    });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    setResetSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, padding: "0 18px",
    borderRadius: 14, fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#ffffff", outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", backgroundColor: "#06150C" }}>

      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,155,47,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 380, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p
            className="font-display font-black"
            style={{ fontSize: 36, letterSpacing: "-0.04em", color: "#ffffff", lineHeight: 1, marginBottom: 10 }}
          >
            NINE<span style={{ color: "#2f9b2f" }}>2</span>FIVE
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
            Ambassador Portal
          </p>
        </div>

        {/* Card */}
        <div style={{ padding: 28, borderRadius: 22, backgroundColor: "rgba(7,24,14,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>

          {mode === "login" ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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

              <div style={{ textAlign: "right", marginTop: -4 }}>
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.3)", padding: 0, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "#f87171", paddingLeft: 4 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", height: 52, borderRadius: 999, border: "none",
                  fontSize: 13, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
                  backgroundColor: loading ? "rgba(47,155,47,0.4)" : "#2f9b2f",
                  color: "#ffffff", cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s", marginTop: 4,
                }}
              >
                {loading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : "Sign In"}
              </button>
            </form>
          ) : resetSent ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(47,155,47,0.12)", border: "1px solid rgba(47,155,47,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span style={{ fontSize: 22 }}>✓</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>Check your email</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                We sent a password reset link to <span style={{ color: "rgba(255,255,255,0.7)" }}>{email}</span>
              </p>
              <button
                onClick={() => { setMode("login"); setResetSent(false); }}
                style={{ marginTop: 20, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 6, margin: "20px auto 0" }}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} /> Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 4, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} /> Back to sign in
              </button>

              <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>Reset your password</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8, lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
              />

              {error && (
                <p style={{ fontSize: 12, color: "#f87171", paddingLeft: 4 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", height: 52, borderRadius: 999, border: "none",
                  fontSize: 13, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase",
                  backgroundColor: loading ? "rgba(47,155,47,0.4)" : "#2f9b2f",
                  color: "#ffffff", cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s", marginTop: 4,
                }}
              >
                {loading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          Want to become an ambassador?{" "}
          <Link href="/join" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline" }}>
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AffiliateLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
