// Four Favorites OG story card — Sprint 162 (The Identity)
// Instagram Story format (1080×1920). 2×2 grid of favorite beers.

import { ImageResponse } from "next/og";

const W = 1080;
const H = 1920;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("user_name") ?? "";
  // Beer list passed as repeated `beer` params: ?beer=Name1&beer=Name2...
  const beers = searchParams.getAll("beer");
  // Brewery list parallel to beers
  const breweries = searchParams.getAll("brewery");

  const slots = [0, 1, 2, 3].map((i) => ({
    name: beers[i] ?? null,
    brewery: breweries[i] ?? null,
  }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, #0F0E0C 0%, #1C1A16 50%, #0F0E0C 100%)",
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

        {/* Wordmark */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
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

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "40px",
            marginBottom: "64px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              color: "#A89F8C",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            {userName ? `${userName}'s` : "My"}
          </div>
          <div
            style={{
              fontSize: "96px",
              fontWeight: 700,
              color: "#F5F0E8",
              fontFamily: "serif",
              lineHeight: 1,
              display: "flex",
            }}
          >
            Four Favorites
          </div>
        </div>

        {/* 2×2 Beer grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
            flex: 1,
          }}
        >
          {slots.map((slot, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(28,26,22,0.8)",
                border: "2px solid #3A3628",
                borderRadius: "32px",
                padding: "48px 36px",
                justifyContent: "space-between",
                minHeight: "400px",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#D4A843",
                  fontFamily: "serif",
                  marginBottom: "16px",
                  display: "flex",
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#F5F0E8",
                    fontFamily: "serif",
                    lineHeight: 1.1,
                    display: "flex",
                  }}
                >
                  {slot.name ?? "—"}
                </div>
                {slot.brewery && (
                  <div
                    style={{
                      fontSize: "24px",
                      color: "#A89F8C",
                      display: "flex",
                    }}
                  >
                    {slot.brewery}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8B7D6E",
            display: "flex",
            justifyContent: "center",
          }}
        >
          TRACK EVERY POUR · hoptrack.beer
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
