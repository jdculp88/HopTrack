---
name: hoptrack-codebase-map
description: HopTrack codebase navigation map and key file locations — route groups, shared libraries, utilities, type definitions, migrations, and documentation. Use whenever navigating the project, searching for a specific utility or helper, trying to find where a feature lives, answering "where does X live", understanding file structure, or making any code change that requires knowing the conventions for where things go. Loads automatically for codebase exploration questions even if the user doesn't explicitly ask for a file map.
---

# HopTrack Codebase Map

The source-of-truth map of where everything lives in the HopTrack codebase. Use this before searching blindly — the answer is usually here.

## Route Groups (Next.js 16 App Router)

```
app/(app)/                    — Consumer app (feed, explore, profile, beer detail, brewery detail)
app/(auth)/                   — Login, signup, password reset, auth callbacks
app/(brewery-admin)/          — Brewery owner dashboard (tap list, analytics, settings, loyalty, board)
app/(superadmin)/             — Platform admin (command center, user detail, brewery detail, barback, moderation)
app/api/                      — 66+ API endpoints (route.ts files)
app/api/v1/                   — Public API v1 (versioned, rate-limited, API key auth)
app/og/                       — Dynamic OG image routes (edge runtime)
```

## Key Components

```
components/session/           — Session check-in flow (renamed from checkin/ in S64)
components/social/            — Feed cards (SessionCard, RatingCard, AchievementFeedCard, etc.)
components/ui/                — Shared primitives (Card, Pill, PillTabs, Button, Modal, FormField, etc.)
components/brewery-admin/     — Brewery owner dashboard components
components/superadmin/        — Platform admin components
components/achievements/      — Achievement badges, celebrations, progress rings
components/profile/           — Profile page components (BeerDNACard, PersonalityBadge, etc.)
components/theme/             — ThemeProvider (dark/light/oled), ThemeToggle
components/layout/            — AppNav, BreweryAdminNav, mobile nav
components/onboarding/        — WelcomeFlow, OnboardingChecklist, BrandOnboardingWizard
```

## Core Libraries

