# Sprint 177 Plan — "The Plumbing" 🔧

**Sprint:** 177
**Theme:** Fix the orphaned stat columns — profiles.unique_beers + brewery_visits
**Arc:** Launch hardening (interrupts Sensory Layer work)
**Facilitator:** Morgan
**Date:** 2026-04-11

---

## Why this sprint exists

A full stats plumbing audit (see conversation archive 2026-04-11) uncovered **two orphaned columns/tables that display on prod but are only written by seed data**. Real users see stale zeros. Paying breweries will see empty Brand CRMs the moment Stripe goes live.

This is a **launch blocker**. Everything else waits.

---

## The Bugs (confirmed, not theoretical)

### P0-1 — `profiles.unique_beers` is orphaned
- **Column:** `profiles.unique_beers int default 0 not null` (from `supabase/schema.sql:14`)
- **Written by:** Seed migrations 074, 075, 076 only
- **Read by:**
  - `app/(app)/profile/[username]/page.tsx:411` (Quick Stats card)
  - `app/(app)/home/YouTabContent.tsx:189` (You tab)
  - `app/(app)/profile/[username]/tabs/StatsTab.tsx:93` (Stats tab)
  - `app/(app)/friends/page.tsx:25` — **sorts leaderboard by this column**
  - `app/(superadmin)/superadmin/users/[user_id]/UserDetailClient.tsx:880`
  - `lib/superadmin-user.ts:550`
- **What the `increment_xp` RPC updates (migration 036):** xp, level, unique_breweries, current_streak, longest_streak, last_session_date. **NOT unique_beers.**
- **Real user impact:** Every non-seeded user has `unique_beers = 0` forever. The friends leaderboard sorts by a column that's always zero for real users.

### P0-2 — `brewery_visits` table is orphaned
- **Schema:** `supabase/schema.sql:183` — `(id, user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at)` with `UNIQUE(user_id, brewery_id)`
- **Written by:** Seed migration 076 only
- **Read by 18 code paths** including:
  - `lib/kpi.ts:155-177` — New vs Returning % on brewery dashboard
  - `lib/brand-crm.ts:133-239` — **entire Brand CRM** (S129 "The Transfer")
  - `app/(brewery-admin)/brewery-admin/brand/[brand_id]/customers/*` — Brand customer list + detail pages
  - `app/(brewery-admin)/brewery-admin/[brewery_id]/analytics/page.tsx`
  - `lib/ai-promotions.ts:63` — AI suggestions input signal
  - `app/(app)/brewery/[id]/page.tsx:102,148` — consumer brewery page
  - `app/(app)/profile/[username]/page.tsx:64` — profile visit history
  - Plus superadmin, demo dashboard
- **What falls back gracefully:** `uniqueVisitors` counter on brewery dashboard (computes from `sessions` directly), retention rate (same), Health Score, Peer Benchmarking (all S159 — query `sessions` directly). ✅
- **What's actually broken for real breweries:**
  - "New vs Returning" split % on brewery dashboard → shows dashes
  - **Brand CRM customer list → empty** (paying feature!)
  - **Brand customer detail → 404** (paying feature!)
  - AI Promotion Suggestions input → missing signal
  - Consumer brewery page visit history → empty
