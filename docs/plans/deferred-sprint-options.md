# Deferred Sprint Options — Backlog

**Owner:** Morgan (PM)
**Convention:** Every sprint kickoff presents 3 options. The 2 unselected options are captured here with full descriptions. These are NOT dead — they're deferred. Joshua or Morgan can pull any of these into a future sprint.

> This is a living document. Updated every sprint kickoff.

---

## Status Legend
- **OPEN** — Available for a future sprint
- **BUILT** — Shipped in a later sprint (noted which)
- **PARTIAL** — Partially addressed (noted which sprint)

---

## Sprint 117 — Selected: The Dashboard (brand analytics + consumer map)

- **Per-Location Billing Add-On** — `$29-49/location` Stripe pricing model. One invoice per brand. *(PARTIAL — Sprint 121 built brand billing with per-location add-ons at $39/location)*
- **Brand-Level Messaging & CRM** — Send messages to customers across all locations, cross-location customer segments. **OPEN**
- **Location Transfer / Merge** — Let brand owners absorb existing brewery listings into their brand. Critical for real multi-location operators claiming unclaimed listings. **OPEN**

---

## Sprint 118 — Selected: The Tap Network (brand tap list management)

*(Drew noted: "The man asked for 3 options and picked the first one. Every time.")*

Options were not fully recorded, but the deferred items from Sprint 117 carried forward:
- **Per-Location Billing** *(see S117 — later PARTIAL in S121)*
- **Shared Beer Catalog** *(BUILT — Sprint 119, The Inventory)*

---

## Sprint 119 — Selected: The Inventory (brand beer catalog)

- **"The Pulse" — Brand Notifications + Activity Feed** — Cross-location activity feed on brand dashboard. Real-time view of what's happening at all locations. Brand-level notifications (new reviews, loyalty milestones, session spikes). "Command center" feel. *(PARTIAL — Sprint 124 built KPI analytics but not the real-time feed)* **OPEN** for real-time feed
- **"The Rollout" — Brand Promotions + Challenges** — Brand-wide promotions and challenges spanning all locations. "Visit 3 of our locations this month." Brand-wide happy hours, cross-location loyalty bonuses. THE revenue feature for Barrel tier upgrades. **OPEN**

---

## Sprint 120 — Selected: The Lens (brand reports + exports)

*(Options not explicitly recorded in kickoff, but retro references Sprint 121 "The Ledger" and Sprint 122 "The Staff Room" as the known next items — suggesting they were the unselected options)*

- **The Ledger — Brand Billing** *(BUILT — Sprint 121)*
- **The Staff Room — Brand Team Management** *(BUILT — Sprint 122, as "The Crew")*

---

## Sprint 121 — Selected: The Ledger (brand billing & subscriptions)

Morgan confirmed "scoped 3 options, plan approved." The deferred options were:

- **The Staff Room / The Crew — Brand Team Management** — Full team management with roles, permissions, activity log. *(BUILT — Sprint 122)*
- **The Consumer Bridge — Cross-Location Consumer Experience** — Cross-location loyalty (earn anywhere/redeem anywhere), brand-level wishlist aggregation, "visit all locations" auto-challenge, consumer brand page upgrade, location-aware "nearest location" with distance. *(PARTIAL — loyalty BUILT in S125, nearest location in S126)* **OPEN** for wishlist aggregation + auto-challenges

---

## Sprint 122 — Selected: The Crew (brand team management)

Joshua "picked it specifically for security."

- **The Loyalty Network — Brand-Level Loyalty** — Unified loyalty programs across all locations. Earn stamps at Location A, redeem at Location B. Brand owners configure one program that propagates. Drew: "This is the one that makes brewery groups switch from paper cards." *(BUILT — Sprint 125, The Passport)*
- **The Megaphone — Brand-Level Promotions & Challenges** — Run challenges and promotions across all brand locations. Cross-location challenges (visit N locations, try beers at different spots). Brand promotion dashboard. Taylor: clear Barrel-tier differentiator. **OPEN**

---

## Sprint 123 — Selected: The Fix (brand hardening / RLS recursion fix)

