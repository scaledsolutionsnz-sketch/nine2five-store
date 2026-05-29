"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Check, ArrowUpRight } from "lucide-react";

const BENEFITS = [
  { title: "Free socks every season", desc: "Get hooked up with Nine2Five product every season. Wear what you promote." },
  { title: "$5 commission per sale", desc: "Every order through your link earns you $5. No cap. Track it live on your dashboard." },
  { title: "Monthly payouts", desc: "Bank transfer every month. No minimum threshold. If you earned it, it's yours." },
  { title: "Custom referral link", desc: "Your own branded link — nine2five.nz?ref=yourname. Share it anywhere." },
  { title: "Live earnings dashboard", desc: "See every click, every order, every dollar. No guessing what you've made." },
  { title: "Content collaboration", desc: "We feature our ambassadors on Nine2Five Instagram and help you grow your audience." },
];

const GOOD_FIT = [
  "You play sport, train at a gym, or do pilates regularly",
  "You have followers on Instagram, TikTok, or a tight WhatsApp group",
  "You'd wear Nine2Five socks anyway — this just pays you for it",
  "You're Māori or Pasifika and want to support a homegrown brand",
];

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", referral_code: "", how_promote: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function autoCode(name: string) {
    return name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").slice(0, 15);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/affiliates/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "#06150C", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(46,139,40,0.12)", border: "1px solid rgba(46,139,40,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check style={{ width: 32, height: 32, color: "#2E8B28" }} />
          </div>
          <h1 className="font-display font-black text-white" style={{ fontSize: "2rem", marginBottom: 12 }}>You&apos;re in.</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 32 }}>
            We&apos;ll review your application and get back to you within 24 hours. Once approved, log in and your dashboard is live.
          </p>
          <button
            onClick={() => router.push("/affiliate/login")}
            style={{ height: 52, padding: "0 36px", borderRadius: 9999, background: "#2E8B28", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#06150C", color: "#ffffff", minHeight: "100vh" }}>
      <style>{`
        .join-wrap { max-width: 1280px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 48px); }
        .benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 1024px) { .benefits-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .benefits-grid { grid-template-columns: 1fr; } }
        .form-input { width: 100%; height: 48px; padding: 0 16px; border-radius: 12px; background: #0d2614; border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .form-input:focus { border-color: rgba(46,139,40,0.4); }
        .form-input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Hero */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(100px, 12vw, 160px) clamp(20px, 4vw, 48px) 80px" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "#2E8B28", fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>Ambassador Programme</p>
        <h1 className="font-display font-black" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.92, letterSpacing: "-0.03em", marginBottom: 28 }}>
          WEAR IT.<br />SHARE IT.<br /><span style={{ color: "#2E8B28" }}>GET PAID.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(1rem, 1.5vw, 1.125rem)", lineHeight: 1.7, maxWidth: 500, marginBottom: 16 }}>
          Become a Nine2Five ambassador. Get free socks. Earn $5 every time someone orders through your link. No follower minimum. No corporate nonsense.
        </p>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 14, lineHeight: 1.7, maxWidth: 460, marginBottom: 40 }}>
          If you train, play sport, or just rep Māori culture — you&apos;re already doing the work. We&apos;ll pay you for it.
        </p>
        <a href="#apply" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2E8B28", color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 2.6rem", height: 56, borderRadius: 9999, textDecoration: "none" }}>
          Apply Now — It&apos;s Free <ArrowUpRight style={{ width: 16, height: 16 }} />
        </a>
      </div>

      {/* Benefits */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6rem 0" }}>
        <div className="join-wrap">
          <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "#2E8B28", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>What You Get</p>
          <h2 className="font-display font-black text-white" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 48 }}>THE DEAL</h2>
          <div className="benefits-grid">
            {BENEFITS.map(({ title, desc }) => (
              <div key={title} style={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Check style={{ width: 15, height: 15, color: "#2E8B28", flexShrink: 0 }} />
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", margin: 0 }}>{title}</p>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, paddingLeft: 25 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Good fit */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6rem 0" }}>
        <div className="join-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="fit-grid">
            <style>{`@media (max-width: 768px) { .fit-grid { grid-template-columns: 1fr !important; } }`}</style>
            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "#2E8B28", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Is This For You?</p>
              <h2 className="font-display font-black text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 32 }}>
                YOU&apos;RE A GOOD FIT IF...
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {GOOD_FIT.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <Check style={{ width: 15, height: 15, color: "#2E8B28", flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "2.5rem" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2E8B28", marginBottom: 20 }}>Earnings Example</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "10 sales/month", value: "$50/mo", muted: false, highlight: false },
                  { label: "25 sales/month", value: "$125/mo", muted: false, highlight: false },
                  { label: "50 sales/month", value: "$250/mo", muted: false, highlight: true },
                ].map(({ label, value, highlight }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{label}</p>
                    <p style={{ fontSize: highlight ? 22 : 16, fontWeight: highlight ? 900 : 700, color: highlight ? "#2E8B28" : "rgba(255,255,255,0.7)" }}>{value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 20, lineHeight: 1.6 }}>$5 per sale, paid monthly. No cap on earnings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6rem 0" }}>
        <div className="join-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="apply-grid">
            <style>{`@media (max-width: 768px) { .apply-grid { grid-template-columns: 1fr !important; } }`}</style>
            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "#2E8B28", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>Apply</p>
              <h2 className="font-display font-black text-white" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 24 }}>
                JOIN THE<br /><span style={{ color: "#2E8B28" }}>TEAM</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 380, marginBottom: 24 }}>
                Takes 2 minutes. We review every application and reply within 24 hours. Once approved, your dashboard is live and your link is ready to share.
              </p>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, lineHeight: 1.6, maxWidth: 360 }}>
                Already an ambassador?{" "}
                <Link href="/affiliate/login" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline" }}>Sign in to your dashboard</Link>
              </p>
            </div>

            <div style={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "clamp(24px, 5vw, 40px)" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Field label="Full Name">
                  <input className="form-input" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, referral_code: autoCode(e.target.value) }))}
                    placeholder="Your name" />
                </Field>
                <Field label="Email">
                  <input className="form-input" required type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com" />
                </Field>
                <Field label="Password">
                  <input className="form-input" required type="password" minLength={8} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters" />
                </Field>
                <Field label="Your Link Code">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.22)", fontFamily: "monospace", pointerEvents: "none" }}>?ref=</span>
                    <input className="form-input" required value={form.referral_code}
                      onChange={e => setForm(f => ({ ...f, referral_code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                      placeholder="yourname" style={{ paddingLeft: 56, fontFamily: "monospace" }} />
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
                    nine2five.nz?ref=<span style={{ color: "rgba(255,255,255,0.45)" }}>{form.referral_code || "yourname"}</span>
                  </p>
                </Field>
                <Field label={<>How will you promote? <span style={{ fontWeight: 400, textTransform: "none" as const, letterSpacing: 0, color: "rgba(255,255,255,0.2)" }}>(optional)</span></>}>
                  <textarea rows={3} value={form.how_promote}
                    onChange={e => setForm(f => ({ ...f, how_promote: e.target.value }))}
                    placeholder="e.g. TikTok, Instagram, team group chat — tell us about your audience"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "#0d2614", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
                </Field>

                {error && (
                  <p style={{ fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, padding: "12px 16px" }}>{error}</p>
                )}

                <button type="submit" disabled={loading} style={{ width: "100%", height: 52, borderRadius: 9999, background: loading ? "rgba(46,139,40,0.5)" : "#2E8B28", color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <>Apply Now — It&apos;s Free <ArrowUpRight style={{ width: 15, height: 15 }} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
