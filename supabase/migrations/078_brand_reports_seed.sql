-- ============================================================================
-- Migration 078: Brand Reports Test Seed Data
-- Sprint 120 — The Lens
-- ============================================================================
-- Creates "Pint & Pixel Brewing Co." brand with 2 locations:
--   1. Pint & Pixel (existing, Asheville area)
--   2. Pint & Pixel — Charlotte (new, Charlotte NC 28270)
-- Seeds sessions, beer logs, followers across both locations
-- for the past 3 weeks to populate cross-location reports.
-- ============================================================================

DO $$
DECLARE
  joshua_id uuid := '90a1a802-8a79-4816-bf10-a900b91f2c5c';
  pp_brewery uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  pp_charlotte uuid := 'dd078001-0000-4000-8000-000000000001';
  v_brand_id uuid := 'bb000001-0000-4000-8000-000000000001';
  -- Test users (reuse from existing seed data)
  user_01 uuid := 'bbbbbbbb-0001-4000-8000-000000000001';
  user_02 uuid := 'bbbbbbbb-0002-4000-8000-000000000002';
  user_03 uuid := 'bbbbbbbb-0003-4000-8000-000000000003';
  user_04 uuid := 'bbbbbbbb-0004-4000-8000-000000000004';
  user_05 uuid := 'bbbbbbbb-0005-4000-8000-000000000005';
  -- Session IDs
  s_01 uuid := 'ee078001-0000-4000-8000-000000000001';
  s_02 uuid := 'ee078001-0000-4000-8000-000000000002';
  s_03 uuid := 'ee078001-0000-4000-8000-000000000003';
  s_04 uuid := 'ee078001-0000-4000-8000-000000000004';
  s_05 uuid := 'ee078001-0000-4000-8000-000000000005';
  s_06 uuid := 'ee078001-0000-4000-8000-000000000006';
  s_07 uuid := 'ee078001-0000-4000-8000-000000000007';
  s_08 uuid := 'ee078001-0000-4000-8000-000000000008';
  s_09 uuid := 'ee078001-0000-4000-8000-000000000009';
  s_10 uuid := 'ee078001-0000-4000-8000-000000000010';
  s_11 uuid := 'ee078001-0000-4000-8000-000000000011';
  s_12 uuid := 'ee078001-0000-4000-8000-000000000012';
  -- Beer IDs
  beer_pp1 uuid;
  beer_pp2 uuid;
  beer_clt1 uuid := 'ff078001-0000-4000-8000-000000000001';
  beer_clt2 uuid := 'ff078001-0000-4000-8000-000000000002';
  beer_clt3 uuid := 'ff078001-0000-4000-8000-000000000003';
