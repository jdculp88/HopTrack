import { ExternalLink, BookOpen, GlassWater, Code2, Key, BarChart3, Beer, CalendarDays, Search, LayoutGrid } from "lucide-react";
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
          Reference guides for your team — glassware, API documentation, and more.
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

      <p className="text-xs text-center mt-4 mb-8" style={{ color: "var(--text-muted)" }}>
        These guides are also used to filter the glass picker in your tap list — select a drink type and only the appropriate glasses appear.
      </p>

      {/* API Documentation */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            API Documentation
          </span>
        </div>

        {/* Getting Started */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Key size={16} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
              Getting Started
            </h3>
          </div>
          <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <p>The HopTrack Public API lets you display your tap list on your website, connect to POS systems, and build custom integrations.</p>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>1. Generate an API Key</p>
              <p>Go to <strong>Settings &rarr; API Keys</strong> and click <em>Create API Key</em>. Copy the key immediately — it&apos;s only shown once.</p>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>2. Make Requests</p>
              <p>Most endpoints are public (no key needed). For brewery stats and analytics, pass your key as a Bearer token:</p>
            </div>
            <pre
              className="text-xs font-mono p-3 rounded-xl overflow-x-auto"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
            >
{`curl https://hoptrack.beer/api/v1/breweries/YOUR_ID/stats \\
  -H "Authorization: Bearer ht_live_your_key_here"`}
            </pre>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>3. Response Format</p>
              <p>Every response uses the same envelope:</p>
            </div>
            <pre
              className="text-xs font-mono p-3 rounded-xl overflow-x-auto"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
            >
{`{
  "data": { ... },
  "meta": { "total": 10, "page": 1, "per_page": 20 },
  "error": null
}`}
            </pre>
          </div>
        </div>

        {/* Endpoints Reference */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Endpoints
          </h3>
          <div className="space-y-3">
            {[
              {
                icon: <LayoutGrid size={14} />,
                method: "GET",
                path: "/api/v1/breweries/:id",
                desc: "Brewery detail — name, location, description, contact info",
                auth: false,
              },
              {
                icon: <Beer size={14} />,
                method: "GET",
                path: "/api/v1/breweries/:id/beers",
                desc: "On-tap beers with pour sizes, pagination (?page=1&per_page=50&on_tap=true)",
                auth: false,
              },
              {
                icon: <LayoutGrid size={14} />,
                method: "GET",
                path: "/api/v1/breweries/:id/menu",
                desc: "Full menu grouped by type (beer, cider, wine, cocktail, NA) with events",
                auth: false,
              },
              {
                icon: <CalendarDays size={14} />,
                method: "GET",
                path: "/api/v1/breweries/:id/events",
                desc: "Upcoming events, pagination (?include_past=true for historical)",
                auth: false,
              },
              {
                icon: <BarChart3 size={14} />,
                method: "GET",
                path: "/api/v1/breweries/:id/stats",
                desc: "Visits, top beers, followers, avg rating (?period=7d|30d|90d|all)",
                auth: true,
              },
              {
                icon: <Beer size={14} />,
                method: "GET",
                path: "/api/v1/beers/:id",
                desc: "Individual beer detail with brewery info and pour sizes",
                auth: false,
              },
              {
                icon: <Search size={14} />,
                method: "GET",
                path: "/api/v1/beers/search",
                desc: "Search beers (?q=name&style=IPA&brewery_id=...&item_type=beer)",
                auth: false,
              },
            ].map((ep) => (
              <div
                key={ep.path}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "var(--surface-2)" }}
              >
                <div className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent-gold)" }}>
                  {ep.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>
                      {ep.method}
                    </code>
                    <code className="text-xs font-mono truncate" style={{ color: "var(--text-primary)" }}>
                      {ep.path}
                    </code>
                    {ep.auth && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(196,75,58,0.15)", color: "var(--danger)" }}>
                        KEY REQUIRED
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {ep.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Limits & Best Practices */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Rate Limits & Best Practices
          </h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>Public endpoints:</strong> 20 requests/minute per IP</p>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>Authenticated (API key):</strong> 100 requests/minute per IP</p>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>Caching:</strong> Responses are cached for 60 seconds. Cache on your end too for best performance.</p>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>Pagination:</strong> Use <code className="text-xs font-mono px-1 rounded" style={{ background: "var(--surface-2)" }}>page</code> and <code className="text-xs font-mono px-1 rounded" style={{ background: "var(--surface-2)" }}>per_page</code> params. Max 100 per page.</p>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>CORS:</strong> All endpoints support cross-origin requests — embed your tap list anywhere.</p>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>Security:</strong> Your API key is scoped to your brewery. Stats are private — only accessible with your key.</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center mt-8 mb-4" style={{ color: "var(--text-muted)" }}>
        Questions? Reach out at support@hoptrack.beer
      </p>
    </div>
  );
}
