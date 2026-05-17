"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
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
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) { setError("Enter your email first"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    toast.success("Magic link sent — check your email");
  }

  const inputClass = "w-full h-12 px-4 rounded-xl bg-[#111] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#4ade80]/50 transition-colors";

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display font-black text-2xl tracking-tight text-white inline-block mb-1">
            NINE2FIVE
          </Link>
          <p className="text-white/40 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Email</label>
              <input
                type="email" required placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Password</label>
              <input
                type="password" required placeholder="••••••••" minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-red-400 bg-red-500/10 rounded-xl px-4 py-3 text-sm">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 w-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#111] text-xs text-white/30">or</span>
            </div>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full border border-white/[0.08] rounded-xl h-12 flex items-center justify-center gap-3 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 transition-all"
          >
            Send magic link
          </button>
        </div>

        <p className="text-center text-sm text-white/40 hover:text-white mt-6 transition-colors">
          No account?{" "}
          <Link href={`/account/signup${next !== "/account" ? `?next=${next}` : ""}`} className="text-white/40 hover:text-white underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
