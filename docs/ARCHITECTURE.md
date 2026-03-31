# HopTrack Architecture
**Last updated:** 2026-03-30 (Sprint 69)
**Author:** Jordan (Architecture Lead)

---

## System Overview

```
Browser/PWA
    |
    v
Next.js 16 App Router (Vercel)
    |
    +-- Server Components (RSC) -- read data via Supabase server client
    +-- Client Components ("use client") -- interact via Supabase browser client
    +-- API Routes (/app/api/) -- mutations, integrations, webhooks
    |
    v
Supabase (Postgres + Auth + Storage + Realtime)
    |
    +-- RLS policies on all tables
    +-- Edge Functions (achievement-eval)
    +-- Realtime subscriptions (The Board TV display)
    |
    v
External Services
    +-- Stripe (billing, webhooks)
    +-- Anthropic Claude (HopRoute AI generation)
    +-- Web Push (VAPID, browser notifications)
    +-- Sentry (error tracking)
```

## Authentication

- **Provider:** Supabase Auth (email/password, magic link)
- **Session:** JWT stored in httpOnly cookies, managed by `@supabase/ssr`
- **Session refresh:** `proxy.ts` refreshes auth on every request (replaces middleware.ts)
- **Route protection:** Server layouts check `supabase.auth.getUser()` and redirect to `/login` if unauthorized
- **Service role:** `lib/supabase/service.ts` — bypasses RLS, used only server-side for admin operations and cascade deletes

### Auth Flow
1. User signs up/logs in via Supabase Auth
2. `proxy.ts` intercepts every request, refreshes JWT cookie
3. Server components use `createClient()` from `lib/supabase/server` (cookie-based auth)
4. Client components use `createClient()` from `lib/supabase/client` (browser-side auth)
5. API routes get user via `supabase.auth.getUser()` — returns `null` if not authenticated

## Database

### Row Level Security (RLS)
Every table has RLS policies. Key patterns:
- **profiles:** Public read, own-row write
- **sessions/beer_logs:** Own-row read/write, feed visibility via `share_to_feed`
- **brewery data (beers, events, tap list):** Public read, brewery admin write (via `brewery_accounts`)
- **friendships:** Participants only
- **notifications:** Own-row only

### Key Tables (46 migrations, 001-047)

**User domain:** `profiles`, `friendships`, `user_achievements`, `wishlist`, `push_subscriptions`, `referral_codes`, `referral_uses`

**Session domain:** `sessions`, `beer_logs`, `session_comments`, `session_participants`, `session_photos`, `reactions`

**Brewery domain:** `breweries`, `beers`, `beer_reviews`, `brewery_reviews`, `brewery_visits`, `brewery_follows`, `brewery_events`, `pour_sizes`, `brewery_accounts`, `brewery_claims`

**Platform:** `achievements`, `notifications`, `hop_routes`, `hop_route_stops`, `hop_route_stop_beers`, `loyalty_programs`, `loyalty_redemptions`, `beer_lists`, `beer_list_items`

### Foreign Key Pattern
All review tables (`beer_reviews`, `brewery_reviews`) point `user_id` → `public.profiles(id)` (not `auth.users`). This lets PostgREST resolve `profile:profiles(...)` embedded joins. Migration 047 fixed this.

## File Storage

- **Provider:** Supabase Storage
- **Buckets:** `avatars` (profile photos), `session-photos` (session uploads), `brewery-logos`
- **RLS:** Applied per bucket (own-row access for uploads)
- **Image optimization:** Next.js `<Image>` component for optimized loading

## Real-Time

- **The Board** (`/brewery-admin/[id]/board`) uses Supabase Realtime subscriptions
- Subscribes to `beers` and `sessions` tables for live tap list and active session updates
- `BoardClient.tsx` handles real-time event handling and UI refresh

## Feed System

Three tabs: **Friends**, **Discover**, **You**

### Query Architecture (`lib/queries/feed.ts`)
- **Friends tab:** Sessions from accepted friends where `share_to_feed = true`, ordered by `started_at`
- **Discover tab:** Curated collections, trending beers, new breweries, popular sessions
- **You tab:** User's own sessions, achievements, stats

### Feed Card Types (union type in `FeedItem`)
- `session` — Standard session card with beer logs
- `brewery_review` — Star rating + review text
- `hop_route_cta` — HopRoute invite card
- Decorative variants: counter, spotlight, route-invite, pill (selected by `index % 4`)

## HopRoute AI System

