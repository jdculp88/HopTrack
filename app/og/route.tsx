import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// runtime: "edge" removed — incompatible with cacheComponents (Sprint 158)

// 1200×630 — standard OG image size
const W = 1200;
const H = 630;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "home";
  const breweryName = searchParams.get("brewery");
  const breweryCity = searchParams.get("city");

  const isBrewery = type === "brewery" && breweryName;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: "#0F0E0C",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial warm gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #1C1A16 0%, #0F0E0C 70%)",
          }}
        />

        {/* Gold grain texture overlay (soft) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 120% 80% at 20% 80%, rgba(212,168,67,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            height: "100%",
          }}
        >
          {/* HopTrack wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Hop icon mark */}
            <svg
              width={48}
              height={48}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx={24} cy={24} r={24} fill="#D4A843" fillOpacity={0.15} />
              <text x={24} y={32} textAnchor="middle" fontSize={26} fill="#D4A843">
                🍺
              </text>
            </svg>
            <span
              style={{
                fontFamily: "serif",
                fontSize: 32,
                fontWeight: 700,
                color: "#D4A843",
                letterSpacing: "-0.5px",
              }}
            >
              HopTrack
            </span>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {isBrewery ? (
              <>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#D4A843",
                    textTransform: "uppercase",
                    letterSpacing: "3px",
                    fontFamily: "monospace",
                  }}
                >
                  BREWERY ON HOPTRACK
                </div>
                <div
                  style={{
                    fontSize: breweryName.length > 30 ? 56 : 72,
                    fontWeight: 800,
                    color: "#F5F0E8",
                    fontFamily: "serif",
                    lineHeight: 1.05,
                    letterSpacing: "-1px",
                  }}
                >
                  {breweryName}
                </div>
                {breweryCity && (
                  <div
                    style={{
                      fontSize: 28,
                      color: "#A89F8C",
                      fontFamily: "sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    📍 {breweryCity}
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 80,
                    fontWeight: 800,
                    color: "#F5F0E8",
                    fontFamily: "serif",
                    lineHeight: 1.0,
                    letterSpacing: "-2px",
                  }}
                >
                  Track Every Pour.
                </div>
                <div
                  style={{
                    fontSize: 28,
                    color: "#A89F8C",
                    fontFamily: "sans-serif",
                    fontWeight: 400,
                    maxWidth: 700,
                    lineHeight: 1.4,
                  }}
                >
                  The social brewery app. Check in beers, earn XP, follow friends, and discover the best craft breweries near you.
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "#6B6456",
                fontFamily: "monospace",
              }}
            >
              hoptrack.beer
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
              }}
            >
              {["🍺", "⭐", "🗺️"].map((emoji, i) => (
                <div
                  key={i}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: "rgba(212,168,67,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
    }
  );
}
