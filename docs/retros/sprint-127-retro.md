# Sprint 127 Retro — The Reckoning
**Facilitated by:** Morgan
**Date:** 2026-04-02
**Verdict:** We fixed what Sprint 126 broke, plus a 33-sprint-old bug. Brand page locations need Supabase dashboard investigation.

---

## What We Shipped
- Migration 085: Brand data integrity verification (2 locations linked, 1 loyalty program active)
- MugClubSection: object perks `{title, description}` now render properly (P0 fix — bug since Sprint 94)
- Breweries API: brand join on all 5 query paths (was 1/5)
- Brewery detail page: beer query narrowed from `brewery:breweries(*)` to `brewery:breweries(id, name)`
- DiscoveryCard: defensive brewery name rendering
- 3 new guardrail test files: mug-club-perks, breweries-api-consistency, brewery-page-safety
- 12 new tests (834 to 846), build clean

## What Went Wrong

### P1: Brand page locations still shows 0
Data is correct — API `/api/brand/[brand_id]/locations` returns 2 locations, migration 085 confirmed both linked. But the server component's Supabase query returns empty. Root cause: likely RLS enabled on `breweries` table in Supabase dashboard (not via migrations). SSR client can't read breweries by `brand_id`. Needs dashboard investigation.

### Leaflet CSS crash on brand page (dev only)
Turbopack dev server cache issue with `leaflet/dist/leaflet.css` module factory. Not a code bug — stale browser/dev cache. Hard reload or production build resolves it.

---

## The Team Speaks

**Morgan**: "We found the P0 root cause in under an hour. That's what focus looks like. The brand page locations issue is a Supabase config problem, not a code problem — we need eyes on the dashboard."

**Jordan**: "The mug club perks bug has been there since Sprint 94. Migration 074 wrote objects, MugClubSection read strings. Nobody noticed because you had to be a mug club member at P&P to trigger it. The beer query narrowing was overdue."

**Avery**: "Four `.select('*')` calls fixed to include brand joins. The API is consistent now. The MugClubSection fix handles both string and object perks."

**Casey**: "12 new tests. Three of them are guardrails — they read actual source code and fail if someone removes the brand join or widens the beer query."

**Reese**: "Covered. Perks test validates 5 scenarios. API consistency test counts query paths and verifies brand joins."

**Quinn**: "Migration 085 clean — 2 locations, 1 loyalty program. The brand page issue is upstream — need to check RLS policies on the breweries table in the dashboard."

**Sam**: "The P0 was the real win. A brewery owner seeing their mug club crash would be a deal-breaker. Now perks render title AND description."

**Riley**: "Migration pipeline worked clean. Brand page RLS is a dashboard config item."

**Drew**: "The mug club fix — that's real. '$1 off every pint — All day, every day.' That's what a member wants to see."

**Taylor**: "The P0 fix is the money play. Mug clubs are a revenue driver. If they can't show perks, they can't sell memberships."

**Jamie**: "Perks descriptions as muted text below the title? That's a UI improvement, not just a bug fix."

**Sage**: "Action item for Sprint 128: Supabase dashboard audit for RLS on breweries table."

---

## Roast Corner

**Casey on the perks bug:** "It survived 33 sprints. The bug had tenure."

**Jordan on himself:** "I reviewed migration 074 when it shipped. I saw `[{title, description}]` in the JSON. I saw `as string[]` in the component. I had to take a walk."

**Drew on the brand page:** "We fixed the crash, fixed the API, fixed the data, pushed a migration that confirmed everything is correct... and the page still shows 0 locations. Modern web development."

**Taylor on Sprint 126:** "Last sprint we shipped a GPS system for a car with no wheels. This sprint we found the car also had no engine. Progress!"

**Avery on `.select('*')`:** "Four queries. Four missing brand joins. Four chances to catch it. Zero did."

---

## Action Items

### Immediate (Sprint 128)
1. **Supabase dashboard audit** — Check RLS policies on `breweries` table, fix SELECT policy for brand_id queries
2. **Brand page locations fix** — Once RLS is resolved, verify locations render on brand page
3. **Leaflet CSS** — Consider lazy-loading Leaflet with dynamic import to avoid module cache issues

### Process
4. **Data pipeline testing** — Every server component query should be verified client-side as fallback
5. **JSONB type safety** — Audit all JSONB columns for type assumptions (perks was objects cast as strings)

---

## Stats
- **Files modified:** 5
- **Files created:** 4 (1 migration, 3 test files)
- **Tests:** 834 to 846 (+12)
- **Bugs fixed:** 3 (P0 perks crash, P2 API consistency, beer query safety)
- **Bugs investigated:** 1 (P1 brand page — Supabase RLS, needs dashboard)
- **Sprint grade:** B+