*(P0 bug forced this sprint — RLS recursion on brand_accounts found by Joshua)*

- **The Rollout — Brand Onboarding & Permissions** — Brand onboarding wizard, regional manager scope enforcement in UI, brand notifications for propagated changes, team activity dashboard improvements. **OPEN**
- **The Pivot — Consumer & Revenue** — Pause brand work, focus on first revenue: PWA/App Store prep (Alex waiting since S8), Taylor's warm intro playbook, brewery claim funnel optimization (7,177 listings, zero claimed beyond test data). **OPEN**

---

## Sprint 124 — Selected: The Pulse (enhanced KPIs & analytics, REQ-069)

- **"The Stage" — Brand Events & Cross-Location Promotions** — Brand-wide event management (tap takeovers, happy hours, beer releases spanning all locations). Event creation at brand level, auto-push to locations, consumer-facing event discovery. Cross-location challenges. Brand event calendar. **OPEN**
- **"The Menu" — Menu Uploads & Gallery (REQ-070)** — Full menu image system (food, cocktails, wine, NA, seasonal, kids, brunch, happy hour — 8 categories, up to 3 images each). `brewery_menus` table, Supabase Storage bucket, Settings UI, consumer gallery. Taylor: "Every brewery I pitch serves food." **OPEN**

---

## Sprint 125 — Selected: The Passport (brand-wide loyalty)

- **"The Stage" — Brand Events** — Multi-location event management. Brand creates event once, shows on all/selected locations. Consumer event discovery with location picker. Event feed cards. Drew: "Tap takeovers, trivia nights, beer releases — they run these across locations ALL the time." **OPEN**
- **"The Menu" — Menu Uploads (REQ-070)** — Non-beer menu uploads: 8 categories, up to 3 images each. New `brewery_menus` table, Supabase Storage, Settings UI, consumer-facing gallery. Taylor: "'Can they see our food menu?' is literally the second question." **OPEN**

---

## Sprint 126 — Selected: The Geo (brand location proximity)

- **"The Transfer" — Cross-Location Customer Tools** — Full customer history across all brand locations. Transfer/merge duplicate profiles. "Regulars at your other locations" insight card. Cross-location customer journey visualization. **BUILT — Sprint 129**
- **"The Polish" — Brand Hardening** — Migration tracking gap fix, brand E2E tests, tier gate audit, slug consistency, brand onboarding wizard, UI integration tests for tier mismatches (the Pint & Pixel bug). **OPEN**

---

## Sprint 128 — Selected: The Menu (menu uploads & food presence, REQ-070)

- **"The Stage" — Brand Events & Cross-Location Experiences** — Multi-location event management (tap takeovers, trivia nights, beer releases). Brand creates event once, pushes to all/selected locations. Consumer event discovery with proximity. Event feed cards. Deferred 3x now (S124, S125, S128) — strong team consensus, Drew keeps asking. **OPEN**
- **"The Megaphone" — Brand-Level Promotions & Challenges** — Cross-location challenges ("Visit 3 Pint & Pixel locations this month"), brand-wide happy hours, cross-location loyalty bonuses. Barrel tier differentiator. Taylor: clear upsell path. Deferred 3x (S119, S122, S128). **OPEN**

---

## Sprint 131 — Selected: The Storefront (public brewery pages)

Joshua explicitly backlogged both deferred options "way into the future":

- **"The Stage" — Brand Events & Cross-Location Experiences** — Multi-location event management. Deferred 4x (S124, S125, S128, S131). **BACKLOGGED** — Joshua says "way more into the future"
- **"The Megaphone" — Brand-Level Promotions & Challenges** — Cross-location challenges. Deferred 4x (S119, S122, S128, S131). **BACKLOGGED** — Joshua says "way more into the future"

---

## Sprint 133 — Selected: The Cleanup (brewery admin nav reorganization)

