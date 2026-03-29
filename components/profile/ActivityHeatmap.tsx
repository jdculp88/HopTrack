"use client";

import { useMemo } from "react";

interface ActivityHeatmapProps {
  /** Array of { date: "YYYY-MM-DD", count: number } */
  data: { date: string; count: number }[];
  /** Show full 52 weeks or compact 26 weeks */
  compact?: boolean;
}

const DAYS_OF_WEEK = ["Mon", "", "Wed", "", "Fri", "", ""];

function getIntensity(count: number): string {
  if (count === 0) return "var(--surface-2)";
  if (count <= 2) return "color-mix(in srgb, var(--accent-gold) 30%, var(--surface-2))";
  if (count <= 5) return "color-mix(in srgb, var(--accent-gold) 55%, var(--surface-2))";
  return "var(--accent-gold)";
}

export function ActivityHeatmap({ data, compact = false }: ActivityHeatmapProps) {
  const { grid, months, totalPours, activeDays } = useMemo(() => {
    const weeks = compact ? 26 : 52;
    const today = new Date();
    const countMap = new Map<string, number>();
    for (const d of data) {
      countMap.set(d.date, (countMap.get(d.date) || 0) + d.count);
    }

    // Build grid: weeks × 7 days
    const grid: { date: string; count: number; dayOfWeek: number }[][] = [];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - endDate.getDay()); // Start of current week (Sunday)
    endDate.setDate(endDate.getDate() + 6); // End of current week (Saturday)

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    let currentDate = new Date(startDate);
    let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];

    let total = 0;
    let active = 0;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = countMap.get(dateStr) || 0;
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        grid.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push({ date: dateStr, count, dayOfWeek });
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
                      background: getIntensity(day.count),
                    }}
                    title={`${new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${day.count} pour${day.count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>Less</span>
            {[0, 1, 3, 6].map((c) => (
              <div
                key={c}
                className="rounded-[2px]"
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: getIntensity(c),
                }}
              />
            ))}
            <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
