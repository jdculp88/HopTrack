# Sprint 131 Retro — The Storefront 🏪
**Facilitated by:** Morgan (PM)
**Date:** 2026-04-02

---

## What We Shipped

### The Storefront — Public Brewery Pages (No Account Required)
Every brewery page (`/brewery/[id]`) is now publicly accessible without login. Two tiers:

**Basic Page (unclaimed / free tier)** — all 7,177 breweries:
- Hero with cover image/gradient, name, location, brewery type
- Contact info (website, phone), description
- Stats bar (visits, visitors, avg rating, top beer, on tap count)
- Reviews (read-only — our content, always public)
- Prominent "Own this brewery? Claim it" CTA
- Gated sections (tap list, menus, events, challenges, loyalty, mug clubs) with "This brewery hasn't claimed their listing yet" StorefrontGate

**Premium Storefront (Tap tier+, $49/mo)** — claimed & paid:
- Everything above PLUS full tap list, menus, events, challenges, loyalty, mug clubs visible
- Beautiful shareable landing page — the brewery's mini-website
- Interactive features (rating, follow, check-in) show "Sign up" CTAs for unauthenticated visitors

### Architecture
- **StorefrontShell** (`components/layout/StorefrontShell.tsx`) — standalone layout, no app nav. HopTrack logo + "Log in" / "Sign Up Free" header. Sticky mobile CTA bar. Branded footer.
- **AuthGate** (`components/ui/AuthGate.tsx`) — reusable blur overlay + signup CTA for interactive features
- **StorefrontGate** (`components/ui/StorefrontGate.tsx`) — tier-based content gate for unclaimed/free-tier breweries
- **Reviews API** — GET now public (our content), POST/DELETE still auth-required
- **Middleware** — `/brewery` removed from protected paths
- **Layout** — conditional: StorefrontShell for unauthenticated brewery visitors, AppShell for authenticated users

### SEO
- `description` added to `generateMetadata`
- Canonical URL set
- JSON-LD structured data (already existed, now actually indexable)
- OG images + Twitter cards (already existed, now actually indexable)

### Files
- 4 new: `StorefrontShell.tsx`, `AuthGate.tsx`, `StorefrontGate.tsx`, `storefront.test.ts`
- 10 modified: middleware, layout, brewery page, BreweryHeroSection, BreweryRatingHeader, BreweryReview, BreweryEventsSection, BreweryReviewsSection, BreweryChallenges, MugClubSection, reviews API
- 0 migrations
- 22 new tests (894 → 916)

---

## Team Credits

- **Morgan** 🗂️ — Sprint scoping, plan, ceremony. Presented 3 options, Joshua picked #3 (historic first for option 3).
- **Jordan** 🏛️ — Architecture review. Approved conditional layout pattern, StorefrontShell as separate component.
- **Avery** 💻 — Built everything. 14 files, 3 new components, tier gate logic, reviews API public read.
- **Alex** 🎨 — StorefrontShell design direction. Sticky mobile CTA bar. "Appetizing, not punishing" blur philosophy.
- **Casey** 🔍 — QA sign-off. Auth flow testing. Return path verification. Zero P0s.
- **Reese** 🧪 — 22 new tests across middleware, tier logic, route detection, return paths.
- **Sam** 📊 — Content gating strategy: reviews = our content (public), tap list = their content (gated). SEO review.
- **Drew** 🍻 — Validated the small brewery value prop. "This is how it should've always worked."
- **Taylor** 💰 — Revenue strategy. "7,177 sales pages in one sprint." The Storefront IS the pitch deck.
- **Jamie** 🎨 — Brand consistency on storefront pages. "Every link shared is a brand touchpoint."
- **Riley** ⚙️ — Confirmed zero migrations needed. Most infrastructure-safe sprint ever.
- **Quinn** ⚙️ — "Let me check the migration state first... there is no migration."
- **Sage** 📋 — Notes, metrics, sprint summary.

---

## Roast Highlights 🔥

- Drew on Joshua: "The man said 'scope it, plan it, shit it.' Direct quote. On the record."
- Casey on Morgan: "Morgan presented three options and Joshua picked the third one for the first time ever. Drew, you owe me five bucks."
- Jordan on Avery: "13 files, zero pattern violations. Is this what happiness is?"
- Sam on Quinn: "Quinn's sprint contribution was 'Let me check the migration state first... there is no migration.' Shortest standup in history."
- Alex on Joshua: "He said 'think of small breweries that can't afford a full on site.' That's someone who actually gives a damn about the little guy."

---

## What Went Well
- Zero regressions. 894 → 916 tests, all passing.
- Zero migrations. Pure application-layer change.
- Build passes clean.
- The authenticated app experience is completely unchanged.
- Every brewery page is now SEO-indexable.
- The tier gate creates a natural upgrade path for brewery owners.

## What To Watch
- RLS policies: verify anon key has SELECT on all tables queried for the public page (brewery, beers, sessions, beer_logs, brewery_reviews, brewery_menus, brewery_events, challenges, mug_clubs, loyalty_programs).
- ISR behavior: page uses `revalidate = 60`. Public data is cacheable, user data behind `if (user)` guards. Should be safe but monitor.
- Sitemap: already lists `/brewery/[id]` routes. Now they're actually accessible to crawlers.

## Next Sprint Ideas
- Joshua mentioned backlogging The Stage (events) and The Megaphone (promotions) "way into the future"
- Deprecate `brewery-welcome` pages (301 redirect to `/brewery/[id]`)
- Beer pages could get the same Storefront treatment
- Analytics: track storefront page views vs signup conversions

---

*"This is a living document."* — Morgan
