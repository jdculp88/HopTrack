import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import { getStyleFamily } from "@/lib/beerStyleColors";
import { formatPrice, type CreamColors } from "@/lib/board-helpers";

interface EmbedPourSize {
  label: string;
  oz: number | null;
  price: number;
}

interface EmbedBeerRowProps {
  beer: {
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
    pour_sizes: EmbedPourSize[];
  };
  colors: CreamColors;
  showGlass: boolean;
  showStyle: boolean;
  showRating: boolean;
  showPrice: boolean;
  showDescription: boolean;
  compact: boolean;
  featured?: boolean;
}

// ─── Style color accents for embed ──────────────────────────────────────────

const STYLE_ACCENTS: Record<string, string> = {
  ipa: "#4A7C59",
  stout: "#6B4C3B",
  sour: "#8B3A6B",
  porter: "#7B5B8D",
  lager: "#4A7B9B",
  saison: "#B8863B",
  cider: "#B85C4A",
  wine: "#722F37",
  cocktail: "#1A8E80",
  na: "#BFA032",
  default: "#9E8E7A",
};

function getStyleAccent(style: string | null, itemType?: string | null): string {
  const family = getStyleFamily(style, itemType);
  return STYLE_ACCENTS[family] ?? STYLE_ACCENTS.default;
}

export function EmbedBeerRow({
  beer, colors, showGlass, showStyle, showRating, showPrice, showDescription, compact, featured = false,
}: EmbedBeerRowProps) {
  const glassObj = beer.glass_type ? getGlass(beer.glass_type) : null;
  const showGlassCol = showGlass && !!glassObj && !compact;
  const styleAccent = getStyleAccent(beer.style);

  // Compact mode: single line
  if (compact) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontWeight: 600, fontSize: 14, color: colors.text, lineHeight: 1.2,
            }}>
              {beer.name}
            </span>
            {showStyle && beer.style && (
              <span style={{
                fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em",
                color: styleAccent, fontWeight: 600,
                background: `${styleAccent}15`,
                border: `1px solid ${styleAccent}30`,
                borderRadius: 99, padding: "1px 7px",
                lineHeight: 1.4,
              }}>
                {beer.style}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {beer.abv != null && (
            <span style={{ fontSize: 11, color: colors.textSubtle, fontFamily: "'JetBrains Mono', monospace" }}>
              {beer.abv.toFixed(1)}%
            </span>
          )}
          {showPrice && beer.pour_sizes.length > 0 && (
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.gold, fontFamily: "'JetBrains Mono', monospace" }}>
              {formatPrice(beer.pour_sizes[0].price)}
            </span>
          )}
          {showPrice && !beer.pour_sizes.length && beer.price_per_pint != null && (
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.gold, fontFamily: "'JetBrains Mono', monospace" }}>
              {formatPrice(beer.price_per_pint)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: showGlassCol ? 16 : 0,
      padding: featured ? "16px 0" : "14px 0",
      borderBottom: featured ? "none" : `1px solid ${colors.border}`,
    }}>
      {/* Glass illustration */}
      {showGlassCol && glassObj && (
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <svg
            viewBox="0 0 80 120"
            width={40}
            height={57}
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))", display: "block" }}
            dangerouslySetInnerHTML={{ __html: getGlassSvgContent(glassObj, `embed-${beer.id}`) }}
          />
          <span style={{
            fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em",
            color: colors.textSubtle, textAlign: "center", lineHeight: 1.2,
            fontFamily: "'JetBrains Mono', monospace", maxWidth: 48,
          }}>
            {glassObj.name}
          </span>
        </div>
      )}

      {/* Beer info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + price row */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "nowrap" }}>
          <span style={{
            fontWeight: 700,
            fontSize: featured ? 22 : 17,
            lineHeight: 1.2,
            color: colors.text,
            fontFamily: "'Playfair Display', serif",
            flexShrink: 0,
          }}>
            {beer.name}
          </span>

          {showPrice && beer.pour_sizes.length > 0 ? (
            <>
              <span style={{
                flex: 1, borderBottom: `1.5px dotted ${colors.gold}40`,
                marginBottom: 4, marginLeft: 8, marginRight: 8,
                minWidth: 12, alignSelf: "flex-end",
              }} />
              {/* Pour size chips */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "nowrap" }}>
                {beer.pour_sizes.map((size, idx) => (
                  <div key={idx} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: colors.chipBg,
                    border: `1px solid ${colors.chipBorder}`,
                    borderRadius: 6, padding: "3px 8px",
                  }}>
                    <div>
                      <div style={{
                        fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                        color: colors.textMuted, lineHeight: 1.2,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {size.label}
                      </div>
                      {size.oz != null && (
                        <div style={{
                          fontSize: 8, color: colors.textSubtle, opacity: 0.7,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {size.oz} oz
                        </div>
                      )}
                    </div>
                    <div style={{ width: 1, height: 20, background: colors.chipBorder, flexShrink: 0 }} />
                    <div style={{
                      fontWeight: 700, fontSize: 14, color: colors.gold, lineHeight: 1, flexShrink: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {formatPrice(size.price)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : showPrice && beer.price_per_pint != null ? (
            <>
              <span style={{
                flex: 1, borderBottom: `1.5px dotted ${colors.gold}40`,
                marginBottom: 4, marginLeft: 8, marginRight: 8,
                minWidth: 12, alignSelf: "flex-end",
              }} />
              <span style={{
                fontWeight: 700, fontSize: featured ? 22 : 17, lineHeight: 1.2,
                color: colors.gold, flexShrink: 0,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {formatPrice(beer.price_per_pint)}
              </span>
            </>
          ) : null}
        </div>

        {/* Meta row: style + ABV + IBU */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0, marginTop: 3,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {showStyle && beer.style && (
            <span style={{
              fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em",
              color: styleAccent, fontWeight: 600,
              background: `${styleAccent}15`,
              border: `1px solid ${styleAccent}30`,
              borderRadius: 99, padding: "2px 8px",
              lineHeight: 1.4,
            }}>
              {beer.style}
            </span>
          )}
          {showStyle && beer.style && beer.abv != null && (
            <span style={{ margin: "0 6px", fontSize: 10, color: colors.textSubtle }}>·</span>
          )}
          {beer.abv != null && (
            <span style={{ fontSize: 10, color: colors.textSubtle }}>
              {beer.abv.toFixed(1)}% ABV
            </span>
          )}
          {beer.ibu != null && beer.abv != null && (
            <span style={{ margin: "0 6px", fontSize: 10, color: colors.textSubtle }}>·</span>
          )}
          {beer.ibu != null && (
            <span style={{ fontSize: 10, color: colors.textSubtle }}>
              {beer.ibu} IBU
            </span>
          )}
        </div>

        {/* Rating */}
        {showRating && beer.avg_rating != null && (
          <div style={{
            marginTop: 3, fontSize: 10, color: colors.gold, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ⭐ {beer.avg_rating.toFixed(1)}
            {beer.total_ratings ? (
              <span style={{ fontWeight: 400, color: colors.textSubtle, marginLeft: 4 }}>
                ({beer.total_ratings})
              </span>
            ) : null}
          </div>
        )}

        {/* Description */}
        {showDescription && beer.description && (
          <p style={{
            marginTop: 4, fontSize: 12, lineHeight: 1.5, color: colors.textMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {beer.description}
          </p>
        )}
      </div>
    </div>
  );
}