```
lib/supabase/                 — Server + client createClient() wrappers
lib/glassware.ts              — 20 glass SVGs, PourSize interface, getGlassSvgContent()
lib/beerStyleColors.ts        — 26 styles → 6 color families, getStyleFamily(), getStyleVars()
lib/personality.ts            — 4-axis Beer Personality system (S162)
lib/animation.ts              — Canonical spring configs, transitions, stagger presets
lib/api-helpers.ts            — requireAuth, requireBreweryAdmin, requirePremiumTier (S134)
lib/api-response.ts           — apiSuccess, apiError, apiUnauthorized, apiForbidden (S107)
lib/api-keys.ts               — Public API v1 key generation + validation (S85)
lib/first-name.ts             — getFirstName() utility (S134)
lib/stripe.ts                 — STRIPE_PRICES, TIER_INFO, lazy getStripe(), isStripeConfigured()
lib/email.ts                  — Resend integration + template renderer
lib/email-templates/          — 6 branded email templates (welcome, brewery-welcome, digest, etc.)
lib/email-triggers.ts         — onUserSignUp, onBreweryClaim, onTrialWarning, onWeeklyDigest
lib/crm.ts                    — Customer segments, engagement scoring, profile builder (S89)
lib/brand-crm.ts              — Brand-level cross-location CRM (S129)
lib/brand-auth.ts             — Brand access verification with brewery_accounts fallback (S123)
lib/brand-billing.ts          — Brand tier propagation (S121)
lib/brand-loyalty.ts          — Brand-wide loyalty programs (S125)
lib/brand-catalog.ts          — Brand-level beer catalog (S119)
lib/kpi.ts                    — Brewery + drinker KPI calculations (S124)
lib/brewery-health.ts         — 0-100 health score for single brewery (S159)
lib/win-back.ts               — At-risk regulars win-back identification (S159)
lib/brewery-benchmarks.ts     — Anonymous peer benchmarking (S159)
lib/digest-recommendations.ts — 6 rule-based recommendation types for weekly digest (S159)
lib/superadmin-intelligence.ts — 8 novel KPI engines (Magic Number, Health, Predictive) (S158)
lib/superadmin-metrics.ts     — Command center data aggregation (S136)
lib/superadmin-brewery-list.ts — Superadmin breweries list engine (S143)
lib/superadmin-brewery.ts     — Superadmin brewery detail page engine (S140)
lib/superadmin-user.ts        — Superadmin consumer account detail engine (S142)
lib/superadmin-stats.ts       — Platform stats engine (S143)
lib/pos-crypto.ts             — AES-256-GCM token encryption for POS (S86)
lib/pos-sync/                 — POS sync engine: engine, mapper, normalizer, types, mock (S87)
lib/ai-promotions.ts          — AI promotion suggestions via Claude Haiku (S146)
lib/recommendations.ts        — Smart beer recommendations + AI version (S146)
lib/win-back.ts               — Win-back candidates + message templates (S159)
lib/pint-rewind.ts            — PintRewind data aggregation (extracted S93)
lib/wrapped.ts                — Wrapped stats + fetchWrappedStatsForRange (extracted S93)
lib/your-round.ts             — 7-day rolling weekly recap (S162)
lib/temporal.ts               — Day-of-week + hour aggregation with timezone support (S162)
lib/percentiles.ts            — Bucket-based percentile computation (S162)
lib/share.ts                  — OG image URLs + share text templates (S162)
lib/brand.ts                  — Brand color/font/dimension constants for OG routes (S162)
lib/schemas/                  — Zod validation schemas (common, sessions, profiles, leaderboard)
lib/queries/feed.ts           — Feed query builder (server-side)
lib/constants/tiers.ts        — TIER_COLORS, TIER_STYLES, RANK_STYLES, CATEGORY_LABELS (S134)
lib/constants/ui.ts           — PILL_ACTIVE, PILL_INACTIVE, INPUT_STYLE (S134)
lib/brewery-utils.ts          — formatPhone, formatCity, formatState, normalizeAddress, US_STATES
lib/brand-utils.ts            — Brand slug generation, validation
lib/cached-data.ts            — Cached Supabase query helpers (S158)
lib/cache-invalidation.ts     — revalidateTag helpers (S158)
```

## Hooks

```
hooks/useHaptic.ts            — 6 haptic presets (tap/press/selection/success/error/celebration)
hooks/useDetentSheet.ts       — iOS-style 3-detent bottom sheet (peek/half/full)
hooks/useOptimisticToggle.ts  — Optimistic UI toggle with rollback
hooks/useDeleteConfirmation.ts — Inline delete confirmation with AnimatePresence
hooks/useLongPress.ts         — Long-press detection with haptic + didFire (S161)
hooks/useOnlineStatus.ts      — Online/offline detection
hooks/useInstallPrompt.ts     — PWA install prompt (beforeinstallprompt + 7-day dismiss)
hooks/usePullToRefresh.ts     — Pull-to-refresh gesture handling
hooks/useRealtimeSubscription.ts — Supabase Realtime generic subscription hook
hooks/useBreweryPresence.ts   — Supabase Presence for "drinking now" strip
hooks/useTabUrlSync.ts        — URL query param sync for PillTabs
hooks/useScrollMemory.ts      — Per-tab scroll position persistence
```

## Types & Supabase

```
types/database.ts             — Supabase schema types (all tables registered)
types/supabase-helpers.ts     — Common join shapes, ProfileSummary, BeerSummary, SessionWithJoins
supabase/migrations/          — DB migrations, run in order, see README.md
supabase/functions/           — Supabase Edge Functions
supabase/seeds/               — Seed SQL files (seeds 001-014)
```

## Configuration

```
next.config.ts                — Next.js config (CORS, cacheComponents, Sentry)
tsconfig.json                 — TypeScript config (strict, @/* alias)
tailwind.config.ts            — Not used — Tailwind v4 uses CSS-first @theme in globals.css
app/globals.css               — All design tokens, card-bg-* classes, theme variables
vitest.config.ts              — Vitest test runner config
playwright.config.ts          — E2E test config
.env.local.example            — Env var template (copy to .env.local)
.env.production.example       — Production env var audit
```

