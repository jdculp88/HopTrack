"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ExternalLink, GlassWater, Code2, Plug, HelpCircle, Key, LayoutGrid, Beer, CalendarDays, Search, BarChart3, RefreshCw, ArrowRight, AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { transition } from "@/lib/animation";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: "guides", label: "Guides", icon: HelpCircle },
  { id: "glassware", label: "Glassware", icon: GlassWater },
  { id: "api", label: "API", icon: Code2 },
  { id: "pos", label: "POS", icon: Plug },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Help guide FAQ data ─────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  id: string;
  title: string;
  emoji: string;
  items: FaqItem[];
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    emoji: "🚀",
    items: [
      {
        question: "What should I do first after claiming my brewery?",
        answer: "Start with the setup checklist on your dashboard — upload your logo, add your beers to the tap list, create a loyalty program, and generate QR table tents. These four steps get your brewery fully visible to customers and earning repeat visits.",
      },
      {
        question: "How do customers find my brewery on HopTrack?",
        answer: "Your brewery appears in search results, on the Explore map, and in HopRoute (AI-powered brewery crawl planning). Customers can also scan your QR table tents to go directly to your page. The more complete your profile (logo, hours, tap list, menus), the better you rank in discovery.",
      },
      {
        question: "What's my public brewery page URL?",
        answer: "Your brewery page is at hoptrack.beer/brewery/YOUR_ID. Share it on your website, social media, and printed materials. Unauthenticated visitors can see your basic info, tap list (if on a paid plan), and menus.",
      },
      {
        question: "What's the difference between the tiers (Tap, Cask, Barrel)?",
        answer: "Tap ($49/mo) covers the essentials: tap list management, loyalty programs, analytics, and The Board TV display. Cask ($149/mo) adds POS integration, advanced analytics, challenges, mug clubs, and customer messaging. Barrel (custom pricing) adds multi-location brand management, cross-location analytics, and dedicated support.",
      },
    ],
  },
  {
    id: "content",
    title: "Content",
    emoji: "📋",
    items: [
      {
        question: "How do I manage my tap list?",
        answer: "Go to Tap List in the Content section. Add beers with name, style, ABV, and optional description. Drag to reorder, use the 86 button to temporarily mark items unavailable, and batch-select for bulk actions. Your tap list updates instantly on your public page and The Board.",
      },
      {
        question: "How do I set up The Board TV display?",
        answer: "Go to Board in the Content section. The Board shows your current tap list in a beautiful full-screen layout designed for TVs. Open the Board URL on any browser (smart TV, Chromecast, Fire Stick) and it auto-refreshes. Customize the layout from the Board settings.",
      },
      {
        question: "How do I upload food and drink menus?",
        answer: "Go to Menus in the Content section. Upload images for up to 8 categories (Food, Cocktails, Wine, Beer Specials, Brunch, Kids, Happy Hour, Seasonal). Each category supports up to 3 images. Customers see your menus on your brewery page.",
      },
      {
        question: "How does the embed widget work?",
        answer: "Go to Embed in the Content section to get a code snippet. Paste it into your website's HTML and your HopTrack tap list appears live — styled to match, always up to date. Any changes you make in HopTrack automatically reflect on your site.",
      },
    ],
  },
  {
    id: "engage",
    title: "Engage",
    emoji: "💬",
    items: [
      {
        question: "How do loyalty stamp cards work?",
        answer: "Go to Loyalty in the Engage section. Create a stamp card by choosing how many visits earn a reward (e.g., 10 visits = free pint). Customers earn stamps automatically when they check in at your brewery. They generate a redemption code from their phone, your staff confirms it — no paper cards needed.",
      },
      {
        question: "How do I send messages to my customers?",
        answer: "Go to Messages in the Engage section. You can message all customers or target specific segments (VIP, Power, Regular, New). Messages appear as in-app notifications and push notifications. Rate limited to prevent spam (5/hour).",
      },
      {
        question: "What are Mug Clubs?",
        answer: "Mug Clubs are premium membership programs — think of them as a VIP tier above the basic loyalty card. Create tiers with perks like discounted pours, exclusive releases, or members-only events. Customers can join from your brewery page.",
      },
      {
        question: "How do brewery challenges work?",
        answer: "Go to Challenges in the Engage section. Create challenges like 'Try 5 IPAs this month' or 'Visit 3 times this week.' Four challenge types available: beer count, style variety, visit streak, and custom. Customers see active challenges on your brewery page and earn recognition when they complete them.",
      },
    ],
  },
  {
    id: "insights",
    title: "Insights",
    emoji: "📊",
    items: [
      {
        question: "What do the analytics metrics mean?",
        answer: "Analytics shows visits, unique visitors, beers logged, ratings, and trends over time. Use the date range pills (7d/30d/90d/All) to zoom in. Key metrics: avg session duration (how long people stay), beers per visit (engagement depth), new vs returning visitors (growth health), and loyalty conversion rate.",
      },
      {
        question: "How do customer segments work?",
        answer: "Go to Customers in the Insights section. HopTrack automatically segments visitors: VIP (10+ visits), Power (5-9), Regular (2-4), and New (1 visit). Use segments to target messages, understand your customer mix, and identify your most valuable regulars.",
      },
      {
        question: "How do I export my data?",
        answer: "On the Report page, click Export CSV. The export includes all visits, beer logs, ratings, and customer data for your selected date range. Useful for importing into spreadsheets, accounting software, or your own analytics tools.",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    emoji: "⚙️",
    items: [
      {
        question: "How does the staff punch system work?",
        answer: "Go to Punch in the Operations section. When a customer presents a loyalty redemption code, your bartender enters the 6-digit code to confirm. Quick access: the Punch page is always visible in the nav for staff-role users — they see only Overview and Punch for a streamlined experience.",
      },
      {
        question: "How do I create events?",
        answer: "Go to Events in the Operations section. Create tap takeovers, trivia nights, beer releases, and more. Events appear on your brewery page and in customer feeds. Include a title, description, date/time, and optional image.",
      },
      {
        question: "What are QR table tents?",
        answer: "Go to Table Tent in the Operations section. Generate a unique QR code for your brewery. Print it on table tents, coasters, or signage. When customers scan it, they go directly to your brewery page where they can start a session, browse your tap list, and earn loyalty stamps.",
      },
      {
        question: "How does POS integration work?",
        answer: "Connect your Toast or Square POS to auto-sync your tap list. When you update your POS menu, HopTrack updates within seconds. Go to POS Sync in Operations, or check the POS tab in Resources for detailed setup guides. Available on Cask and Barrel tiers.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    emoji: "👤",
    items: [
      {
        question: "How do I update my brewery's profile?",
        answer: "Go to Settings in the Account section. Update your brewery name, description, logo, contact info, social links (Instagram, Facebook, X, Untappd), hours, and address. All changes reflect immediately on your public page.",
      },
      {
        question: "How do I manage my subscription?",
        answer: "Go to Billing in the Account section. See your current plan, switch between monthly and annual billing (save 20%), upgrade or downgrade tiers, and manage payment methods via the Stripe customer portal. Cancel anytime — your data is retained for 30 days.",
      },
      {
        question: "How do I add staff members?",
        answer: "Go to Settings and scroll to Staff Management. Invite team members by email. Four roles: Admin (full access), Business (analytics + customers), Marketing (messages + promotions), and Staff (punch system only). Staff members get their own login with role-appropriate access.",
      },
    ],
  },
];

// ─── Glassware data ──────────────────────────────────────────────────────────

const GLASSWARE_GUIDES = [
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

// ─── FaqAccordionItem ────────────────────────────────────────────────────────

function FaqAccordionItem({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab Content: Guides ─────────────────────────────────────────────────────

function GuidesTab({ searchQuery }: { searchQuery: string }) {
  const filtered = FAQ_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery) ||
        item.answer.toLowerCase().includes(searchQuery)
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="space-y-6">
      {filtered.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          No results for &ldquo;{searchQuery}&rdquo;
        </p>
      )}
      {filtered.map((section) => (
        <div key={section.id} id={section.id}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{section.emoji}</span>
            <h3 className="font-display font-semibold" style={{ color: "var(--text-primary)" }}>
              {section.title}
            </h3>
          </div>
          <div
            className="rounded-2xl border px-5 divide-y divide-[var(--border)]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {section.items.map((item) => (
              <FaqAccordionItem key={item.question} {...item} />
            ))}
          </div>
        </div>
      ))}

      <div
        className="rounded-2xl border p-5 text-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
          Still need help?
        </p>
        <p>
          Email us at{" "}
          <a
            href="mailto:support@hoptrack.beer"
            className="underline underline-offset-2"
            style={{ color: "var(--accent-gold)" }}
          >
            support@hoptrack.beer
          </a>{" "}
          and we&apos;ll get back to you within one business day.
        </p>
      </div>
    </div>
  );
}

