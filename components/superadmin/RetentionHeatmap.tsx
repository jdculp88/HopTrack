"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RetentionCohort } from "@/lib/superadmin-metrics";

// ── Color mapping ──────────────────────────────────────────────────────

function getRetentionColor(pct: number | null): string {
  if (pct === null) return "transparent";
  if (pct >= 60) return "rgba(74,124,89,0.8)";   // green — strong
  if (pct >= 40) return "rgba(74,124,89,0.5)";   // green — medium
  if (pct >= 25) return "rgba(212,168,67,0.5)";  // gold — moderate
  if (pct >= 10) return "rgba(212,168,67,0.25)";  // gold — light
  if (pct > 0) return "rgba(196,75,58,0.25)";    // red — low
  return "rgba(196,75,58,0.1)";                    // red — zero
}

function getTextColor(pct: number | null): string {
  if (pct === null) return "var(--text-muted)";
  if (pct >= 40) return "#fff";
  return "var(--text-secondary)";
}

// ── Component ──────────────────────────────────────────────────────────

interface Props {
  cohorts: RetentionCohort[];
}

export function RetentionHeatmap({ cohorts }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{ cohortIdx: number; weekIdx: number } | null>(null);

  if (!cohorts || cohorts.length === 0) {
    return (
      <Card padding="spacious">
        <CardHeader><CardTitle as="h3">Cohort Retention</CardTitle></CardHeader>
        <p className="text-sm px-5 pb-5" style={{ color: "var(--text-muted)" }}>
          Not enough data for cohort analysis yet
        </p>
      </Card>
    );
  }

  const maxWeeks = Math.max(...cohorts.map(c => c.retention.length));

  return (
    <Card padding="spacious">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle as="h3">Cohort Retention</CardTitle>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Weekly cohorts · {cohorts.length} weeks
          </span>
        </div>
      </CardHeader>

      <div className="overflow-x-auto pb-2">
        <table className="w-full border-collapse" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th
                className="text-left text-xs font-mono uppercase tracking-wider px-2 py-2"
                style={{ color: "var(--text-muted)", width: 100 }}
              >
                Cohort
              </th>
              <th
                className="text-right text-xs font-mono uppercase tracking-wider px-2 py-2"
                style={{ color: "var(--text-muted)", width: 50 }}
              >
                Users
              </th>
              {Array.from({ length: maxWeeks }, (_, i) => (
                <th
                  key={i}
                  className="text-center text-xs font-mono px-1 py-2"
                  style={{ color: "var(--text-muted)", width: 48 }}
                >
                  W{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort, cIdx) => (
              <tr key={cohort.cohortWeek}>
                <td
                  className="text-xs font-mono px-2 py-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {cohort.cohortStart.slice(5)} {/* MM-DD */}
                </td>
                <td
                  className="text-xs font-mono text-right px-2 py-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cohort.userCount}
                </td>
                {cohort.retention.map((pct, wIdx) => {
                  const isHovered = hoveredCell?.cohortIdx === cIdx && hoveredCell?.weekIdx === wIdx;
                  const userCount = pct !== null ? Math.round((pct / 100) * cohort.userCount) : 0;

                  return (
                    <td
                      key={wIdx}
                      className="text-center text-xs font-mono px-1 py-1 relative"
                      onMouseEnter={() => setHoveredCell({ cohortIdx: cIdx, weekIdx: wIdx })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div
                        className="rounded px-1 py-1.5 transition-all"
                        style={{
                          background: getRetentionColor(pct),
                          color: getTextColor(pct),
                          transform: isHovered ? "scale(1.1)" : "scale(1)",
                          cursor: pct !== null ? "default" : "default",
                        }}
                      >
                        {pct !== null ? `${pct}%` : ""}
                      </div>
                      {/* Tooltip */}
                      {isHovered && pct !== null && (
                        <div
                          className="absolute z-50 px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap pointer-events-none"
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginBottom: 4,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          }}
                        >
                          {userCount} of {cohort.userCount} users
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
