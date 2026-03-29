-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 006: February Activity for Pint & Pixel Brewing Co. (Month 2 of 2)
-- Casey (QA) — adds ~80 check-ins covering Feb 1–28 (the month BEFORE seed 003).
-- Users are newer here: still discovering styles, more first-impression comments,
-- slightly lower frequency, ratings a touch more varied (4.0–4.5 avg, some 3.5s).
-- Run AFTER 003_test_activity.sql (users and beers must already exist).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  demo_brewery_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Fixed test user UUIDs (same as seed 003)
  u01 uuid := 'cc000000-0000-0000-0000-000000000001';
  u02 uuid := 'cc000000-0000-0000-0000-000000000002';
  u03 uuid := 'cc000000-0000-0000-0000-000000000003';
  u04 uuid := 'cc000000-0000-0000-0000-000000000004';
  u05 uuid := 'cc000000-0000-0000-0000-000000000005';
  u06 uuid := 'cc000000-0000-0000-0000-000000000006';
  u07 uuid := 'cc000000-0000-0000-0000-000000000007';
  u08 uuid := 'cc000000-0000-0000-0000-000000000008';
  u09 uuid := 'cc000000-0000-0000-0000-000000000009';
  u10 uuid := 'cc000000-0000-0000-0000-000000000010';
  u11 uuid := 'cc000000-0000-0000-0000-000000000011';
  u12 uuid := 'cc000000-0000-0000-0000-000000000012';

  -- Beer IDs (fetched by name)
  b_ipa       uuid; b_pils    uuid; b_stout   uuid;
  b_sour      uuid; b_marzen  uuid; b_pale    uuid;
  b_porter    uuid; b_wheat   uuid; b_dipa    uuid;
  b_lager     uuid;

BEGIN

  -- ── 1. Fetch beer IDs ─────────────────────────────────────────────────────
  SELECT id INTO b_ipa    FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Debug IPA';
  SELECT id INTO b_pils   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Pixel Perfect Pils';
  SELECT id INTO b_stout  FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Dark Mode Stout';
  SELECT id INTO b_sour   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Stack Overflow Sour';
  SELECT id INTO b_marzen FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Merge Conflict Märzen';
  SELECT id INTO b_pale   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Pull Request Pale';
  SELECT id INTO b_porter FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Kernel Panic Porter';
  SELECT id INTO b_wheat  FROM beers WHERE brewery_id = demo_brewery_id AND name = '404 Wheat Not Found';
  SELECT id INTO b_dipa   FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Deploy Friday DIPA';
  SELECT id INTO b_lager  FROM beers WHERE brewery_id = demo_brewery_id AND name = 'Legacy Code Lager';

  RAISE NOTICE 'Seed 006: Activity tracked via sessions + beer_logs (seeds 009/010).';

END $$;

-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT 'Seed 006: Activity tracked via sessions + beer_logs (seeds 009/010).' AS result;
