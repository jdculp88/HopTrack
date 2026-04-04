import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";

const W = 1200;
const H = 630;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return new ImageResponse(<DefaultSessionOG />, { width: W, height: H });
  }

  const supabase = await createClient();
  const { data: session } = await (supabase as any)
    .from("sessions")
    .select(`
      id, started_at, ended_at, xp_earned, context,
      brewery:breweries(name, city, state),
      beer_logs(
        id,
        beer:beers(name, style),
        rating
      )
    `)
    .eq("id", sessionId)
    .single();

  if (!session) {
    return new ImageResponse(<DefaultSessionOG />, { width: W, height: H });
  }

  const brewery = (session as any).brewery;
  const beerLogs = ((session as any).beer_logs || []).slice(0, 4);
  const beerCount = ((session as any).beer_logs || []).length;
  const ratedLogs = ((session as any).beer_logs || []).filter((l: any) => l.rating != null);
  const avgRating =
    ratedLogs.length > 0
      ? (ratedLogs.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / ratedLogs.length).toFixed(1)
      : null;

  const start = new Date((session as any).started_at);
  const end = (session as any).ended_at ? new Date((session as any).ended_at) : new Date();
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
  const duration =
    durationMin >= 60 ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : `${durationMin}m`;

  const xpEarned = (session as any).xp_earned || 0;

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
          background: "linear-gradient(135deg, #0F0E0C 0%, #1A1814 50%, #0F0E0C 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* HopTrack logo text */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
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

        {/* Brewery name */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            color: "#F5F0E8",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {brewery?.name || "Beer Session"}
        </div>

        {/* Location */}
        {brewery?.city && (
          <div style={{ fontSize: "20px", color: "#A89F8C", marginBottom: "32px" }}>
            {brewery.city}
            {brewery.state ? `, ${brewery.state}` : ""}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: "48px", marginBottom: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: 700, color: "#D4A843" }}>{beerCount}</span>
            <span
              style={{
                fontSize: "14px",
                color: "#A89F8C",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Beers
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: 700, color: "#D4A843" }}>{duration}</span>
            <span
              style={{
                fontSize: "14px",
                color: "#A89F8C",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Duration
            </span>
          </div>
          {avgRating && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "36px", fontWeight: 700, color: "#D4A843" }}>
                {"\u2605"} {avgRating}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#A89F8C",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Avg Rating
              </span>
            </div>
          )}
          {xpEarned > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "36px", fontWeight: 700, color: "#D4A843" }}>
                +{xpEarned}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#A89F8C",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                XP
              </span>
            </div>
          )}
        </div>

        {/* Beer list */}
        {beerLogs.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}
          >
            {beerLogs.map((log: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  background: "rgba(212, 168, 67, 0.1)",
                  border: "1px solid rgba(212, 168, 67, 0.2)",
                  color: "#F5F0E8",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {log.beer?.name || "Unknown Beer"}
                {log.rating && (
                  <span style={{ color: "#D4A843", fontSize: "14px" }}>
                    {"\u2605"}
                    {log.rating}
                  </span>
                )}
              </div>
            ))}
            {beerCount > 4 && (
              <div style={{ padding: "8px 16px", color: "#A89F8C", fontSize: "16px" }}>
                +{beerCount - 4} more
              </div>
            )}
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

function DefaultSessionOG() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0F0E0C 0%, #1A1814 50%, #0F0E0C 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          color: "#D4A843",
          fontWeight: 700,
          letterSpacing: "0.1em",
          marginBottom: "16px",
        }}
      >
        HOPTRACK
      </div>
      <div style={{ fontSize: "48px", fontWeight: 800, color: "#F5F0E8" }}>Beer Session</div>
      <div style={{ fontSize: "18px", color: "#A89F8C", marginTop: "12px" }}>
        Track Every Pour
      </div>
    </div>
  );
}
