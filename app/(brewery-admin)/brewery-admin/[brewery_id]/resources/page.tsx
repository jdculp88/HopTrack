import { ExternalLink, BookOpen, GlassWater } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Resources" };

const GUIDES = [
  {
    title: "Beer Glassware",
    emoji: "🍺",
    description: "All 20 beer glasses — from Shaker Pints to Tulips, Snifters to Teku. Which glass shapes, concentrates aroma, and when to use each.",
    href: "/guides/beer.html",
    color: "rgba(212,168,67,0.15)",
    accent: "var(--accent-gold)",
  },
  {
    title: "Cider Glassware",
    emoji: "🍏",
    description: "From wine glass pours to Basque sidra tumblers — how the vessel changes everything for sparkling, still, and farmhouse ciders.",
    href: "/guides/cider.html",
    color: "rgba(120,200,100,0.12)",
    accent: "#78c864",
  },
  {
    title: "Wine Glassware",
    emoji: "🍷",
    description: "Bordeaux vs. Burgundy, flutes vs. coupes, universal vs. varietal-specific — the science behind why bowl shape matters.",
    href: "/guides/wine.html",
    color: "rgba(180,80,100,0.12)",
    accent: "#c45870",
  },
  {
    title: "Cocktail Glassware",
    emoji: "🍹",
    description: "Coupes, martini glasses, rocks glasses, highballs, hurricane — a bartender's guide to matching vessel to drink.",
    href: "/guides/cocktail.html",
    color: "rgba(100,160,220,0.12)",
    accent: "#64a0dc",
  },
  {
    title: "Non-Alcoholic Glassware",
    emoji: "🥤",
    description: "Coffee mugs, latte glasses, mocktail coupes, water goblets — presentation matters for zero-proof drinks too.",
    href: "/guides/na-beverage.html",
    color: "rgba(140,120,200,0.12)",
    accent: "#8c78c8",
  },
];

export default function ResourcesPage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pt-16 lg:pt-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={20} style={{ color: "var(--accent-gold)" }} />
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Resources
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Reference guides for your team — glassware recommendations by drink type.
        </p>
      </div>

      {/* Glassware Guides */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <GlassWater size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Glassware Guides
          </span>
        </div>
        <div className="space-y-3">
          {GUIDES.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 rounded-2xl border transition-all group"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              {/* Emoji icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ background: guide.color }}
              >
                {guide.emoji}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                    {guide.title}
                  </span>
                  <ExternalLink
                    size={12}
                    className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0"
                    style={{ color: guide.accent }}
                  />
                </div>
                <p className="text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                  {guide.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <p className="text-xs text-center mt-8" style={{ color: "var(--text-muted)" }}>
        These guides are also used to filter the glass picker in your tap list — select a drink type and only the appropriate glasses appear.
      </p>
    </div>
  );
}
