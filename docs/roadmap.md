# HopTrack Product Roadmap
**Last updated:** 2026-03-31
**PM:** Morgan
**Current Sprint:** Sprint 81 — The Challenge

> This is a living document -- updated every sprint. For completed sprints 1-12, see `docs/roadmap-archive.md`. For sprint plans, see `docs/plans/`. For the Shore It Up master plan (Sprints 64-73), see `docs/plans/sprint-64-73-master-plan.md`. For the Q2 2026 roadmap research (30 features, 18 REQs, 4 sprint arcs), see `docs/plans/roadmap-research-2026-q2.md`.

---

## Sprints 64-66 -- Phase 1: Clean House (COMPLETE)
**Theme:** Remove dead code, fix types, clean logs, organize folders

Sprint 64 (Zero Noise): 4 console.log debug leftovers standardized, `components/checkin/` renamed to `components/session/` (2 dead files deleted, 7 moved), 20+ stale docs deleted, brand docs consolidated to `docs/brand/`, strategy/ removed.

Sprint 65 (Type Safety Pt.1): Wired `Database` generic into all 3 Supabase clients (root cause of all `(supabase as any)` casts), 16 new table types registered in Database interface, `types/supabase-helpers.ts` created, `(supabase as any)` eliminated from 63 files (→ 0), `UserAvatar` made null-safe, components `as any` reduced from 8 → 1.

Sprint 66 (Folder Surgery): `docs/` restructured — `plans/`, `archive/`, `brand/` dirs created, 22 sprint plans moved, stale docs archived. `.env.local.example` updated with `ANTHROPIC_API_KEY`.

---

## Sprints 67-70 -- Phase 2: Document Everything (COMPLETE)

Sprint 67 (README & Onboarding): Comprehensive README.md, CONTRIBUTING.md, supabase/migrations/README.md, roadmap update.

Sprint 68 (API Reference): All 57 endpoints documented.

Sprint 69 (Architecture): System map — auth, RLS, feed, HopRoute AI, theme, animation.

Sprint 70 (Requirements & Brand): Close every REQ, finalize brand guide, update sales docs.

---

## Sprints 71-73 -- Phase 3: Harden & Ship (COMPLETE)

Sprint 71 (Type Safety Pt.2): Remaining Database types added. Build errors fixed across 8 files.

Sprint 72 (Test & Performance): `npm run build` passes clean. 64 pages, 0 errors.

Sprint 73 (Final Audit): Sprint history + CLAUDE.md updated, 10-sprint retro delivered.

---

## Sprint 74 -- First Impressions (COMPLETE ✅)
**Theme:** Brewery onboarding wizard + push notification wiring
**Plan:** `docs/plans/sprint-74-plan.md` | **Retro:** `docs/retros/sprint-74-retro.md`

Brewery Onboarding Wizard (4-step: Logo → Beers → Loyalty → Board Preview). Auto-shows for freshly claimed breweries. Push notification wiring — Messages API fires Web Push via `sendPushToUser()`. Rate limited (5/hr). Push count shown in toast feedback. Also produced: comprehensive Q2 2026 roadmap research (30 features, 18 REQs, 4 sprint arcs through Sprint 96).

---

## Sprint 75 -- Revenue Plumbing (COMPLETE ✅)
**Theme:** Complete Stripe billing + email infrastructure
**Arc:** Launch or Bust (Sprints 75-78)
**Plan:** `docs/plans/sprint-75-plan.md`

Complete Stripe Billing: annual pricing toggle (Tap $470/yr, Cask $1,430/yr — 20% savings), in-app cancel/downgrade UI with AnimatePresence confirmation, webhook hardening (payment_failed, invoice.paid, trial_will_end events). Email Infrastructure: Resend integration with dev-mode fallback, 6 branded email templates (welcome, brewery-welcome, trial-warning, trial-expired, password-reset, weekly-digest), drip trigger system wired to sign-up + brewery claim + password reset flows. REQ-069 (Enhanced KPIs) and REQ-070 (Menu Uploads) queued as future requirements.

