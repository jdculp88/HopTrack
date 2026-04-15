# Sprint 157 — The Engagement Engine 🔥

## Context

Joshua chose Option C after reviewing three sprint options. He wants consumer engagement features that make users come back daily AND code quality that would impress a senior developer on handoff. The team conducted deep research across Reddit/design trends, brewery industry needs, and modern React/Next.js patterns before scoping.

**Key research findings driving this sprint:**
- View Transitions and scroll-driven animations are the "wow" patterns in 2026
- Brewery owners want social proof ("X people checked in today") — it drives visits
- Streaks + leaderboards are the #1 retention mechanic (Duolingo model)
- Codebase has 1,290 `as any` casts and zero Zod validation — the two things a senior dev flags first
- `framer-motion` import is deprecated → `motion/react` (186 files to migrate, identical API)
- E2E secrets are now configured — CI tests run for real

**Two tracks:** Track 1 (Engagement) builds features users love. Track 2 (Code Excellence) makes the codebase impressive.

---

## Track 1: Consumer Engagement Features

### 1. Leaderboard System (Medium)
Full leaderboard page at `/leaderboards` with categories, scopes, and time ranges.

**New files:**
- `app/api/leaderboard/route.ts` — GET endpoint with category/scope/timeRange params, 60s cache
- `app/(app)/leaderboards/page.tsx` — server component (auth + metadata)
- `app/(app)/leaderboards/LeaderboardClient.tsx` — client component with tabs/filters
- `app/(app)/leaderboards/loading.tsx` — skeleton
- `lib/schemas/leaderboard.ts` — Zod schema for query params (first Zod schema!)

**Modified files:**
- `app/(app)/layout.tsx` or nav config — add "Leaderboards" nav link (Trophy icon)

**Categories:** XP (all-time), Check-ins (period), Styles Explored, Breweries Visited, Current Streak
**Scopes:** Global / Friends / City (uses profile.home_city)
**Time ranges:** This Week / This Month / All Time
**Reuse:** `LeaderboardRow` component, `PageHeader`, `Pill` for filters, `RANK_STYLES`

### 2. Streak Enhancement (Medium)
Make streaks visible, motivating, and shareable.

**New files:**
- `components/profile/StreakDisplay.tsx` — flame icon, current count, best streak, "at risk" pulse
- `components/social/StreakShareCard.tsx` — shareable streak milestone card
- `app/og/streak/route.tsx` — OG image for streak milestones
- `app/api/cron/streak-reminder/route.ts` — daily cron for streak reminders
- `supabase/migrations/099_streak_freeze.sql` — streak freeze columns

**Streak freeze mechanic:**
- Earn 1 freeze per 7-day streak milestone (7, 14, 21, etc.), max 3 stored
- Auto-consumed when streak would break
- Visual: snowflake icon next to flame when freezes available

### 3. Achievement Share Cards (Small)
OG image route for achievements + share button on celebration overlay.

### 4. View Transitions Adoption (Small-Medium)
Enable `viewTransition: true` in next.config.ts. Shared element transitions between brewery/beer list cards and detail pages.

### 5. Trending Enhancement (Small-Medium)
Friends trending API, city filter in UI, style-based sub-filters, trending badge on feed cards.

---

## Track 2: Code Excellence

### 6. Zod Validation Foundation (Medium)
Create `lib/schemas/` with core schemas. Migrate 15-20 highest-traffic API routes from manual validation to Zod.

### 7. framer-motion → motion/react Migration (Small — bulk)
186 files, identical API, zero risk.

### 8. Error Boundary Expansion (Small)
Wrap brewery detail sections, feed tabs, discover sub-sections, dashboard widgets.

### 9. API Response Pattern Completion (Small — bulk)
Migrate ~68 remaining files from raw `NextResponse.json({ error })` to `apiError()`.

### 10. New E2E Tests (Small-Medium)
Leaderboard, streak, session flow tests with newly configured CI secrets.

---

## Execution Order

1. **Phase 0 (parallel):** Import migration + API response migration + config + migration 099
2. **Phase 1:** Zod foundation (blocks new APIs)
3. **Phase 2:** Error boundaries
4. **Phase 3 (parallel):** Leaderboard + Streaks + Achievement shares + View Transitions + Trending
5. **Phase 4:** Tests + build verification

---

## Estimated Output
- ~25 new files, ~200+ modified files
- ~50 new tests (target: 1,480 unit, 92 E2E)
- 1 migration (099_streak_freeze)
- 0 new npm dependencies
