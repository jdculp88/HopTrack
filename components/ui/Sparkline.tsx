"use client";

/**
 * Lightweight inline SVG sparkline — no charting library needed.
 * Extracted from DashboardClient.tsx — Sprint 136 (The Command Center)
 */

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ data, color = "var(--accent-gold)", height = 28, width = 64 }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="flex-shrink-0" style={{ overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) * step}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r={3}
        fill={color}
      />
    </svg>
  );
}
