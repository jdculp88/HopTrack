"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AppError({
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
      <p className="text-5xl">🍺</p>
      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        We spilled a beer. Our team has been notified and is working on a fix.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-[var(--accent-gold)] text-[#0F0E0C] font-semibold rounded-xl hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