- **"The Formatter" — Data Standardization + Address Seeding** — Normalize city/state/address across 7,177 breweries. Seed missing addresses. Extend brewery-utils.ts with formatCity(), formatState(), normalizeAddress(). Auto-format on write in brewery creation + settings APIs. **Joshua's addition:** Need deeper input validation — type-ahead/predictive search or field-level errors in Settings so data is ALWAYS standardized on input, not just via batch migration. "We need to seed addresses for breweries and we need it standardized." **OPEN**
- **"The Command Center" — Superadmin Enhancement** — Founder dashboard for launch ops: user growth, brewery claims, revenue tracking, system health, Barback crawl status. P1 for launch. Taylor: "How do we know if the business is working if Joshua can't see the numbers?" **OPEN**

---

## Recurring Themes (appeared in multiple sprints)

These ideas keep coming back — they're clearly high-value:

| Theme | Appeared In | Status |
|-------|------------|--------|
| **Brand Events / The Stage** | S124, S125, S128, S131 | **BACKLOGGED** — Joshua deferred "way into the future" (S131). 4x deferred. |
| **Menu Uploads / The Menu (REQ-070)** | S124, S125 | **BUILT — Sprint 128** |
| **Brand Promotions / The Megaphone / The Rollout** | S119, S122, S128, S131 | **BACKLOGGED** — Joshua deferred "way into the future" (S131). 4x deferred. |
| **Public Brewery Pages / The Storefront** | S123, S131 | **BUILT — Sprint 131** |
| **Consumer Bridge / Cross-Location Experience** | S121 | **PARTIAL** — loyalty done, wishlist + auto-challenges still open |
| **Brand Onboarding Wizard** | S123, S126 | **OPEN** — keeps getting deferred for higher-priority items |
| **Location Transfer / Merge** | S117 | **OPEN** — critical for real operators claiming listings |
| **App Store / PWA Push** | S123 | **OPEN** — Alex waiting since Sprint 8 |
| **Tier Gate Testing** | S126 | **OPEN** — Joshua's request after the Pint & Pixel bug |

---

## Standing Ideas (Not Yet Sprint Options)

- **Cross-Location Leaderboard** — Gamified comparison across brand locations
- **Brand-Level Wishlist Aggregation** — See wishlisted beers across all locations
- **"Visit All Locations" Auto-Challenge** — Automatically generated brand challenge
- **Real-Time Brand Activity Feed** — Live cross-location dashboard
- **Claim Funnel Optimization** — 7,177 listings, need conversion

---

## Roadmap Ideas — Captured 2026-04-02

*Source: Joshua braindump. Captured by Sage.*

- **Smarter Search** — Type-ahead, predictive search, investigate tools/libraries to improve search UX beyond current pg_trgm fuzzy search (S114). Think autocomplete dropdowns, popular searches, "did you mean?" corrections. *Owner: Jordan/Avery (architecture + implementation). Priority: P2 — UX quality of life, not blocking but highly visible.*

- **AI Promotion Suggestions** — Proactive revenue intelligence for brewery owners. "You should run this type of promotion," "You're not selling XYZ — lower the price and let people know." Uses check-in data + tap list analytics to generate actionable business suggestions. *Owner: Sam (requirements) + Avery (build) + Drew (validation). Priority: P2 — high value for brewery retention, needs data density first.*

- **Certified Beer Reviewers** — Badge system for certified/trained reviewers (Cicerone, BJCP, etc.). Their reviews get promoted/highlighted on beer and brewery pages. Builds trust in review quality. *Owner: Sam (criteria definition) + Alex (badge design) + Avery (build). Priority: P3 — nice differentiator, not urgent.*

- **Superadmin: Brewery Impersonation** — Ability to impersonate any brewery from superadmin dashboard to diagnose issues, see what brewery owners see. Essential for support and debugging at scale. *Owner: Riley/Quinn (security) + Avery (build). Priority: P1 — critical for launch support, founders need this on day one.*

- **Superadmin: AI Seeding (Barback) Review Page** — Make the existing Barback crawler review page (`/superadmin/barback/`) more accessible from the main superadmin dashboard. Add manual crawl kick-off button and schedule adjustment controls. Infrastructure exists (S79), needs polish and discoverability. *Owner: Avery (build) + Riley (infra). Priority: P2 — needed before scaling crawl operations.*

