"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    // If email confirmation is disabled (dev), session is created immediately
    if (data.session) {
      // Link customer record
      await supabase.rpc("link_customer_account");
      // Update name if customer record just created
      await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: form.firstName, last_name: form.lastName }),
      });
      router.push(next);
      router.refresh();
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  const inputClass = "w-full h-12 px-4 rounded-xl bg-[#192d1e] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#3a7722]/50 transition-colors";

  if (done) {
    return (
      <div className="bg-[#112016] min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-[#3a7722]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-[#3a7722]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display font-black text-2xl text-white mb-2">Check your email</h2>
          <p className="text-white/40 text-sm mb-6">
            We sent a confirmation link to <span className="text-white">{form.email}</span>. Click it to activate your account.
          </p>
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">← Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#112016] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block mb-1">
            NINE2FIVE
          </Link>
          <p className="text-white/40 text-sm">Join Nine2Five for order history and wishlist</p>
        </div>

        <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">First Name</label>
                <input
                  placeholder="First name" required
                  value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Last Name</label>
                <input
                  placeholder="Last name" required
                  value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Email</label>
              <input
                type="email" placeholder="your@email.com" required
                value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Password</label>
              <input
                type="password" placeholder="Min 6 characters" required minLength={6}
                value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 w-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have one?{" "}
          <Link href={`/account/login${next !== "/account" ? `?next=${next}` : ""}`} className="text-white/40 hover:text-white underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
