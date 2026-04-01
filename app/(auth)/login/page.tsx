"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/home");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Welcome back</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5">Sign in to your HopTrack account.</p>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-[var(--surface-2)] hover:bg-[#2a2720] border border-[var(--border)] hover:border-[#6B6456] text-[var(--text-primary)] py-3 rounded-xl transition-all text-sm font-medium mb-6"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-[#3A3628]" />
        <span className="text-xs text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px bg-[#3A3628]" />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <Mail size={16} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <Lock size={16} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-11 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex justify-end -mt-1">
          <Link href="/forgot-password" className="text-xs text-[var(--accent-gold)] hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-[#C44B3A] bg-[#C44B3A]/10 border border-[#C44B3A]/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#D4A843] hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5832-5.036-3.7104H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2818-1.1168-.2818-1.71s.1018-1.17.2818-1.71V4.9582H.957C.3477 6.1731 0 7.5477 0 9s.3477 2.8269.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4627.891 11.4255 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}
