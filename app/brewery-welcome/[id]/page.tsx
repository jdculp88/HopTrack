import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { HopMark } from "@/components/ui/HopMark";

export const revalidate = 300; // 5-minute ISR — public page, no auth required

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: brewery } = await (supabase as any)
    .from("breweries").select("name, city, state").eq("id", id).maybeSingle();
  if (!brewery) return { title: "Brewery — HopTrack" };
  return {
    title: `${brewery.name} — HopTrack`,
    description: `Track your pours at ${brewery.name} on HopTrack — the craft beer check-in app.`,
    openGraph: {
      title: `${brewery.name} on HopTrack`,
      description: `Track your beers at ${brewery.name}${brewery.city ? ` in ${brewery.city}` : ""}.`,
    },
  };
}

export default async function BreweryWelcomePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: brewery } = await (supabase as any)
    .from("breweries")
    .select("id, name, city, state, brewery_type")
    .eq("id", id)
    .maybeSingle();

  if (!brewery) notFound();

  const { data: onTapBeers } = await (supabase as any)
    .from("beers")
    .select("name, style, abv")
    .eq("brewery_id", id)
    .eq("is_on_tap", true)
    .order("display_order", { ascending: true })
    .limit(6);

  const beerList = (onTapBeers as any[]) ?? [];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#FBF7F0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Gold top bar */}
      <div style={{ width: "100%", height: 5, background: "var(--accent-gold)", flexShrink: 0 }} />

      {/* Header */}
      <header style={{ width: "100%", maxWidth: 480, padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <HopMark variant="horizontal" theme="cream" height={22} />
        <a
          href={`/brewery/${brewery.id}`}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent-gold)", textDecoration: "none", letterSpacing: "0.1em" }}
        >
          Sign in →
        </a>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, width: "100%", maxWidth: 480, padding: "40px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Brewery name */}
        <h1 style={{
          fontFamily: "'Instrument Serif', 'Georgia', serif",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "clamp(40px, 10vw, 60px)",
          lineHeight: 1.1,
          color: "#1A1714",
          textAlign: "center",
          letterSpacing: "-0.01em",
          marginBottom: 8,
        }}>
          {brewery.name}
        </h1>

        {/* Location */}
        {brewery.city && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: "#6B5E4E", textTransform: "uppercase", marginBottom: 32 }}>
            {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
            {brewery.brewery_type ? ` · ${brewery.brewery_type.replace(/_/g, " ")}` : ""}
          </p>
        )}

        {/* Gold divider */}
        <div style={{ width: 60, height: 2, background: "var(--accent-gold)", marginBottom: 32 }} />

        {/* On tap preview */}
        {beerList.length > 0 && (
          <div style={{ width: "100%", marginBottom: 32 }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: "#9E8E7A", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
              Currently on tap
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {beerList.map((beer: any, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.6)",
                  borderRadius: 10,
                  border: "1px solid #E5DDD0",
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1714", lineHeight: 1.2 }}>{beer.name}</p>
                    {beer.style && <p style={{ fontSize: 12, color: "#6B5E4E", marginTop: 2 }}>{beer.style}</p>}
                  </div>
                  {beer.abv && (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9E8E7A" }}>
                      {beer.abv}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA — navigates to home with brewery pre-selected for session start */}
        <a
          href={`/home?start_brewery=${brewery.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            padding: "16px 24px",
            background: "#1A1714",
            color: "var(--accent-gold)",
            borderRadius: 14,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          Track Your Pours
        </a>

        <a
          href={`/brewery/${brewery.id}`}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9E8E7A", letterSpacing: "0.1em", textDecoration: "none" }}
        >
          View full brewery page →
        </a>

        {/* HopTrack pitch */}
        <div style={{ marginTop: 40, padding: "20px", background: "rgba(212,168,67,0.08)", borderRadius: 12, border: "1px solid rgba(212,168,67,0.2)", width: "100%" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.15em", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: 8 }}>
            New to HopTrack?
          </p>
          <p style={{ fontSize: 13, color: "#6B5E4E", lineHeight: 1.6 }}>
            Log every pour, earn XP, unlock achievements, and keep your personal beer journal. Free to join.
          </p>
          <a
            href="/signup"
            style={{ display: "inline-block", marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "0.1em", textDecoration: "none" }}
          >
            Create an account →
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ width: "100%", maxWidth: 480, padding: "16px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <HopMark variant="horizontal" theme="cream" height={16} aria-hidden />
        </div>
      </footer>

      {/* Gold bottom bar */}
      <div style={{ width: "100%", height: 5, background: "var(--accent-gold)", flexShrink: 0 }} />
    </div>
  );
}
