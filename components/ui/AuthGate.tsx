"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Beer } from "lucide-react";

interface AuthGateProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  featureName: string;
  returnPath: string;
}

export function AuthGate({ children, isAuthenticated, featureName, returnPath }: AuthGateProps) {
  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div
        className="select-none"
        style={{ filter: "blur(8px)", pointerEvents: "none" }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay CTA */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="rounded-2xl border p-6 text-center space-y-3 max-w-xs w-full mx-4 shadow-xl"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-2xl">🍺</p>
            <h3
              className="font-display text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Sign up to {featureName}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Join HopTrack free to unlock the full experience.
            </p>
            <Link
              href={`/signup?next=${encodeURIComponent(returnPath)}`}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Beer size={14} />
              Create Account — It's Free
            </Link>
            <Link
              href={`/login?next=${encodeURIComponent(returnPath)}`}
              className="block text-xs transition-colors hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Already have an account? Log in
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
