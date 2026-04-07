"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { variants, transition } from "@/lib/animation";
import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";

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
  const glass = getGlass(beer.glass_type || "shaker_pint");
  const svgHtml = glass ? getGlassSvgContent(glass, `botw-${beer.id}`) : null;
  const rating = beer.avg_rating ?? null;

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={{ delay: index * 0.05, ...transition.normal }}
    >
      <Link href={`/beer/${beer.id}`}>
        <div
          className="card-bg-featured rounded-[14px] p-4 flex items-start gap-4"
          style={{
            border:
              "2px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
          }}
        >
          {/* Glass SVG */}
          {svgHtml && (
            <div className="flex-shrink-0">
              <svg
                viewBox="0 0 80 120"
                width={48}
                height={72}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            </div>
          )}

          {/* Text content */}
          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-1.5 mb-1">
              <Star
                size={10}
                style={{ color: "var(--accent-gold)" }}
                fill="var(--accent-gold)"
              />
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "var(--accent-gold)" }}
              >
                Beer of the Week
              </span>
            </div>

            {/* Beer name */}
            <p
              className="font-display font-bold text-base truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {beer.name}
            </p>

            {/* Style + ABV + Brewery inline */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {beer.style && <BeerStyleBadge style={beer.style} size="xs" />}
              {beer.abv && (
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  · {beer.abv}%
                </span>
              )}
              {beer.brewery && (
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  · {beer.brewery.name}
                </span>
              )}
            </div>

            {/* Context */}
            <p
              className="text-xs font-mono mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Most sessions this week
            </p>
          </div>

          {/* Big rating */}
          {rating != null && rating > 0 && (
            <div className="flex flex-col items-end flex-shrink-0">
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
