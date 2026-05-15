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

  const inputClass = "w-full h-11 px-4 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#16a34a]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Check your email</h2>
          <p className="text-sm text-[#737373] mb-6">
            We sent a confirmation link to <span className="text-white">{form.email}</span>. Click it to activate your account.
          </p>
          <Link href="/" className="text-sm text-[#16a34a] hover:underline">← Back to store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-black text-xl tracking-tight text-white inline-block mb-6">
            NINE2FIVE
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">Create account</h1>
          <p className="text-sm text-[#737373] mt-1">Join Nine2Five for order history and wishlist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="First name" required
              value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={inputClass}
            />
            <input
              placeholder="Last name" required
              value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <input
            type="email" placeholder="Email address" required
            value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
          />
          <input
            type="password" placeholder="Password (min 6 characters)" required minLength={6}
            value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={inputClass}
          />

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full h-11 rounded-xl bg-[#16a34a] text-white font-display font-semibold text-sm hover:bg-[#15803d] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#737373] mt-6">
          Already have one?{" "}
          <Link href={`/account/login${next !== "/account" ? `?next=${next}` : ""}`} className="text-[#16a34a] hover:underline">
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