## Documentation

```
docs/roadmap.md               — SOURCE OF TRUTH for what we're building
docs/sprint-history.md        — Full sprint-by-sprint narrative (Sprints 1-73+)
docs/API-REFERENCE.md         — All 57 endpoints documented (S68)
docs/ARCHITECTURE.md          — Full system map (S69)
docs/launch-checklist.md      — 124-item launch checklist
docs/launch-day-ops.md        — Launch day runbook + incident response
docs/plans/                   — Sprint plans and deferred options
docs/retros/                  — Sprint retros and roasts (sprint-NNN-retro.md)
docs/requirements/            — REQ-XXX numbered requirements docs (Sam's domain)
docs/sales/                   — GTM, pitch guide, pricing, target breweries (Taylor's domain)
docs/brand/                   — Brand guide, Apple app plan (Jamie's domain)
docs/archive/                 — Stale docs preserved for reference
```

## Scripts

```
scripts/seed-next-day.mjs     — Advance Pint & Pixel seed data one day forward (sprint close)
scripts/supabase-setup.mjs    — One-time Supabase setup script
scripts/fetch-breweries.mjs   — Open Brewery DB API fetcher (used in S78)
scripts/fetch-beers.mjs       — Kaggle Beer Study CSV fetcher (used in S78)
scripts/barback-crawl.mjs     — AI beer crawler pilot (S79)
scripts/cleanup-future-seeds.mjs — Seed data date cleanup utility
```

## CI/CD & GitHub Actions

```
.github/workflows/ci.yml                  — Main CI (lint, types, tests, build, E2E)
.github/workflows/staging.yml             — Staging deploy CI
.github/workflows/trial-lifecycle.yml     — Daily trial lifecycle cron (disabled S173)
.github/workflows/onboarding-drip.yml     — Daily onboarding email drip (disabled S173)
.github/workflows/weekly-digest.yml       — Weekly digest emails (disabled S173)
.github/workflows/ai-suggestions.yml      — Weekly AI promotion suggestions (disabled S173)
.github/workflows/stats-snapshot.yml      — Daily stats snapshot cron (disabled S173)
.github/workflows/barback.yml             — Weekly Barback crawler (disabled S173)
```

## Common Lookups (Frequently Asked)

| Question | Answer |
|---|---|
| Where does XP logic live? | `lib/xp/index.ts` — levels, progression, rollXpMultiplier (S161) |
| Where are feed cards defined? | `components/social/*.tsx` |
| Where is the check-in flow? | `components/session/CheckinEntryDrawer.tsx`, `DetentSheet.tsx` |
| Where is theme config? | `components/theme/ThemeProvider.tsx` + `app/globals.css` |
| Where are API helpers? | `lib/api-helpers.ts` (auth) + `lib/api-response.ts` (responses) |
| Where are beer style colors? | `lib/beerStyleColors.ts` — 26 styles → 6 families |
| Where are shared UI primitives? | `components/ui/` (Card, Pill, PillTabs, Modal, FormField, etc.) |
| Where are migrations numbered? | `supabase/migrations/` — current max is 103 |
| Where does brand billing propagate? | `lib/brand-billing.ts` — propagateBrandTier, revertBrandTier |
| Where are email templates? | `lib/email-templates/index.ts` |
| Where is the POS sync engine? | `lib/pos-sync/engine.ts` |
| Where are sprint retros saved? | `docs/retros/sprint-{N}-retro.md` |
| Where is the launch checklist? | `docs/launch-checklist.md` |

## Related Skills

- **`hoptrack-conventions`** — coding rules and BANNED/REQUIRED patterns (triggers when writing code)
- **`supabase-migration`** — migration rules and RLS patterns (triggers when touching schema)
- **`sprint-close`** — sprint close ceremony (manual trigger only)