1. User selects city + vibe preferences
2. `POST /api/hop-route/generate` sends prompt to Anthropic Claude
3. Claude returns structured JSON: route name, stops, beer recommendations
4. Response saved to `hop_routes`, `hop_route_stops`, `hop_route_stop_beers`
5. User can start route, check in at stops, complete route for XP
6. Rate limited: 5 generations per minute (protects API credits)

## Theme System

### CSS Variables (Tailwind v4)
All colors defined as CSS variables in `globals.css` via `@theme {}`:
- `--surface`, `--surface-2` — background layers
- `--border` — borders
- `--text-primary`, `--text-secondary`, `--text-muted` — text hierarchy
- `--accent-gold` — brand gold (#D4A843)
- `--danger` — destructive actions

### Dark/Light Mode
- Default: dark (`#0F0E0C` background)
- Light: cream (`#FAF7F2` background)
- Toggle stored in localStorage, applied via CSS class
- `DarkCardWrapper` — client component that forces dark vars via `style.setProperty()` (Tailwind v4 workaround for nested theme overrides)

### Card Background System (Sprint 63)
11 semantic CSS classes: `card-bg-stats`, `card-bg-live`, `card-bg-featured`, `card-bg-hoproute`, `card-bg-reco`, `card-bg-collection`, `card-bg-notification`, `card-bg-achievement`, `card-bg-social`, `card-bg-streak`, `card-bg-taste-dna`

Applied via `::before`/`::after` pseudo-elements — zero extra DOM nodes.

### Beer Style Colors (`lib/beerStyleColors.ts`)
26 `BeerStyle` values mapped to 6 color families. `getStyleFamily()` + `getStyleVars()` return CSS variable strings (`primary`, `light`, `soft`) for style-tinted UI.

## Animation System (`lib/animation.ts`)

- **Spring configs:** `snappy`, `gentle`, `bouncy` — canonical presets
- **Page transitions:** `PageEnterWrapper` client component
- **Card interactions:** `cardHover` presets (lift, press states)
- **Reduced motion:** `MotionConfig reducedMotion="user"` in root layout
- **Rule:** Never `motion.button` — always `<button>` with inner `<motion.div>`

## XP & Achievement System

### XP (`lib/xp/`)
- Actions award XP: session start, beer log, review, friend add, streak
- `getLevelFromXP()` maps cumulative XP to beer-themed levels (Hop Curious → Grand Cicerone)
- Level displayed in `UserAvatar` badge

### Achievements (`lib/achievements/`)
- 52 achievements across 6 categories: explorer, variety, quantity, social, time, quality
- Tiers: bronze, silver, gold, platinum
- Evaluated at session end (`/api/sessions/[id]/end`) — checks all achievement conditions
- Celebration overlay: `AchievementCelebration` component with confetti + haptic

## Billing (Stripe)

- **Integration:** `lib/stripe.ts` — lazy `getStripe()`, price IDs, tier info
- **Checkout:** `POST /api/billing/checkout` → Stripe Checkout Session
- **Portal:** `POST /api/billing/portal` → Stripe Customer Portal
- **Webhooks:** `POST /api/billing/webhook` handles `checkout.session.completed` and `customer.subscription.deleted`
- **Tiers:** Free (default), Tap ($49/mo), Cask ($149/mo), Barrel (custom)
- **Demo mode:** App functions without Stripe keys (all features unlocked in demo)

## Performance

- **ISR:** `revalidate = 300` on brewery-welcome, `revalidate = 60` on brewery detail
- **Cache-Control:** 6 public GET endpoints have explicit cache headers (leaderboard 5min, breweries/beers/reviews 1min, hop-route 1hr)
- **Dynamic imports:** `SessionRecapSheet` loaded via `next/dynamic` (code splitting)
- **Image optimization:** Next.js `<Image>` with priority loading on above-the-fold content

## Error Handling

- **Client errors:** Inline form errors (never `alert()`), toast notifications for mutations
- **API errors:** Structured `{ error: string }` responses with appropriate HTTP status codes
- **Error boundaries:** 4 route-group `error.tsx` files (app, auth, brewery-admin, superadmin)
- **Monitoring:** Sentry for production error tracking

## Key Architectural Decisions

1. **No middleware.ts** — `proxy.ts` handles auth refresh (Next.js 16 pattern)
2. **Push to main** — no PRs, no branch protection. Trust the team.
3. **CSS variables over Tailwind classes** — supports runtime theme switching
4. **Supabase RLS over API-level auth** — defense in depth
5. **Server Components by default** — client components only for interactivity
6. **`as any` for Supabase joins** — typed where possible, commented where not (see `types/database.ts`)
