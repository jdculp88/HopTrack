"use client";

import { CheckCircle } from "lucide-react";

export type Step = "search" | "claim" | "success";

export const STEPS: { key: Step; label: string; number: number }[] = [
  { key: "search", label: "Find", number: 1 },
  { key: "claim", label: "Verify", number: 2 },
  { key: "success", label: "Go Live", number: 3 },
];

interface ClaimProgressBarProps {
  currentStep: Step;
}

export function ClaimProgressBar({ currentStep }: ClaimProgressBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={{
                  background: isComplete
                    ? "var(--accent-gold)"
                    : isCurrent
                    ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
                    : "var(--surface-2)",
                  color: isComplete
                    ? "var(--bg)"
                    : isCurrent
                    ? "var(--accent-gold)"
                    : "var(--text-muted)",
                  border: isCurrent ? "2px solid var(--accent-gold)" : "2px solid transparent",
                }}
              >
                {isComplete ? <CheckCircle size={16} /> : step.number}
              </div>
              <span
                className="text-[10px] font-mono uppercase tracking-wider mt-1.5"
                style={{
                  color: isComplete || isCurrent ? "var(--accent-gold)" : "var(--text-muted)",
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-12 sm:w-16 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300"
                style={{
                  background: isComplete ? "var(--accent-gold)" : "var(--border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