- **Real brewery impact:** Cask-tier brand logs in to see their multi-location customer intelligence (what they're paying for) and sees zero customers. Refund.

---

## Scope & Deliverables

### Track 1 — The Fix (Quinn + Avery)
**Migration 113 — `fix_orphaned_stat_columns.sql`**

Two triggers + one updated RPC + one backfill pass. Pre-staged at `supabase/migrations/113_fix_orphaned_stat_columns.sql`.

**A. `profiles.unique_beers` — trigger on `beer_logs` insert**
```
CREATE FUNCTION sync_profile_unique_beers_on_beer_log() RETURNS TRIGGER
  -- When a new beer_log is inserted, check if the user has already
  -- logged that beer_id before. If not, increment profiles.unique_beers.
  -- Skip if beer_id is NULL (free-form entry).
```

**B. `brewery_visits` — trigger on `sessions` insert**
```
CREATE FUNCTION sync_brewery_visits_on_session() RETURNS TRIGGER
  -- UPSERT brewery_visits on session insert:
  --   INSERT with total_visits=1, unique_beers_tried=0
  --   ON CONFLICT (user_id, brewery_id) DO UPDATE
  --     SET total_visits = total_visits + 1,
  --         last_visit_at = NEW.started_at
  -- Skip if brewery_id is NULL (home session context).
```

**C. `brewery_visits.unique_beers_tried` — trigger on `beer_logs` insert**
```
CREATE FUNCTION sync_brewery_visits_unique_beers_on_beer_log() RETURNS TRIGGER
  -- When a beer_log is inserted with a non-null brewery_id + beer_id,
  -- check if the user has already logged that beer at that brewery.
  -- If not, increment brewery_visits.unique_beers_tried.
```

**D. Backfill pass**
```
-- Rebuild profiles.unique_beers from beer_logs
UPDATE profiles p SET unique_beers = (
  SELECT COUNT(DISTINCT beer_id) FROM beer_logs
  WHERE user_id = p.id AND beer_id IS NOT NULL
);

-- Rebuild brewery_visits from sessions + beer_logs
INSERT INTO brewery_visits (user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at)
SELECT
  s.user_id,
  s.brewery_id,
  COUNT(*) AS total_visits,
  COUNT(DISTINCT bl.beer_id) FILTER (WHERE bl.beer_id IS NOT NULL) AS unique_beers_tried,
  MIN(s.started_at) AS first_visit_at,
  MAX(s.started_at) AS last_visit_at
FROM sessions s
LEFT JOIN beer_logs bl ON bl.session_id = s.id
WHERE s.brewery_id IS NOT NULL
GROUP BY s.user_id, s.brewery_id
ON CONFLICT (user_id, brewery_id) DO UPDATE
  SET total_visits = EXCLUDED.total_visits,
      unique_beers_tried = EXCLUDED.unique_beers_tried,
      first_visit_at = EXCLUDED.first_visit_at,
      last_visit_at = EXCLUDED.last_visit_at;
```

**E. Rollback plan** (per convention)
```
-- To roll back: drop triggers + functions. Data stays (it's correct now).
DROP TRIGGER IF EXISTS trg_sync_profile_unique_beers ON beer_logs;
DROP TRIGGER IF EXISTS trg_sync_brewery_visits_on_session ON sessions;
DROP TRIGGER IF EXISTS trg_sync_brewery_visits_unique_beers ON beer_logs;
DROP FUNCTION IF EXISTS sync_profile_unique_beers_on_beer_log();
DROP FUNCTION IF EXISTS sync_brewery_visits_on_session();
DROP FUNCTION IF EXISTS sync_brewery_visits_unique_beers_on_beer_log();
```

**Owner:** Quinn (migration authoring) + Avery (trigger logic review + integration test)
**Acceptance:**
- Migration applies cleanly to a fresh Supabase
- Backfill matches a manual COUNT query for 5 spot-checked profiles
- Inserting a beer_log for a new beer increments `profiles.unique_beers`
- Inserting a beer_log for an existing beer does NOT increment
- Inserting a session upserts `brewery_visits` correctly (total_visits, first/last)
- Home sessions (brewery_id NULL) do NOT create brewery_visits rows

---

### Track 2 — The Safety Net (Casey + Reese)
**Regression tests** that would have caught this if they existed:

**Unit tests** — `lib/__tests__/stat-write-paths.test.ts` (new file)
- Mock Supabase client, verify the session-end API route results in correct profile state
- Verify `brewery_visits` upsert logic for new-brewery and repeat-brewery cases
- Verify `unique_beers` only increments for genuinely new beers

**E2E test** — `e2e.frozen/stats-plumbing.spec.ts` (draft, stays frozen until E2E unfreezes)
- Sign up → check in 2 distinct beers → profile shows `unique_beers = 2`
- Check in at same brewery twice → brewery page shows `total_visits = 2`
- Multi-brewery: check in at 2 breweries → profile shows `unique_breweries = 2`

**Regression guard** — `lib/__tests__/orphaned-columns-guard.test.ts` (new file)
- Greps for columns displayed in JSX that have no grep hit for an UPDATE/INSERT/RPC path
- Starts as an allowlist of known orphans (empty after this sprint)
- Fails CI if a new orphan is added without being allowlisted

**Owner:** Casey (test design) + Reese (implementation)
**Acceptance:** All tests green. Regression guard allowlist is empty or documented.

---

### Track 3 — Adjacent Write-Path Gaps (Finley + Alex + Dakota)
Three S176-neighbor fields caught in the same audit. Bundle them for efficiency — Finley's in this area of the code anyway.

**A. `beers.cover_image_url`**
- Displays on `components/brewery-admin/BoardSlideshow.tsx`
- No upload UI in `BeerFormModal.tsx`
- **Fix:** Add image upload field to BeerFormModal, wire to Supabase Storage beer-covers bucket (already exists from S82 for brewery covers), update beer save path

**B. `beers.seasonal`**
- Displays in beer detail + filters
- Only seed migrations set it
- **Fix:** Add checkbox toggle to BeerFormModal near item type

**C. Sensory fields on NA beverages**
- TapListClient strips aroma/taste/finish/srm on save for NA beverages (line 128)
- But BeerFormModal still shows the pickers
- **Fix:** Conditionally hide SrmPicker + SensoryNotesPicker when `showSensoryNotesFields(itemType) === false`

**Owner:** Finley (UX + hide logic) + Dakota (implementation) + Alex (approve feel)
**Acceptance:** All three fields have working write UIs, NA beverages don't show sensory pickers.

---

### Track 4 — Documentation (Sam + Morgan)
- Update `docs/plans/deferred-sprint-options.md` with the audit lesson
- Add a "Write-path audit" step to `hoptrack-conventions` skill (PR required — touches the skill file)
- Memory entry for the lesson (see below)

**Owner:** Sam (requirements doc) + Morgan (skill update)

---

## Out of Scope
- No new features. No new sprint options. No design work.
- Sensory Layer v2 (Drew's ask) — waits one sprint
- Display Suite polish — waits one sprint
- Context7 playbook (P4 backlog) — waits

---

## Team Assignments

| Track | Lead | Support |
|---|---|---|
| 1. The Fix (migration 113) | Quinn | Avery, Riley |
| 2. The Safety Net (tests) | Casey | Reese, Avery |
| 3. Adjacent Gaps (S176 neighbors) | Finley | Dakota, Alex |
| 4. Documentation | Morgan | Sam |

---

## Success Criteria
- [ ] Migration 113 applied and backfill verified on staging (and prod once confirmed)
- [ ] `profiles.unique_beers` correct for 100% of users after backfill
- [ ] `brewery_visits` rebuilt from real sessions data
- [ ] All regression tests green
- [ ] Orphaned-columns guard test in CI (empty allowlist)
- [ ] Three S176-neighbor write paths live
- [ ] Memory entry saved
- [ ] Zero new lint errors, 2070+ tests passing
- [ ] `hoptrack-conventions` updated with write-path audit step

---

## Why this is a one-sprint interrupt
This sprint doesn't ship features. It ships **trust**. Every sprint after this one assumes the stats are correct. Before Drew does warm intros to real breweries, the brewery dashboard has to show real numbers — not placeholder zeros masquerading as data.

Drew will forgive a missing feature. He won't forgive a demo where his Asheville contact asks "what does this number mean" and Morgan has to say "...it's not wired up yet."

**This is a living document.** — Morgan
