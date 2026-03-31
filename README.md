# HopTrack

![CI](https://github.com/hoptrack/hoptrack/actions/workflows/ci.yml/badge.svg)

**Track Every Pour.** A craft beer check-in and loyalty platform for drinkers and breweries.

- **Consumer app** — check in beers, earn XP, unlock achievements, follow friends, discover breweries
- **Brewery dashboard** — manage tap lists, loyalty programs, promotions, analytics, customer messaging

## Tech Stack

- **Framework:** Next.js 16.2.1 (App Router)
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **Database:** Supabase (Postgres + Auth + Storage + Realtime)
- **Payments:** Stripe (Tap $49/mo, Cask $149/mo, Barrel custom)
- **AI:** Anthropic Claude (HopRoute brewery route generation)
- **Animation:** Framer Motion
- **Testing:** Playwright (E2E)
- **Language:** TypeScript (strict mode)

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd hoptrack
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Fill in your Supabase, Stripe, and Anthropic keys

# 3. Apply database migrations
npm run db:migrate

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.local.example` for the full list. Required:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

Optional (features degrade gracefully without these):

| Variable | Feature |
|----------|---------|
| `STRIPE_SECRET_KEY` | Brewery billing |
| `ANTHROPIC_API_KEY` | HopRoute AI generation |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web push notifications |

## Project Structure

```
app/
  (app)/              Consumer app routes
  (brewery-admin)/    Brewery owner dashboard
  (superadmin)/       Platform admin
  (auth)/             Login/signup
  api/                55 API endpoints
components/
  session/            Session flow (banner, drawer, recap, tap wall)
  social/             Feed cards, ratings, comments
  brewery/            Brewery-specific components
  beer/               Beer cards, reviews
  ui/                 Base components (Modal, Toast, Skeleton, etc.)
  layout/             AppShell, AppNav
lib/
  supabase/           Client, server, service role clients
  queries/            Feed queries
  achievements/       Achievement evaluation logic
  xp/                 XP and leveling system
  animation.ts        Shared spring configs
  beerStyleColors.ts  Style-to-color mapping
types/
  database.ts         Supabase schema types
  supabase-helpers.ts Common join shapes
supabase/
  migrations/         Database migrations (001-047)
  functions/          Edge Functions
docs/
  roadmap.md          Product roadmap (source of truth)
  plans/              Sprint plans
  retros/             Sprint retrospectives
  sales/              GTM, pricing, pitch docs
  brand/              Brand guide, App Store plan
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply Supabase migrations |
| `npm run db:types` | Regenerate TypeScript types from schema |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run setup` | One-time Supabase setup (storage buckets, etc.) |

## Architecture

- **Route groups:** `(app)`, `(auth)`, `(brewery-admin)`, `(superadmin)`
- **Auth:** Supabase Auth with JWT, RLS policies on all tables
- **Real-time:** Supabase Realtime for The Board (TV display)
- **Styling:** CSS variables (`var(--surface)`, `var(--accent-gold)`, etc.) — dark mode default
- **Fonts:** Playfair Display (headings), DM Sans (body), JetBrains Mono (stats)
- **Routing:** `proxy.ts` handles auth redirects (no middleware.ts)

## Team

Built by the HopTrack product team. See `CLAUDE.md` for the full team roster and conventions.

## License

Private. All rights reserved.
