"use client";

import { Check, X, ExternalLink, Tv, HelpCircle } from "lucide-react";
import Link from "next/link";

interface OnboardingStepPreviewProps {
  breweryId: string;
  breweryName: string;
  logoUploaded: boolean;
  beersAdded: boolean;
  loyaltyConfigured: boolean;
}

export function OnboardingStepPreview({
  breweryId,
  breweryName,
  logoUploaded,
  beersAdded,
  loyaltyConfigured,
}: OnboardingStepPreviewProps) {
  const steps = [
    { label: "Logo uploaded", done: logoUploaded },
    { label: "Beers added", done: beersAdded },
    { label: "Loyalty program", done: loyaltyConfigured },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <Tv size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          You're almost ready!
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Here's what you've set up for {breweryName}.
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
              {step.done ? (
                <Check size={12} style={{ color: "var(--bg)" }} strokeWidth={3} />
              ) : (
                <X size={12} style={{ color: "var(--text-muted)" }} />
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
              All set! Your brewery is ready.
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
          href={`/brewery-admin/${breweryId}/board`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:border-[var(--accent-gold)]"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
        >
          <Tv size={16} style={{ color: "var(--accent-gold)" }} />
          Preview your Board
        </Link>
        <Link
          href={`/brewery/${breweryId}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-all"
          style={{ color: "var(--text-muted)" }}
        >
          <ExternalLink size={14} />
          View public brewery page
        </Link>
        <Link
          href={`/brewery-admin/${breweryId}/resources#guides`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-all"
          style={{ color: "var(--text-muted)" }}
        >
          <HelpCircle size={14} />
          Browse setup guides
        </Link>
      </div>
    </div>
  );
}
