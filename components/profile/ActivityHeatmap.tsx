"use client";

import { useMemo } from "react";
import { getStyleVars } from "@/lib/beerStyleColors";

interface ActivityHeatmapProps {
  /** Array of { date: "YYYY-MM-DD", count: number, style?: string } */
  data: { date: string; count: number; style?: string }[];
}

/**
 * Pour Activity heatmap — design spec exact.
 * 52-week grid, 14×14px cells, 3px gap/radius, style-colored cells,
 * full 12-month labels, beer style color legend.
 */

function getCellColor(count: number, style?: string): string {
  if (count === 0) return "var(--warm-bg, var(--surface-2))";
  const vars = getStyleVars(style ?? null);
  const primary = vars.primary;
  if (count <= 2) return `color-mix(in srgb, ${primary} 35%, var(--surface-2))`;
  if (count <= 5) return `color-mix(in srgb, ${primary} 65%, var(--surface-2))`;
  return primary;
}

// Beer style spectrum for legend (representative colors)
const LEGEND_STYLES = [
  null,       // empty (warm-bg)
  "IPA",      // green
  "Stout",    // dark brown
  "Amber",    // amber
  "Sour",     // berry/pink
  "Porter",   // plum
];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { grid, months, totalPours, activeDays } = useMemo(() => {
    const weeks = 52;
    const today = new Date();
    const countMap = new Map<string, { count: number; style?: string }>();
    for (const d of data) {
      const existing = countMap.get(d.date);
      countMap.set(d.date, {
        count: (existing?.count ?? 0) + d.count,
        style: d.style ?? existing?.style,
      });
    }

    // Build grid: weeks × 7 days
    const grid: { date: string; count: number; style?: string; dayOfWeek: number }[][] = [];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - endDate.getDay() + 6); // End of current week (Saturday)

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    const currentDate = new Date(startDate);
    let currentWeek: typeof grid[0] = [];
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

    // Month labels — positioned across full width
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < grid.length; w++) {
      const firstDay = grid[w][0];
      if (!firstDay) continue;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        months.push({
          label: new Date(firstDay.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
          col: w,
        });
        lastMonth = month;
      }
    }

    return { grid, months, totalPours: total, activeDays: active };
  }, [data]);

  const totalCols = grid.length;

  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        padding: "18px 20px",
      }}
    >
      {/* Header — title + stats */}
      <div
        className="flex justify-between items-baseline"
        style={{ marginBottom: "14px" }}
      >
        <h3
          className="font-sans font-semibold"
          style={{ fontSize: "16px", color: "var(--text-primary)" }}
        >
          Pour Activity
        </h3>
        <span
          className="font-mono"
          style={{ fontSize: "10px", color: "var(--text-muted)" }}
        >
          {totalPours} pours · {activeDays} days active
        </span>
      </div>

      {/* Month labels — spread across full width */}
      <div
        className="relative"
        style={{ marginBottom: "10px", height: "10px" }}
      >
        {months.map((m, i) => (
          <span
            key={i}
            className="absolute font-mono uppercase"
            style={{
              fontSize: "8px",
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
              left: `${(m.col / totalCols) * 100}%`,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid — 52 weeks × 7 days, 14px cells, 3px gap */}
      <div
        className="flex"
        style={{ gap: "3px", marginBottom: "12px" }}
      >
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: "3px", flex: "1 1 0" }}>
            {week.map((day) => (
              <div
                key={day.date}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  maxWidth: "14px",
                  maxHeight: "14px",
                  borderRadius: "3px",
                  background: getCellColor(day.count, day.style),
                  transition: "transform 0.15s",
                  cursor: day.count > 0 ? "pointer" : "default",
                }}
                title={`${new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${day.count} pour${day.count !== 1 ? "s" : ""}${day.style ? ` · ${day.style}` : ""}`}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = "scale(1.4)";
                  (e.target as HTMLElement).style.zIndex = "2";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = "scale(1)";
                  (e.target as HTMLElement).style.zIndex = "0";
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend — beer style color spectrum */}
      <div
        className="flex items-center font-mono"
        style={{ gap: "8px", fontSize: "9px", color: "var(--text-muted)" }}
      >
        <span>Less</span>
        {LEGEND_STYLES.map((style, i) => {
          const bg = i === 0
            ? "var(--warm-bg, var(--surface-2))"
            : getStyleVars(style).primary;
          return (
            <div
              key={i}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "2px",
                background: bg,
              }}
            />
          );
        })}
        <span>More</span>
        <span style={{ marginLeft: "8px" }}>color = style</span>
      </div>
    </div>
  );
}
