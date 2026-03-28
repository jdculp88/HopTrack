"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AuthError({
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF7F0" }}>
      <div className="max-w-sm text-center space-y-4 px-6">
        <p className="text-5xl">🍺</p>
        <h2 className="font-display text-2xl font-bold" style={{ color: "#1A1714" }}>
          Something went wrong
        </h2>
        <p className="text-sm" style={{ color: "#6B5E4E" }}>
          We spilled a beer on the login page. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: "#D4A843", color: "#0F0E0C" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
