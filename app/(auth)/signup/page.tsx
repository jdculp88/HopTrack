"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, MapPin, Eye, EyeOff, ArrowRight, ChevronLeft, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthErrorAlert } from "@/components/auth/AuthErrorAlert";
import { DOBInput } from "@/components/auth/DOBInput";

type SignupStep = "account" | "profile";
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<SignupStep>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobError, setDobError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    if (!/^[a-z0-9_]+$/i.test(value)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (username.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsernameStatus("idle");
      return;
    }
    debounceRef.current = setTimeout(() => checkUsername(username), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, checkUsername]);

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?onboarding=true` },
    });
  }

  function validateEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function handleEmailBlur() {
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
    }
  }

  const passwordMeetsLength = password.length >= 8;

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    if (!validateEmail(email)) { setEmailError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!dateOfBirth) { setDobError("Date of birth is required."); return; }
    // Age gate: must be 21+
    const dob = new Date(dateOfBirth + "T00:00:00");
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 21) { setDobError("You must be 21 or older to use HopTrack"); return; }
    setEmailError(null);
    setDobError(null);
    setError(null);
    setStep("profile");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) { setError("Username and display name are required."); return; }
    if (!/^[a-z0-9_]+$/i.test(username)) { setError("Username can only contain letters, numbers, and underscores."); return; }
    if (usernameStatus === "taken") { setError("That username is already taken."); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase(), display_name: displayName, home_city: homeCity, date_of_birth: dateOfBirth },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Fire-and-forget: welcome email + referral redemption
    fetch("/api/auth/welcome", { method: "POST" }).catch(() => {});
    const refCode = searchParams.get("ref");
    if (refCode) {
      fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: refCode }),
      }).catch(() => {});
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <div>
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

      <AnimatePresence mode="wait" initial={false}>
        {step === "account" ? (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <GoogleOAuthButton onClick={handleGoogleSignup} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <AuthDivider />
            </motion.div>

            <form onSubmit={handleAccountStep} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                    onBlur={handleEmailBlur}
                    placeholder="Email"
                    required
                    className={`w-full bg-[var(--surface-2)] border rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none transition-colors ${
                      emailError
                        ? "border-[var(--danger)] focus:border-[var(--danger)]"
                        : "border-[var(--border)] focus:border-[var(--accent-gold)]"
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs mt-1.5 ml-1" style={{ color: 'var(--danger)' }}>{emailError}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-11 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <p className="text-xs mt-1.5 ml-1 flex items-center gap-1" style={{ color: passwordMeetsLength ? 'var(--success)' : 'var(--text-muted)' }}>
                    {passwordMeetsLength ? <Check size={12} /> : null}
                    8+ characters
                  </p>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 ml-1">
                  Date of Birth
                </label>
                <DOBInput
                  value={dateOfBirth}
                  onChange={(d) => { setDateOfBirth(d); if (dobError) setDobError(null); }}
                  error={dobError}
                />
              </motion.div>
              <AuthErrorAlert message={error} />
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <button type="submit" disabled={!dateOfBirth} className="w-full flex items-center justify-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm">
                  Continue
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                <div key="displayName" className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    required
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  />
                </div>,
                <div key="username">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm pointer-events-none">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="username"
                      required
                      maxLength={30}
                      className={`w-full bg-[var(--surface-2)] border rounded-xl pl-8 pr-10 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none transition-colors font-mono ${
                        usernameStatus === "available"
                          ? "border-[#4ADE80] focus:border-[#4ADE80]"
                          : usernameStatus === "taken"
                          ? "border-[#C44B3A] focus:border-[#C44B3A]"
                          : "border-[var(--border)] focus:border-[var(--accent-gold)]"
                      }`}
                    />
                    {usernameStatus === "checking" && (
                      <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] animate-spin" />
                    )}
                    {usernameStatus === "available" && (
                      <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ADE80]" />
                    )}
                    {usernameStatus === "taken" && (
                      <X size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C44B3A]" />
                    )}
                  </div>
                  {usernameStatus === "checking" && (
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">Checking...</p>
                  )}
                  {usernameStatus === "available" && (
                    <p className="text-xs text-[#4ADE80] mt-1.5 ml-1">Username available</p>
                  )}
                  {usernameStatus === "taken" && (
                    <p className="text-xs text-[#C44B3A] mt-1.5 ml-1">Username taken</p>
                  )}
                </div>,
                <div key="homeCity" className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="text"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                    placeholder="Home city (optional)"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                  />
                </div>,
              ].map((field, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {field}
                </motion.div>
              ))}
              <AuthErrorAlert message={error} />
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <button type="submit" disabled={loading || usernameStatus === "taken" || usernameStatus === "checking"} className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                By signing up you agree to our{" "}
                <Link href="/terms" className="underline" style={{ color: "var(--text-secondary)" }}>Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>
              </motion.p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#D4A843] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