---

## Sprint 76 -- The Safety Net (COMPLETE ✅)
**Theme:** CI/CD pipeline + staging environment documentation
**Arc:** Launch or Bust (Sprints 75-78)
**Plan:** `docs/plans/sprint-76-plan.md` | **Retro:** `docs/retros/sprint-76-retro.md`

GitHub Actions CI/CD (lint + type check + build + E2E soft-fail). Staging environment documentation. Node 22, npm cache.

---

## Sprint 77 -- The Countdown (COMPLETE ✅)
**Theme:** Unit test framework + launch checklist burndown
**Arc:** Launch or Bust (Sprints 75-78)
**Plan:** `docs/plans/sprint-77-plan.md` | **Retro:** `docs/retros/sprint-77-retro.md`

Vitest configured (39 unit tests across 4 files). Vitest added to CI. Cookie consent banner. JSON-LD structured data on brewery pages. Launch checklist audited (44%→56%). Auth rate limit audit. Launch day ops documented. Business formation guide.

---

## Sprint 78 -- The Database (COMPLETE ✅)
**Theme:** Seed database with real US brewery and beer data
**Arc:** Launch or Bust (Sprints 75-78)
**Plan:** `docs/plans/sprint-78-plan.md` | **Retro:** `docs/retros/sprint-78-retro.md`

7,177 US breweries seeded from Open Brewery DB (all 50 states + DC, 5,513 with GPS). 2,361 beers from Kaggle Beer Study (541 breweries matched, 26 canonical styles). Explore page upgraded (200 initial + Load More pagination). Search by name, city, state, or zip code. Duplicate Reviews heading fixed. CI lint fixed (no-explicit-any disabled). Beer deduplication (migration 050). Reusable fetch scripts in `scripts/`.

---

## Sprint 79 — Brewery Value + The Barback Pilot (COMPLETE ✅)
**Theme:** Show brewery owners ROI + pilot AI beer data crawler
**Arc:** Stick Around (Sprints 79-84)
**Plan:** `docs/plans/sprint-79-plan.md`

**F-007: Weekly Digest Emails** — Automated weekly email to brewery owners with check-ins, top beers, loyalty redemptions, new followers, week-over-week comparison. Cron endpoint (`/api/cron/weekly-digest`) secured by CRON_SECRET, GitHub Actions weekly schedule (Monday 9am ET). `onWeeklyDigest()` trigger added. Shared `calculateDigestStats()` function.

**F-010: ROI Dashboard Card** — `ROIDashboardCard` server component on brewery dashboard showing loyalty-driven ROI. Hero number (ROI multiple for paid tiers, dollar estimate for free), 4-week sparkline, 3-stat grid (repeat visits / est. revenue / trend). `lib/roi.ts` calculation engine. Handles all edge cases (no loyalty program, no data, free tier).

**The Barback — AI Beer Crawler Pilot** — Foundation for AI-powered brewery website crawling. Migration 051: `crawl_sources`, `crawl_jobs`, `crawled_beers` tables + provenance columns on `beers`/`breweries`. `scripts/barback-crawl.mjs`: fetches brewery websites, strips HTML, sends to Claude Haiku for structured beer extraction, stages results for manual review. Charlotte NC metro pilot (50 breweries). Superadmin review UI at `/superadmin/barback/` with approve/reject/batch controls. robots.txt compliance, SHA-256 dedup, 2s rate limiting, circuit breaker. REQ-071 written (Sam), architecture doc written (Jordan).

---

## Sprint 81 — The Challenge ✅ (2026-03-31)
**Theme:** Brewery-created challenges that drive repeat visits
**Arc:** Stick Around (Sprints 79-84)

**Challenges System (F-009)** — Full-stack brewery challenge platform. Brewery admins create challenges (4 types: beer_count, specific_beers, visit_streak, style_variety) with rewards (XP + loyalty stamps + custom description). Consumers join challenges from the brewery detail page, progress tracked automatically on every session end. Challenge completions surface in the Friends feed.

