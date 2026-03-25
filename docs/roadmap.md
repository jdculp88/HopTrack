# HopTrack Product Roadmap
**Last updated:** 2026-03-24
**PM:** Morgan
**Current Sprint:** Sprint 8 — Hardening & Mobile

> 💬 **Team note from Morgan:** This is a living document — updated every sprint. If you're touching a ticket, update its status here. If you discover something not on the list, add it. The roadmap is the source of truth for what we're building and why.

---

## ✅ Sprint 1 — Foundation (Complete)
**Theme:** Core infrastructure, design system, auth, landing page
**Completed:** 2026-03-24

- [x] Next.js 16 + Tailwind v4 + Supabase SSR setup
- [x] Design system — dark theme, gold accent, Playfair Display, DM Sans, JetBrains Mono
- [x] CSS variable token system with light/dark mode support
- [x] Auth — Google OAuth + email/password, signup + login flows
- [x] Database schema — 11 core tables + RLS policies
- [x] Landing page — hero, feature highlights, CTA
- [x] App shell + navigation — desktop sidebar + mobile bottom nav FAB
- [x] Check-in modal — 5-step wizard flow
- [x] Core components: StarRating, BeerCard, BreweryCard, CheckinCard, AchievementBadge, SkeletonLoader

---

## ✅ Sprint 2 — Consumer App (Complete)
**Theme:** All consumer-facing pages live
**Completed:** 2026-03-24

- [x] Home feed — activity stream, XP progress bar, weekly stats
- [x] Brewery detail page — hero, info, beer menu, top visitors leaderboard
- [x] Beer detail page — details, ratings, check-in history
- [x] Explore page — brewery grid with visit tracking
- [x] Profile page — stats, XP level, achievement badges, recent check-ins
- [x] Friends & leaderboards page
- [x] Achievements page — 35 achievements across 6 categories
- [x] Notifications page
- [x] Settings page
- [x] API routes: check-ins, breweries, beers, profiles, friends
- [x] Hooks: useAuth, useCheckin, useBreweries
- [x] XP/leveling system — 20 levels
- [x] Achievement definitions — 35 unlockable achievements

---

## ✅ Sprint 3 — Brewery Platform (Complete)
**Theme:** B2B brewery admin dashboard
**Completed:** 2026-03-24

- [x] Brewery admin route group + role-gated layout
- [x] Brewery dashboard — stats cards, recent check-ins, top 3 beers with medals
- [x] Analytics page — 30-day trend, busiest days, top styles, rating distribution
- [x] Loyalty program display (consumer + admin views)
- [x] Promotions display
- [x] Database migrations: brewery_accounts, loyalty_programs, loyalty_cards, promotions
- [x] Test brewery: Pint & Pixel Brewing Co. with 10 developer-themed beers
- [x] 12 test users + 69+ realistic check-ins over 30 days
- [x] RLS policy: brewery admins can read all check-ins for their brewery
- [x] QA process established (Casey joined team)

---

## ✅ Sprint 4 — Polish & Consumer Loop (Complete)
**Theme:** Fix known bugs, wire real auth, close the consumer loop
**Completed:** 2026-03-24

- [x] BUG-004: Hydration mismatch — added `suppressHydrationWarning` to `<body>`
- [x] BUG-005: i.pravatar.cc not in `remotePatterns` — added to `next.config.ts`
- [x] BUG-006: Banner text invisible in light mode — hardcoded `text-white` for hero overlays
- [x] BUG-009: Star rating hitbox corruption — fixed `motion.button` → plain `<button>` + inner `motion.div`
- [x] Real Supabase auth wired throughout app (no more placeholder user)
- [x] AppNav connected to real username + notification count
- [x] CheckinModal wired to real API (no more `setTimeout` mock)
- [x] `proxy.ts` — merged `x-pathname` header injection (replaced deleted `middleware.ts`)
- [x] Loyalty stamp card component — 323-line skeuomorphic Framer Motion card

---

## ✅ Sprint 5 — Brewery Branding & Test Data (Complete)
**Theme:** Make the test data feel real; polish brewery experience
**Completed:** 2026-03-24

