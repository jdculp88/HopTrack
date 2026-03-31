# Sprint 12 Plan — "Back to Our Roots" 🍺

**Date:** 2026-03-26
**PM:** Morgan
**Theme:** Dashboard migration, photo uploads, Customer Pint Rewind, mobile polish
**Sprint leads:** Jordan (dev), Alex (UX), Riley (infra), Taylor (first brewery close)

> **Sprint goal:** Brewery dashboard runs on real session data. Photo uploads work. Customer Pint Rewind ships. Taylor closes first paid brewery. Mobile doesn't embarrass us.

---

## Phase 1: Foundation (Migrations + RLS)

### S12-M01: Apply migration 007 (home sessions + quantity)
**Owner:** Riley
**What:** Run `007_home_sessions_quantity.sql` in Supabase SQL Editor
- Makes `sessions.brewery_id` nullable (home drinking)
- Adds `sessions.context` column ('brewery' | 'home')
- Makes `beer_logs.brewery_id` nullable
- Adds `beer_logs.quantity` column (default 1)
**Blocker for:** Everything below

### S12-M02: Migration 008 — Brewery admin RLS for sessions/beer_logs
**Owner:** Riley + Jordan
**What:** New migration adding RLS policies so brewery admins can read sessions and beer_logs at their brewery
**Why:** Current RLS only lets users see their OWN sessions. Dashboard queries run with user auth — brewery admin needs to see ALL sessions at their brewery.
**Policies needed:**
- `sessions` SELECT for brewery_accounts members
- `beer_logs` SELECT for brewery_accounts members (via brewery_id match)
**Blocker for:** S12-001 through S12-003

---

## Phase 2: Dashboard Migration (P0 — Drew + Taylor blocked)

### S12-001: Brewery dashboard → sessions/beer_logs
**Owner:** Jordan
**What:** Rewrite `app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx`
- Replace all `checkins` queries with `sessions` + `beer_logs`
- "Total Check-ins" → "Total Visits" (session count) + "Beers Logged" (beer_logs sum)
- "Unique Visitors" → from sessions
- "Avg Rating" → from beer_logs
- "Recent Activity" → recent sessions with beer_logs joined
- "Top Beers" → from beer_logs grouped by beer_id
- Keep loyalty + promotions queries unchanged

### S12-002: Analytics → sessions/beer_logs
**Owner:** Jordan
**What:** Rewrite `analytics/page.tsx` + `AnalyticsClient.tsx`
- Fetch sessions + beer_logs instead of checkins
- Pass structured data to client component
- All charts recomputed from beer_logs (daily, DOW, top beers, styles, ratings)
- Summary stats from sessions (visits) + beer_logs (ratings)

### S12-003: Pint Rewind → session data
**Owner:** Jordan
**What:** Rewrite `pint-rewind/page.tsx`
- 30-day and all-time queries from sessions + beer_logs
- Top visitor from sessions (most visits), not checkins
- Top beers from beer_logs
- Busiest hour/day from sessions.started_at
- Share card data unchanged (just different source)

---

## Phase 3: Photo Uploads (P0 — Drew's list)

### S12-004: Photo upload components
**Owner:** Jordan
**What:** Build reusable `ImageUpload` component + wire into:
- Beer log photo (in TapWallSheet/check-in flow)
- Brewery cover photo (in BrewerySettingsClient)
- Uses existing Supabase Storage buckets (migration 003 already applied)
- `beer-photos` bucket: user uploads to `{user_id}/{filename}`
- `brewery-covers` bucket: brewery admin uploads to `{brewery_id}/{filename}`

---

## Phase 4: Customer Pint Rewind (S12-001 from roadmap)

### S12-005: Customer Pint Rewind — animated card stack
**Owner:** Alex + Jordan + Jamie
**What:** Full-screen swipeable card experience at `/home/pint-rewind` or `/pint-rewind`
**Design brief:** (from roadmap)
- Your Beer Personality (most common style → archetype)
- Your Signature Beer (most logged)
- Your Brewery Loyalty (most visited)
- Legendary Session (longest/most beers)
- Rating Habits (harsh critic vs easy grader)
- Home Couch Researcher (home session count)
- The Scroll (total beers, pours, XP)
- Your Level (current level + what it says)
**Delivery:** Framer Motion card stack, swipe/tap, dark theme + gold, shareable as image

---

## Phase 5: Polish + Revenue

### S12-006: Mobile responsive polish (landing pages)
**Owner:** Alex + Jamie
**What:** LandingContent.tsx + BreweriesContent.tsx responsive breakpoints

### S12-007: REQ backfill (2 docs minimum)
**Owner:** Sam

### S12-008: First paid brewery close
**Owner:** Taylor

---

## Implementation Order

```
1. Write + apply migration 008 (RLS for brewery admin)
2. Dashboard page.tsx → sessions/beer_logs
3. Analytics page.tsx + AnalyticsClient.tsx → sessions/beer_logs
4. Pint Rewind page.tsx → sessions/beer_logs
5. Photo upload component + wiring
6. Customer Pint Rewind
7. Mobile responsive
8. QA regression
```

---

*"Plan, document, design, implement, test. By the book."* — Morgan
