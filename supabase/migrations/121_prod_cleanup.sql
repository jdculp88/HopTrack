-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 121: Prod Cleanup — remove all test/demo data
--
-- Accumulated from seed migrations: 024 (demo breweries + beers), 074 (Pint &
-- Pixel + test users), 075/076/078/100 (demo activity), 104/105 (diverse seed
-- data), 112 (P&P sensory).
--
-- After this migration, prod contains ONLY:
--   - Real brewery catalog (~7,191 breweries from OpenBreweryDB + enrichment)
--   - Real beer catalog (~1,018 beers from hand-curated + Barback crawls)
--   - Real auth users (jdculp88@gmail.com founder, testflight@hoptrack.beer beta)
--   - Waitlist signups (real pre-launch demand)
--
-- Test patterns removed:
--   Users  : aaaaaaaa-*, bbbbbbbb-*, cc000000-*, f000000*-*
--   Emails : @pintandpixel.test, @hoptrack.test, @test.hoptrack.beer, setup@hoptrack.app
--   Breweries : dd000001-*, dd078001-*, a1b2c3d4-*
--   Beers  : dd000004-*, cccccccc-*, plus any orphaned by brewery delete
--
-- Execution plan:
--   1. Assert founder account exists (abort if not — means we're in wrong DB)
--   2. Collect test user IDs + test brewery IDs into temp tables
--   3. Report counts before delete
--   4. Cascade delete (most FKs have ON DELETE CASCADE from auth.users + breweries)
--   5. Verify: zero test data remains, real data preserved
--   6. RAISE on failure (transaction rolls back)
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ─── Safety: founder account MUST exist ──────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jdculp88@gmail.com') THEN
    RAISE EXCEPTION 'ABORT: founder account jdculp88@gmail.com not found. Wrong database? Not running cleanup.';
  END IF;
  RAISE NOTICE 'Safety check passed: founder account present.';
END $$;

-- ─── Collect target IDs ──────────────────────────────────────────────────────
CREATE TEMP TABLE _cleanup_user_ids AS
SELECT id, email FROM auth.users
WHERE id::text LIKE 'aaaaaaaa-%'
   OR id::text LIKE 'bbbbbbbb-%'
   OR id::text LIKE 'cc000000-%'
   OR id::text LIKE 'f000000%-%'
   OR email LIKE '%@pintandpixel.test'
   OR email LIKE '%@hoptrack.test'
   OR email LIKE '%@test.hoptrack.beer'
   OR email = 'setup@hoptrack.app';

CREATE TEMP TABLE _cleanup_brewery_ids AS
SELECT id, name FROM breweries
WHERE id::text LIKE 'dd000001-%'
   OR id::text LIKE 'dd078001-%'
   OR id::text LIKE 'a1b2c3d4-%';

-- Report before
DO $$
DECLARE
  user_count int;
  brewery_count int;
BEGIN
  SELECT count(*) INTO user_count FROM _cleanup_user_ids;
  SELECT count(*) INTO brewery_count FROM _cleanup_brewery_ids;
  RAISE NOTICE 'Cleanup targets: % test users, % test breweries', user_count, brewery_count;
END $$;

-- ─── Delete test brewery beers FIRST (in case FK doesn't CASCADE) ───────────
DELETE FROM beers
WHERE brewery_id IN (SELECT id FROM _cleanup_brewery_ids)
   OR id::text LIKE 'dd000004-%'
   OR id::text LIKE 'cccccccc-%';

-- ─── Delete test breweries (CASCADE to tap list items, reviews, etc.) ───────
DELETE FROM breweries
WHERE id IN (SELECT id FROM _cleanup_brewery_ids);

-- ─── Delete test auth users (CASCADE to profiles, sessions, beer_logs, etc.) ─
DELETE FROM auth.users
WHERE id IN (SELECT id FROM _cleanup_user_ids);

-- ─── Verification ────────────────────────────────────────────────────────────
DO $$
DECLARE
  remaining_test_users int;
  remaining_test_breweries int;
  remaining_test_beers int;
  real_brewery_count int;
BEGIN
  -- Nothing of ours should remain
  SELECT count(*) INTO remaining_test_users FROM auth.users
  WHERE id::text LIKE 'aaaaaaaa-%'
     OR id::text LIKE 'bbbbbbbb-%'
     OR id::text LIKE 'cc000000-%'
     OR id::text LIKE 'f000000%-%'
     OR email LIKE '%@pintandpixel.test'
     OR email LIKE '%@hoptrack.test'
     OR email LIKE '%@test.hoptrack.beer'
     OR email = 'setup@hoptrack.app';

  SELECT count(*) INTO remaining_test_breweries FROM breweries
  WHERE id::text LIKE 'dd000001-%' OR id::text LIKE 'dd078001-%' OR id::text LIKE 'a1b2c3d4-%';

  SELECT count(*) INTO remaining_test_beers FROM beers
  WHERE id::text LIKE 'dd000004-%' OR id::text LIKE 'cccccccc-%';

  -- Real catalog must survive
  SELECT count(*) INTO real_brewery_count FROM breweries;

  IF remaining_test_users > 0 THEN
    RAISE EXCEPTION 'Cleanup incomplete: % test users remain', remaining_test_users;
  END IF;
  IF remaining_test_breweries > 0 THEN
    RAISE EXCEPTION 'Cleanup incomplete: % test breweries remain', remaining_test_breweries;
  END IF;
  IF remaining_test_beers > 0 THEN
    RAISE EXCEPTION 'Cleanup incomplete: % test beers remain', remaining_test_beers;
  END IF;
  IF real_brewery_count < 7000 THEN
    RAISE EXCEPTION 'PANIC: real brewery catalog dropped below 7000 (% breweries). Rolling back.', real_brewery_count;
  END IF;

  RAISE NOTICE 'Cleanup verified: 0 test users, 0 test breweries, 0 test beers remain';
  RAISE NOTICE 'Preserved: % real breweries', real_brewery_count;
END $$;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- Rollback plan (if applied in error and detected immediately):
--   Only option is to restore from backup. Supabase takes daily backups; use
--   dashboard → Database → Backups → Point-in-time recovery.
--
-- There is no automated reverse migration because we don't preserve the
-- deleted row contents. If this ran against the wrong DB, stop the app and
-- restore from backup immediately.
-- ─────────────────────────────────────────────────────────────────────────────
