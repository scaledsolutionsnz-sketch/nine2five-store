"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const code = params.get("code");
    if (!code) { setError("Invalid or expired reset link. Please request a new one."); setExchanging(false); return; }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) setError("This link has expired. Please request a new one.");
      setExchanging(false);
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push("/affiliate/login"), 2500);
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

      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,155,47,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 380, position: "relative" }}>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-0.04em", color: "#ffffff", lineHeight: 1, marginBottom: 10 }}>
            NINE<span style={{ color: "#2f9b2f" }}>2</span>FIVE
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
            Affiliate Portal
          </p>
        </div>

        <div style={{ padding: 28, borderRadius: 22, backgroundColor: "rgba(7,24,14,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>

          {exchanging ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <Loader2 style={{ width: 24, height: 24, color: "#2f9b2f" }} className="animate-spin" />
            </div>
          ) : done ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(47,155,47,0.12)", border: "1px solid rgba(47,155,47,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>
                ✓
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>Password updated</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Redirecting you to sign in…</p>
            </div>
          ) : error && !password ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <p style={{ fontSize: 14, color: "#f87171", marginBottom: 20 }}>{error}</p>
              <a href="/affiliate/login" style={{ fontSize: 13, color: "#2f9b2f", textDecoration: "underline" }}>Back to sign in</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>Set new password</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Choose a strong password for your affiliate account.</p>

              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0, display: "flex" }}>
                  {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>

              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(47,155,47,0.6)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
              />

              {error && <p style={{ fontSize: 12, color: "#f87171", paddingLeft: 4 }}>{error}</p>}

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
                {loading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