- **Data Standardization** — Audit all location data for consistency: addresses, cities, states, zip codes. Open Brewery DB data (S78, 7,177 breweries) has inconsistent formatting. Normalize to standard formats. *Owner: Quinn (data migration) + Sam (audit criteria). Priority: P1 — data quality directly impacts search, proximity, and credibility.*

- **Superadmin Enhancement** — Central founder dashboard to track HopTrack as it launches. Manage everything from one location: user growth, brewery claims, revenue, crawl status, system health. What features does a founder need to run the business day-to-day? *Owner: Sam (requirements) + Avery (build). Priority: P1 — Joshua needs this for launch operations.*

- **Bartender Code Entry** — Clear, dedicated UI for bartenders/staff to enter promo codes that customers present. Current staff redemption system (S114) has code entry, but the UX path for a busy bartender needs to be obvious and fast. Where exactly does a bartender go? One-tap access from POS or dashboard. *Owner: Drew (workflow validation) + Alex (UX) + Avery (build). Priority: P2 — important for loyalty adoption, Drew should validate the real-world flow.*

- **Per-Location Toggle on Analytics** — Toggle for by-location tracking in weekly trends and other analytics views. Currently analytics show aggregate; brand owners need to drill into individual locations from any analytics chart or KPI card. *Owner: Avery (build). Priority: P2 — enhances existing analytics (S124), natural extension.*

- **Menu Type Specification** — Ability to specify menu type when uploading: Lunch, Dinner, Brunch, Kids, Cocktails, Wine List, etc. Extends the current 8-category system (S128) with more granular meal/occasion-based categorization. May need schema change on `brewery_menus`. *Owner: Sam (category taxonomy) + Avery (build). Priority: P3 — current 8 categories cover launch, this is a refinement.*

- **Brewery Admin Nav Reorganization** — Too many nav items in brewery-admin, need hierarchy/grouping. Combine into nested groups or collapsible themes (e.g., "Content" for tap list + menus + events, "Business" for analytics + billing + CRM, "Brand" for all brand features). *Owner: Alex (information architecture) + Avery (build). Priority: P1 — usability issue that gets worse with every feature we add.*

- **Brand Colors on Admin** — Brewery-admin and superadmin pages need consistent use of brand colors instead of current hodgepodge. Audit all admin surfaces for color consistency, align with Jamie's brand guide (dark theme + gold accent system). *Owner: Jamie (brand audit) + Alex (design) + Avery (implementation). Priority: P2 — visual polish, builds trust with brewery owners.*

- **User Guides for All Admin Features** — Comprehensive documentation with screenshots for every admin feature. In-app help or linked docs. Brewery owners should never be confused about how to use a feature. *Owner: Sam (content) + Jamie (visual design). Priority: P2 — critical for self-serve onboarding, reduces support load.*

- **Public Brewery Pages (No Account)** — Unauthenticated users can see brewery info, menus, description, phone number, tap list. Everything else (reviews, social, loyalty) blurred with "Create a HopTrack account" CTA overlay. Turns every brewery page into a conversion funnel. *Owner: Taylor (conversion strategy) + Avery (build) + Jordan (auth architecture). Priority: P1 — massive for SEO and organic growth, every brewery page becomes a landing page.*

- **Brewery Social Links** — Ability to link to social feeds (X, Facebook, Instagram, etc.) displayed alongside phone number on brewery pages. Simple addition to brewery profile settings + display on public pages. *Owner: Avery (build). Priority: P3 — low effort, nice to have, enhances brewery pages.*

- **Image from Screenshot (Investigation)** — Joshua saw a recommendation (possibly related to Next.js config or image optimization) but is unsure if it's still relevant. Needs investigation — could be about `next/image` remote patterns, OG image generation, or screenshot-to-image tooling. *Owner: Jordan (investigation). Priority: P3 — needs clarification from Joshua before scoping.*