// ─── Tab Content: Glassware ──────────────────────────────────────────────────

function GlasswareTab() {
  return (
    <div>
      <div className="space-y-3">
        {GLASSWARE_GUIDES.map((guide) => (
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
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ background: guide.color }}
            >
              {guide.emoji}
            </div>
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
      <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
        These guides are also used to filter the glass picker in your tap list — select a drink type and only the appropriate glasses appear.
      </p>
    </div>
  );
}

// ─── Tab Content: API ────────────────────────────────────────────────────────

function ApiTab() {
  return (
    <div className="space-y-4">
      {/* Getting Started */}
      <div
        className="rounded-2xl border p-5"
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

      {/* Endpoints */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Endpoints
        </h3>
        <div className="space-y-3">
          {[
            { icon: <LayoutGrid size={14} />, method: "GET", path: "/api/v1/breweries/:id", desc: "Brewery detail — name, location, description, contact info", auth: false },
            { icon: <Beer size={14} />, method: "GET", path: "/api/v1/breweries/:id/beers", desc: "On-tap beers with pour sizes, pagination (?page=1&per_page=50&on_tap=true)", auth: false },
            { icon: <LayoutGrid size={14} />, method: "GET", path: "/api/v1/breweries/:id/menu", desc: "Full menu grouped by type (beer, cider, wine, cocktail, NA) with events", auth: false },
            { icon: <CalendarDays size={14} />, method: "GET", path: "/api/v1/breweries/:id/events", desc: "Upcoming events, pagination (?include_past=true for historical)", auth: false },
            { icon: <BarChart3 size={14} />, method: "GET", path: "/api/v1/breweries/:id/stats", desc: "Visits, top beers, followers, avg rating (?period=7d|30d|90d|all)", auth: true },
            { icon: <Beer size={14} />, method: "GET", path: "/api/v1/beers/:id", desc: "Individual beer detail with brewery info and pour sizes", auth: false },
            { icon: <Search size={14} />, method: "GET", path: "/api/v1/beers/search", desc: "Search beers (?q=name&style=IPA&brewery_id=...&item_type=beer)", auth: false },
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

      {/* Rate Limits */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Rate Limits & Best Practices
        </h3>
        <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {[
            { label: "Public endpoints:", value: "20 requests/minute per IP" },
            { label: "Authenticated (API key):", value: "100 requests/minute per IP" },
            { label: "Caching:", value: "Responses are cached for 60 seconds. Cache on your end too for best performance." },
            { label: "Pagination:", value: "Use page and per_page params. Max 100 per page." },
            { label: "CORS:", value: "All endpoints support cross-origin requests — embed your tap list anywhere." },
            { label: "Security:", value: "Your API key is scoped to your brewery. Stats are private — only accessible with your key." },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span style={{ color: "var(--accent-gold)" }}>&#8226;</span>
              <p><strong>{item.label}</strong> {item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Content: POS ────────────────────────────────────────────────────────

function PosTab() {
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div
        className="rounded-2xl border p-5"
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

      {/* Providers */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Supported Providers
        </h3>
        <div className="space-y-3">
          {[
            {
              name: "Toast", emoji: "🍞",
              desc: "Full menu sync via webhooks. When you update items in Toast, HopTrack receives a notification and syncs automatically within seconds.",
              features: ["Real-time webhook sync", "Menu item matching", "Price sync", "86'd item detection"],
            },
            {
              name: "Square", emoji: "⬛",
              desc: "Catalog sync via Square webhooks. Square sends catalog change notifications and HopTrack fetches your latest menu.",
              features: ["Catalog change detection", "Item matching by name", "Category mapping", "Variation support"],
            },
          ].map((prov) => (
            <div key={prov.name} className="p-4 rounded-xl" style={{ background: "var(--surface-2)" }}>
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

      {/* Setup */}
      <div
        className="rounded-2xl border p-5"
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
            { step: "1", title: "Connect your POS", desc: "Go to Settings \u2192 POS Integration and click Connect on your provider (Toast or Square). You'll be redirected to authorize HopTrack." },
            { step: "2", title: "Run your first sync", desc: "After connecting, click Sync Now. HopTrack will pull your current menu and auto-match items to your existing tap list." },
            { step: "3", title: "Review mappings", desc: "Check the Item Mappings section in Settings. Auto-matched items show a green dot. Unmapped items need you to select the matching HopTrack beer from the dropdown." },
            { step: "4", title: "Automatic sync active", desc: "Once connected, every menu change in your POS triggers an automatic sync. New items are added, removed items are toggled off-tap, and prices stay current." },
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

      {/* Troubleshooting */}
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
          {[
            "Your brewery dashboard shows a POS status card with connection health (green/yellow/red), last sync time, and item count.",
            "Visit the POS Sync page (from dashboard or quick actions) to see a full history of every sync — what was added, updated, or removed.",
            "If a sync fails or data goes stale (no sync in 24+ hours), a warning banner appears on your dashboard automatically.",
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
              <p>{text}</p>
            </div>
          ))}
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
  );
}

// ─── Main ResourcesClient ────────────────────────────────────────────────────

export default function ResourcesClient() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    // Sync with URL hash on mount — using initializer avoids setState in effect
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1) as TabId;
      if (TABS.some((t) => t.id === hash)) {
        return hash;
      }
    }
    return "guides";
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Update hash when tab changes
  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId);
    setSearchQuery("");
    window.history.replaceState(null, "", `#${tabId}`);
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition-colors"
              style={isActive ? PILL_ACTIVE : PILL_INACTIVE}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search (Guides tab only) */}
      {activeTab === "guides" && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      )}

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transition.fast}
        >
          {activeTab === "guides" && <GuidesTab searchQuery={searchQuery} />}
          {activeTab === "glassware" && <GlasswareTab />}
          {activeTab === "api" && <ApiTab />}
          {activeTab === "pos" && <PosTab />}
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-center mt-8 mb-4" style={{ color: "var(--text-muted)" }}>
        Questions? Reach out at support@hoptrack.beer
      </p>
    </div>
  );
}
