"use client";

import { useMemo } from "react";
import { getStyleVars } from "@/lib/beerStyleColors";

interface ActivityHeatmapProps {
  /** Array of { date: "YYYY-MM-DD", count: number, style?: string } */
  data: { date: string; count: number; style?: string }[];
  /** Show full 52 weeks or compact 26 weeks */
  compact?: boolean;
}

const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""];

function getCellColor(count: number, style?: string): string {
  if (count === 0) return "var(--surface-2)";
  const vars = getStyleVars(style ?? null);
  const primary = vars.primary;
  if (count <= 2) return `color-mix(in srgb, ${primary} 30%, var(--surface-2))`;
  if (count <= 5) return `color-mix(in srgb, ${primary} 60%, var(--surface-2))`;
  return primary;
}

export function ActivityHeatmap({ data, compact = false }: ActivityHeatmapProps) {
  const { grid, months, totalPours, activeDays } = useMemo(() => {
    const weeks = compact ? 26 : 52;
    const today = new Date();
    const countMap = new Map<string, { count: number; style?: string }>();
    for (const d of data) {
      const existing = countMap.get(d.date);
      countMap.set(d.date, { count: (existing?.count ?? 0) + d.count, style: d.style ?? existing?.style });
    }

    // Build grid: weeks × 7 days
    const grid: { date: string; count: number; style?: string; dayOfWeek: number }[][] = [];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - endDate.getDay()); // Start of current week (Sunday)
    endDate.setDate(endDate.getDate() + 6); // End of current week (Saturday)

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    const currentDate = new Date(startDate);
    let currentWeek: { date: string; count: number; style?: string; dayOfWeek: number }[] = [];

    let total = 0;
    let active = 0;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const entry = countMap.get(dateStr);
      const count = entry?.count ?? 0;
      const style = entry?.style;
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        grid.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push({ date: dateStr, count, style, dayOfWeek });
      total += count;
      if (count > 0) active++;

      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (currentWeek.length > 0) grid.push(currentWeek);

    // Month labels
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < grid.length; w++) {
      const firstDay = grid[w][0];
      if (!firstDay) continue;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        months.push({
          label: new Date(firstDay.date).toLocaleDateString("en-US", { month: "short" }),
          col: w,
        });
        lastMonth = month;
      }
    }

    return { grid, months, totalPours: total, activeDays: active };
  }, [data, compact]);

  const cellSize = compact ? 10 : 11;
  const gap = 2;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Pour Activity
        </h3>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{totalPours} pours</span>
          <span>{activeDays} days active</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: compact ? 0 : 28 }}>
            {months.map((m, i) => (
              <span
                key={i}
                className="text-[9px] font-mono"
                style={{
                  color: "var(--text-muted)",
                  position: "relative",
                  left: m.col * (cellSize + gap),
                  width: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            {!compact && (
              <div className="flex flex-col gap-0.5 mr-1">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div
                    key={i}
                    className="text-[9px] font-mono flex items-center justify-end"
                    style={{
                      width: 22,
                      height: cellSize,
                      color: "var(--text-muted)",
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-[2px] transition-colors"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: getCellColor(day.count, day.style),
                    }}
                    title={`${new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${day.count} pour${day.count !== 1 ? "s" : ""}${day.style ? ` · ${day.style}` : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>Color = style</span>
            {(["IPA", "Stout", "Sour", "Porter", "Lager", "Saison"] as const).map((s) => (
              <div
                key={s}
                className="rounded-[2px]"
                title={s}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: getStyleVars(s).primary,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
