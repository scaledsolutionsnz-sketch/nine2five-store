"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export default function ClubsForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const clubName = fd.get("clubName") as string;
    const phone = fd.get("phone") as string;
    const sport = fd.get("sport") as string;
    const quantity = fd.get("quantity") as string;
    const extra = fd.get("message") as string;

    const message = [
      `Club / Team: ${clubName}`,
      phone ? `Phone: ${phone}` : null,
      `Sport / Activity: ${sport}`,
      quantity ? `Estimated Quantity: ${quantity}` : null,
      extra ? `\nAdditional info:\n${extra}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: `Club/Team Enquiry — ${clubName}`, message }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="contact-form"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "48px 32px", textAlign: "center" }}
      >
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(46,139,40,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E8B28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p style={{ fontWeight: 800, fontSize: 18, color: "#ffffff", letterSpacing: "-0.02em" }}>Enquiry received.</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 320 }}>
          We&apos;ll send your free mockup within 48 hours. Check your inbox — we might reply sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-field">
        <label className="form-label">Club / Team Name *</label>
        <input className="form-input" name="clubName" type="text" placeholder="e.g. Lincoln Rugby Club" required />
      </div>
      <div className="form-field">
        <label className="form-label">Your Name *</label>
        <input className="form-input" name="name" type="text" placeholder="Your full name" required />
      </div>
      <div className="form-field">
        <label className="form-label">Email *</label>
        <input className="form-input" name="email" type="email" placeholder="your@email.com" required />
      </div>
      <div className="form-field">
        <label className="form-label">Phone</label>
        <input className="form-input" name="phone" type="tel" placeholder="+64 21 ..." />
      </div>
      <div className="form-field">
        <label className="form-label">Sport / Activity *</label>
        <input className="form-input" name="sport" type="text" placeholder="e.g. Rugby, Touch, Gym, Netball..." required />
      </div>
      <div className="form-field">
        <label className="form-label">Estimated Quantity</label>
        <select className="form-input" name="quantity" style={{ cursor: "pointer" }}>
          <option value="">Select...</option>
          <option value="50–100 pairs">50–100 pairs</option>
          <option value="100–200 pairs">100–200 pairs</option>
          <option value="200+ pairs">200+ pairs</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Anything else? (colours, logo, deadline)</label>
        <textarea className="form-input" name="message" rows={4} placeholder="Club colours, logo link, when you need them by..." />
      </div>

      <button type="submit" disabled={loading} className="btn-green" style={{ width: "100%", justifyContent: "center" }}>
        {loading ? "Sending..." : "Send Enquiry — Get Free Mockup"} {!loading && <ArrowUpRight style={{ width: 16, height: 16 }} />}
      </button>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
        We reply within 24 hours. Free mockup within 48 hours. No obligation.
      </p>
    </form>
  );
}