BEGIN
  -- ─── 1. CREATE BRAND ──────────────────────────────────────────────────────
  INSERT INTO brewery_brands (id, name, slug, description, website_url, owner_id, created_at)
  VALUES (
    v_brand_id,
    'Pint & Pixel Brewing Co.',
    'pint-and-pixel',
    'Craft beer meets gaming culture. Taprooms in Asheville and Charlotte.',
    'https://pintandpixel.beer',
    joshua_id,
    now() - interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ─── 2. ADD BRAND ACCOUNT ─────────────────────────────────────────────────
  INSERT INTO brand_accounts (brand_id, user_id, role, created_at)
  VALUES (v_brand_id, joshua_id, 'owner', now() - interval '30 days')
  ON CONFLICT (user_id, brand_id) DO NOTHING;

  -- ─── 3. CREATE CHARLOTTE LOCATION ─────────────────────────────────────────
  INSERT INTO breweries (
    id, name, city, state, postal_code, street, website_url,
    description, latitude, longitude, verified, brand_id,
    subscription_tier, hop_route_eligible
  ) VALUES (
    pp_charlotte,
    'Pint & Pixel — Charlotte',
    'Charlotte', 'NC', '28270',
    '1234 Craft Beer Blvd',
    'https://pintandpixel.beer/charlotte',
    'The Charlotte taproom. Same great brews, new arcade cabinets, South End vibes.',
    35.1269, -80.8433,
    true,
    v_brand_id,
    'cask',
    true
  )
  ON CONFLICT (id) DO NOTHING;

  -- Joshua owns the Charlotte location too
  INSERT INTO brewery_accounts (user_id, brewery_id, role, created_at)
  VALUES (joshua_id, pp_charlotte, 'owner', now() - interval '25 days')
  ON CONFLICT DO NOTHING;

  -- ─── 4. LINK EXISTING PINT & PIXEL TO BRAND ──────────────────────────────
  UPDATE breweries SET brand_id = v_brand_id WHERE id = pp_brewery;

  -- ─── 5. CREATE BEERS FOR CHARLOTTE ────────────────────────────────────────
  INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active) VALUES
    (beer_clt1, pp_charlotte, 'Ctrl+Z Kölsch',     'Blonde Ale', 4.6, 20, 'Light, crisp German-style kölsch. The undo button for a long week.', true, true),
    (beer_clt2, pp_charlotte, 'Pixel Dust Hazy',    'IPA',        6.8, 50, 'Juicy haze bomb with Citra and Mosaic. Glows like a CRT.', true, true),
    (beer_clt3, pp_charlotte, 'Boss Level Stout',    'Stout',      7.2, 40, 'Rich imperial stout with espresso and dark chocolate. Final boss energy.', true, true)
  ON CONFLICT (id) DO NOTHING;

  -- ─── 6. GRAB EXISTING PINT & PIXEL BEER IDS ──────────────────────────────
  SELECT id INTO beer_pp1 FROM beers WHERE brewery_id = pp_brewery AND is_active = true LIMIT 1;
  SELECT id INTO beer_pp2 FROM beers WHERE brewery_id = pp_brewery AND is_active = true OFFSET 1 LIMIT 1;

  -- Fallback if no beers exist
  IF beer_pp1 IS NULL THEN
    beer_pp1 := beer_clt1;
    beer_pp2 := beer_clt2;
  END IF;
  IF beer_pp2 IS NULL THEN
    beer_pp2 := beer_pp1;
  END IF;

  -- ─── 7. SEED SESSIONS (past 3 weeks) ─────────────────────────────────────
  -- Asheville (flagship) gets more traffic, Charlotte ramping up
  INSERT INTO sessions (id, user_id, brewery_id, started_at, ended_at, is_active) VALUES
    -- Week 1 (2 weeks ago): Asheville busy, Charlotte just opened
    (s_01, user_01, pp_brewery,   now() - interval '14 days' + interval '18 hours', now() - interval '14 days' + interval '20 hours', false),
    (s_02, user_02, pp_brewery,   now() - interval '13 days' + interval '17 hours', now() - interval '13 days' + interval '19 hours', false),
    (s_03, user_03, pp_brewery,   now() - interval '12 days' + interval '19 hours', now() - interval '12 days' + interval '21 hours', false),
    (s_04, user_04, pp_charlotte, now() - interval '13 days' + interval '16 hours', now() - interval '13 days' + interval '18 hours', false),
    -- Week 2 (1 week ago): Charlotte picking up, cross-location visitors
    (s_05, user_01, pp_brewery,   now() - interval '7 days' + interval '18 hours', now() - interval '7 days' + interval '20 hours', false),
    (s_06, user_05, pp_brewery,   now() - interval '6 days' + interval '19 hours', now() - interval '6 days' + interval '21 hours', false),
    (s_07, user_01, pp_charlotte, now() - interval '6 days' + interval '14 hours', now() - interval '6 days' + interval '16 hours', false),
    (s_08, user_04, pp_charlotte, now() - interval '5 days' + interval '17 hours', now() - interval '5 days' + interval '19 hours', false),
    (s_09, user_03, pp_charlotte, now() - interval '5 days' + interval '18 hours', now() - interval '5 days' + interval '20 hours', false),
    -- This week: Both locations active
    (s_10, user_02, pp_brewery,   now() - interval '2 days' + interval '18 hours', now() - interval '2 days' + interval '20 hours', false),
    (s_11, user_05, pp_charlotte, now() - interval '2 days' + interval '17 hours', now() - interval '2 days' + interval '19 hours', false),
    (s_12, user_03, pp_charlotte, now() - interval '1 day' + interval '18 hours', now() - interval '1 day' + interval '20 hours', false)
  ON CONFLICT (id) DO NOTHING;

  -- ─── 8. SEED BEER LOGS ───────────────────────────────────────────────────
  -- user_01 visits both locations (cross-location visitor)
  INSERT INTO beer_logs (id, session_id, user_id, beer_id, brewery_id, rating, quantity, logged_at) VALUES
    -- Week 1
    (gen_random_uuid(), s_01, user_01, beer_pp1,  pp_brewery,   4.5, 2, now() - interval '14 days' + interval '18 hours 30 minutes'),
    (gen_random_uuid(), s_02, user_02, beer_pp2,  pp_brewery,   4.0, 1, now() - interval '13 days' + interval '17 hours 30 minutes'),
    (gen_random_uuid(), s_03, user_03, beer_pp1,  pp_brewery,   3.5, 2, now() - interval '12 days' + interval '19 hours 30 minutes'),
    (gen_random_uuid(), s_04, user_04, beer_clt1, pp_charlotte, 4.0, 1, now() - interval '13 days' + interval '16 hours 30 minutes'),
    (gen_random_uuid(), s_04, user_04, beer_clt2, pp_charlotte, 4.5, 1, now() - interval '13 days' + interval '17 hours'),
    -- Week 2
    (gen_random_uuid(), s_05, user_01, beer_pp1,  pp_brewery,   4.5, 1, now() - interval '7 days' + interval '18 hours 30 minutes'),
    (gen_random_uuid(), s_05, user_01, beer_pp2,  pp_brewery,   4.0, 1, now() - interval '7 days' + interval '19 hours'),
    (gen_random_uuid(), s_06, user_05, beer_pp1,  pp_brewery,   5.0, 2, now() - interval '6 days' + interval '19 hours 30 minutes'),
    (gen_random_uuid(), s_07, user_01, beer_clt1, pp_charlotte, 4.5, 1, now() - interval '6 days' + interval '14 hours 30 minutes'),
    (gen_random_uuid(), s_07, user_01, beer_clt3, pp_charlotte, 4.0, 1, now() - interval '6 days' + interval '15 hours'),
    (gen_random_uuid(), s_08, user_04, beer_clt2, pp_charlotte, 3.5, 2, now() - interval '5 days' + interval '17 hours 30 minutes'),
    (gen_random_uuid(), s_09, user_03, beer_clt1, pp_charlotte, 4.0, 1, now() - interval '5 days' + interval '18 hours 30 minutes'),
    -- This week
    (gen_random_uuid(), s_10, user_02, beer_pp1,  pp_brewery,   4.0, 2, now() - interval '2 days' + interval '18 hours 30 minutes'),
    (gen_random_uuid(), s_11, user_05, beer_clt2, pp_charlotte, 3.5, 1, now() - interval '2 days' + interval '17 hours 30 minutes'),
    (gen_random_uuid(), s_12, user_03, beer_clt3, pp_charlotte, 4.5, 2, now() - interval '1 day' + interval '18 hours 30 minutes')
  ON CONFLICT DO NOTHING;

END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
