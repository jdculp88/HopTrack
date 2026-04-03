"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { SessionHeatmapDay } from "@/lib/superadmin-user";

// ── Color levels (gold intensity) ──────────────────────────────────────

const COLORS = [
  "var(--surface-2)",           // 0 sessions
  "rgba(212,168,67,0.15)",      // level 1
  "rgba(212,168,67,0.35)",      // level 2
  "rgba(212,168,67,0.60)",      // level 3
  "rgba(212,168,67,0.90)",      // level 4
];

function getColor(count: number, max: number): string {
  if (count === 0) return COLORS[0];
  if (max === 0) return COLORS[0];
  const ratio = count / max;
  if (ratio <= 0.25) return COLORS[1];
  if (ratio <= 0.5) return COLORS[2];
  if (ratio <= 0.75) return COLORS[3];
  return COLORS[4];
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Component ──────────────────────────────────────────────────────────

interface Props {
  data: SessionHeatmapDay[];
}

export function SessionHeatmap({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { grid, maxCount, monthMarkers } = useMemo(() => {
    if (!data || data.length === 0) {
      return { grid: [], maxCount: 0, monthMarkers: [] };
    }

    const max = Math.max(...data.map(d => d.count), 1);

    // Build 53×7 grid (columns = weeks, rows = days)
    const firstDate = new Date(data[0].date);
    const firstDay = firstDate.getDay(); // 0=Sun

    // Pad with empty cells at the beginning
    const paddedData: (SessionHeatmapDay | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      paddedData.push(null);
    }
    paddedData.push(...data);

    // Build grid: array of weeks, each week is array of 7 days
    const weeks: (SessionHeatmapDay | null)[][] = [];
    for (let i = 0; i < paddedData.length; i += 7) {
      weeks.push(paddedData.slice(i, i + 7));
    }

    // Month markers: detect when month changes across weeks
    const markers: { weekIdx: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks.length; w++) {
      const firstCell = weeks[w].find(c => c !== null);
      if (firstCell) {
        const month = new Date(firstCell.date).getMonth();
        if (month !== lastMonth) {
          markers.push({ weekIdx: w, label: MONTH_LABELS[month] });
          lastMonth = month;
        }
      }
    }

    return { grid: weeks, maxCount: max, monthMarkers: markers };
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle as="h3">Session Activity</CardTitle></CardHeader>
        <p className="text-sm px-5 pb-5" style={{ color: "var(--text-muted)" }}>No session data</p>
      </Card>
    );
  }

  const CELL_SIZE = 13;
  const GAP = 3;
  const LABEL_WIDTH = 32;

  return (
    <Card padding="spacious">
      <CardHeader>
        <CardTitle as="h3">Session Activity</CardTitle>
      </CardHeader>

      <div className="overflow-x-auto pb-2">
        {/* Month labels */}
        <div className="flex" style={{ paddingLeft: LABEL_WIDTH + 4 }}>
          {monthMarkers.map((m, i) => (
            <span
              key={i}
              className="text-xs font-mono"
              style={{
                color: "var(--text-muted)",
                position: "relative",
                left: m.weekIdx * (CELL_SIZE + GAP),
                width: 0,
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5 mt-1" style={{ position: "relative" }}>
          {/* Day labels */}
          <div
            className="flex flex-col justify-between flex-shrink-0"
            style={{ width: LABEL_WIDTH, height: 7 * (CELL_SIZE + GAP) - GAP }}
          >
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="text-xs font-mono leading-none"
                style={{ color: "var(--text-muted)", height: CELL_SIZE, lineHeight: `${CELL_SIZE}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Cells */}
          <div className="flex gap-[3px]">
            {grid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, dIdx) => {
                  const cell = week[dIdx] ?? null;
                  return (
                    <div
                      key={dIdx}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: 2,
                        background: cell ? getColor(cell.count, maxCount) : "transparent",
                        cursor: cell ? "pointer" : "default",
                      }}
                      onMouseEnter={(e) => {
                        if (!cell) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          text: `${cell.count} session${cell.count !== 1 ? "s" : ""} on ${cell.date}`,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3" style={{ paddingLeft: LABEL_WIDTH + 4 }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Less</span>
          {COLORS.map((color, i) => (
            <div
              key={i}
              style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 2, background: color }}
            />
          ))}
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg text-xs font-mono pointer-events-none"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </Card>
  );
}