- Migration 054: `challenges` + `challenge_participants` tables, RLS on both (public read for active challenges, brewery-admin write, user-owned progress).
- Brewery admin `/challenges/` page: list with live stats (participants, completions), inline create/edit form with icon picker + type selector + beer picker (for specific_beers), pause/activate/delete with AnimatePresence confirmation.
- Consumer brewery detail: `BreweryChallenges` section with progress bars, completion badges, `ChallengeDetailDrawer` slide-up with join CTA.
- Session-end API wired: auto-advances all active user challenges at session close. Handles beer_count (cumulative distinct beers), specific_beers (subset match), visit_streak (total visits), style_variety (cumulative distinct styles). Awards XP + loyalty stamps on completion.
- Feed: `ChallengeFeedCard` for friend completions in Friends tab. `fetchFriendChallengeCompletions()` in `lib/queries/feed.ts`. `FeedItem` union extended with `challenge_completion` type.
- Vitest: 29/29 tests passing (`lib/__tests__/challenges.test.ts`) — validation, progress %, completion detection, type labels, reward formatting.
- Nav: Challenges added to `BreweryAdminNav` (Trophy icon).
- API: 5 routes — `GET/POST/PATCH/DELETE /api/brewery/[brewery_id]/challenges`, `GET /api/brewery/[brewery_id]/challenges/participants`, `POST /api/challenges/join`, `GET /api/challenges/my-challenges`.

**Key changes from Sprint 81:**
- `supabase/migrations/054_challenges_system.sql` — NEW: challenges + challenge_participants tables, indexes, RLS
- `app/api/brewery/[brewery_id]/challenges/route.ts` — NEW: CRUD (GET/POST/PATCH/DELETE)
- `app/api/brewery/[brewery_id]/challenges/participants/route.ts` — NEW: participant stats
- `app/api/challenges/join/route.ts` — NEW: consumer join
- `app/api/challenges/my-challenges/route.ts` — NEW: user's challenge list
- `app/api/sessions/[id]/end/route.ts` — UPDATED: challenge progress tracking wired in, `completedChallenges` in response
- `app/(brewery-admin)/brewery-admin/[brewery_id]/challenges/page.tsx` — NEW: server page
- `app/(brewery-admin)/brewery-admin/[brewery_id]/challenges/ChallengesClient.tsx` — NEW: full admin UI
- `components/brewery-admin/BreweryAdminNav.tsx` — UPDATED: Challenges nav item added
- `components/brewery/BreweryChallenges.tsx` — NEW: consumer challenge section + detail drawer
- `app/(app)/brewery/[id]/page.tsx` — UPDATED: challenge data fetch + BreweryChallenges section
- `components/social/ChallengeFeedCard.tsx` — NEW: friend completion feed card
- `lib/queries/feed.ts` — UPDATED: `fetchFriendChallengeCompletions()` added
- `app/(app)/home/FeedItemCard.tsx` — UPDATED: `challenge_completion` type + render
- `app/(app)/home/HomeFeed.tsx` — UPDATED: friendChallengeCompletions prop + feed assembly
- `app/(app)/home/page.tsx` — UPDATED: fetchFriendChallengeCompletions wired in
- `lib/__tests__/challenges.test.ts` — NEW: 29 tests (validation, progress, completion, labels, rewards)

---

## Backlog

| # | Item | Notes | Source |
|---|------|-------|--------|
| BL-001 | Deduplication logic (beers + breweries) | Prevent future duplicates at DB level — unique constraint on (brewery_id, LOWER(name)) for beers, (LOWER(name), city, state) for breweries | Sprint 78 |
| BL-002 | Closed brewery memorial mode | Closed breweries stay visible with their history (beers, reviews, sessions) but are clearly marked closed. Restrict all edits unless reopened. "Remember what they offered." | Sprint 78 |
| BL-003 | Incomplete beer data handling | Flag beers with suspect data (e.g., 0.1% ABV). Show "Brewery needs to add details" badge. Encourage owners to claim and update. | Sprint 78 |
| BL-004 | Lint cleanup pass | 74 pre-existing lint errors (unescaped entities, React hooks issues). Not blocking but CI shows failures. | Sprint 78 |

