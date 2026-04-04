import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const W = 1200;
const H = 630;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const streak = parseInt(searchParams.get("streak") || "0", 10);

  if (!userId || !streak) {
    return new ImageResponse(<DefaultStreakOG />, { width: W, height: H });
  }

  const supabase = await createClient();
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", userId)
    .single();

  if (!profile) {
    return new ImageResponse(<DefaultStreakOG streak={streak} />, {
      width: W,
      height: H,
    });
  }

  const displayName = (profile as any).display_name || (profile as any).username || "HopTracker";
  const avatarUrl = (profile as any).avatar_url;

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
        }}
      >
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

        {/* Avatar */}
        {avatarUrl && (
          <div
            style={{
              display: "flex",
              marginBottom: "24px",
            }}
          >
            <img
              src={avatarUrl}
              width={64}
              height={64}
              style={{
                borderRadius: "32px",
                border: "2px solid rgba(212, 168, 67, 0.3)",
              }}
            />
          </div>
        )}

        {/* Fire emoji */}
        <div style={{ fontSize: "80px", marginBottom: "8px", display: "flex" }}>
          {"\uD83D\uDD25"}
        </div>

        {/* Streak number */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#D4A843",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          {streak}
        </div>

        {/* Day streak label */}
        <div
          style={{
            fontSize: "20px",
            color: "#A89F8C",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          DAY STREAK
        </div>

        {/* User display name */}
        <div
          style={{
            fontSize: "28px",
            color: "#F5F0E8",
            fontWeight: 600,
          }}
        >
          {displayName}
        </div>

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

function DefaultStreakOG({ streak }: { streak?: number }) {
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
      <div style={{ fontSize: "64px", marginBottom: "12px", display: "flex" }}>
        {"\uD83D\uDD25"}
      </div>
      {streak ? (
        <>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#D4A843",
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            {streak}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#A89F8C",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 600,
            }}
          >
            DAY STREAK
          </div>
        </>
      ) : (
        <div style={{ fontSize: "48px", fontWeight: 800, color: "#F5F0E8" }}>
          Streak Milestone
        </div>
      )}
      <div
        style={{
          fontSize: "18px",
          color: "#A89F8C",
          marginTop: "16px",
        }}
      >
        Track Every Pour
      </div>
    </div>
  );
}