- [x] Seed 004: Pint & Pixel cover image, brewery description, phone, website, address
- [x] Seed 004: All 10 beers get cover images + rich flavor descriptions + ABV/IBU
- [x] BUG-007: Kernel Panic Porter — wrong Unsplash photo ID fixed
- [x] BUG-008: Stack Overflow Sour — 404'd Unsplash URL fixed
- [x] Seed 005: 12 test users get pravatar.cc avatars, bios, home_city
- [x] Seed 006: ~80 February check-ins (month 2 activity data)
- [x] Brand identity locked — Jamie joined as Marketing
  - "HopTrack" name confirmed
  - "Track Every Pour" primary tagline
  - The Hop Pin logo concept
  - "Pint Rewind" (replaces "Year in Beer")
  - "The Board" (TV display feature name)

---

## ✅ Sprint 6 — Platform Hardening & Superadmin (Complete)
**Theme:** Fix the foundation before we build higher
**Completed:** 2026-03-24

### Shipped
- [x] REQ-015: Enhanced brewery stats bar — Check-ins, Visitors, Avg Rating, Top Beer, On Tap
- [x] REQ-012: Superadmin panel — `/superadmin` overview, users table, claims queue
- [x] REQ-014: Beer permissions — only brewery accounts can add beers (API enforced)
- [x] Claims queue UI — filter tabs, approve/reject with audit logging
- [x] `admin_actions` audit table — all superadmin mutations logged before returning
- [x] `is_superadmin` flag on profiles — server-side only, never client-trusted
- [x] Superadmin layout — role-gated, SUPERADMIN badge in header
- [x] `PATCH /api/admin/claims` — verifies superadmin, validates pending state, flips verified flag
- [x] `GET /api/admin/stats` — platform-wide stats for overview
- [x] docs/URL-REFERENCE.md — fully updated with all Sprint 6 routes + DB setup steps
- [x] notion-import.zip — 90KB, 35 docs packaged for Notion import
- [x] Fixed recursive RLS bug on `profiles_superadmin_select` policy
- [x] Fixed `brewery_id` type mismatch (text → uuid) in migration 001

### Deferred to Sprint 7+
- [ ] REQ-013: Check-in / Beer Review separation (design spec first)
- [ ] Pint Rewind recap page (brewery admin)
- [ ] Domestic beer achievement ("How American Are You")
- [ ] Server-side flavor tag cap enforcement

### New REQs Created
- REQ-012: Superadmin Panel
- REQ-013: Check-in / Beer Review Separation
- REQ-014: Beer Permissions
- REQ-015: Enhanced Brewery Stats
- REQ-016: Domestic Beer Achievement

---

## ✅ Sprint 7 — The Feel-Good Sprint (Complete)
**Theme:** Every critical path works end-to-end — no dead ends, no silent failures, no blank pages
**Completed:** 2026-03-24
**Sprint lead:** Sam (QoL Audit)

> **Sprint goal:** A new user can sign up, explore breweries, check in, and feel the app is alive and polished. A brewery owner can claim, see their dashboard, and trust the data. A superadmin can navigate every page without hitting a 404.

### P0 — Shipped ✅

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S7-001 | Geolocation error handling in CheckinModal | Jordan | ✅ Done | "Location unavailable, search manually" — graceful fallback |
| S7-002 | Home feed empty state | Jordan + Alex | ✅ Done | Friendly CTA for new users with no activity |
| S7-003 | Authenticated root redirect | Jordan | ✅ Done | `/` → `/home` if logged in |
| S7-004 | Fix/gate dead check-in buttons | Jordan | ✅ Done | Photo upload, "not listed" beer, friend tagging — "Coming soon" treatments |
| S7-005 | Superadmin missing pages | Jordan | ✅ Done | `/superadmin/breweries` table + `/superadmin/content` placeholder shipped |

### P1 — Shipped ✅

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S7-006 | Global toast notification system | Jordan + Alex | ✅ Done | Fires on check-in save, profile update, claim submit, settings save |
| S7-007 | Skeleton loaders — all data pages | Jordan | ✅ Done | `loading.tsx` for home, brewery detail, explore, profile, brewery dashboard |
| S7-008 | Pending claim confirmation page | Jordan + Alex | ✅ Done | Post-submit status page + pending state on `/brewery-admin` |
| S7-009 | Explore page — search + filter | Jordan | ✅ Done | Real-time filter by name/city + visited toggle |
| S7-010 | Brewery settings edit form | Jordan | ✅ Done | description, phone, website_url, street — live edits with toast feedback |
| S7-013 | QA: full check-in regression suite | Casey | ✅ Done | All edge cases covered: no location, no beers, 0 ratings |
| S7-014 | Bug severity matrix doc | Casey | ✅ Done | Consistent triage rubric established |

