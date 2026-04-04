import { ImageResponse } from "next/og";

export const runtime = "edge";

const W = 1200;
const H = 630;

const TIER_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#D4A843",
  platinum: "#E5E4E2",
};

const TIER_EMOJIS: Record<string, string> = {
  bronze: "\uD83E\uDD49",
  silver: "\uD83E\uDD48",
  gold: "\uD83E\uDD47",
  platinum: "\uD83D\uDC8E",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const description = searchParams.get("description");
  const tier = searchParams.get("tier") || "bronze";
  const xp = searchParams.get("xp");
  const userName = searchParams.get("user_name");

  if (!name) {
    return new ImageResponse(<DefaultAchievementOG />, {
      width: W,
      height: H,
    });
  }

  const tierColor = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const tierEmoji = TIER_EMOJIS[tier] || "\uD83C\uDFC6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #0F0E0C 0%, #1A1814 50%, #0F0E0C 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Tier accent line at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: tierColor,
            display: "flex",
          }}
        />

        {/* HopTrack logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              color: "#D4A843",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            HOPTRACK
          </span>
        </div>

        {/* Tier emoji */}
        <div style={{ fontSize: "60px", marginBottom: "20px", display: "flex" }}>
          {tierEmoji}
        </div>

        {/* Achievement name */}
        <div
          style={{
            fontSize: "44px",
            fontWeight: 800,
            color: "#F5F0E8",
            textAlign: "center",
            marginBottom: "12px",
            maxWidth: "900px",
          }}
        >
          {name}
        </div>

        {/* Achievement description */}
        {description && (
          <div
            style={{
              fontSize: "18px",
              color: "#A89F8C",
              textAlign: "center",
              marginBottom: "24px",
              maxWidth: "700px",
            }}
          >
            {description}
          </div>
        )}

        {/* XP badge */}
        {xp && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "20px",
              background: "rgba(212, 168, 67, 0.15)",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#D4A843",
              }}
            >
              +{xp} XP
            </span>
          </div>
        )}

        {/* User name */}
        {userName && (
          <div
            style={{
              fontSize: "20px",
              color: "#A89F8C",
              fontWeight: 500,
            }}
          >
            {userName}
          </div>
        )}

        {/* Tagline */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "14px",
            color: "#6B5E4E",
            letterSpacing: "0.15em",
          }}
        >
          TRACK EVERY POUR
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}

function DefaultAchievementOG() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0F0E0C 0%, #1A1814 50%, #0F0E0C 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          color: "#D4A843",
          fontWeight: 700,
          letterSpacing: "0.1em",
          marginBottom: "24px",
        }}
      >
        HOPTRACK
      </div>
      <div style={{ fontSize: "60px", marginBottom: "16px", display: "flex" }}>
        {"\uD83C\uDFC6"}
      </div>
      <div style={{ fontSize: "48px", fontWeight: 800, color: "#F5F0E8" }}>
        Achievement Unlocked
      </div>
      <div
        style={{
          fontSize: "18px",
          color: "#A89F8C",
          marginTop: "12px",
        }}
      >
        Track Every Pour
      </div>
    </div>
  );
}
