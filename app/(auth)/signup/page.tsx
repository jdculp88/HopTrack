"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, MapPin, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SignupStep = "account" | "profile";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?onboarding=true` },
    });
  }

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(null);
    setStep("profile");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) { setError("Username and display name are required."); return; }
    if (!/^[a-z0-9_]+$/i.test(username)) { setError("Username can only contain letters, numbers, and underscores."); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase(), display_name: displayName, home_city: homeCity },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl shadow-black/40">
      {step === "profile" && (
        <button
          onClick={() => setStep("account")}
          className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}

      <div className="mb-8">
        <div className="flex gap-1.5 mb-6">
          <div className={`h-1 flex-1 rounded-full transition-all ${step === "account" || step === "profile" ? "bg-[#D4A843]" : "bg-[#3A3628]"}`} />
          <div className={`h-1 flex-1 rounded-full transition-all ${step === "profile" ? "bg-[#D4A843]" : "bg-[#3A3628]"}`} />
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          {step === "account" ? "Join HopTrack" : "Your profile"}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5">
          {step === "account"
            ? "Create your account to start tracking."
            : "Let's set up your identity on HopTrack."}
        </p>
      </div>

      {step === "account" ? (
        <>
          <button
            onClick={handleGoogleSignup}
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

          <form onSubmit={handleAccountStep} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (8+ characters)"
                required
                minLength={8}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-11 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-sm text-[#C44B3A] bg-[#C44B3A]/10 border border-[#C44B3A]/20 rounded-xl px-4 py-3">{error}</p>}
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3.5 rounded-xl transition-all text-sm">
              Continue
              <ArrowRight size={16} />
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              required
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm pointer-events-none">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="username"
              required
              maxLength={30}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#D4A843] transition-colors font-mono"
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              placeholder="Home city (optional)"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#D4A843] transition-colors"
            />
          </div>
          {error && <p className="text-sm text-[#C44B3A] bg-[#C44B3A]/10 border border-[#C44B3A]/20 rounded-xl px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm">
            {loading ? "Creating account..." : "🍺 Create Account"}
          </button>
          <p className="text-xs text-center text-[var(--text-muted)]">
            By signing up, you agree to our terms and privacy policy.
          </p>
        </form>
      )}

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#D4A843] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5832-5.036-3.7104H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2818-1.1168-.2818-1.71s.1018-1.17.2818-1.71V4.9582H.957C.3477 6.1731 0 7.5477 0 9s.3477 2.8269.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4627.891 11.4255 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}