---

## Q2 2026 Roadmap — Sprint Arcs (PLANNED)
**Research:** `docs/plans/roadmap-research-2026-q2.md`

| Arc | Sprints | Theme | Key Features |
|-----|---------|-------|-------------|
| Launch or Bust | 75-78 | Revenue plumbing, first brewery | Stripe billing stub, email infra stub, CI/CD, staging, launch prep |
| Stick Around | 79-84 | Retention | Weekly digests, ROI dashboard, challenges, Wrapped, smart push, HopRoute autocomplete |
| Open the Pipes | 85-90 | Integrations | POS (Toast/Square), barcode scanning, CRM, public API |
| The Flywheel | 91-96 | Revenue flywheel | Sponsored challenges, mug clubs, ad engine, promotion hub, multi-location |

---

## Sprint 13 -- Consumer Delight & Social (COMPLETE)
**Theme:** Make the consumer app sticky and shareable
**Plan:** `docs/sprint-13-plan.md` | **Retro:** `docs/retros/sprint-13-retro.md`

12 features shipped: beer wishlist, passport, friends feed, session share card, push notifications MVP, Beer of the Week, streak system, style badges, Sentry, checkins deprecation plan, REQ backfill, migrations 009-011.

---

## Sprint 14 -- Clean House, Open Doors (COMPLETE)
**Theme:** Kill the legacy, ship real push notifications, close the first deal
**Plan:** `docs/sprint-14-plan.md` | **Retro:** `docs/retros/sprint-14-retro.md`

15 deliverables shipped: checkins reads migrated, writes disabled (410 Gone), Web Push, notification preferences, style badges (50 total), profile empty states, feed polish, share card upgrades, explore filters, Capacitor installed, claim flow trial badge, privacy policy, App Store prep. Migrations 012-013.

---

## Sprint 15 -- Walk the Floor (COMPLETE)
**Theme:** Validation, QA audit, fix what they find
**Plan:** `docs/sprint-15-plan.md` | **Retro:** `docs/retros/sprint-15-retro.md`

Shipped: dead code deletion (CheckinCard + CheckinModal), friend Accept/Decline, friend search + Add Friend, 13 loading.tsx skeletons, error.tsx boundaries (3 route groups), "check-in" copy replaced with session/visit, /session/[id] share page, profile photo upload, FriendButton on profiles, onboarding card, claim trial badge. Migration 015 written.

---

## Sprint 16 -- Turn It Up (COMPLETE)
**Theme:** New consumer features + brewery dashboard polish
**Plan:** `docs/sprint-16-plan.md` | **Retro:** `docs/retros/sprint-16-retro.md`

Shipped: VAPID keys, migrations 014-015 applied, session comments, The Board TV display, drag-to-reorder tap list, analytics upgrades, notification actions, domestic beer achievements (52 total), loyalty dashboard enhancements, brewery events CRUD + consumer views. Migrations 014-021.

---

## Sprint 17 -- Polish & Prove It (COMPLETE)
**Theme:** Fix what's broken, make it beautiful, get it demo-ready
**Plan:** `docs/sprint-17-plan.md`

Shipped: DiceBear avatars, avatar clipping fix, profile hero polish, friends management rebuild (unfriend, cancel sent), "Start Session" nav CTA, Board chalk board redesign, demo seed data (3 Asheville breweries, 20 beers), loyalty_redemptions table. Migration 022-024.

---

## Sprint 18 -- The Board: Cream Menu Redesign (COMPLETE)
**Retro:** `docs/retros/sprint-17-18-retro.md`

