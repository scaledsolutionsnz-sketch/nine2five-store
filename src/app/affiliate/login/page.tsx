"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Incorrect email or password");
      setLoading(false);
      return;
    }
    router.push("/affiliate/dashboard");
    router.refresh();
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", color: "var(--foreground)" }} className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block">
            NINE<span style={{ color: "var(--accent)" }}>2</span>FIVE
          </Link>
          <p className="text-sm mt-1.5" style={{ color: "var(--muted)" }}>Affiliate Portal</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h1 className="font-display font-bold text-white text-lg mb-6">Sign in to your dashboard</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none transition-colors"
                style={{ background: "var(--surface-2, #132b19)", border: "1px solid var(--border)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(46,139,40,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "var(--muted)" }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none transition-colors"
                style={{ background: "var(--surface-2, #132b19)", border: "1px solid var(--border)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(46,139,40,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
          Want to become an affiliate?{" "}
          <Link href="/join" className="underline transition-colors" style={{ color: "var(--muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
          >
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AffiliateLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
