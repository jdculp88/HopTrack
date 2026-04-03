import { ExternalLink, BookOpen, GlassWater, Code2, Key, BarChart3, Beer, CalendarDays, Search, LayoutGrid, Plug, RefreshCw, ArrowRight, AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader
        title="Resources"
        subtitle="Reference guides for your team — glassware, API documentation, and more."
        icon={BookOpen}
      />

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

      {/* POS Integration Guide */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Plug size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            POS Integration
          </span>
        </div>

        {/* Overview */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={16} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
              How POS Sync Works
            </h3>
          </div>
          <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <p>Connect your Toast or Square POS to automatically keep your HopTrack tap list in sync. When you update your menu in your POS, HopTrack updates too — no double entry.</p>
            <div className="flex items-center gap-3 py-3 flex-wrap">
              {[
                { label: "POS Menu Updated", icon: "🍞" },
                { label: "Webhook Received", icon: "📡" },
                { label: "Items Matched", icon: "🔗" },
                { label: "Tap List Synced", icon: "✅" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  {i > 0 && <ArrowRight size={12} style={{ color: "var(--text-muted)" }} />}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}>
                    <span>{step.icon}</span>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
            <p><strong style={{ color: "var(--text-primary)" }}>Available on Cask ($149/mo) and Barrel tiers.</strong> Go to Settings &rarr; POS Integration to connect.</p>
          </div>
        </div>

        {/* Supported Providers */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Supported Providers
          </h3>
          <div className="space-y-3">
            {[
              {
                name: "Toast",
                emoji: "🍞",
                desc: "Full menu sync via webhooks. When you update items in Toast, HopTrack receives a notification and syncs automatically within seconds.",
                features: ["Real-time webhook sync", "Menu item matching", "Price sync", "86'd item detection"],
              },
              {
                name: "Square",
                emoji: "⬛",
                desc: "Catalog sync via Square webhooks. Square sends catalog change notifications and HopTrack fetches your latest menu.",
                features: ["Catalog change detection", "Item matching by name", "Category mapping", "Variation support"],
              },
            ].map((prov) => (
              <div
                key={prov.name}
                className="p-4 rounded-xl"
                style={{ background: "var(--surface-2)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{prov.emoji}</span>
                  <span className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>{prov.name}</span>
                </div>
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{prov.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {prov.features.map((f) => (
                    <span key={f} className="text-[11px] font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Steps */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
              Setup Guide
            </h3>
          </div>
          <div className="space-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            {[
              {
                step: "1",
                title: "Connect your POS",
                desc: "Go to Settings → POS Integration and click Connect on your provider (Toast or Square). You'll be redirected to authorize HopTrack.",
              },
              {
                step: "2",
                title: "Run your first sync",
                desc: "After connecting, click Sync Now. HopTrack will pull your current menu and auto-match items to your existing tap list.",
              },
              {
                step: "3",
                title: "Review mappings",
                desc: "Check the Item Mappings section in Settings. Auto-matched items show a green dot. Unmapped items need you to select the matching HopTrack beer from the dropdown.",
              },
              {
                step: "4",
                title: "Automatic sync active",
                desc: "Once connected, every menu change in your POS triggers an automatic sync. New items are added, removed items are toggled off-tap, and prices stay current.",
              },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  {s.step}
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                  <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Log & Troubleshooting */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
              Monitoring & Troubleshooting
            </h3>
          </div>
          <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
              <p><strong style={{ color: "var(--text-primary)" }}>Dashboard card:</strong> Your brewery dashboard shows a POS status card with connection health (green/yellow/red), last sync time, and item count.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
              <p><strong style={{ color: "var(--text-primary)" }}>Sync log:</strong> Visit the POS Sync page (from dashboard or quick actions) to see a full history of every sync — what was added, updated, or removed.</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
              <p><strong style={{ color: "var(--text-primary)" }}>Alert banners:</strong> If a sync fails or data goes stale (no sync in 24+ hours), a warning banner appears on your dashboard automatically.</p>
            </div>
            <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>Common issues:</p>
              <ul className="space-y-1.5 ml-4" style={{ color: "var(--text-muted)" }}>
                <li className="list-disc">Unmapped items — open Settings &rarr; POS Integration &rarr; Item Mappings and assign each item</li>
                <li className="list-disc">Stale sync — click Sync Now on the dashboard POS card to force a fresh sync</li>
                <li className="list-disc">Connection lost — disconnect and reconnect from Settings &rarr; POS Integration</li>
                <li className="list-disc">Missing items — ensure items are active and visible in your POS system</li>
              </ul>
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
