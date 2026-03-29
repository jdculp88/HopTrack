"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase auto-exchanges the token from the URL hash on page load.
    // We wait briefly for that to complete, then check for a valid session.
    const checkSession = async () => {
      const supabase = createClient();
      // Listen for the PASSWORD_RECOVERY event which fires when the token is exchanged
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setHasSession(true);
        }
      });

      // Also check if session already exists (e.g. page refresh after token exchange)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        // Give the auth state change listener a moment to fire
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          setHasSession(!!retrySession);
        }, 1000);
      }

      return () => subscription.unsubscribe();
    };

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
            <CheckCircle size={32} className="text-[var(--accent-gold)]" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
          Password updated
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  if (hasSession === false) {
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
          Invalid or expired link
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          This password reset link has expired or is no longer valid.
          <br />
          Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3 px-6 rounded-xl transition-all text-sm"
        >
          Request New Link
        </Link>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ChevronLeft size={16} />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (hasSession === null) {
    return (
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-muted)] text-sm">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          Set new password
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <Lock size={16} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            required
            minLength={8}
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

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <Lock size={16} />
          </div>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={8}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-11 pr-11 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
