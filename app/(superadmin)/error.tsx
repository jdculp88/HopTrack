"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function SuperadminError({
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
      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Admin Error</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Something went wrong in the admin panel. This error has been reported to Sentry.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-[var(--accent-gold)] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
