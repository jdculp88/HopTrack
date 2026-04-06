import { TrendingUp, DollarSign, Info } from "lucide-react";
import { calculateROI, formatROIMessage, type ROIData } from "@/lib/roi";
import { Card } from "@/components/ui/Card";

// ── Mini Sparkline (inline SVG, no client JS needed) ─────────────
function MiniSparkline({
  data,
  color = "var(--accent-gold)",
  height = 32,
  width = 80,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map(
      (v, i) =>
        `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`
    )
    .join(" ");

  const lastX = (data.length - 1) * step;
  const lastY =
    height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;

  return (
    <svg
      width={width}
      height={height}
      className="flex-shrink-0"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3} fill={color} />
    </svg>
  );
}

// ── Props ────────────────────────────────────────────────────────
interface ROIDashboardCardProps {
  loyaltyVisitsThisMonth: number;
  loyaltyVisitsByWeek: number[];
  subscriptionTier: string;
  hasLoyaltyProgram: boolean;
}

// ── ROI Dashboard Card (Server Component) ────────────────────────
export default function ROIDashboardCard({
  loyaltyVisitsThisMonth,
  loyaltyVisitsByWeek,
  subscriptionTier,
  hasLoyaltyProgram,
}: ROIDashboardCardProps) {
  // ── No loyalty program ──
  if (!hasLoyaltyProgram) {
    return (
      <Card bgClass="card-bg-stats" padding="spacious">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "var(--accent-gold)", opacity: 0.15 }}
          >
            <DollarSign
              size={18}
              style={{ color: "var(--accent-gold)" }}
            />
          </div>
          <h3
            className="font-display text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            ROI Tracker
          </h3>
        </div>
        <p
          className="font-sans text-sm leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Set up a loyalty program to start tracking your return on investment.
          Repeat visits driven by your stamp card show up here.
        </p>
      </Card>
    );
  }

  // ── Calculate ROI ──
  const roi: ROIData = calculateROI({
    loyaltyVisitsThisMonth,
    loyaltyVisitsByWeek,
    subscriptionTier: subscriptionTier as "free" | "tap" | "cask" | "barrel",
  });

  const message = formatROIMessage(roi);
  const hasData = roi.loyaltyDrivenVisits > 0;
  const isFree = subscriptionTier === "free";

  // ── Hero number logic ──
  let heroValue: string;
  let heroLabel: string;

  if (!hasData) {
    heroValue = "--";
    heroLabel = "Not enough data yet";
  } else if (isFree) {
    heroValue = `$${roi.estimatedRevenue.toLocaleString()}`;
    heroLabel = "Estimated loyalty-driven revenue";
  } else if (roi.roiMultiple >= 1) {
    heroValue = `${roi.roiMultiple}x`;
    heroLabel = "Return on subscription";
  } else {
    heroValue = `$${roi.estimatedRevenue.toLocaleString()}`;
    heroLabel = "Loyalty-driven revenue this month";
  }

  // ── Trend direction ──
  const weekData = roi.trend;
  const trendUp =
    weekData.length >= 2 && weekData[weekData.length - 1] >= weekData[weekData.length - 2];

  return (
    <Card bgClass="card-bg-stats" padding="spacious">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <TrendingUp size={18} style={{ color: "var(--accent-gold)" }} />
          </div>
          <h3
            className="font-display text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            ROI Tracker
          </h3>
        </div>
        {hasData && weekData.length >= 2 && (
          <MiniSparkline data={weekData} />
        )}
      </div>

      {/* Hero number */}
      <div className="mb-3">
        <div
          className="font-display text-4xl font-bold tracking-tight"
          style={{ color: "var(--accent-gold)" }}
        >
          {heroValue}
        </div>
        <div
          className="font-sans text-sm mt-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {heroLabel}
        </div>
      </div>

      {/* Message */}
      {hasData && (
        <p
          className="font-sans text-sm leading-relaxed mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          {message}
        </p>
      )}

      {/* Stats row */}
      {hasData && (
        <div
          className="grid grid-cols-3 gap-3 rounded-xl p-3"
          style={{
            background: "color-mix(in srgb, var(--surface-2) 50%, transparent)",
          }}
        >
          <div className="text-center">
            <div
              className="font-mono text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {roi.loyaltyDrivenVisits}
            </div>
            <div
              className="font-sans text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Repeat visits
            </div>
          </div>
          <div className="text-center">
            <div
              className="font-mono text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              ${roi.estimatedRevenue.toLocaleString()}
            </div>
            <div
              className="font-sans text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Est. revenue
            </div>
          </div>
          <div className="text-center">
            <div
              className="font-mono text-lg font-semibold flex items-center justify-center gap-1"
              style={{
                color: trendUp ? "var(--accent-gold)" : "var(--text-secondary)",
              }}
            >
              {trendUp ? "+" : ""}
              {weekData.length >= 2
                ? weekData[weekData.length - 1] - weekData[weekData.length - 2]
                : 0}
            </div>
            <div
              className="font-sans text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              vs last week
            </div>
          </div>
        </div>
      )}

      {/* How we calculate */}
      <div className="flex items-start gap-1.5 mt-4">
        <Info size={12} className="mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
        <p
          className="font-sans text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Based on loyalty stamp check-ins this month and an industry average of $35/visit.
          {!isFree && roi.subscriptionCost > 0 && (
            <> ROI = estimated revenue / ${roi.subscriptionCost}/mo subscription.</>
          )}
        </p>
      </div>
    </Card>
  );
}