### P1 — In Progress / Carried to S8

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S7-011 | Staging Supabase project | Riley | 🔄 In Progress | Project provisioning in progress; `.env.local` template pending |
| S7-012 | Storage buckets + RLS | Riley | 🔄 Blocked on S7-011 | `beer-photos` + `brewery-covers` — unlocks photo uploads |

### Additional Wins (Unplanned S7)

| Item | Notes |
|------|-------|
| Brewery admin mobile tab strip | Scrollable `border-b-2` active strip; owners can now navigate between admin sections on mobile |
| Achievement "see all" toggle | `AchievementsGrid` extracted as client component; shows 12, expands to all |
| Superadmin stat cards → clickable links | All 6 stat cards now route to correct sub-pages |
| Claims queue search filter | Real-time search by brewery, claimant, or email chained on tab filter |
| "Remove brewery" alert() → mailto | `mailto:support@hoptrack.beer` with pre-filled subject/body; no browser dialogs |

### P2 — Deferred to S8+

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S7-015 | REQ-013: Check-in / Beer Review separation | Alex + Jordan | 🔲 Deferred | Design spec first (Alex), then build |
| S7-016 | Pint Rewind recap page | Jordan | 🔲 Deferred | Brewery admin monthly/yearly recap |
| S7-017 | Domestic beer achievement | Jordan | 🔲 Deferred | "How American Are You" unlock |
| S7-018 | Explore page map view | Jordan + Riley | 🔲 Deferred | Mapbox integration (requires API key) |

### QoL Issues — S7 Resolution

| ID | Issue | Status |
|----|-------|--------|
| UX-001 | Photo upload dead button | ✅ "Coming soon" treatment + tooltip |
| UX-002 | Geolocation denial silent failure | ✅ Fixed — graceful message |
| UX-003 | "Add new brewery" / "not listed" stub | ✅ "Coming soon" gated |
| UX-004 | Friend tagging disrupts wizard | ✅ "Coming soon" — flow preserved |
| UX-005 | Home feed blank for new users | ✅ Fixed — empty state CTA |
| UX-006 | Explore hardcoded 50 breweries, no search | ✅ Fixed — real-time filter |
| UX-007 | No skeleton loaders | ✅ Fixed — all major data pages |
| UX-008 | Achievement grid capped at 12, no "see all" | ✅ Fixed — `AchievementsGrid` client component |
| UX-009 | Root `/` no redirect | ✅ Fixed — `/` → `/home` if authed |
| UX-010 | Claim flow no pending state | ✅ Fixed — confirmation + status page |
| UX-011 | Brewery dashboard no loading states | ✅ Fixed — `loading.tsx` skeleton |
| UX-012 | Brewery settings form empty | ✅ Fixed — full edit form |
| UX-013 | No cover photo / description edit | ✅ Partial — text only; photo upload in S8 after Storage |
| UX-014 | Analytics page content audit | 🔲 S8 |
| UX-015 | "View all check-ins" CTA easy to miss | 🔲 S8 |
| UX-016 | Timezone not considered in admin dates | 🔲 S9 |
| UX-017 | `/superadmin/breweries` 404 | ✅ Fixed |
| UX-018 | `/superadmin/content` 404 | ✅ Fixed |
| UX-019 | Superadmin stat cards not clickable | ✅ Fixed — `<Link>` wrappers |
| UX-020 | No search on claims queue | ✅ Fixed — real-time search filter |
| UX-021 | User management — no "view profile" action | 🔲 S9 |

---

## 🚀 Sprint 8 — Hardening & Mobile (CURRENT)
**Theme:** Brewery owner trust, data integrity, PWA foundation, multi-environment infra
**Start:** 2026-03-24
**Sprint leads:** Jordan (brewery ops), Alex (mobile), Riley (infra)

> **Sprint goal:** A brewery owner can trust that every action they take in the dashboard is reflected accurately in the live app. HopTrack works as a first-class PWA on iOS Safari. The team has staging and production environments separated.