- **Lint Zero — Kill All 20 Pre-Existing Errors** — 20 lint errors remain from pre-Sprint 134: 6 React compiler "Cannot access variable before declared" (hoisting issues in brand components), 4 "setState in effect" (ExploreClient, QuickRatingSheet, RateLimitBanner, BreweryAdminNav), 2 "impure function during render" (brewery detail page), 5 unescaped entities in JSX strings, 2 `require()` imports (Stripe lazy-load), 1 `prefer-const` (layout destructuring). Joshua wants zero errors — clean slate. *Owner: Avery (fixes) + Casey (verification). Priority: P1 — code health, zero tolerance.* *(Added 2026-04-03, requested by Joshua)*

- **Code Protection & IP Security** — Protect HopTrack's source code and intellectual property before going live. Scope: disable source maps in production (`productionBrowserSourceMaps: false`), add Content-Security-Policy headers, add `X-Content-Type-Options: nosniff`, implement anti-scraping rate limits on public pages, add copyright headers to key files, obfuscate client bundles (investigate `next-bundle-analyzer` + `javascript-obfuscator`), protect API endpoints from abuse (bot detection), legal protections (ToS, copyright notices, DMCA policy), lock down Supabase RLS policies audit, ensure no secrets in client bundles, investigate code signing for PWA. *Owner: Riley/Quinn (infra security) + Jordan (code review) + Taylor (legal/ToS). Priority: P1 — must be done before launch, non-negotiable.* *(Added 2026-04-03, requested by Joshua)*

- **Codebase DRY-Up & Modernization** — Systematic audit for copy-paste JSX, repeated patterns, and opportunities to extract into data-driven `.map()` loops. Inspired by Jordan's S133 brand nav cleanup. *Owner: Jordan (audit) + Avery (implementation). Priority: P2 — code health.* *(Added 2026-04-03, requested by Joshua)* **BUILT — Sprint 134 (The Tidy)**

- **Superadmin Evolution — The Full Bridge** — Expand the Command Center (S136) into a comprehensive platform operations suite. Inspired by Stripe Dashboard, Shopify Admin, and Toast Admin patterns. Key initiatives:
  - **Brewery Account Detail Pages** — Click into any brewery from superadmin → see everything: subscription tier, billing history, Stripe invoices, plan changes, feature usage metrics, tap list activity, loyalty program stats, support requests, admin actions log, onboarding status, account health score. Modeled on Stripe's customer detail page. *Priority: P0 — Joshua's top request.*
  - **Consumer Account Detail Pages** — View any user's profile: check-in history, XP/level, achievements, social connections, sessions, reported content. Read-only for now, moderation actions later. *Priority: P1.*
  - **Brewery Impersonation** — "View as Brewery" button on account detail page. Opens the brewery dashboard as if logged in as that brewery's owner. Gold banner at top: "You are viewing as [Brewery Name] — Exit Impersonation". 1-hour session timeout, full audit logging, email notification to brewery owner. Essential for support and debugging. *Priority: P1 — critical for launch support, founders need this on day one.*
  - **Communications & Activity Timeline** — Unified timeline per brewery: emails sent (welcome, digest, trial warnings), admin actions, subscription changes, support notes (free-text notes from Joshua). Think Stripe's event log. *Priority: P1.*
  - **Advanced Platform Metrics** — Cohort analysis (weekly cohorts, retention curves), revenue forecasting, LTV estimation, churn prediction, funnel conversion rates over time. Customizable date ranges. CSV/PDF export. *Priority: P2.*
  - **Operational Tools** — Bulk actions (mass email, tier changes), feature flags (enable/disable features per brewery), content moderation queue (reported reviews/sessions/photos), announcement system (banner messages to all brewery admins). *Priority: P2.*
  - **Customizable Dashboard** — Drag-and-drop widget layout, saved views, favorite breweries pinned, configurable alert thresholds. The "next level" of the command center. *Priority: P3.*
  *Owner: Sam (requirements) + Jordan (architecture) + Avery (build). Multi-sprint initiative — scope 2-4 sprints.* *(Added 2026-04-03, requested by Joshua, informed by Stripe/Shopify/Toast research)*

---

## Sprint 132 — Selected: The Clean Slate (data quality + social links)

