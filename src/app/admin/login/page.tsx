"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push("/admin");
    router.refresh();
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0D1117" }}>
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#116DFF] mb-4">
            <span className="text-white font-black text-[17px] tracking-tight">N2</span>
          </div>
          <h1 className="text-white font-bold text-[22px] tracking-tight leading-none">Nine2Five</h1>
          <p className="text-[#6B7280] text-[13px] mt-1.5">Admin Dashboard</p>
        </div>

        {/* Email/password form */}
        <form onSubmit={signInWithEmail} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full h-[46px] px-4 rounded-xl text-[14px] text-white placeholder:text-[#4B5563] focus:outline-none transition-colors"
              style={{ backgroundColor: "#161B22", border: "1px solid #30363D" }}
              onFocus={e => (e.target.style.borderColor = "#116DFF")}
              onBlur={e => (e.target.style.borderColor = "#30363D")}
            />
          </div>

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full h-[46px] px-4 pr-12 rounded-xl text-[14px] text-white placeholder:text-[#4B5563] focus:outline-none transition-colors"
              style={{ backgroundColor: "#161B22", border: "1px solid #30363D" }}
              onFocus={e => (e.target.style.borderColor = "#116DFF")}
              onBlur={e => (e.target.style.borderColor = "#30363D")}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-[12px] text-[#F87171] px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[46px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ backgroundColor: "#116DFF" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: "#21262D" }} />
          <span className="text-[12px] text-[#4B5563]">or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#21262D" }} />
        </div>

        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="w-full h-[46px] flex items-center justify-center gap-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-60"
          style={{ backgroundColor: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-6 text-center text-[12px] text-[#4B5563]">
          Only authorised accounts can access the admin.
        </p>
      </div>
    </div>
  );
}
