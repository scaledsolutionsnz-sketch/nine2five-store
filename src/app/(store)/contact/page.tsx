"use client";

import { useState } from "react";
import { ArrowUpRight, MapPin, Mail } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", height: 48, padding: "0 16px",
    borderRadius: 12, background: "#0e2314",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#F7F7F2", fontSize: 14, outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  return (
    <div style={{ backgroundColor: "#06150C", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={{
        position: "relative",
        backgroundColor: "#07180e",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        {/* Texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/bg-overlay.webp')",
          backgroundSize: "540px auto", backgroundRepeat: "repeat",
          opacity: 0.05, pointerEvents: "none",
        }} />
        {/* Green glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 80% 100%, rgba(46,139,40,0.10) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "clamp(70px,10vw,120px) clamp(20px,4vw,48px) clamp(44px,6vw,70px)",
          position: "relative", zIndex: 1,
        }}>
          <p style={{
            fontSize: 10, letterSpacing: "0.4em", color: "#2E8B28",
            fontWeight: 700, textTransform: "uppercase", marginBottom: 16,
          }}>
            Get In Touch
          </p>
          <h1 className="font-display font-black text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.92, letterSpacing: "-0.02em" }}>
            CONTACT US
          </h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(48px,8vw,96px) clamp(20px,4vw,48px) 96px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
        gap: "clamp(40px, 6vw, 80px)",
        alignItems: "start",
      }}>

        {/* Left — info */}
        <div>
          <h2 className="font-display font-black text-white"
            style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", lineHeight: 1.05, marginBottom: 16 }}>
            Let&apos;s Talk
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 420 }}>
            Whether you&apos;re after teamwear, custom orders, a stockist inquiry, or just want to say kia ora — we&apos;d love to hear from you.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
            {[
              { icon: <MapPin style={{ width: 16, height: 16, color: "#2E8B28" }} />, label: "Location", value: "Masterton, New Zealand", href: null },
              { icon: <Mail style={{ width: 16, height: 16, color: "#2E8B28" }} />, label: "Email", value: "nine2five.co.nz@gmail.com", href: "mailto:nine2five.co.nz@gmail.com" },
              { icon: <span style={{ fontSize: 10, fontWeight: 800, color: "#2E8B28" }}>IG</span>, label: "Instagram", value: "@nine2five.nz", href: "https://instagram.com/nine2five.nz" },
            ].map(({ icon, label, value, href }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#0e2314", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                    {label}
                  </p>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                      style={{ color: "#F7F7F2", fontSize: 14, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                      className="hover:text-[#2E8B28] transition-colors">
                      {value} {href.startsWith("http") && <ArrowUpRight style={{ width: 12, height: 12 }} />}
                    </a>
                  ) : (
                    <p style={{ color: "#F7F7F2", fontSize: 14, fontWeight: 500 }}>{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Club CTA */}
          <div style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(46,139,40,0.06)", border: "1px solid rgba(46,139,40,0.18)", marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "#2E8B28", marginBottom: 10 }}>
              Club &amp; Team Orders
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Custom design free. MOQ 50 pairs. Buy at $12, sell at $25 — your club keeps $650. We send a free mockup before you commit.
            </p>
            <a href="/clubs" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "#2E8B28", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              See the Club Offer →
            </a>
          </div>
          {/* Ambassador */}
          <div style={{ padding: "24px 28px", borderRadius: 16, background: "rgba(46,139,40,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "#2E8B28", marginBottom: 10 }}>
              Ambassador Programme
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Earn $5 per sale, get free socks, and rep a brand you actually believe in.
            </p>
            <a href="/join" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "#2E8B28", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Apply to Join →
            </a>
          </div>
        </div>

        {/* Right — form */}
        <div style={{
          background: "#07180e", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "clamp(24px,4vw,40px)",
        }}>
          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 24px" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(46,139,40,0.1)", border: "1px solid rgba(46,139,40,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
              }}>
                <span style={{ color: "#2E8B28", fontSize: 28, fontWeight: 900 }}>✓</span>
              </div>
              <h3 className="font-display font-black text-white" style={{ fontSize: "1.75rem", marginBottom: 12 }}>Message Sent</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
                Ngā mihi! We&apos;ll get back to you as soon as we can.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-display font-black text-white" style={{ fontSize: "1.25rem", marginBottom: 28 }}>
                Send a Message
              </h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Name</label>
                    <input name="name" type="text" required placeholder="Your name" style={input}
                      onFocus={e => e.currentTarget.style.borderColor = "rgba(46,139,40,0.5)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Email</label>
                    <input name="email" type="email" required placeholder="your@email.com" style={input}
                      onFocus={e => e.currentTarget.style.borderColor = "rgba(46,139,40,0.5)"}
                      onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Subject</label>
                  <select name="subject" required style={{ ...input, cursor: "pointer" }}>
                    <option value="" disabled>Select a topic</option>
                    <option value="Club / Team Order">Club / Team Order (50+ pairs)</option>
                    <option value="Ambassador Enquiry">Ambassador Enquiry</option>
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Stockist Inquiry">Stockist Inquiry</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Message</label>
                  <textarea name="message" required rows={6} placeholder="Tell us what you need..."
                    style={{ ...input, height: "auto", padding: "14px 16px", resize: "none" }}
                    onFocus={e => e.currentTarget.style.borderColor = "rgba(46,139,40,0.5)"}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"} />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%", height: 52,
                  background: loading ? "rgba(46,139,40,0.5)" : "#2E8B28",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#36A832"; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#2E8B28"; }}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
