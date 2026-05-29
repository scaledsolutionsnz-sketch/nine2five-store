import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import ClubsForm from "./ClubsForm";

export const metadata: Metadata = {
  title: "Clubs & Teams — Nine2Five",
  description: "Custom grip socks for your club. Your logo, your colours. Free design. MOQ 50 pairs. Your club keeps the margin.",
};

const STEPS = [
  { num: "01", title: "Fill in the form below", desc: "Tell us your club name, sport, colours, and rough size split. Takes 2 minutes." },
  { num: "02", title: "We send a free mockup", desc: "Within 48 hours we'll send a design preview with your logo and colours. No cost, no obligation." },
  { num: "03", title: "Approve and place your order", desc: "Happy with the design? Pay a deposit and we lock in production. Balance on delivery." },
  { num: "04", title: "Sell. Keep the margin.", desc: "Sell at $25 each. Buy at $12. Your club keeps $650+ from one order — no volunteers, no weekend stalls." },
];

const NUMBERS = [
  { stat: "Free", label: "Design & Mockup" },
  { stat: "50", label: "Min. Order (pairs)" },
  { stat: "$12", label: "Your price per pair" },
  { stat: "$650", label: "Club revenue (50 pairs @ $25)" },
];

const FAQS = [
  { q: "What's the minimum order?", a: "50 pairs. First 50 pairs at $12 each. First 100 pairs at $10 each. Custom sizing and colour split available." },
  { q: "How much does the design cost?", a: "Nothing. Design and mockups are completely free. You only pay when you're ready to order." },
  { q: "How long does production take?", a: "Once you approve the design and pay a deposit, production is approximately 3–5 weeks. We'll confirm the exact lead time when you enquire." },
  { q: "Can we sell them as a fundraiser?", a: "Yes — that's the most common use. Buy at wholesale, sell at retail, keep the difference. One order of 50 pairs can raise $650+ for your club." },
  { q: "Do you ship to Australia?", a: "Yes. NZ shipping is 2–4 business days. Australia is 5–10 business days." },
  { q: "Can we see a sample before committing?", a: "Yes. DM or email us and we'll send you a sample pair so you can check the quality before placing a bulk order." },
];