### 🔴 P0 — Must Ship

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S8-001 | TapList: fix `is_on_tap` overwrite bug | Jordan | ✅ Done | Edit payload hardcoded `is_on_tap: true` — kicks beers silently back onto tap list |
| S8-002 | TapList: replace `confirm()` with inline UX | Jordan | ✅ Done | Browser dialogs removed; inline delete confirmation |
| S8-003 | Loyalty: add edit capability for programs | Jordan | ✅ Done | Owners can edit stamps_required, reward, name after creation |
| S8-004 | Loyalty: replace `confirm()` on promo delete | Jordan | ✅ Done | Inline confirmation pattern consistent with tap list |
| S8-005 | Staging Supabase project (carry S7-011) | Riley | 🔄 In Progress | `.env.local` template + npm scripts (`dev:staging`, `db:migrate:staging`) |
| S8-006 | Supabase Storage buckets (carry S7-012) | Riley | 🔲 Todo | `beer-photos`, `brewery-covers` + RLS; unblocks photo uploads |

### 🟡 P1 — Should Ship

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S8-007 | PWA: `manifest.json` + service worker | Alex | ✅ Done | `manifest.json` + `sw.js` + Next.js `Viewport` export + SW registration |
| S8-008 | PWA: Apple touch icons (9 sizes) | Alex | 🔄 In Progress | Meta tags wired; PNG icon files need generating from design (57–180px) |
| S8-009 | PWA: iOS safe area insets | Alex | 🔲 Todo | `env(safe-area-inset-*)` for notch/home indicator clearance |
| S8-010 | PWA: 44pt touch target audit | Alex | 🔲 Todo | All interactive elements ≥ 44×44pt; 16px font floor |
| S8-011 | Photo uploads to Supabase Storage | Jordan | 🔲 Blocked on S8-006 | Check-in photos + brewery cover photos |
| S8-012 | BrewerySettingsClient RLS review | Casey + Jordan | ✅ Done | Moved update to `/api/brewery/[brewery_id]/settings` — server verifies ownership |
| S8-013 | Loyalty: loading skeleton | Jordan | ✅ Done | `loading.tsx` shipped |
| S8-014 | TapList: loading skeleton | Jordan | ✅ Done | `loading.tsx` shipped |
| S8-015 | Analytics page content audit | Sam + Jordan | ✅ Done | Added unique visitors stat; fixed 30d/90d label confusion; `user_id` added to query |

### 🟢 P2 — Nice to Have

| ID | Task | Owner | Status | Notes |
|----|------|-------|--------|-------|
| S8-016 | REQ-013: Check-in / Beer Review separation | Alex + Jordan | 🔲 Todo | Alex spec first, then Jordan builds |
| S8-017 | Pint Rewind recap page | Jordan | ✅ Done | `/brewery-admin/[id]/pint-rewind` — 30d/all-time toggle, top beers, busiest hour, loyal visitor |
| S8-018 | Domestic beer achievement | Jordan | 🔲 Todo | "How American Are You" unlock |
| S8-019 | Explore page map view | Jordan + Riley | 🔲 Todo | Mapbox — requires API key from user |
| S8-020 | `/for-breweries` pricing page | Taylor + Jamie | ✅ Done | Live at `/for-breweries` — Tap $49, Cask $149, Barrel custom; linked from landing page nav |

### Drew's Brewery Ops P0 List (S8 Anchor)
Per Drew's ops review, these are the items brewery owners will hit on day one:
1. ✅ **Tap list data integrity** — `is_on_tap` overwrite bug (S8-001)
2. ✅ **No browser dialogs in admin UI** — `confirm()` → inline (S8-002, S8-004)
3. ✅ **Loyalty program editing** — can't change stamps/reward after create (S8-003)
4. 🔲 **Photo uploads** — owners expect to add beer photos; "Coming soon" is tolerated short-term (S8-011)
5. 🔲 **Analytics accuracy** — are the numbers trustworthy? (S8-015)

---

## 📋 Sprint 9 — Gamification & Social (Planning)
**Theme:** Make the social loop addictive
**Estimated start:** 2026-03-31

- [ ] Friends activity feed improvements
- [ ] Push notifications (Supabase Edge Functions + Resend)
- [ ] Brewery QR code for loyalty redemption
- [ ] Slow seller promotion push
- [ ] User Pint Rewind shareable card
- [ ] Brewery Wrapped monthly recap (brewery admin)
- [ ] Timezone-aware date displays throughout
- [ ] User management — "view profile" action in superadmin

---

## 📋 Sprint 10 — Premium & Launch Prep (Planning)
**Theme:** Premium B2B tier + App Store preparation
**Estimated start:** 2026-04-07