Complete typographic redesign of The Board. Instrument Serif italic headers, Playfair Display beer names, gold dotted leaders, BOTW hero section, per-beer stats, auto-scroll. Migrations 025-027.

---

## Sprint 19 -- The Pour (COMPLETE)
**Retro:** `docs/retros/sprint-19-retro.md`

20 glass type SVGs in `lib/glassware.ts`, glass picker in tap list admin, glass SVGs on Board, horizontal size chips, flight support, pour sizes API. Migrations 028-029.

---

## Sprints 20-21 -- Close It / All of It (COMPLETE)
**Plan:** `docs/sprint-21-plan.md`

ActiveSessionBanner live timer, explore URL params, beer-themed empty states, SessionCard tooltips, modal focus trap, Board settings preview, tap list unsaved changes guard, paginated brewery sessions, QR Table Tents (3 formats), brewery welcome bridge page.

---

## Sprint 22 -- The Mark (COMPLETE)

HopMark identity system (4 variants, 5 themes), deployed across app. Friends Live (DrinkingNow) with 60s polling + privacy toggle. Session start notifications. Logo bug fixes.

---

## Sprint 23 -- Bug Bash (COMPLETE)
**Retro:** `docs/retros/sprint-23-retro.md`

16 fixes: brewery reviews system, avatars storage bucket + RLS, hardcoded color sweep, API error handling, accessibility improvements, DarkCardWrapper cleanup. Migrations 030-031.

---

## Sprints 24-26 -- Avatar Fix / Rate & Relate / The Glow-Up (COMPLETE)
**Retro:** `docs/retros/sprint-27-retro.md`

Avatar seed fix, StarRating bug fix, beer reviews system, BreweryRatingHeader, beer log PATCH API, session recap v2 (rate-these split), feed card visual refresh, welcome card slim-down, filter tab redesign, SessionComments redesign, brewery admin 404 fix. Migration 032.

---

## Sprint 27 -- Three-Tab Feed (COMPLETE)
**Retro:** `docs/retros/sprint-27-retro.md`

Complete HomeFeed rewrite: Friends/Discover/You tabs. FeedTabBar with spring animation. AchievementFeedCard, StreakFeedCard. DrinkingNow renamed "Live Now". You tab: profile hero, XP bar, Taste DNA, achievements, wishlist, passport. Discover tab: BOTW, Trending, Events, New Breweries. Migration 033 (CRITICAL: brewery_id text->uuid FK fix).

---

## Sprint 28 -- Feed Spec Implementation (COMPLETE)
**Retro:** `docs/retros/sprint-28-retro.md`

3 new card types: RecommendationCard, NewFavoriteCard, FriendJoinedCard. 2 Discover sections: SeasonalBeersScroll, CuratedCollectionsList. BOTW compact banner on Friends tab. Scroll position memory. Hydration fix (SessionRecapSheet dynamic import).

---

## Sprint 29 -- Your Round (COMPLETE)
**Retro:** `docs/retros/sprint-29-retro.md`

ReactionBar component (cheers toggle + comment count + share). Reaction counts API batch query. Seed 011 "Your Round" demo data. Explicit FK hint on feed queries. Dead checkins references cleaned from seeds.

---

## Sprint 30 -- Foundation Fix (COMPLETE)
**Theme:** Kill every P0, fix the RLS layer, ship a product that actually works
**Plan:** `docs/sprint-30-plan.md` | **Retro:** `docs/retros/sprint-29-retro.md`

85-issue testing audit. 12 P0s + 20 P1s killed. Hardcoded color sweep. `timeAgo` consolidation. Migrations 034-035.

---

## Sprint 31 -- Launch Polish (COMPLETE)
**Theme:** P1 cleanup, code quality, revenue readiness
**Plan:** `docs/sprint-31-plan.md` | **Retro:** `docs/retros/sprint-31-retro.md`

