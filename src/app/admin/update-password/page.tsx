"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");
    if (errorCode || errorDesc) {
      setError(errorDesc?.replace(/\+/g, " ") || "Link is invalid or has expired. Request a new one.");
      setChecking(false);
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setError("No recovery token found. Please request a new password reset.");
      setChecking(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: err }) => {
        if (err) {
          setError("Link has expired. Please request a new password reset.");
        } else {
          setReady(true);
        }
        setChecking(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push("/admin");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, padding: "0 18px",
    borderRadius: 14, fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#ffffff", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", backgroundColor: "#06150C" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p className="font-display font-black" style={{ fontSize: 36, letterSpacing: "-0.04em", color: "#ffffff", lineHeight: 1, marginBottom: 10 }}>
            NINE<span style={{ color: "#2f9b2f" }}>2</span>FIVE
          </p>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
            Set New Password
          </p>
        </div>

        <div style={{ padding: 28, borderRadius: 22, backgroundColor: "rgba(7,24,14,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {checking ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <Loader2 style={{ width: 20, height: 20, color: "#2f9b2f" }} className="animate-spin" />
            </div>
          ) : error && !ready ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#f87171", marginBottom: 20 }}>{error}</p>
              <a href="/admin/login" style={{ color: "#2f9b2f", fontSize: 13 }}>Back to login</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={inputStyle}
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
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4,
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
