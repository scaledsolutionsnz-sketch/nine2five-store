"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function EmailCapture() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("n25_email_seen")) return;
    const t = setTimeout(() => setVisible(true), 40000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem("n25_email_seen", "1");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem("n25_email_seen", "1");
    setTimeout(() => setVisible(false), 3000);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: 24, zIndex: 9000,
      background: "#07180e", border: "1px solid rgba(46,139,40,0.35)",
      borderRadius: 16, padding: "22px 22px 20px", width: 296,
      boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
    }}>
      <button
        onClick={dismiss}
        style={{
          position: "absolute", top: 12, right: 12,
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.25)", padding: 4, lineHeight: 1,
        }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <p style={{ fontSize: 18, marginBottom: 6 }}>✦</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#2E8B28", marginBottom: 4 }}>You&apos;re in.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>First to hear about new drops.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2E8B28", marginBottom: 10 }}>
            Nine2Five Club
          </p>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.35, marginBottom: 6 }}>
            New drops. Team collabs. First.
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16, lineHeight: 1.5 }}>
            No spam. Unsubscribe any time.
          </p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8, padding: "10px 12px",
                fontSize: 13, color: "#fff", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#2E8B28", color: "#fff", border: "none",
                borderRadius: 8, padding: "11px 0",
                fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.12em", cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
              }}
            >
              {loading ? "..." : "Count Me In"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
