# Sprint 27 Retro — "Three-Tab Feed" — 2026-03-28

## What We Shipped
- Complete three-tab feed redesign: Friends / Discover / You
- `HomeFeed.tsx` rewrite (~1000 lines) — new tab architecture, AnimatePresence transitions
- `FeedTabBar` — spring-animated underline indicator, layoutId
- `AchievementFeedCard` — gold gradient, tier pills, XP badge
- `StreakFeedCard` — milestone detection, localStorage dedup
- `DrinkingNow` updated to CSS vars (gold, not green)
- You tab: profile hero + XP bar, 4-stat grid, Taste DNA bars, Recent Achievements scroll, Want-to-Try wishlist, Brewery Passport
- Discover tab: BOTW, Trending, Events, New Breweries 2-col grid
- Seed 009 — 24 sessions, 65+ beer logs, 14 beer reviews, 8 brewery reviews, 2 active sessions, 14 friendships
- Seed 010 — friend achievements, streak milestones, refreshed active sessions, extra reviews
- **Migration 033 — fixed the root cause bug (see below)**

## The Bug

`sessions.brewery_id` has been a plain `text` column since migration 006 (Sprint 6). No foreign key to `breweries`. PostgREST returned `PGRST200` on every `brewery:breweries(...)` join, silently returning `null` data, silently falling back to `[]`. Every session feed query — friends tab, active sessions, everything — has been returning empty since Sprint 13 when we added the friends feed.

Migration 033 converts both `sessions.brewery_id` and `beer_logs.brewery_id` from `text` to `uuid` with proper FK constraints. Stale rows with invalid brewery references were nulled out. RLS policies were rewritten to remove the now-unnecessary `::text` cast.

**After applying migration 033:** run `NOTIFY pgrst, 'reload schema';` in the Supabase SQL editor to flush PostgREST's schema cache.

## What's Needed to Fully Verify
1. Run `NOTIFY pgrst, 'reload schema';` in SQL editor
2. Unregister service worker in browser DevTools → Application → Service Workers
3. Hard reload `Cmd+Shift+R`
4. Friends tab should show: sessions, DrinkingNow strip, achievement cards, streak cards, rating cards
5. Discover tab should show: BOTW, trending reviews, brewery reviews, events, new breweries
6. You tab should show: profile + XP, stats, Taste DNA (requires 3+ styles in beer_logs), achievements, wishlist, brewery passport

## Team Notes

**Morgan:** The architecture is right. The data pipeline is fixed. Sprint 28 opens with feed verification and call it shipped.

**Jordan:** I had to take two walks. `text NOT NULL` on a FK column, lurking since Sprint 6. Migration 033 buries it. Never again.

**Riley:** `NOTIFY pgrst, 'reload schema'` — run it after every migration that adds FKs. Also: migration consolidation proposal still open since Sprint 21.

**Sam:** Empty feed on load = P0 churn. Need error visibility in feed pipeline. The silent `?? []` fallback masks real errors.

**Casey:** PGRST200 was in the server console on every request. E2E tests would have caught this day one. Still no E2E tests. Still watching. 👀

**Alex:** Tab bar is excellent. Card designs are ready. When the data loads it's going to feel incredible.

**Drew:** Board and tap list unaffected. Brewery side is solid.

**Taylor:** Three-tab feed is a strong Asheville demo story — once it loads.

**Jamie:** Achievement card gold gradients + small-caps section headers = App Store screenshot material.

## Deferred to Sprint 28
- Verify full feed render with all card types after PGRST schema reload
- Service worker stale chunk issue (known, low priority)
- Cheers/reaction button on feed cards (P1)
- Feed infinite scroll / pagination (P2)
- E2E tests (Casey has been waiting since Sprint 17)
