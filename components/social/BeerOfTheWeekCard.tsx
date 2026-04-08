"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star, Beer } from "lucide-react";
import { variants, transition } from "@/lib/animation";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { getStyleVars } from "@/lib/beerStyleColors";

export interface FeaturedBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  glass_type: string | null;
  description: string | null;
  brewery: { id: string; name: string } | null;
  avg_rating?: number | null;
}

export function BeerOfTheWeekCard({
  beer,
  index = 0,
}: {
  beer: FeaturedBeer;
  index?: number;
}) {
  const rating = beer.avg_rating ?? null;
  const styleVars = beer.style ? getStyleVars(beer.style) : null;

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={{ delay: index * 0.05, ...transition.normal }}
    >
      <Link href={`/beer/${beer.id}`}>
        <div
          className="rounded-[16px] overflow-hidden flex items-center botw-card-bg"
          style={{
            border: "1px solid var(--border)",
            padding: "18px 20px",
            gap: "16px",
          }}
        >
          {/* Glass icon in style-tinted square container */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-[14px] relative"
            style={{
              width: "56px",
              height: "56px",
              background: styleVars
                ? `linear-gradient(135deg, color-mix(in srgb, ${styleVars.primary} 14%, transparent), color-mix(in srgb, ${styleVars.primary} 6%, transparent))`
                : "linear-gradient(135deg, rgba(196,136,62,0.12), rgba(196,136,62,0.06))",
              border: styleVars
                ? `1px solid color-mix(in srgb, ${styleVars.primary} 18%, transparent)`
                : "1px solid rgba(196,136,62,0.15)",
            }}
          >
            <Beer
              size={26}
              strokeWidth={1.5}
              style={{ color: styleVars?.primary ?? "var(--text-muted)" }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-1.5" style={{ marginBottom: "2px" }}>
              <Star
                size={10}
                style={{ color: "var(--accent-gold)" }}
                fill="var(--accent-gold)"
              />
              <span
                className="font-mono font-semibold uppercase"
                style={{
                  fontSize: "9px",
                  color: "var(--accent-gold)",
                  letterSpacing: "0.12em",
                }}
              >
                Beer of the Week
              </span>
            </div>

            {/* Beer name */}
            <p
              className="font-sans font-bold truncate"
              style={{ fontSize: "18px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}
            >
              {beer.name}
            </p>

            {/* Style + ABV + Brewery inline */}
            <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: "2px" }}>
              {beer.style && <BeerStyleBadge style={beer.style} size="sm" />}
              {beer.abv && (
                <span
                  className="font-mono"
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                >
                  · {beer.abv}%
                </span>
              )}
              {beer.brewery && (
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  · {beer.brewery.name}
                </span>
              )}
            </div>

            {/* Context */}
            <p
              className="font-mono"
              style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}
            >
              Most sessions this week
            </p>
          </div>

          {/* Big rating in warm-bg container */}
          {rating != null && rating > 0 && (
            <div
              className="flex flex-col items-center flex-shrink-0 rounded-[10px]"
              style={{ background: "var(--warm-bg)", padding: "8px 12px" }}
            >
              <span
                className="font-mono text-2xl font-bold leading-none"
                style={{ color: "var(--accent-gold)" }}
              >
                {rating.toFixed(1)}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={9}
                    style={{
                      color: "var(--accent-gold)",
                      fill:
                        i < Math.round(rating)
                          ? "var(--accent-gold)"
                          : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
