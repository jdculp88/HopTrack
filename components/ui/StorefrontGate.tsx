"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

interface StorefrontGateProps {
  children: React.ReactNode;
  isUnlocked: boolean;
  sectionName: string;
  breweryId: string;
}

export function StorefrontGate({ children, isUnlocked, sectionName, breweryId }: StorefrontGateProps) {
  if (isUnlocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div
        className="select-none"
        style={{ filter: "blur(6px)", pointerEvents: "none", opacity: 0.5 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Claim CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="rounded-2xl border p-5 text-center space-y-2.5 max-w-sm w-full mx-4"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--border)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
          >
            <Lock size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {sectionName}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            This brewery hasn't claimed their listing yet.
          </p>
          <Link
            href={`/brewery-admin/claim?brewery_id=${breweryId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{
              background: "var(--accent-gold)",
              color: "var(--bg)",
            }}
          >
            Own this brewery? Claim it →
          </Link>
        </div>
      </div>
    </div>
  );
}
