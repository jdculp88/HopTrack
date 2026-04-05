// Personality OG story card — Sprint 162 (The Identity)
// Instagram Story format (1080×1920). Displays 4-letter archetype + emoji.

import { ImageResponse } from "next/og";
import { getArchetypeByCode } from "@/lib/personality";

const W = 1080;
const H = 1920;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "----";
  const entry = getArchetypeByCode(code);

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
            "linear-gradient(135deg, #0F0E0C 0%, #1A1814 40%, #2A2418 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "120px 80px",
          position: "relative",
        }}
      >
        {/* Gold accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, transparent 0%, #D4A843 50%, transparent 100%)",
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

        {/* Archetype emoji */}
        <div
          style={{
            fontSize: "280px",
            lineHeight: 1,
            marginBottom: "40px",
            display: "flex",
          }}
        >
          {entry.emoji}
        </div>

        {/* Code */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            letterSpacing: "0.3em",
            color: "#D4A843",
            marginBottom: "24px",
            display: "flex",
            fontFamily: "monospace",
          }}
        >
          {code}
        </div>

        {/* Archetype name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#F5F0E8",
            textAlign: "center",
            marginBottom: "32px",
            fontFamily: "serif",
            lineHeight: 1.1,
            display: "flex",
          }}
        >
          {entry.archetype}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            color: "#A89F8C",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          {entry.tagline}
        </div>

        {/* Footer tagline */}
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
          BEER PERSONALITY · hoptrack.beer
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
