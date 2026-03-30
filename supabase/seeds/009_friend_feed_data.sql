-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 009: Friend Feed Data — All Card Types Visible
-- Riley / Quinn — Adds sessions + beer_logs for 8 friends so every card type
-- appears in Josh's Friends feed: SessionCard, StreakFeedCard, AchievementFeedCard,
-- NewFavoriteCard, FriendJoinedCard.
-- Safe to re-run (ON CONFLICT DO NOTHING throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Friend user UUIDs (from seed 003)
  u01 uuid := 'cc000000-0000-0000-0000-000000000001'; -- Alex Chen
  u02 uuid := 'cc000000-0000-0000-0000-000000000002'; -- Marcus Johnson
  u03 uuid := 'cc000000-0000-0000-0000-000000000003'; -- Priya Patel
  u05 uuid := 'cc000000-0000-0000-0000-000000000005'; -- Sam Rivera
  u07 uuid := 'cc000000-0000-0000-0000-000000000007'; -- Tom Nguyen
  u08 uuid := 'cc000000-0000-0000-0000-000000000008'; -- Jessica Blake
  u10 uuid := 'cc000000-0000-0000-0000-000000000010'; -- Rachel Foster
  u11 uuid := 'cc000000-0000-0000-0000-000000000011'; -- James O'Toole

  -- Breweries (from seed 007)
  pp_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- Pint & Pixel
  bs_id uuid := 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; -- Barrel & Stone
  hf_id uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678902'; -- Hopfield
  lc_id uuid := 'd4e5f6a7-b8c9-0123-defa-123456789003'; -- Lost Creek

  -- Beer UUIDs — Pint & Pixel (resolved by name below)
  b_ipa     uuid; b_stout uuid; b_sour   uuid;
  b_wheat   uuid; b_pils  uuid; b_dipa   uuid;
  b_porter  uuid; b_lager uuid; b_pale   uuid; b_marzen uuid;

  -- Beer UUIDs — other breweries (from seed 007)
  bs_amber   uuid := 'e5f6a7b8-c9d0-1234-efab-234567890104';
  bs_ipa     uuid := 'f6a7b8c9-d0e1-2345-fabc-345678901205';
  bs_wheat   uuid := 'a7b8c9d0-e1f2-3456-abcd-456789012306';
  hf_hazy    uuid := 'b8c9d0e1-f2a3-4567-bcde-567890123407';
  hf_saison  uuid := 'c9d0e1f2-a3b4-5678-cdef-678901234508';
  hf_porter  uuid := 'd0e1f2a3-b4c5-6789-defa-789012345609';
  lc_ipa     uuid := 'e1f2a3b4-c5d6-7890-efab-890123456700';
  lc_kolsch  uuid := 'f2a3b4c5-d6e7-8901-fabc-901234567801';
  lc_sour    uuid := 'a3b4c5d6-e7f8-9012-abcd-012345678902';

  -- Session UUIDs for friends (ff prefix)
  fs01 uuid := 'ff000009-0000-0000-0000-000000000001'; -- Alex @ Pint & Pixel (4h ago)
  fs02 uuid := 'ff000009-0000-0000-0000-000000000002'; -- Tom @ Hopfield (6h ago)
  fs03 uuid := 'ff000009-0000-0000-0000-000000000003'; -- Marcus @ Barrel & Stone (10h ago)
  fs04 uuid := 'ff000009-0000-0000-0000-000000000004'; -- Rachel @ Lost Creek (22h ago)
  fs05 uuid := 'ff000009-0000-0000-0000-000000000005'; -- Priya @ home (2d ago)
  fs06 uuid := 'ff000009-0000-0000-0000-000000000006'; -- James @ Pint & Pixel (3d ago)
  fs07 uuid := 'ff000009-0000-0000-0000-000000000007'; -- Jessica @ Hopfield (3d ago)
  fs08 uuid := 'ff000009-0000-0000-0000-000000000008'; -- Sam @ Barrel & Stone (4d ago)

BEGIN

  -- ── 1. Resolve Pint & Pixel beer IDs ────────────────────────────────────
  SELECT id INTO b_ipa    FROM beers WHERE brewery_id = pp_id AND name = 'Debug IPA';
  SELECT id INTO b_stout  FROM beers WHERE brewery_id = pp_id AND name = 'Dark Mode Stout';
  SELECT id INTO b_sour   FROM beers WHERE brewery_id = pp_id AND name = 'Stack Overflow Sour';
  SELECT id INTO b_wheat  FROM beers WHERE brewery_id = pp_id AND name = '404 Wheat Not Found';
  SELECT id INTO b_pils   FROM beers WHERE brewery_id = pp_id AND name = 'Pixel Perfect Pils';
  SELECT id INTO b_dipa   FROM beers WHERE brewery_id = pp_id AND name = 'Deploy Friday DIPA';
  SELECT id INTO b_porter FROM beers WHERE brewery_id = pp_id AND name = 'Kernel Panic Porter';
  SELECT id INTO b_lager  FROM beers WHERE brewery_id = pp_id AND name = 'Legacy Code Lager';
  SELECT id INTO b_pale   FROM beers WHERE brewery_id = pp_id AND name = 'Pull Request Pale';
  SELECT id INTO b_marzen FROM beers WHERE brewery_id = pp_id AND name = 'Merge Conflict Märzen';

  -- ── 2. Friend sessions — spread across last 4 days ──────────────────────
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at, note)
  VALUES
    -- Alex @ Pint & Pixel — tonight (4h ago)
    (fs01, u01, pp_id, 'brewery', false, true, 175,
     now() - interval '4 hours',
     now() - interval '1 hour',
     'First time at P&P in months. Still the best IPA in Austin.'),

    -- Tom @ Hopfield — this afternoon (6h ago)
    (fs02, u07, hf_id, 'brewery', false, true, 195,
     now() - interval '6 hours',
     now() - interval '3 hours',
     'Hazy Daze + a saison. Thursday well spent.'),

    -- Marcus @ Barrel & Stone — this morning (10h ago)
    (fs03, u02, bs_id, 'brewery', false, true, 160,
     now() - interval '10 hours',
     now() - interval '7 hours',
     NULL),

    -- Rachel @ Lost Creek — last night (22h ago)
    (fs04, u10, lc_id, 'brewery', false, true, 180,
     now() - interval '22 hours',
     now() - interval '19 hours',
     'That Greenbelt Gose is genuinely dangerous in this heat.'),

    -- Priya — home session (2d ago)
    (fs05, u03, NULL, 'home', false, true, 100,
     now() - interval '2 days' + interval '20 hours',
     now() - interval '2 days' + interval '22 hours',
     'Trying some cans from the bottle shop. Research night.'),

    -- James @ Pint & Pixel (3d ago)
    (fs06, u11, pp_id, 'brewery', false, true, 165,
     now() - interval '3 days' + interval '18 hours',
     now() - interval '3 days' + interval '21 hours',
     NULL),

    -- Jessica @ Hopfield (3d ago, different time)
    (fs07, u08, hf_id, 'brewery', false, true, 190,
     now() - interval '3 days' + interval '14 hours',
     now() - interval '3 days' + interval '17 hours',
     'Dark Matter Porter is everything.'),

    -- Sam @ Barrel & Stone (4d ago)
    (fs08, u05, bs_id, 'brewery', false, true, 155,
     now() - interval '4 days' + interval '16 hours',
     now() - interval '4 days' + interval '19 hours',
     NULL)

  ON CONFLICT (id) DO NOTHING;

  -- ── 3. Beer logs for each friend session ────────────────────────────────
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, flavor_tags, serving_style, comment, logged_at)
  VALUES

    -- fs01: Alex @ Pint & Pixel — 3 beers
    (fs01, u01, b_ipa,    pp_id, 1, 4.5, ARRAY['citrus','hoppy'],       'draft', 'Classic opener. This place holds up.',         now() - interval '4 hours'),
    (fs01, u01, b_dipa,   pp_id, 1, 5.0, ARRAY['tropical','dank'],      'draft', 'Deploy Friday DIPA is genuinely elite.',       now() - interval '3 hours'),
    (fs01, u01, b_stout,  pp_id, 1, 4.0, ARRAY['roasty','chocolate'],   'draft', NULL,                                           now() - interval '2 hours'),

    -- fs02: Tom @ Hopfield — 2 beers
    (fs02, u07, hf_hazy,  hf_id, 1, 5.0, ARRAY['mango','tropical','hazy'], 'draft', 'Every time. Undefeated.',                  now() - interval '6 hours'),
    (fs02, u07, hf_saison,hf_id, 1, 4.0, ARRAY['spicy','dry','crisp'],     'draft', 'Lighter than expected but grows on you.',  now() - interval '5 hours'),

    -- fs03: Marcus @ Barrel & Stone — 2 beers
    (fs03, u02, bs_amber, bs_id, 1, 4.5, ARRAY['caramel','oaky','smooth'], 'draft', 'Stave Amber hits different on a weekday.', now() - interval '10 hours'),
    (fs03, u02, bs_ipa,   bs_id, 1, 4.0, ARRAY['citrus','whiskey','resinous'],'draft', NULL,                                   now() - interval '9 hours'),

    -- fs04: Rachel @ Lost Creek — 3 beers (reviewer, everything rated)
    (fs04, u10, lc_sour,  lc_id, 1, 5.0, ARRAY['lime','salty','refreshing'],  'draft', 'Greenbelt Gose is a top-5 beer for me. Not kidding.', now() - interval '22 hours'),
    (fs04, u10, lc_kolsch,lc_id, 1, 4.5, ARRAY['crisp','light','floral'],     'draft', 'Barton Kölsch — accidentally ordered a second.',       now() - interval '21 hours'),
    (fs04, u10, lc_ipa,   lc_id, 1, 4.0, ARRAY['pine','grapefruit','bitter'], 'draft', 'Spring Branch IPA: textbook West Coast.',               now() - interval '20 hours'),

    -- fs05: Priya @ home — 2 beers
    (fs05, u03, bs_wheat, bs_id, 1, 4.0, ARRAY['vanilla','citrus','soft'], 'can', 'Grabbed a 4-pack of White Oak Wit. Good call.',     now() - interval '2 days' + interval '20 hours'),
    (fs05, u03, hf_porter,hf_id, 1, 4.5, ARRAY['coffee','chocolate'],     'can', 'Dark Matter Porter from a can: still excellent.',    now() - interval '2 days' + interval '21 hours'),

    -- fs06: James @ Pint & Pixel — 2 beers
    (fs06, u11, b_porter, pp_id, 1, 5.0, ARRAY['vanilla','smoky','roasty'],   'draft', 'Kernel Panic Porter is in my top 3 beers ever.', now() - interval '3 days' + interval '18 hours'),
    (fs06, u11, b_sour,   pp_id, 1, 4.5, ARRAY['tart','fruity','effervescent'],'draft', 'Stack Overflow Sour: dangerous and delicious.',   now() - interval '3 days' + interval '19 hours'),

    -- fs07: Jessica @ Hopfield — 3 beers
    (fs07, u08, hf_porter,hf_id, 1, 5.0, ARRAY['dark','coffee','rich'],     'draft', 'Dark Matter Porter is everything I needed today.',  now() - interval '3 days' + interval '14 hours'),
    (fs07, u08, hf_hazy,  hf_id, 1, 4.5, ARRAY['juicy','tropical'],        'draft', 'Hazy Daze: as advertised.',                         now() - interval '3 days' + interval '15 hours'),
    (fs07, u08, hf_saison,hf_id, 1, 3.5, ARRAY['farmhouse','dry'],         'draft', 'Circuit Saison is an acquired taste. Working on it.', now() - interval '3 days' + interval '16 hours'),

    -- fs08: Sam @ Barrel & Stone — 2 beers
    (fs08, u05, bs_ipa,   bs_id, 1, 4.5, ARRAY['citrus','oaky','hoppy'],  'draft', NULL,                                             now() - interval '4 days' + interval '16 hours'),
    (fs08, u05, bs_amber, bs_id, 1, 4.0, ARRAY['malty','caramel','warm'], 'draft', 'Stave Amber is so solid. Underrated.',             now() - interval '4 days' + interval '17 hours')

  ON CONFLICT DO NOTHING;

  -- ── 4. Set streak milestones on friend profiles ──────────────────────────
  -- Triggers StreakFeedCard for these users when their sessions load
  UPDATE public.profiles SET current_streak = 7  WHERE id = u01; -- Alex: 7-day streak
  UPDATE public.profiles SET current_streak = 14 WHERE id = u07; -- Tom: 14-day streak
  UPDATE public.profiles SET current_streak = 30 WHERE id = u10; -- Rachel: 30-day streak (!!)
  UPDATE public.profiles SET current_streak = 5  WHERE id = u11; -- James: 5-day streak

  -- ── 5. Add 5-star reviews so NewFavoriteCard appears ────────────────────
  -- beer_reviews table: user_id, beer_id, brewery_id, rating, comment
  INSERT INTO beer_reviews (user_id, beer_id, brewery_id, rating, comment, created_at)
  VALUES
    (u10, lc_sour,  lc_id, 5.0, 'My new favorite beer. Period. Greenbelt Gose is perfect.', now() - interval '22 hours'),
    (u07, hf_hazy,  hf_id, 5.0, 'Hazy Daze from Hopfield is elite. Top shelf hazy IPA.',   now() - interval '6 hours'),
    (u08, hf_porter,hf_id, 5.0, 'Dark Matter Porter: this is what craft beer is all about.', now() - interval '3 days' + interval '14 hours')
  ON CONFLICT DO NOTHING;

  -- ── 6. Update brewery visit records for friends ──────────────────────────
  INSERT INTO brewery_visits (user_id, brewery_id, visit_count, last_visited_at)
  VALUES
    (u01, pp_id, 3, now() - interval '4 hours'),
    (u07, hf_id, 5, now() - interval '6 hours'),
    (u02, bs_id, 2, now() - interval '10 hours'),
    (u10, lc_id, 4, now() - interval '22 hours'),
    (u11, pp_id, 6, now() - interval '3 days'),
    (u08, hf_id, 3, now() - interval '3 days'),
    (u05, bs_id, 2, now() - interval '4 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET visit_count = EXCLUDED.visit_count,
        last_visited_at = EXCLUDED.last_visited_at;

  RAISE NOTICE 'Seed 009 complete — % friend sessions, streak milestones set, 5-star reviews added', 8;
END $$;