- [ ] TV display app (`/display/[brewery_id]`) — Supabase Realtime board ("The Board")
- [ ] Location-based brewery insights
- [ ] Weekly analytics email digest (Resend)
- [ ] Brewery API access (Cask tier)
- [ ] Map view — Mapbox integration on Explore page
- [ ] Performance audit + optimization
- [ ] Accessibility review (WCAG 2.1 AA)
- [ ] SEO — OG images, metadata, sitemap
- [ ] Error monitoring (Sentry)
- [ ] Analytics (PostHog or Mixpanel)
- [ ] Capacitor wrapper → App Store + TestFlight (Alex leading; PWA ships first in S8)
- [ ] Beta user onboarding flow
- [ ] Pricing page (`/for-breweries`) + Stripe integration

---

## 🏗️ Infrastructure Roadmap (Riley)

| Item | Sprint | Status |
|------|--------|--------|
| Supabase project setup + migrations | 1 | ✅ Complete |
| RLS policies (all tables) | 1 | ✅ Complete |
| proxy.ts (replaces middleware.ts in Next 16) | 4 | ✅ Complete |
| next.config.ts remotePatterns | 4 | ✅ Complete |
| Superadmin role + audit logging | 6 | ✅ Complete |
| Staging Supabase project | 8 | 🔄 In Progress (Riley) |
| Supabase Storage buckets + RLS | 8 | 🔲 Planned (blocked on staging) |
| Multi-env `.env` setup (`.env.local` / `.env.staging` / `.env.production`) | 8 | 🔲 Planned |
| npm scripts: `dev:staging`, `db:migrate:staging` | 8 | 🔲 Planned |
| Environment variable validation on startup | 8 | 🔲 Planned |
| Image CDN (Supabase transforms) | 8 | 🔲 Planned |
| Supabase Edge Functions (achievement eval) | 9 | 🔲 Planned |
| Scheduled jobs (weekly recaps) | 9 | 🔲 Planned |
| Email (Resend integration) | 9 | 🔲 Planned |
| Realtime subscriptions (TV display) | 10 | 🔲 Planned |
| Error monitoring (Sentry) | 10 | 🔲 Planned |
| Analytics pipeline | 10 | 🔲 Planned |

---

## 📱 Mobile App Roadmap (Alex leading)

| Phase | Sprint | Status | Notes |
|-------|--------|--------|-------|
| PWA polish — manifest, service worker, icons | 8 | 🔲 In Progress | Ships before Capacitor |
| iOS safe area + 44pt tap targets | 8 | 🔲 Todo | Audit all interactive elements |
| Real device testing (iPhone Safari + Add to Home Screen) | 8 | 🔲 Todo | Alex to screenshot for icon spec |
| Capacitor wrapper + App Store prep | 10 | 🔲 Planned | After PWA is solid |
| TestFlight beta | 10 | 🔲 Planned | Jamie leading distribution |
| App Store submission | Post-S10 | 🔲 Planned | — |

---

## 💰 Revenue Milestones (Taylor + Sam)

| Milestone | Target Sprint | Status | Notes |
|-----------|--------------|--------|-------|
| 10 brewery accounts | Sprint 9 | 🔲 | Early access / free trial |
| 100 consumer users | Sprint 9 | 🔲 | Organic from Austin launch |
| `/for-breweries` pricing page live | Sprint 10 | 🔲 | Tap $49 · Cask $149 · Barrel custom |
| TestFlight / beta launch | Sprint 10 | 🔲 | Jamie leading |
| First paid brewery ($49 Tap tier) | Sprint 10 | 🔲 | After loyalty + QR ships |
| 50 paid breweries | 3 months post-launch | 🔲 | $2,450 MRR |
| 500 paid breweries | 6 months post-launch | 🔲 | $75K MRR target |

---

## 🐛 Bug Log Summary

