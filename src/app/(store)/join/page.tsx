"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Check, DollarSign, TrendingUp, Users } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referral_code: "",
    how_promote: "",
  });
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
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }
    setDone(true);
  }

  const inputStyle = {
    background: "var(--surface-2, #132b19)",
    border: "1px solid var(--border)",
  };

  const inputClass = "w-full h-12 px-4 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none transition-colors";

  function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "rgba(46,139,40,0.4)";
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.currentTarget.style.borderColor = "var(--border)";
  }

  if (done) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100vh", color: "var(--foreground)" }} className="flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(46,139,40,0.1)", border: "1px solid rgba(46,139,40,0.2)" }}>
            <Check className="h-7 w-7" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-3">Application submitted!</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--muted)" }}>
            We&apos;ll review your application and get back to you within 24 hours.
            Once approved, log in and start earning $5 per sale.
          </p>
          <button
            onClick={() => router.push("/affiliate/login")}
            className="h-12 px-8 rounded-xl font-bold text-sm text-white transition-all"
            style={{ background: "var(--accent)" }}
            onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.filter = "none")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", color: "var(--foreground)" }} className="px-6 py-12">
      <div className="max-w-lg mx-auto">

        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block">
            NINE<span style={{ color: "var(--accent)" }}>2</span>FIVE
          </Link>
          <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>Affiliate Program</p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: DollarSign, label: "$5 per sale", sub: "Flat rate, every order" },
            { icon: TrendingUp, label: "Live tracking", sub: "Clicks & earnings" },
            { icon: Users, label: "Monthly pay", sub: "Bank transfer, no minimums" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-2xl px-4 py-4 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <Icon style={{ width: 18, height: 18, color: "var(--accent)", margin: "0 auto 8px" }} strokeWidth={1.8} />
              <p className="text-xs font-semibold text-white">{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)", fontSize: 10 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h1 className="font-display font-bold text-white text-lg mb-1">Become an affiliate</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            Earn <span className="text-white font-semibold">$5 for every sale</span> you refer.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                Full Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, referral_code: autoCode(e.target.value) }))}
                placeholder="Your name"
                className={inputClass}
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
                className={inputClass}
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                Password
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className={inputClass}
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                Your Link Code
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                  ?ref=
                </span>
                <input
                  required
                  value={form.referral_code}
                  onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                  placeholder="yourname"
                  className={`${inputClass} pl-14 font-mono`}
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                nine2five.nz?ref=<span style={{ color: "var(--muted)" }}>{form.referral_code || "yourname"}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                How will you promote?{" "}
                <span className="normal-case tracking-normal" style={{ color: "rgba(255,255,255,0.2)" }}>(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.how_promote}
                onChange={(e) => setForm((f) => ({ ...f, how_promote: e.target.value }))}
                placeholder="e.g. TikTok, Instagram, YouTube — tell us about your audience"
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none transition-colors resize-none"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            {error && (
              <p className="text-red-400 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all mt-2"
              style={{ background: "var(--accent)" }}
              onMouseEnter={e => !loading && (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "none")}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Now"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
          Already an affiliate?{" "}
          <Link href="/affiliate/login" className="underline transition-colors" style={{ color: "var(--muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
