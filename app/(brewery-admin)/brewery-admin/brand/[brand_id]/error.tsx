"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Building2 } from "lucide-react";

export default function BrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
        style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
        <Building2 size={28} style={{ color: "var(--accent-gold)" }} />
      </div>
      <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        Brand Dashboard Error
      </h2>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Something went wrong loading this brand page. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        Try again
      </button>
    </div>
  );
}