| Bug | Severity | Status | Fixed Sprint |
|-----|----------|--------|-------------|
| BUG-001: AppNav left bar contrast | Medium | ✅ Fixed | S4 |
| BUG-002: Star rating final star small | Medium | ✅ Fixed | S4 |
| BUG-003: Check-in button no destination | High | ✅ Fixed | S4 |
| BUG-004: Hydration mismatch (Grammarly) | Medium | ✅ Fixed | S4 — `suppressHydrationWarning` |
| BUG-005: pravatar.cc not in remotePatterns | High | ✅ Fixed | S4 — added to next.config.ts |
| BUG-006: Banner text invisible light mode | High | ✅ Fixed | S5 — hardcoded `text-white` on hero overlays |
| BUG-007: Kernel Panic Porter wrong image | Low | ✅ Fixed | S5 — correct Unsplash ID |
| BUG-008: Stack Overflow Sour 404 | Low | ✅ Fixed | S5 — new verified URL |
| BUG-009: Star rating hitbox corruption | High | ✅ Fixed | S4 — `motion.button` → `<button>` + inner `motion.div` |
| BUG-010: Recursive RLS on profiles | Critical | ✅ Fixed | S6 — dropped `profiles_superadmin_select` policy |
| BUG-011: middleware.ts + proxy.ts conflict | Critical | ✅ Fixed | S6 — merged, deleted middleware.ts |
| BUG-012: brewery_id type mismatch | High | ✅ Fixed | S6 — text → uuid in migration |
| BUG-013: TapList `is_on_tap` overwrite on edit | Critical | ✅ Fixed | S8 — edit payload no longer resets tap status |
| UX-001: Dead photo upload button | High | ✅ S7 | "Coming soon" treatment |
| UX-002: Silent geolocation failure | High | ✅ S7 | Graceful fallback message |
| UX-005: Blank home feed (new users) | High | ✅ S7 | Empty state + CTA |
| UX-017: /superadmin/breweries 404 | High | ✅ S7 | Page shipped |
| UX-018: /superadmin/content 404 | High | ✅ S7 | Page shipped |

---

## 📚 Requirements Index

| REQ | Title | Status | Sprint |
|-----|-------|--------|--------|
| REQ-001 | Check-in Core Flow | ✅ Shipped | S1 |
| REQ-002 | XP & Leveling System | ✅ Shipped | S2 |
| REQ-003 | Achievement System | ✅ Shipped | S2 |
| REQ-004 | Brewery Admin Dashboard | ✅ Shipped | S3 |
| REQ-005 | Pint Rewind (Brewery Recap) | 🔲 Planned | S8 |
| REQ-006 | Loyalty Program | ✅ Shipped | S3 |
| REQ-007 | Brewery Claim Flow | ✅ Shipped | S4 |
| REQ-008 | Reactions on Check-ins | 🔲 Planned | S9 |
| REQ-009 | Wishlist / Want to Try | 🔲 Planned | S9 |
| REQ-010 | Flavor Tags | ✅ Shipped | S4 (client-side cap; server-side cap S8+) |
| REQ-011 | Serving Styles | ✅ Shipped | S4 |
| REQ-012 | Superadmin Panel | ✅ Shipped | S6 |
| REQ-013 | Check-in / Review Separation | 🔲 Design phase | S8 |
| REQ-014 | Beer Permissions (brewery-only) | ✅ Shipped | S6 |
| REQ-015 | Enhanced Brewery Stats | ✅ Shipped | S6 |
| REQ-016 | Domestic Beer Achievement | 🔲 Planned | S8 stretch |
| REQ-017 | Photo Uploads | 🔲 Planned | S8 (Storage S8) |
| REQ-018 | TV Display ("The Board") | 🔲 Planned | S10 |
| REQ-019 | Toast Notifications | ✅ Shipped | S7 |
| REQ-020 | Skeleton Loaders | ✅ Shipped | S7 |
| REQ-021 | PWA / Mobile App | 🔲 In Progress | S8 (Alex leading) |
| REQ-022 | Multi-environment Infrastructure | 🔲 In Progress | S8 (Riley leading) |
| REQ-023 | Loyalty Program Editing | ✅ Shipped | S8 |
| REQ-024 | Sales / Pricing Presence | 🔲 Planned | S10 (Sales Prep Sprint) |

---

## 📣 Team Roster

| Person | Role | Joined |
|--------|------|--------|
| Morgan | Product Manager | Sprint 1 |
| Sam | Business Analyst / QA Lead | Sprint 1 |
| Alex | UI/UX Designer + Mobile Lead | Sprint 1 |
| Jordan | Dev Lead (Full Stack) | Sprint 1 |
| Riley | Infrastructure / DevOps | Sprint 2 |
| Casey | QA Engineer | Sprint 3 |
| Taylor | Sales & Revenue | Sprint 4 |
| Drew | Industry Expert (Brewery Ops) | Sprint 5 |
| Jamie | Marketing & Brand | Sprint 5 |

---

*Roadmap is a living document — updated each sprint by Morgan + Sam.*
*Questions or additions? Drop a comment or ping Morgan directly.*
