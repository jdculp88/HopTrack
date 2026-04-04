"use client";

import { motion } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { spring } from "@/lib/animation";
import type { FunnelStep } from "@/lib/superadmin-metrics";

// ── Gold gradient steps ────────────────────────────────────────────────

const STEP_COLORS = [
  "rgba(212,168,67,0.90)",  // brightest
  "rgba(212,168,67,0.78)",
  "rgba(212,168,67,0.66)",
  "rgba(212,168,67,0.54)",
  "rgba(212,168,67,0.42)",
  "rgba(212,168,67,0.30)",
  "rgba(212,168,67,0.20)",  // faintest
];

// ── Component ──────────────────────────────────────────────────────────

interface Props {
  steps: FunnelStep[];
}

export function UserFunnel({ steps }: Props) {
  if (!steps || steps.length === 0) {
    return (
      <Card padding="spacious">
        <CardHeader><CardTitle as="h3">User Funnel</CardTitle></CardHeader>
        <p className="text-sm px-5 pb-5" style={{ color: "var(--text-muted)" }}>
          No funnel data available
        </p>
      </Card>
    );
  }

  const maxCount = steps[0]?.count ?? 1;

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle as="h3">User Funnel</CardTitle>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {maxCount.toLocaleString()} total users
          </span>
        </div>
      </CardHeader>

      <div className="space-y-2 px-5 pb-5">
        {steps.map((step, i) => {
          const barPct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;

          return (
            <div key={step.label} className="flex items-center gap-3">
              {/* Label */}
              <span
                className="text-xs font-mono w-28 flex-shrink-0 truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {step.label}
              </span>

              {/* Bar */}
              <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  className="h-full rounded-lg flex items-center px-2"
                  style={{ background: STEP_COLORS[i] ?? STEP_COLORS[STEP_COLORS.length - 1] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(barPct, 2)}%` }}
                  transition={{ ...spring.gentle, delay: i * 0.08 }}
                >
                  {barPct > 15 && (
                    <span className="text-xs font-mono font-bold" style={{ color: "#0F0E0C" }}>
                      {step.count.toLocaleString()}
                    </span>
                  )}
                </motion.div>
                {barPct <= 15 && (
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {step.count.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Percentage + Dropoff */}
              <div className="flex items-center gap-2 flex-shrink-0 w-24 justify-end">
                <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                  {step.pct}%
                </span>
                {i > 0 && step.dropoffPct > 0 && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: step.dropoffPct > 40 ? "var(--danger)" : "var(--text-muted)" }}
                  >
                    -{step.dropoffPct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
