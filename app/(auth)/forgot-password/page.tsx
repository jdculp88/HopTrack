"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthErrorAlert } from "@/components/auth/AuthErrorAlert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
            <CheckCircle size={32} className="text-[var(--accent-gold)]" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
          Check your email
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          We sent a password reset link to{" "}
          <span className="text-[var(--text-primary)] font-medium">{email}</span>.
          <br />
          Click the link in the email to reset your password.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Didn&apos;t get the email? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="text-[var(--accent-gold)] hover:underline"
          >
            try again
          </button>
          .
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mt-6"
        >
          <ChevronLeft size={16} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to sign in
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
          Reset password
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <AuthErrorAlert message={error} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
