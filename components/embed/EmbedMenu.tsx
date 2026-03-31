import { EmbedBeerRow } from "./EmbedBeerRow";
import { EmbedFooter } from "./EmbedFooter";
import { getInitials, formatEventDate, type CreamColors, CREAM, DARK } from "@/lib/board-helpers";
import { getStyleFamily } from "@/lib/beerStyleColors";

// ─── Style grouping helpers ─────────────────────────────────────────────────

const STYLE_ORDER = ["ipa", "lager", "stout", "sour", "porter", "saison", "default"] as const;

const STYLE_GROUP_NAMES: Record<string, string> = {
  ipa: "IPAs & Pale Ales",
  lager: "Lagers, Pilsners & Kolsch",
  stout: "Stouts",
  sour: "Sours & Wild Ales",
  porter: "Porters & Brown Ales",
  saison: "Wheat, Belgian & Saison",
  default: "Other",
};

const STYLE_GROUP_ACCENTS: Record<string, string> = {
  ipa: "#4A7C59",
  stout: "#6B4C3B",
  sour: "#8B3A6B",
  porter: "#7B5B8D",
  lager: "#4A7B9B",
  saison: "#B8863B",
  default: "#9E8E7A",
};

interface EmbedBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_featured: boolean;
  avg_rating: number | null;
  total_ratings: number | null;
  price_per_pint: number | null;
  glass_type: string | null;
  pour_sizes: { label: string; oz: number | null; price: number }[];
}

interface EmbedEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

interface EmbedMenuProps {
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    brewery_type: string | null;
    description: string | null;
    cover_image_url: string | null;
  };
  beers: EmbedBeer[];
  events: EmbedEvent[];
  theme: "cream" | "dark";
  accentColor: string;
  layout: "full" | "compact";
  showRating: boolean;
  showPrice: boolean;
  showGlass: boolean;
  showStyle: boolean;
  showEvents: boolean;
  showDescription: boolean;
}

export function EmbedMenu({
  brewery, beers, events, theme, accentColor, layout,
  showRating, showPrice, showGlass, showStyle, showEvents, showDescription,
}: EmbedMenuProps) {
  const colors: CreamColors = theme === "dark"
    ? { ...DARK, gold: `#${accentColor}` }
    : { ...CREAM, gold: `#${accentColor}` };

  const compact = layout === "compact";
  const initials = getInitials(brewery.name);
  const featuredBeer = beers.find(b => b.is_featured);
  const regularBeers = beers.filter(b => !b.is_featured);
  const beerCount = beers.length;

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: theme === "dark"
        ? `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.05) 0%, transparent 55%), ${colors.cream}`
        : `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%), ${colors.cream}`,
      color: colors.text,
      minHeight: compact ? "auto" : undefined,
    }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div style={{ padding: compact ? "12px 16px" : "20px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            {/* Monogram */}
            <div style={{
              width: compact ? 32 : 40,
              height: compact ? 32 : 40,
              borderRadius: compact ? 8 : 10,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme === "dark" ? colors.border : "#0F0E0C",
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                fontSize: compact ? 11 : 14,
                color: colors.gold,
                letterSpacing: 1,
              }}>
                {initials}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: compact ? 18 : 24,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: colors.text,
                margin: 0,
              }}>
                {brewery.name}
              </h1>
              {!compact && brewery.city && (
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: colors.textSubtle,
                  textTransform: "uppercase",
                  margin: "3px 0 0",
                }}>
                  {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
                  {brewery.brewery_type ? ` · ${brewery.brewery_type.replace(/_/g, " ")}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Beer count */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: colors.gold,
              display: "block",
            }}>
              On Tap
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: compact ? 20 : 26,
              fontWeight: 700,
              lineHeight: 1,
              color: colors.gold,
            }}>
              {beerCount}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          marginTop: compact ? 10 : 14,
          height: 1,
          background: theme === "dark" ? "rgba(245,240,232,0.08)" : "rgba(26,23,20,0.1)",
        }} />
      </div>

      {/* ─── Beer of the Week ────────────────────────────────────────── */}
      {featuredBeer && !compact && (
        <div style={{ padding: "0 24px 8px" }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: colors.gold,
            display: "block",
            marginBottom: 6,
          }}>
            ★ Beer of the Week
          </span>
          <EmbedBeerRow
            beer={featuredBeer}
            colors={colors}
            showGlass={showGlass}
            showStyle={showStyle}
            showRating={showRating}
            showPrice={showPrice}
            showDescription={showDescription}
            compact={false}
            featured
          />
          <div style={{
            marginTop: 8,
            height: 2,
            background: `${colors.gold}40`,
          }} />
        </div>
      )}

      {/* ─── Beer List (grouped by style) ────────────────────────────── */}
      <div style={{ padding: compact ? "0 16px" : "0 24px" }}>
        {beers.length === 0 ? (
          <div style={{
            padding: "32px 0",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontStyle: "italic",
              color: colors.textSubtle,
              opacity: 0.5,
            }}>
              No beers on tap
            </p>
          </div>
        ) : (() => {
          // Group regular beers by style family
          const groups: Record<string, typeof regularBeers> = {};
          for (const beer of regularBeers) {
            const family = getStyleFamily(beer.style ?? "");
            if (!groups[family]) groups[family] = [];
            groups[family].push(beer);
          }

          // Sort groups by defined order
          const sortedFamilies = STYLE_ORDER.filter(f => groups[f]?.length);

          return sortedFamilies.map(family => {
            const groupBeers = groups[family];
            const accent = STYLE_GROUP_ACCENTS[family] ?? STYLE_GROUP_ACCENTS.default;
            const groupName = STYLE_GROUP_NAMES[family] ?? "Other";

            return (
              <div key={family} style={{ marginBottom: compact ? 8 : 16 }}>
                {/* Section header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: compact ? "8px 0 4px" : "12px 0 6px",
                }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: compact ? 14 : 18,
                    fontWeight: 700,
                    fontStyle: "italic",
                    color: accent,
                  }}>
                    {groupName}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: colors.textSubtle,
                    opacity: 0.6,
                  }}>
                    {groupBeers.length}
                  </span>
                  <div style={{
                    flex: 1,
                    height: 1,
                    background: `${accent}30`,
                  }} />
                </div>

                {/* Beers in this group */}
                {groupBeers.map(beer => (
                  <EmbedBeerRow
                    key={beer.id}
                    beer={beer}
                    colors={colors}
                    showGlass={showGlass}
                    showStyle={showStyle}
                    showRating={showRating}
                    showPrice={showPrice}
                    showDescription={showDescription}
                    compact={compact}
                  />
                ))}
              </div>
            );
          });
        })()}
      </div>

      {/* ─── Events ──────────────────────────────────────────────────── */}
      {showEvents && events.length > 0 && !compact && (
        <div style={{ padding: "12px 24px 0" }}>
          <div style={{
            height: 1,
            background: theme === "dark" ? "rgba(245,240,232,0.08)" : "rgba(26,23,20,0.1)",
            marginBottom: 12,
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: colors.gold,
            display: "block",
            marginBottom: 8,
          }}>
            Upcoming Events
          </span>
          {events.map(ev => (
            <div key={ev.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 0",
            }}>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.text,
              }}>
                {ev.title}
              </span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: colors.gold,
              }}>
                {formatEventDate(ev.event_date, ev.start_time)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div style={{ padding: compact ? "8px 16px 12px" : "12px 24px 16px" }}>
        <EmbedFooter breweryId={brewery.id} colors={colors} />
      </div>
    </div>
  );
}