HomeFeed split (1318→6 files), ReactionContext, feed queries to `lib/queries/feed.ts`, infinite scroll, password reset, username uniqueness, billing page, brewery onboarding, XP atomic RPC, session-end batch rewrite, Playwright scaffolded. Migrations 034-036.

---

## Sprint 32 -- The Vibe (COMPLETE)
**Plan:** `docs/sprint-32-plan.md` | **Retro:** `docs/retros/sprint-32-retro.md`

Brewery follows, recommendation engine, activity heatmap, cheers animations, geolocation, notification grouping, customer insights page, session photos, session complete redesign. Migration 037.

---

## Sprint 33 -- The Recap (COMPLETE)
**Plan:** `docs/sprint-33-plan.md`

Session recap v3 (cream reskin), mobile branding header, beer stats in recap, session photos carousel, `/api/beer-logs/stats` endpoint.

---

## Sprints 34-36 -- Own Your Data / Social Layer / Close the Loop (COMPLETE)
**Plans:** `docs/sprint-34-plan.md` through `docs/sprint-36-plan.md`

Customer export CSV, superfans VIP highlight, tap list performance analytics, referral system, group sessions V1, HopTrack Report page, beer lists (tables), @ mentions, wishlist-to-tap matching, brewery leaderboard.

---

## Sprint 37 -- Grow Together (COMPLETE)
**Plan:** `docs/sprint-37-plan.md`

Referrals, group sessions V1, HopTrack Report page, beer list URLs. Migrations 038-039.

---

## Sprints 38-40 -- Audit & Harden / HopRoute Phase 1 / HopRoute Live (COMPLETE)
**Plans:** `docs/sprint-38-plan.md` through `docs/sprint-40-plan.md` | **Retro:** `docs/retros/sprint-38-40-retro.md`

10 audit fixes (XP race condition, N+1 mentions, friendship validation, rate limits on 4 endpoints, leaderboard page). HopRoute AI-powered brewery crawl planner end-to-end (generate → live mode → achievements). Brewery promotions tab (vibe tags, sponsored stops). Migrations 040-041.

---

## Sprints 41-50 -- Make It Crisp (COMPLETE ✅)
**Master Plan:** `docs/sprint-41-50-master-plan.md`
**Current Sprint:** Sprint 50 — Ship It ✅

| Sprint | Theme | One-Liner |
|--------|-------|-----------|
| **41** ✅ | Crystal Clear | Fix HopRoute data, seed 60+ real breweries, visual cohesion audit |
| **42** ✅ | Smooth Operator | Workflow polish, every user action intuitive, onboarding redesign |
| **43** ✅ | The Dashboard | Brewery admin = sales demo, customer messaging, review responses |
| **44** ✅ | Lock It Down | E2E tests, rate limit expansion, edge functions, Supabase type gen |
| **45** ✅ | Social Glue | Beer lists UI, group sessions UI, brewery leaderboard on Board |
| **46** ✅ | Revenue Ready | Stripe integration, trial conversion, sales demo mode |
| **47** ✅ | The Feel | Micro-interactions, animations, accessibility audit |
| **48** ✅ | Smart & Personal | Recommendation engine v2, insights, personalization |
| **49** ✅ | Scale Prep | Query audit, caching, multi-tenant security, staging env |
| **50** ✅ | Ship It | Launch checklist, App Store, first 10 breweries, launch party |

---

## Infrastructure Roadmap (Riley + Quinn)

