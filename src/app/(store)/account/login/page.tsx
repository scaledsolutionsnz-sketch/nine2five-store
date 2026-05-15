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

  const inputClass = "w-full h-11 px-4 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-black text-xl tracking-tight text-white inline-block mb-6">
            NINE2FIVE
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
          <p className="text-sm text-[#737373] mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" required placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password" required placeholder="Password" minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full h-11 rounded-xl bg-[#16a34a] text-white font-display font-semibold text-sm hover:bg-[#15803d] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#262626]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-[#0a0a0a] text-xs text-[#525252]">or</span>
          </div>
        </div>

        <button
          onClick={handleMagicLink}
          disabled={loading}
          className="w-full h-11 rounded-xl border border-[#262626] text-sm text-[#a3a3a3] hover:text-white hover:border-[#404040] disabled:opacity-50 transition-colors"
        >
          Send magic link
        </button>

        <p className="text-center text-sm text-[#737373] mt-6">
          No account?{" "}
          <Link href={`/account/signup${next !== "/account" ? `?next=${next}` : ""}`} className="text-[#16a34a] hover:underline">
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
