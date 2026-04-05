// Your Round (Weekly) OG story card — Sprint 162 (The Identity)
// Instagram Story format (1080×1920). Weekly stats recap.

import { ImageResponse } from "next/og";

const W = 1080;
const H = 1920;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const totalBeers = searchParams.get("beers") ?? "0";
  const uniqueBreweries = searchParams.get("breweries") ?? "0";
  const topBeer = searchParams.get("top_beer") ?? null;
  const topStyle = searchParams.get("top_style") ?? null;
  const label = searchParams.get("label") ?? "This Week";

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
        {/* Amber accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background:
              "linear-gradient(90deg, #D4A843 0%, #E8841A 50%, #D4A843 100%)",
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
          HOPTRACK · YOUR ROUND
        </div>

        {/* Period label */}
        <div
          style={{
            fontSize: "32px",
            color: "#A89F8C",
            textTransform: "uppercase",
            letterSpacing: "0.4em",
            marginTop: "80px",
            marginBottom: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {label}
        </div>

        {/* Main hero stat: total beers */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "80px",
          }}
        >
          <div
            style={{
              fontSize: "380px",
              fontWeight: 900,
              color: "#D4A843",
              lineHeight: 1,
              fontFamily: "serif",
              display: "flex",
            }}
          >
            {totalBeers}
          </div>
          <div
            style={{
              fontSize: "56px",
              color: "#F5F0E8",
              fontWeight: 500,
              marginTop: "16px",
              display: "flex",
            }}
          >
            {totalBeers === "1" ? "beer" : "beers"}
          </div>
        </div>

        {/* Secondary stats grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            background: "rgba(28,26,22,0.6)",
            border: "2px solid #3A3628",
            borderRadius: "32px",
            padding: "48px 56px",
          }}
        >
          {uniqueBreweries !== "0" && (
            <StatRow
              label="Breweries"
              value={`${uniqueBreweries}`}
            />
          )}
          {topBeer && <StatRow label="Top Pour" value={topBeer} />}
          {topStyle && <StatRow label="Top Style" value={topStyle} />}
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
          hoptrack.beer/your-round
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: "1px solid #3A3628",
        paddingBottom: "24px",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          color: "#8B7D6E",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          display: "flex",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "40px",
          fontWeight: 700,
          color: "#F5F0E8",
          fontFamily: "serif",
          maxWidth: "600px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "flex",
        }}
      >
        {value}
      </div>
    </div>
  );
}