| Item | Status |
|------|--------|
| Supabase project + migrations + RLS | COMPLETE |
| proxy.ts (replaces middleware.ts) | COMPLETE |
| Superadmin role + audit logging | COMPLETE |
| PWA manifest + service worker | COMPLETE |
| Sentry error monitoring | COMPLETE (S13) |
| Full Web Push (VAPID keys + push) | COMPLETE (S16) |
| Supabase Storage buckets + RLS | COMPLETE (S23) |
| Realtime subscriptions (TV display) | COMPLETE (S16) |
| 50 migrations applied (001-050) | COMPLETE (S78) |
| Rate limiting (in-memory, 6 endpoints) | COMPLETE (S38) |
| Supabase type generation | Planned (S44) |
| Staging Supabase project | Planned (S49) |
| Supabase Edge Functions (session-end) | Planned (S44) |
| Email (Resend integration) | Planned (S43) |
| Stripe billing integration | COMPLETE (S46+S75) |
| Email infrastructure (Resend) | COMPLETE (S75) |
| CI/CD (GitHub Actions) | COMPLETE (S76) |
| Vitest unit tests (39 tests) | COMPLETE (S77) |
| US brewery seed (7,177 from Open Brewery DB) | COMPLETE (S78) |
| US beer seed (2,361 from Kaggle) | COMPLETE (S78) |

---

## Mobile App Roadmap (Alex)

| Phase | Status |
|-------|--------|
| PWA -- manifest, service worker, icons | COMPLETE |
| iOS safe area + 44pt tap targets | COMPLETE |
| Capacitor installed + configured | COMPLETE (S14) |
| TestFlight submission | Blocked (Apple Developer account) |
| App Store submission | Blocked (depends on TestFlight) |

---

## Revenue Milestones (Taylor)

| Milestone | Status |
|-----------|--------|
| `/for-breweries` pricing page live | COMPLETE |
| Sales docs + playbook | COMPLETE (S17) |
| First paid brewery ($49 Tap tier) | In progress -- warm intros via Drew's Asheville network |
| 50 paid breweries ($2,450 MRR) | 3 months post-launch |
| 500 paid breweries ($75K MRR) | 6 months post-launch |

**Tiers:** Tap $49/mo | Cask $149/mo | Barrel custom

---

## Requirements Index

| REQ | Title | Status | Sprint |
|-----|-------|--------|--------|
| REQ-001 | Check-in Core Flow (now Sessions) | COMPLETE | S1-S10 |
| REQ-002 | XP and Leveling System | COMPLETE | S2 |
| REQ-003 | Achievement System (52 achievements) | COMPLETE | S2-S16 |
| REQ-004 | Brewery Admin Dashboard | COMPLETE | S3-S16 |
| REQ-005 | Pint Rewind (Brewery + Customer) | COMPLETE | S8-S12 |
| REQ-006 | Loyalty Program | COMPLETE | S3-S17 |
| REQ-007 | Brewery Claim Flow | COMPLETE | S4-S14 |
| REQ-008 | Reactions / Cheers | COMPLETE | S9-S29 |
| REQ-009 | Wishlist / Want to Try | COMPLETE | S13 |
| REQ-010 | Flavor Tags / Taste DNA | COMPLETE | S2-S27 |
| REQ-011 | Serving Styles / Glassware | COMPLETE | S19 |
| REQ-012 | Superadmin Panel | COMPLETE | S6 |
| REQ-013 | Beer Passport | COMPLETE | S13 |
| REQ-014 | Beer Permissions | COMPLETE | S6 |
| REQ-015 | Enhanced Brewery Stats | COMPLETE | S6-S16 |
| REQ-016 | Domestic Beer Achievement | COMPLETE | S16 |
| REQ-017 | Photo Uploads | COMPLETE | S12-S23 |
| REQ-018 | TV Display ("The Board") | COMPLETE | S16-S19 |
| REQ-019 | Toast Notifications | COMPLETE | S7 |
| REQ-020 | Skeleton Loaders (~95% coverage) | COMPLETE | S7-S15 |
| REQ-021 | PWA / Mobile App | IN PROGRESS | S8-S14 |
| REQ-022 | Multi-environment Infra | IN PROGRESS | -- |
| REQ-023 | Loyalty Program Editing | COMPLETE | S8 |
| REQ-024 | Sales / Pricing Presence | COMPLETE | S8 |
| REQ-025 | Sessions and Tap Wall | COMPLETE | S10-S11 |
| REQ-026 | Web Push Notifications | COMPLETE | S14-S16 |
| REQ-027 | Social Feed (Three-Tab) | COMPLETE | S13-S29 |
| REQ-028 | Session Comments | COMPLETE | S16-S25 |
| REQ-029 | Brewery Events | COMPLETE | S16 |
| REQ-030 | Brewery Reviews | COMPLETE | S23 |
| REQ-031 | Beer Reviews | COMPLETE | S25 |
| REQ-032 | Session Recap V2 | COMPLETE | S25-S26 |
| REQ-033 | HopMark Identity System | COMPLETE | S22 |
| REQ-034 | QR Table Tents | COMPLETE | S21 |
| REQ-035 | Brewery Welcome Bridge Page | COMPLETE | S21 |
| REQ-036 | Friends Live (Drinking Now) | COMPLETE | S22 |
| REQ-037 | Glassware Illustrations (20 types) | COMPLETE | S19 |
| REQ-038 | Pour Size Pricing | COMPLETE | S19 |
| REQ-039 | Feed Card Types (7 types) | COMPLETE | S27-S28 |
| REQ-040 | Drag-to-Reorder Tap List | COMPLETE | S16 |
| REQ-041 | Friend Management (full lifecycle) | COMPLETE | S15-S17 |
| REQ-042 | Error Boundaries + Sentry | COMPLETE | S15-S23 |
| REQ-043 | Onboarding Card | COMPLETE | S15-S25 |

