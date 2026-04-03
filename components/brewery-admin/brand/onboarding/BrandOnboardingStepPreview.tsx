"use client";

import { Check } from "lucide-react";
import { BarChart3, ExternalLink, GlassWater } from "lucide-react";
import Link from "next/link";

interface BrandOnboardingStepPreviewProps {
  brandId: string;
  brandName: string;
  brandSlug?: string;
  locationsAdded: boolean;
  loyaltyConfigured: boolean;
  teamInvited: boolean;
}

export function BrandOnboardingStepPreview({
  brandId,
  brandName,
  brandSlug,
  locationsAdded,
  loyaltyConfigured,
  teamInvited,
}: BrandOnboardingStepPreviewProps) {
  const steps = [
    { label: "Locations added", done: locationsAdded },
    { label: "Brand loyalty program", done: loyaltyConfigured },
    { label: "Team invited", done: teamInvited },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <BarChart3 size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          You're almost ready!
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Here's what you've set up for {brandName}.
        </p>
      </div>

      {/* Checklist summary */}
      <div className="rounded-xl border p-4 space-y-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={
                step.done
                  ? { background: "var(--accent-gold)" }
                  : { background: "transparent", border: "2px solid var(--border)" }
              }
            >
              {step.done && (
                <Check size={12} style={{ color: "var(--bg)" }} strokeWidth={3} />
              )}
            </div>
            <span
              className="text-sm"
              style={{
                color: step.done ? "var(--text-primary)" : "var(--text-muted)",
                textDecoration: step.done ? "none" : "line-through",
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Status message */}
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: completedCount === 3
            ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)"
            : "var(--surface-2)",
        }}
      >
        {completedCount === 3 ? (
          <>
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-display font-bold" style={{ color: "var(--accent-gold)" }}>
              All set! Your brand is ready to go.
            </p>
          </>
        ) : completedCount >= 1 ? (
          <>
            <p className="text-2xl mb-1">👍</p>
            <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
              Good start! You can finish the rest later.
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl mb-1">🍺</p>
            <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
              No worries — come back and set up when you're ready.
            </p>
          </>
        )}
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {completedCount} of {steps.length} steps completed
        </p>
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/brewery-admin/brand/${brandId}/dashboard`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:border-[var(--accent-gold)]"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <BarChart3 size={16} style={{ color: "var(--accent-gold)" }} />
          View Brand Dashboard
        </Link>
        {brandSlug && (
          <Link
            href={`/brand/${brandSlug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:border-[var(--accent-gold)]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <ExternalLink size={16} style={{ color: "var(--accent-gold)" }} />
            View Public Brand Page
          </Link>
        )}
        <Link
          href={`/brewery-admin/brand/${brandId}/tap-list`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-all"
          style={{ color: "var(--text-muted)" }}
        >
          <GlassWater size={14} />
          Manage Tap List
        </Link>
      </div>
    </div>
  );
}
