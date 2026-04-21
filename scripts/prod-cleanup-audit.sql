-- ─────────────────────────────────────────────────────────────────────────────
-- Prod Cleanup Audit — dry-run that shows what test data exists.
-- READS ONLY. Safe to run against prod or staging without any writes.
--
-- Run via: psql "CONNECTION_STRING" -f scripts/prod-cleanup-audit.sql
--
-- Test-data UUID patterns (cataloged from migrations 024, 074, 076, 112):
--   dd000001-*              → 3 demo breweries (Mountain Ridge, River Bend, Smoky Barrel)
--   dd000004-*              → 20 demo beers for those breweries
--   a1b2c3d4-e5f6-*         → Pint & Pixel brewery + its beers
--   aaaaaaaa-0000 to 0003   → Pint & Pixel staff/owner test users
--   bbbbbbbb-*              → 8 consumer test users (user_01 through user_08)
--   cccccccc-*              → 10 Pint & Pixel beers
--   dddddddd-*              → session UUIDs for test activity
--
-- Test-data EMAIL patterns:
--   *@pintandpixel.test     → Pint & Pixel staff
--   setup@hoptrack.app      → scripts/supabase-setup.mjs user
--
-- What stays (REAL data worth keeping in prod):
--   breweries 048_open_brewery_db_seed.sql — 7,177 real OpenBreweryDB breweries
--   beers from 049_kaggle_beer_seed.sql — real beer catalog
--   Heist brewery from 052/053 — real Charlotte brewery
--   Enrichment data from 107-119 — real Asheville/Charlotte/Raleigh/Durham/Wilmington breweries
--   waitlist signups — real pre-launch demand intel
--   Joshua's real auth.users row (jdculp88@gmail.com) — NOT part of test UUIDs
-- ─────────────────────────────────────────────────────────────────────────────

\echo '══════════════════════════════════════════════════════════════════════════════'
\echo 'HOPTRACK PROD CLEANUP AUDIT — READ ONLY, no writes'
\echo '══════════════════════════════════════════════════════════════════════════════'
\echo ''

\echo '── Test breweries (will be removed) ─────────────────────────────────────────'
SELECT id, name, city, state
FROM breweries
WHERE id::text LIKE 'dd000001-%'
   OR id::text LIKE 'a1b2c3d4-%'
ORDER BY name;

\echo ''
\echo '── Test beers (will be removed via CASCADE when breweries deleted) ──────────'
SELECT id, name, brewery_id, style, abv
FROM beers
WHERE id::text LIKE 'dd000004-%'
   OR id::text LIKE 'cccccccc-%'
ORDER BY brewery_id, name;

\echo ''
\echo '── Test auth users (will be removed) ────────────────────────────────────────'
SELECT id, email, created_at
FROM auth.users
WHERE id::text LIKE 'aaaaaaaa-%'
   OR id::text LIKE 'bbbbbbbb-%'
   OR email LIKE '%@pintandpixel.test'
   OR email = 'setup@hoptrack.app'
ORDER BY email;

\echo ''
\echo '── Test profiles (will be removed via CASCADE from auth.users) ──────────────'
SELECT id, username, display_name
FROM profiles
WHERE id::text LIKE 'aaaaaaaa-%'
   OR id::text LIKE 'bbbbbbbb-%'
ORDER BY username;

\echo ''
\echo '── Test sessions by UUID pattern (will be removed) ──────────────────────────'
SELECT COUNT(*) AS test_session_count
FROM sessions
WHERE id::text LIKE 'dddddddd-%';

\echo ''
\echo '── SUMMARY COUNTS ───────────────────────────────────────────────────────────'
SELECT
  (SELECT COUNT(*) FROM breweries WHERE id::text LIKE 'dd000001-%' OR id::text LIKE 'a1b2c3d4-%') AS test_breweries,
  (SELECT COUNT(*) FROM beers WHERE id::text LIKE 'dd000004-%' OR id::text LIKE 'cccccccc-%') AS test_beers,
  (SELECT COUNT(*) FROM auth.users WHERE id::text LIKE 'aaaaaaaa-%' OR id::text LIKE 'bbbbbbbb-%' OR email LIKE '%@pintandpixel.test' OR email = 'setup@hoptrack.app') AS test_users,
  (SELECT COUNT(*) FROM profiles WHERE id::text LIKE 'aaaaaaaa-%' OR id::text LIKE 'bbbbbbbb-%') AS test_profiles,
  (SELECT COUNT(*) FROM sessions WHERE id::text LIKE 'dddddddd-%') AS test_sessions;

\echo ''
\echo '── PRESERVATION CHECK — these counts should stay HIGH after cleanup ─────────'
SELECT
  (SELECT COUNT(*) FROM breweries WHERE id::text NOT LIKE 'dd000001-%' AND id::text NOT LIKE 'a1b2c3d4-%') AS real_breweries_kept,
  (SELECT COUNT(*) FROM beers WHERE id::text NOT LIKE 'dd000004-%' AND id::text NOT LIKE 'cccccccc-%') AS real_beers_kept,
  (SELECT COUNT(*) FROM waitlist) AS waitlist_signups_kept;

\echo ''
\echo '══════════════════════════════════════════════════════════════════════════════'
\echo 'AUDIT COMPLETE. Review counts before proceeding with 121_prod_cleanup.sql.'
\echo '══════════════════════════════════════════════════════════════════════════════'