- **"The Formatter" — City/State/Address Standardization** — Normalize city names (capitalization, abbreviations), state field validation (reject full names, enforce 2-letter), address formatting consistency across 7,177 brewery records. Extend brewery-utils.ts with formatCity(), formatState(), normalizeAddress(). Update brewery creation and settings APIs to auto-format on write. Joshua explicitly requested this as Sprint 133 work. **OPEN**

---

## Sprint 138 — Selected: The Bartender (real-world ops hardening)

- **"The Bridge" — Superadmin Evolution (Phase 1)** — **BUILT — Sprint 140**
- **"The Revenue Push" — Launch Readiness** — Claim funnel optimization (7,177 listings, zero real claims), PWA install prompt (Alex waiting since Sprint 8), Taylor's warm intro kit (first 10 target breweries in Asheville via Drew's network). The "go get a customer" sprint. **OPEN**

---

## Sprint 140 — Selected: The Bridge (superadmin evolution Phase 1)

- **"The Revenue Push" — Launch Readiness** — Claim funnel optimization (7,177 listings, zero real claims), PWA install prompt (Alex waiting since Sprint 8), Taylor's warm intro kit (first 10 target breweries in Asheville via Drew's network). The "go get a customer" sprint. **OPEN**
- **"The Playwright" — E2E Test Coverage** — Real Playwright E2E tests for critical user journeys: sign up → first check-in → earn XP, brewery claim → onboarding wizard → first tap list, loyalty stamp → redemption code → staff confirm. CI Supabase instance wired. Casey and Reese's dream sprint. **OPEN**

---

## Sprint 142 — Selected: The Superadmin II (consumer account detail + advanced metrics)

- **"The Revenue Push" — Launch Readiness** — Claim funnel optimization (7,177 listings, zero real claims), PWA install prompt (Alex waiting since Sprint 8), Taylor's warm intro kit (first 10 target breweries in Asheville via Drew's network). The "go get a customer" sprint. Deferred 3x (S138, S140, S142). **OPEN**
- **"The Playwright" — E2E Test Coverage** — Real Playwright E2E tests for critical user journeys. Deferred 2x (S140, S142). **OPEN**

---

## Sprint 143 — Selected: The Superadmin III (breweries list, CC enhancement, stats transformation)

- **"The Revenue Push" — Launch Readiness** — Claim funnel optimization, PWA install prompt, warm intro kit. Deferred 4x (S138, S140, S142, S143). **OPEN**
- **"The Playwright" — E2E Test Coverage** — Real Playwright E2E tests for critical user journeys. Deferred 3x (S140, S142, S143). **OPEN**

---

## Sprint 145 — Selected: The Revenue Push (claim funnel, PWA install, sales materials)

- **"The Playwright" — E2E Test Coverage** — Real Playwright E2E tests for critical user journeys. Deferred 4x (S140, S142, S143, S145). **OPEN**
- **"The AI Sprint" — Intelligent Features** — AI promotion suggestions, Barback polish, smart recommendations. **BUILT — Sprint 146**

---

## Sprint 146 — Selected: The AI Sprint (AI promotions, Barback polish, smart recommendations)

- **"The Playwright" — E2E Test Coverage** — Real Playwright E2E tests for critical user journeys. Deferred 5x (S140, S142, S143, S145, S146). **OPEN**
- **"The Hardening" — Launch Infrastructure** — Turbopack CSS panic fix, Brand Team RLS bug (14 sprints), register crons in GitHub Actions, pre-commit type checks, mobile spot-check, React compiler warnings. **OPEN**

---

## Sprint 147 — The Hardening (Selected: Option B)

**Selected:** Option B — The Hardening (12-3-2 vote)
- Lint zero, Brand Team RLS fix, Turbopack/Leaflet, cron tests, env config

**Deferred — Option A: "The Playwright"** 🧪
E2E test coverage for critical user journeys. Playwright suite, CI integration, flaky test detection. **Promised for Sprint 149.**

**Deferred — Option C: "The Closer"** 💰
First customer acquisition infrastructure. Demo mode, pricing page polish, onboarding email refinement, Drew's warm intro toolkit. **Promised for Sprint 148.**

