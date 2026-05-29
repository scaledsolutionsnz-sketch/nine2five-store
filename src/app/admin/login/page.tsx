"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push("/admin");
    router.refresh();
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
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
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{ padding: 28, borderRadius: 22, backgroundColor: "rgba(7,24,14,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>

          <form onSubmit={signInWithEmail} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.1em" }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={googleLoading}
            style={{
              width: "100%", height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              borderRadius: 14, fontSize: 13, fontWeight: 600,
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.75)",
              cursor: googleLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"; }}
          >
            {googleLoading ? (
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
            ) : (
              <>
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
          Authorised accounts only
        </p>
      </div>
    </div>
  );
}