export default function ClubsPage() {
  return (
    <div style={{ backgroundColor: "#06150C", color: "#ffffff", minHeight: "100vh" }}>

      {/* ── Coming Soon Banner ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#2E8B28", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", color: "#ffffff", textTransform: "uppercase" }}>
          Coming Soon — Club orders launching shortly. Register your interest below.
        </span>
      </div>
      <div style={{ height: 40 }} />
      <style>{`
        .clubs-hero { max-width: 1280px; margin: 0 auto; padding: clamp(100px, 12vw, 160px) clamp(20px, 4vw, 48px) 80px; }
        .clubs-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 1024px) { .clubs-steps { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .clubs-steps { grid-template-columns: 1fr; } }
        .clubs-numbers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 768px)  { .clubs-numbers { grid-template-columns: repeat(2, 1fr); } }
        .faq-item { padding: 24px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .section-label { font-size: 11px; letter-spacing: 0.35em; color: #2E8B28; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
        .section-title { font-size: clamp(2.5rem, 6vw, 5rem); line-height: 0.95; font-weight: 900; letter-spacing: -0.03em; color: #ffffff; }
        .page-wrap { max-width: 1280px; margin: 0 auto; padding: 0 clamp(20px, 4vw, 48px); }
        .contact-form { background: #0d1f12; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: clamp(28px, 5vw, 48px); max-width: 680px; }
        .form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .form-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.12em; text-transform: uppercase; }
        .form-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #ffffff; font-size: 14px; padding: 12px 16px; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: #2E8B28; }
        .form-input::placeholder { color: rgba(255,255,255,0.25); }
        textarea.form-input { min-height: 100px; resize: vertical; font-family: inherit; }
        .btn-green { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #2E8B28; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.08em; border-radius: 9999px; height: 56px; padding: 0 2.6rem; transition: background-color 0.3s; white-space: nowrap; border: none; cursor: pointer; }
        .btn-green:hover { background-color: #36A832; }
      `}</style>

      {/* ── Hero ── */}
      <div className="clubs-hero">
        <p className="section-label">Clubs & Teams</p>
        <h1 className="font-display font-black" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.92, letterSpacing: "-0.03em", marginBottom: 28, color: "#ffffff" }}>
          YOUR CLUB.<br />YOUR COLOURS.<br /><span style={{ color: "#2E8B28" }}>YOUR SOCKS.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(1rem, 1.5vw, 1.125rem)", lineHeight: 1.7, maxWidth: 520, marginBottom: 16 }}>
          Custom grip socks for clubs, schools, gyms, and teams across New Zealand and Australia.
        </p>
        <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 15, lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
          Free design. Free mockup. MOQ 50 pairs. Buy at <strong style={{ color: "#2E8B28" }}>$12/pair</strong>, sell at $25 — your club keeps <strong style={{ color: "#2E8B28" }}>$650</strong> from one order. No sausage sizzle required.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="#enquire" className="btn-green">
            Get a Free Mockup <ArrowUpRight style={{ width: 16, height: 16 }} />
          </a>
          <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 56, padding: "0 2rem", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            See how it works
          </a>
        </div>
      </div>

      {/* ── Numbers ── */}
      <section style={{ padding: "0 0 6rem" }}>
        <div className="page-wrap">
          <div className="clubs-numbers">
            {NUMBERS.map(({ stat, label }) => (
              <div key={label} style={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "2rem", textAlign: "center" }}>
                <p className="font-display font-black" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2E8B28", lineHeight: 1, marginBottom: 10 }}>{stat}</p>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="page-wrap">
          <p className="section-label">The Process</p>
          <h2 className="font-display font-black section-title" style={{ marginBottom: 48 }}>HOW IT WORKS</h2>
          <div className="clubs-steps">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} style={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "2rem" }}>
                <p className="font-display font-black" style={{ fontSize: "3rem", color: "rgba(46,139,40,0.18)", lineHeight: 1, marginBottom: 20 }}>{num}</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginBottom: 10, lineHeight: 1.3 }}>{title}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="page-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="includes-grid">
            <style>{`@media (max-width: 768px) { .includes-grid { grid-template-columns: 1fr !important; } }`}</style>
            <div>
              <p className="section-label">What&apos;s Included</p>
              <h2 className="font-display font-black section-title" style={{ marginBottom: 32 }}>EVERYTHING<br />YOU NEED</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Custom design with your logo and club colours — free",
                  "Free mockup before you commit to anything",
                  "Grip sole pattern, compression support, cushion comfort",
                  "Your choice of sizes — we handle the split",
                  "Nine2Five posts your club on Instagram",
                  "Fundraising guide included with every order",
                  "Sample pair available before bulk order",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <Check style={{ width: 16, height: 16, color: "#2E8B28", flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "2.5rem" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2E8B28", marginBottom: 20 }}>Fundraising Calculator</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "50 pairs × $12 cost", value: "$600", muted: true },
                  { label: "50 pairs × $25 retail", value: "$1,250", muted: false },
                  { label: "Your club keeps", value: "$650", highlight: true },
                ].map(({ label, value, muted, highlight }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize: 14, color: muted ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)" }}>{label}</p>
                    <p style={{ fontSize: highlight ? 22 : 16, fontWeight: highlight ? 900 : 700, color: highlight ? "#2E8B28" : "rgba(255,255,255,0.7)" }}>{value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 20, lineHeight: 1.6 }}>
                Scale it up — 100 pairs at $10 each = $1,500 for your club.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="page-wrap" style={{ maxWidth: 860, margin: "0 auto", paddingLeft: "clamp(20px, 4vw, 48px)", paddingRight: "clamp(20px, 4vw, 48px)" }}>
          <p className="section-label">Common Questions</p>
          <h2 className="font-display font-black section-title" style={{ marginBottom: 48 }}>FAQ</h2>
          <div>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="faq-item">
                <p style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 10 }}>{q}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enquiry form ── */}
      <section id="enquire" style={{ padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="page-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="enquiry-grid">
            <style>{`@media (max-width: 768px) { .enquiry-grid { grid-template-columns: 1fr !important; } }`}</style>
            <div>
              <p className="section-label">Get Started</p>
              <h2 className="font-display font-black" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 24, color: "#ffffff" }}>
                GET YOUR<br /><span style={{ color: "#2E8B28" }}>FREE MOCKUP</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 400 }}>
                Fill in the form and we&apos;ll send you a free design mockup within 48 hours. No commitment. No cost. Just your club&apos;s identity on a grip sock.
              </p>
            </div>
            <ClubsForm />
          </div>
        </div>
      </section>

    </div>
  );
}
