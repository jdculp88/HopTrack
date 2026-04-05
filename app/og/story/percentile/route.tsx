// Percentile OG story card — Sprint 162 (The Identity)
// Instagram Story format (1080×1920). Big "Top X%" rarity flex.

import { ImageResponse } from "next/og";

const W = 1080;
const H = 1920;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const percentileParam = searchParams.get("percentile");
  const metric = searchParams.get("metric") ?? "top_style";
  const label = searchParams.get("label") ?? "drinkers";

  const percentile = percentileParam ? parseInt(percentileParam, 10) : 90;
  const topPct = Math.max(1, 100 - percentile);

  // Color tier based on rarity
  const tierColor =
    percentile >= 99
      ? "#E5E4E2"
      : percentile >= 95
        ? "#D4A843"
        : percentile >= 85
          ? "#E8841A"
          : "#C0C0C0";

  const tierLabel =
    percentile >= 99
      ? "LEGEND"
      : percentile >= 95
        ? "ELITE"
        : percentile >= 85
          ? "RARE"
          : "NOTABLE";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #0F0E0C 0%, #1C1A16 50%, #0F0E0C 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "120px 80px",
          position: "relative",
        }}
      >
        {/* Tier accent at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: tierColor,
            display: "flex",
          }}
        />

        {/* HopTrack wordmark */}
        <div
          style={{
            position: "absolute",
            top: 80,
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#D4A843",
            display: "flex",
          }}
        >
          HOPTRACK
        </div>

        {/* Tier label */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "0.5em",
            color: tierColor,
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {tierLabel}
        </div>

        {/* Big TOP X% number */}
        <div
          style={{
            fontSize: "56px",
            color: "#A89F8C",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 600,
            marginBottom: "8px",
            display: "flex",
          }}
        >
          TOP
        </div>
        <div
          style={{
            fontSize: "360px",
            fontWeight: 900,
            color: "#D4A843",
            lineHeight: 1,
            fontFamily: "serif",
            marginBottom: "0px",
            display: "flex",
          }}
        >
          {topPct}%
        </div>

        {/* Metric label */}
        <div
          style={{
            fontSize: "44px",
            color: "#F5F0E8",
            textAlign: "center",
            marginTop: "32px",
            fontWeight: 500,
            display: "flex",
          }}
        >
          of {label}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8B7D6E",
            display: "flex",
          }}
        >
          {metric.replace(/_/g, " ")} · hoptrack.beer
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