---

## Sprint 149 — The Launchpad (Selected: Option B)

**Selected:** Option B — The Launchpad
- Production hardening: unbounded query fix, v1 cache tuning, font swap, next/image avatar, 404 page, health endpoint, launch checklist burndown

**Deferred — Option A: "The Playwright"** 🧪
E2E test coverage for critical user journeys. Playwright suite, CI Supabase integration, flaky test detection. Deferred 7x (S140, S142, S143, S145, S146, S147, S149). **Casey says Sprint 150 or else.**

**Deferred — Option C: "The Sticky"** 🍻
Consumer retention features. Push notification personalization, check-in streak rewards, consumer weekly recap email, friend activity highlights, WelcomeFlow refresh. **OPEN**

---

## Recurring Themes Update (Sprint 149)

| Theme | Appeared In | Status |
|-------|------------|--------|
| **Superadmin Evolution / The Dashboard** | S136, S140, S142, S143 | **ONGOING** — S143 brought all pages to gold standard. Joshua wants continued evolution informed by Salesforce, HubSpot, and other enterprise admin dashboards. |

---

## Standing Ideas (Not Yet Sprint Options)

### Superadmin IV+ — Enterprise Dashboard Research (Joshua requested S143)

Joshua wants future superadmin sprints to be informed by real-world enterprise admin dashboards. Research targets: **Salesforce Admin Console** (multi-tenant management, account health scores, usage analytics, bulk operations), **HubSpot Dashboard** (CRM pipeline visualization, contact lifecycle stages, revenue attribution), **Stripe Dashboard** (real-time revenue waterfall, subscription analytics, invoice management, dispute handling), **Mixpanel/Amplitude** (behavioral cohorts, event funnels, retention curves, A/B test results), **Intercom** (conversation tracking, customer health scores, proactive outreach triggers).

Potential future superadmin features based on industry research:
- **Customizable dashboard widgets** — drag-and-drop layout, saved views, pinned favorites (Salesforce-style)
- **Account health scoring** — composite score per brewery combining activity, billing status, feature adoption (HubSpot-style)
- **Revenue waterfall** — real-time revenue recognition, MRR movement (new/expansion/contraction/churn) (Stripe-style)
- **Behavioral cohort builder** — custom cohort definitions, retention analysis with arbitrary filters (Mixpanel-style)
- **Proactive alerts** — configurable thresholds for churn risk, usage drops, billing issues (Intercom-style)
- **Bulk operations** — mass email, tier changes, feature toggles across multiple breweries
- **Audit log timeline** — unified per-brewery event log (Stripe-style)
- **Content moderation queue** — reported reviews, photos, comments with approve/reject workflow
- **Feature adoption tracking** — which features each brewery actually uses, adoption percentages

*Owner: Sam (competitive research) + Jordan (architecture) + Avery (build). Priority: P1 — multi-sprint initiative, research-driven.*
*(Added 2026-04-03, requested by Joshua post-S143 close)*

---

## Sprint 151 — Selected: The Ops Room (Option A)

**Selected:** Option A — The Ops Room
- Launch operations: CI hardening, cron workflows, health enhancement, uptime monitoring, connection pooling, email health, GDPR/CCPA, env audit, email routing, launch day ops

