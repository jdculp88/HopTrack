"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body style={{ background: "#0F0E0C", color: "#F5F0E8", fontFamily: "system-ui" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🍺</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>
            We spilled a beer. Our team has been notified.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#D4A843",
              color: "#0F0E0C",
              border: "none",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