| REQ-044 | HopRoute AI Crawl Planner | COMPLETE | S39-S40 |
| REQ-045 | Customer Export + Superfans | COMPLETE | S34-S36 |
| REQ-046 | Brewery Leaderboard | COMPLETE | S38 |
| REQ-047 | Referral System | COMPLETE | S37 |
| REQ-048 | Group Sessions V1 | COMPLETE | S37 |
| REQ-049 | Beer Lists (tables) | COMPLETE | S37 |
| REQ-050 | @ Mentions | COMPLETE | S37 |

| REQ-069 | Enhanced KPIs & Analytics (Drinker + Brewery) | QUEUED | Stick Around (79-84) |
| REQ-070 | Non-Beer Menu Uploads for Breweries | QUEUED | Launch or Bust (75-78) / Stick Around (79-84) |

**Score:** 48 of 52 requirements COMPLETE. 2 IN PROGRESS (PWA TestFlight, staging infra). 2 QUEUED (REQ-069, REQ-070).

---

## Team Roster

| Person | Role | Joined |
|--------|------|--------|
| Morgan | Product Manager | Sprint 1 |
| Sage | PM Assistant | Sprint 30 |
| Sam | Business Analyst / QA Lead | Sprint 1 |
| Alex | UI/UX Designer + Mobile Lead | Sprint 1 |
| Jordan | Architecture Lead (promoted S30) | Sprint 1 |
| Avery | Dev Lead | Sprint 30 |
| Riley | Infrastructure / DevOps | Sprint 2 |
| Quinn | Infrastructure Engineer | Sprint 30 |
| Casey | QA Engineer | Sprint 3 |
| Reese | QA & Test Automation | Sprint 30 |
| Taylor | Sales & Revenue | Sprint 4 |
| Drew | Industry Expert (Brewery Ops) | Sprint 5 |
| Jamie | Marketing & Brand | Sprint 5 |

## Team Expansion Plan

| Priority | Role | Hire Trigger |
|----------|------|-------------|
| 1st | Customer Success / Onboarding Lead | First paid brewery closes |
| 2nd | Growth / SEO Lead | Pre-scale push (500 brewery target) |
| 3rd | Analytics / Data Engineer | ~20-50 active paying breweries |

---

*Roadmap is a living document -- updated each sprint by Morgan + Sam.*
*For sprint history (Sprints 1-12), see `docs/roadmap-archive.md`.*
*Full documentation audit: `docs/documentation-audit.md` (2026-03-29).*