**Deferred — Option B: "The Close"** 💰
Revenue readiness. Claim funnel UX audit + friction removal, trial lifecycle emails end-to-end test, demo dashboard polish, pitch deck slides, warm intro playbook for Asheville Wave 1 (Drew's contacts), onboarding wizard refinements, first-brewery-close simulation. The "hand Drew the keys for warm intros" sprint. **OPEN**

**Deferred — Option C: "The Native Feel"** 📱
Consumer app polish. Core Web Vitals / Lighthouse audit → 90+ scores, PWA install prompt improvements, image optimization pass, mobile gesture and interaction polish, offline-ready foundations, App Store screenshot prep, accessibility re-audit. The "make it feel native" sprint. **OPEN**

---

### Beer Passport Redesign (Deferred Sprint 152)
**Original feature:** Beer Passport — collectible stamp grid of every unique beer a user checked in, shown at `/profile/[username]/passport`. Built Sprint 13, polished Sprint 141.
**Why removed:** Too easy to cheat — self-reported check-ins mean users can inflate their passport without verification.
**Files preserved:** `components/brewery-admin/onboarding/OnboardingWizard.tsx` (unrelated, kept for re-enable). Passport files deleted.
**Redesign requirements when revisited:**
- Verification mechanism (bartender confirmation, QR scan, proximity check, or POS integration)
- Consider making it brewery-verified only (stamps earned at verified locations)
- Explore gamification balance — should be achievable but not trivially fakeable
- Evaluate whether to integrate with existing loyalty system instead of standalone
**Related files to reference:** `lib/beerStyleColors.ts` (style families still used by BeerDNACard), `app/(app)/home/YouTabContent.tsx` (Brewery Passport section — different feature, still live)

---

## Sprint 161 — Selected: The Vibe (Option A, minus audio)

**Selected:** Option A — The Vibe 🎵
- Sensory layer (no audio per Joshua). Liquid Glass rollout, mesh gradients + noise on all cards, variable XP rewards, celebration trifecta (confetti + haptic), Arc-style phase animations, long-press context menus, horizontal swipe between Feed sub-tabs.

**Deferred — Option B: "The Identity"** 🎭 **OPEN**
Stats that WOW. Beer Personality 4-letter archetype ("You're The Hop Hunter"), Four Favorites pinned on profile, half-star ratings (0.5 increments, migration required), percentile framing + rarity scores, temporal stories ("Your Beer Thursday"), "Your Round" weekly hero page (Wrapped-of-the-Week), shareable stat cards (OG images, Instagram Story format), count-up animations. **Leads:** Sam + Finley + Dakota. Fills the Profile/Stats tabs that S160 restructured with the WOW content they deserve. **Originally Joshua's S161 pitch — carried forward intact.**

**Deferred — Option C: "The Glass"** 🥃 **OPEN**
Facelift Arc Track 2 narrower play. Active Session Detent Sheet (iOS-style 3-detent sheet: peek/half/full, deferred from S160 per Avery's scope call) + finish Liquid Glass rollout across BottomNav/modals/toasts + motion consistency pass + PillTabs adoption audit (deploy to Discover, Notifications, Settings). **Leads:** Avery + Alex + Dakota. Note: Some Liquid Glass scope overlaps with The Vibe — if The Vibe ships the nav rollout, The Glass narrows to Active Session Detent Sheet + consistency audit only.

---

### Sprint 161 Kickoff — Standing Rule Established
Joshua established a new rule at S161 kickoff: **unpicked options carry forward to next sprint's kickoff**. Both The Identity and The Glass must appear as options at S162 kickoff (alongside any new options Morgan wants to add). See `feedback_carry_options_forward.md` memory.

---

## Backlog — Tooling / Developer Experience

### Context7 MCP integration — engineering workflow **OPEN**
Context7 MCP server was wired into the harness in commit `cf871dd` (S175 close) to provide live Next 16 / Tailwind v4 / Supabase SSR docs to Claude. The tools (`mcp__context7__resolve-library-id`, `mcp__context7__query-docs`) are available — but there's no playbook yet for when Morgan's team should reach for it vs. the codebase skills vs. local files.

**Scope for a future tooling sprint:**
- Document when Context7 is the right tool (live library docs, version migration questions) vs. when `hoptrack-conventions` / `hoptrack-codebase-map` skills already cover it (in-project patterns).
- Evaluate whether to add it to the debug playbook (`hoptrack-debug` skill) as a step when a library error doesn't match in-project patterns.
- Decide whether to add a rule to `AGENTS.md` or `CLAUDE.md` that nudges Jordan/Avery/Dakota to consult Context7 before writing code that touches Next 16.2.1 / Tailwind v4 / Supabase SSR v0.9 APIs — since HopTrack runs on pre-release versions where Claude's training data is likely stale.
- Low priority: not blocking any sprint, but worth a half-day once the team has a sense of how often "I wrote the wrong Next 16 API" bites us.
