import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EmbedBeerRow } from "@/components/embed/EmbedBeerRow";
import { getInitials, formatEventDate, CREAM } from "@/lib/board-helpers";
import { HopMark } from "@/components/ui/HopMark";

export const revalidate = 300; // 5-minute ISR — public page, no auth required

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: brewery } = await (supabase as any)
    .from("breweries")
    .select("name, city, state, description")
    .eq("id", id)
    .maybeSingle();
  if (!brewery) return { title: "Brewery — HopTrack" };

  const { count } = await (supabase as any)
    .from("beers")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", id)
    .eq("is_on_tap", true);

  const beerCount = count ?? 0;
  const desc = brewery.description
    ? brewery.description.slice(0, 160)
    : `${beerCount} beers on tap at ${brewery.name}${brewery.city ? ` in ${brewery.city}` : ""}. Track your pours on HopTrack.`;

  return {
    title: `${brewery.name} — HopTrack`,
    description: desc,
    openGraph: {
      title: `${brewery.name} on HopTrack`,
      description: `${beerCount} beers on tap. ${desc}`,
    },
  };
}

export default async function BreweryWelcomePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch everything in parallel
  const [breweryRes, beersRes, eventsRes] = await Promise.all([
    (supabase as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type, description, cover_image_url, website_url, phone")
      .eq("id", id)
      .maybeSingle(),
    (supabase as any)
      .from("beers")
      .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, price_per_pint, glass_type")
      .eq("brewery_id", id)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name"),
    (supabase as any)
      .from("brewery_events")
      .select("id, title, event_date, start_time")
      .eq("brewery_id", id)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  if (!breweryRes.data) notFound();
  const brewery = breweryRes.data;

  // Fetch pour sizes
  const allBeers = beersRes.data ?? [];
  const beerIds = allBeers.map((b: any) => b.id);
  const pourSizesMap: Record<string, any[]> = {};

  if (beerIds.length > 0) {
    const { data: pourSizes } = await (supabase as any)
      .from("beer_pour_sizes")
      .select("beer_id, label, oz, price, display_order")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });

    if (pourSizes) {
      for (const ps of pourSizes) {
        if (!pourSizesMap[ps.beer_id]) pourSizesMap[ps.beer_id] = [];
        pourSizesMap[ps.beer_id].push({ label: ps.label, oz: ps.oz, price: ps.price });
      }
    }
  }

  const beers = allBeers.map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  const events = eventsRes.data ?? [];
  const featuredBeer = beers.find((b: any) => b.is_featured);
  const regularBeers = beers.filter((b: any) => !b.is_featured);
  const initials = getInitials(brewery.name);
  const colors = CREAM;

  return (
    <div style={{
      minHeight: "100dvh",
      background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%), ${colors.cream}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Gold top bar */}
      <div style={{ width: "100%", height: 4, background: colors.gold, flexShrink: 0 }} />

      {/* ─── Cover Image ─────────────────────────────────────────────── */}
      {brewery.cover_image_url && (
        <div style={{
          width: "100%",
          maxWidth: 640,
          height: 200,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brewery.cover_image_url}
            alt={`${brewery.name} cover`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 30%, rgba(251,247,240,0.9) 90%, #FBF7F0 100%)",
          }} />
        </div>
      )}

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header style={{
        width: "100%",
        maxWidth: 640,
        padding: brewery.cover_image_url ? "0 24px" : "24px 24px 0",
        marginTop: brewery.cover_image_url ? -40 : 0,
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <HopMark variant="horizontal" theme="cream" height={20} />
          <a
            href={`/brewery/${brewery.id}`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: colors.gold,
              textDecoration: "none",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Sign in →
          </a>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        width: "100%",
        maxWidth: 640,
        padding: "24px 24px 16px",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Brewery identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0F0E0C",
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800, fontSize: 16, color: colors.gold, letterSpacing: 1,
            }}>
              {initials}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontWeight: 700, fontStyle: "italic",
              fontSize: "clamp(28px, 7vw, 42px)",
              lineHeight: 1.1, color: "#1A1714",
              letterSpacing: "-0.01em", margin: 0,
            }}>
              {brewery.name}
            </h1>
          </div>
          {/* Beer count badge */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8, textTransform: "uppercase",
              letterSpacing: "0.2em", color: colors.gold,
              display: "block",
            }}>
              On Tap
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 28, fontWeight: 700, lineHeight: 1, color: colors.gold,
            }}>
              {beers.length}
            </span>
          </div>
        </div>

        {/* Location + type */}
        {brewery.city && (
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: "0.18em", color: colors.textSubtle,
            textTransform: "uppercase", margin: "0 0 4px",
          }}>
            {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
            {brewery.brewery_type ? ` · ${brewery.brewery_type.replace(/_/g, " ")}` : ""}
          </p>
        )}

        {/* Contact info */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          {brewery.website_url && (
            <a href={brewery.website_url} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, color: colors.gold, textDecoration: "none", letterSpacing: "0.08em",
            }}>
              Website ↗
            </a>
          )}
          {brewery.phone && (
            <a href={`tel:${brewery.phone}`} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, color: colors.textMuted, textDecoration: "none", letterSpacing: "0.08em",
            }}>
              {brewery.phone}
            </a>
          )}
        </div>

        {/* Description */}
        {brewery.description && (
          <p style={{
            fontSize: 14, lineHeight: 1.6, color: colors.textMuted,
            margin: "0 0 20px", maxWidth: 500,
          }}>
            {brewery.description}
          </p>
        )}

        {/* Gold divider */}
        <div style={{ width: 60, height: 2, background: colors.gold, marginBottom: 20 }} />

        {/* ─── Beer of the Week ────────────────────────────────────── */}
        {featuredBeer && (
          <div style={{ marginBottom: 16 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, textTransform: "uppercase",
              letterSpacing: "0.18em", color: colors.gold,
              display: "block", marginBottom: 6,
            }}>
              ★ Beer of the Week
            </span>
            <EmbedBeerRow
              beer={featuredBeer}
              colors={colors}
              showGlass
              showStyle
              showRating
              showPrice
              showDescription={false}
              compact={false}
              featured
            />
            <div style={{ marginTop: 8, height: 2, background: `${colors.gold}40` }} />
          </div>
        )}

        {/* ─── On Tap ────────────────────────────────────────────── */}
        {beers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, letterSpacing: "0.18em", color: colors.textSubtle,
              textTransform: "uppercase", display: "block", marginBottom: 8,
            }}>
              Currently On Tap
            </span>
            {regularBeers.map((beer: any) => (
              <EmbedBeerRow
                key={beer.id}
                beer={beer}
                colors={colors}
                showGlass
                showStyle
                showRating
                showPrice
                showDescription={false}
                compact={false}
              />
            ))}
          </div>
        )}

        {beers.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontStyle: "italic", color: colors.textSubtle, opacity: 0.5,
            }}>
              No beers on tap right now
            </p>
            <p style={{ fontSize: 13, color: colors.textSubtle, marginTop: 8 }}>
              Check back soon for updates
            </p>
          </div>
        )}

        {/* ─── Events ────────────────────────────────────────────── */}
        {events.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ height: 1, background: colors.border, marginBottom: 14 }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, letterSpacing: "0.18em", color: colors.gold,
              textTransform: "uppercase", display: "block", marginBottom: 10,
            }}>
              Upcoming Events
            </span>
            {events.map((ev: any) => (
              <div key={ev.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0",
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                  {ev.title}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, color: colors.gold,
                }}>
                  {formatEventDate(ev.event_date, ev.start_time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ─── CTAs ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <a
            href={`/home?start_brewery=${brewery.id}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, width: "100%", padding: "14px 24px",
              background: "#1A1714", color: colors.gold,
              borderRadius: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700, fontSize: 12,
              letterSpacing: "0.1em", textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Track Your Pours
          </a>
          <a
            href={`/brewery/${brewery.id}`}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: colors.textSubtle,
              letterSpacing: "0.08em", textDecoration: "none",
              textAlign: "center",
            }}
          >
            View full brewery page →
          </a>
        </div>

        {/* ─── Embed CTA (for brewery owners) ────────────────────── */}
        <div style={{
          marginTop: 24,
          padding: "16px 20px",
          background: "rgba(212,168,67,0.06)",
          borderRadius: 12,
          border: "1px solid rgba(212,168,67,0.15)",
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: "0.15em", color: colors.gold,
            textTransform: "uppercase", marginBottom: 6,
          }}>
            Own this brewery?
          </p>
          <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
            Claim your profile to manage your tap list, embed your beer menu on your website, and build loyalty with your regulars.
          </p>
          <a
            href="/for-breweries"
            style={{
              display: "inline-block", marginTop: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 700, color: colors.gold,
              letterSpacing: "0.08em", textDecoration: "none",
            }}
          >
            Learn more →
          </a>
        </div>

        {/* ─── HopTrack pitch ────────────────────────────────────── */}
        <div style={{
          marginTop: 16,
          padding: "16px 20px",
          background: "rgba(212,168,67,0.06)",
          borderRadius: 12,
          border: "1px solid rgba(212,168,67,0.15)",
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9, letterSpacing: "0.15em", color: colors.gold,
            textTransform: "uppercase", marginBottom: 6,
          }}>
            New to HopTrack?
          </p>
          <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
            Log every pour, earn XP, unlock achievements, and keep your personal beer journal. Free to join.
          </p>
          <a
            href="/signup"
            style={{
              display: "inline-block", marginTop: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, fontWeight: 700, color: colors.gold,
              letterSpacing: "0.08em", textDecoration: "none",
            }}
          >
            Create an account →
          </a>
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer style={{
        width: "100%", maxWidth: 640, padding: "20px 24px",
        display: "flex", justifyContent: "center",
      }}>
        <HopMark variant="horizontal" theme="cream" height={16} aria-hidden />
      </footer>

      {/* Gold bottom bar */}
      <div style={{ width: "100%", height: 4, background: colors.gold, flexShrink: 0 }} />
    </div>
  );
}
