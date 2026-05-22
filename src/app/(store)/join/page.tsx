"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

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

  const inputClass = "w-full h-12 px-4 rounded-xl bg-[#192d1e] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#3a7722]/50 transition-colors";

  if (done) {
    return (
      <div className="bg-[#112016] min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-[#3a7722]/20 border border-[#3a7722]/30 flex items-center justify-center mx-auto mb-6">
            <Check className="h-7 w-7 text-[#3a7722]" />
          </div>
          <h1 className="text-white font-bold text-2xl mb-3">Application submitted!</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            We&apos;ll review your application and get back to you within 24 hours.
            Once approved you can log in and start earning $5 per sale.
          </p>
          <button
            onClick={() => router.push("/affiliate/login")}
            className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#112016] min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block mb-1">
            NINE2FIVE
          </Link>
          <p className="text-white/40 text-sm mt-1">Affiliate Program</p>
        </div>

        <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl p-8 mb-6">
          <h1 className="text-white font-bold text-lg mb-1">Become an affiliate</h1>
          <p className="text-white/40 text-sm mb-6">
            Earn <span className="text-white font-semibold">$5 for every sale</span> you refer. Share your link, track your earnings.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, referral_code: autoCode(e.target.value) }))}
                placeholder="Wiremu Bartlett"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Email</label>
              <input
                required type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Password</label>
              <input
                required type="password" minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Your Link Code</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
                  nine2five.nz?ref=
                </span>
                <input
                  required
                  value={form.referral_code}
                  onChange={(e) => setForm((f) => ({ ...f, referral_code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                  placeholder="yourname"
                  className={`${inputClass} pl-[9.5rem] font-mono`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">
                How will you promote? <span className="text-white/20 normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.how_promote}
                onChange={(e) => setForm((f) => ({ ...f, how_promote: e.target.value }))}
                placeholder="e.g. TikTok, Instagram, YouTube — tell us about your audience"
                className={`${inputClass} h-auto py-3 resize-none`}
              />
            </div>

            {error && (
              <p className="text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 w-full disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Now"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40">
          Already an affiliate?{" "}
          <Link href="/affiliate/login" className="text-white/60 hover:text-white underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
