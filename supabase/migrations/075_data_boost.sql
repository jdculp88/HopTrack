-- ============================================================================
-- Migration 075: Data Boost — Friday Night in Austin
-- Sprint 115 — Make every dashboard and feed light up
-- ============================================================================
-- Adds: Joshua's personal sessions + beer logs, more consumer sessions
-- spread across today/this week/month, active sessions for "Active Now",
-- more reviews, reactions, comments, achievements, loyalty stamps.
-- ============================================================================

DO $$
DECLARE
  -- Joshua
  j uuid := '90a1a802-8a79-4816-bf10-a900b91f2c5c';
  -- Pint & Pixel
  pp uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  -- Demo breweries
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001';
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002';
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003';
  -- Test users
  user_01 uuid := 'bbbbbbbb-0001-4000-8000-000000000001';
  user_02 uuid := 'bbbbbbbb-0002-4000-8000-000000000002';
  user_03 uuid := 'bbbbbbbb-0003-4000-8000-000000000003';
  user_04 uuid := 'bbbbbbbb-0004-4000-8000-000000000004';
  user_05 uuid := 'bbbbbbbb-0005-4000-8000-000000000005';
  user_06 uuid := 'bbbbbbbb-0006-4000-8000-000000000006';
  user_07 uuid := 'bbbbbbbb-0007-4000-8000-000000000007';
  user_08 uuid := 'bbbbbbbb-0008-4000-8000-000000000008';
  mktg_id uuid := 'aaaaaaaa-0001-4000-8000-000000000001';
  -- New beer refs
  beer_01 uuid := 'cccccccc-0001-4000-8000-000000000001';
  beer_02 uuid := 'cccccccc-0002-4000-8000-000000000002';
  beer_04 uuid := 'cccccccc-0004-4000-8000-000000000004';
  beer_05 uuid := 'cccccccc-0005-4000-8000-000000000005';
  beer_06 uuid := 'cccccccc-0006-4000-8000-000000000006';
  beer_07 uuid := 'cccccccc-0007-4000-8000-000000000007';
  beer_08 uuid := 'cccccccc-0008-4000-8000-000000000008';
  beer_09 uuid := 'cccccccc-0009-4000-8000-000000000009';
  beer_10 uuid := 'cccccccc-0010-4000-8000-000000000010';
  -- Existing PP beers (looked up)
  debug_ipa uuid;
  pixel_pils uuid;
  dark_mode uuid;
  stack_sour uuid;
  merge_marzen uuid;
  pull_pale uuid;
  kernel_porter uuid;
  wheat_404 uuid;
  deploy_dipa uuid;
  legacy_lager uuid;
  -- New session UUIDs (100-series to avoid conflicts with 074)
  s101 uuid := 'dddddddd-0101-4000-8000-000000000001';
  s102 uuid := 'dddddddd-0102-4000-8000-000000000002';
  s103 uuid := 'dddddddd-0103-4000-8000-000000000003';
  s104 uuid := 'dddddddd-0104-4000-8000-000000000004';
  s105 uuid := 'dddddddd-0105-4000-8000-000000000005';
  s106 uuid := 'dddddddd-0106-4000-8000-000000000006';
  s107 uuid := 'dddddddd-0107-4000-8000-000000000007';
  s108 uuid := 'dddddddd-0108-4000-8000-000000000008';
  s109 uuid := 'dddddddd-0109-4000-8000-000000000009';
  s110 uuid := 'dddddddd-0110-4000-8000-000000000010';
  s111 uuid := 'dddddddd-0111-4000-8000-000000000011';
  s112 uuid := 'dddddddd-0112-4000-8000-000000000012';
  s113 uuid := 'dddddddd-0113-4000-8000-000000000013';
  s114 uuid := 'dddddddd-0114-4000-8000-000000000014';
  s115 uuid := 'dddddddd-0115-4000-8000-000000000015';
  s116 uuid := 'dddddddd-0116-4000-8000-000000000016';
  s117 uuid := 'dddddddd-0117-4000-8000-000000000017';
  s118 uuid := 'dddddddd-0118-4000-8000-000000000018';
  s119 uuid := 'dddddddd-0119-4000-8000-000000000019';
  s120 uuid := 'dddddddd-0120-4000-8000-000000000020';
  -- Active sessions (people at the bar RIGHT NOW)
  sa01 uuid := 'dddddddd-a001-4000-8000-000000000001';
  sa02 uuid := 'dddddddd-a002-4000-8000-000000000002';
  sa03 uuid := 'dddddddd-a003-4000-8000-000000000003';
  -- Joshua's personal sessions
  sj01 uuid := 'dddddddd-b001-4000-8000-000000000001';
  sj02 uuid := 'dddddddd-b002-4000-8000-000000000002';
  sj03 uuid := 'dddddddd-b003-4000-8000-000000000003';
  sj04 uuid := 'dddddddd-b004-4000-8000-000000000004';
  sj05 uuid := 'dddddddd-b005-4000-8000-000000000005';
  sj06 uuid := 'dddddddd-b006-4000-8000-000000000006';
  sj07 uuid := 'dddddddd-b007-4000-8000-000000000007';
  sj08 uuid := 'dddddddd-b008-4000-8000-000000000008';

BEGIN
  -- Look up existing Pint & Pixel beer IDs
  SELECT id INTO debug_ipa FROM beers WHERE brewery_id = pp AND name = 'Debug IPA' LIMIT 1;
  SELECT id INTO pixel_pils FROM beers WHERE brewery_id = pp AND name = 'Pixel Perfect Pils' LIMIT 1;
  SELECT id INTO dark_mode FROM beers WHERE brewery_id = pp AND name = 'Dark Mode Stout' LIMIT 1;
  SELECT id INTO stack_sour FROM beers WHERE brewery_id = pp AND name = 'Stack Overflow Sour' LIMIT 1;
  SELECT id INTO merge_marzen FROM beers WHERE brewery_id = pp AND name = 'Merge Conflict Märzen' LIMIT 1;
  SELECT id INTO pull_pale FROM beers WHERE brewery_id = pp AND name = 'Pull Request Pale' LIMIT 1;
  SELECT id INTO kernel_porter FROM beers WHERE brewery_id = pp AND name = 'Kernel Panic Porter' LIMIT 1;
  SELECT id INTO wheat_404 FROM beers WHERE brewery_id = pp AND name = '404 Wheat Not Found' LIMIT 1;
  SELECT id INTO deploy_dipa FROM beers WHERE brewery_id = pp AND name = 'Deploy Friday DIPA' LIMIT 1;
  SELECT id INTO legacy_lager FROM beers WHERE brewery_id = pp AND name = 'Legacy Code Lager' LIMIT 1;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- JOSHUA'S PERSONAL SESSIONS (so his feed + You tab have content)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO sessions (id, user_id, brewery_id, context, started_at, ended_at, is_active, share_to_feed, note, xp_awarded) VALUES
    (sj01, j, pp,       'brewery', now() - interval '2 hours',  now() - interval '30 minutes', false, true, 'Testing the new Infinite Loop IPA. This is the one.', 55),
    (sj02, j, pp,       'brewery', now() - interval '1 day' - interval '5 hours', now() - interval '1 day' - interval '3 hours', false, true, 'Happy hour with the team. Debug IPA never misses.', 50),
    (sj03, j, brew_mtn, 'brewery', now() - interval '3 days' - interval '4 hours', now() - interval '3 days' - interval '2 hours', false, true, 'Mountain Ridge has a new hazy on tap', 45),
    (sj04, j, pp,       'brewery', now() - interval '5 days' - interval '6 hours', now() - interval '5 days' - interval '3 hours', false, true, 'Barrel-aged Binary Barleywine. Life changing.', 60),
    (sj05, j, brew_riv, 'brewery', now() - interval '8 days' - interval '3 hours', now() - interval '8 days' - interval '1 hour', false, true, null, 40),
    (sj06, j, pp,       'brewery', now() - interval '12 days' - interval '4 hours', now() - interval '12 days' - interval '2 hours', false, true, 'Flight night: Saison, Kölsch, ESB, and the Nitro Stout', 55),
    (sj07, j, brew_smk, 'brewery', now() - interval '16 days' - interval '5 hours', now() - interval '16 days' - interval '3 hours', false, true, 'Smoky Barrel knows what they are doing with porters', 45),
    (sj08, j, pp,       'brewery', now() - interval '22 days' - interval '3 hours', now() - interval '22 days' - interval '1 hour', false, true, 'Quick after-work pint. Pixel Pils hits the spot.', 35)
  ON CONFLICT (id) DO NOTHING;

  -- Joshua's beer logs
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, rating, flavor_tags, serving_style, comment, logged_at) VALUES
    (sj01, j, beer_04, pp, 5.0, ARRAY['tropical','juicy','hazy'], 'draft', 'Best hazy IPA in Austin. Period.', now() - interval '1 hour'),
    (sj01, j, debug_ipa, pp, 4.5, ARRAY['hoppy','citrus','piney'], 'draft', 'The OG. Always reliable.', now() - interval '90 minutes'),
    (sj02, j, debug_ipa, pp, 4.6, ARRAY['citrus','hoppy','crisp'], 'draft', null, now() - interval '1 day' - interval '4 hours'),
    (sj02, j, beer_07, pp, 4.3, ARRAY['tropical','light','sessionable'], 'draft', 'Great session beer', now() - interval '1 day' - interval '3 hours' - interval '30 minutes'),
    (sj02, j, beer_01, pp, 4.1, ARRAY['crisp','clean','refreshing'], 'draft', 'Kölsch for the win', now() - interval '1 day' - interval '3 hours'),
    (sj04, j, beer_08, pp, 4.9, ARRAY['toffee','dark-fruit','bourbon','warming'], 'draft', 'This barleywine is a MASTERPIECE. Toffee, dark fruit, warm finish. Sip slow.', now() - interval '5 days' - interval '5 hours'),
    (sj04, j, beer_05, pp, 4.7, ARRAY['chocolate','creamy','espresso'], 'draft', 'Nitro stout chaser. Perfect pairing.', now() - interval '5 days' - interval '4 hours'),
    (sj06, j, beer_06, pp, 4.4, ARRAY['peppery','dry','farmhouse'], 'draft', 'Saison is growing on me', now() - interval '12 days' - interval '3 hours'),
    (sj06, j, beer_01, pp, 4.2, ARRAY['crisp','light','clean'], 'draft', null, now() - interval '12 days' - interval '3 hours' + interval '20 minutes'),
    (sj06, j, beer_10, pp, 4.5, ARRAY['malty','earthy','biscuit'], 'draft', 'Proper ESB. More people need to try this.', now() - interval '12 days' - interval '2 hours' - interval '30 minutes'),
    (sj06, j, beer_05, pp, 4.8, ARRAY['chocolate','creamy','coffee'], 'draft', 'The nitro cascade is mesmerizing', now() - interval '12 days' - interval '2 hours'),
    (sj08, j, pixel_pils, pp, 4.6, ARRAY['floral','crisp','clean'], 'draft', 'Quick pils. Hits the spot every time.', now() - interval '22 days' - interval '2 hours')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- TODAY'S SESSIONS AT PINT & PIXEL (lights up "Today" banner)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO sessions (id, user_id, brewery_id, context, started_at, ended_at, is_active, share_to_feed, note, xp_awarded) VALUES
    -- Completed today
    (s101, user_01, pp, 'brewery', now() - interval '6 hours', now() - interval '4 hours', false, true, 'Lunch session. Infinite Loop IPA and a burger.', 50),
    (s102, user_03, pp, 'brewery', now() - interval '5 hours', now() - interval '3 hours' - interval '30 minutes', false, true, 'Quick pils break', 35),
    (s103, user_05, pp, 'brewery', now() - interval '4 hours', now() - interval '2 hours', false, true, 'Kölsch weather today', 40),
    (s104, user_08, pp, 'brewery', now() - interval '3 hours', now() - interval '1 hour', false, true, 'ESB flight with the crew', 45),
    (s105, user_02, pp, 'brewery', now() - interval '4 hours' - interval '30 minutes', now() - interval '2 hours' - interval '30 minutes', false, true, 'Dark Mode double feature', 50),
    (s106, user_04, pp, 'brewery', now() - interval '3 hours' - interval '30 minutes', now() - interval '2 hours', false, true, 'Sour + cider combo', 45),
    (s107, mktg_id, pp, 'brewery', now() - interval '5 hours', now() - interval '3 hours', false, true, 'Photographing the new menu cards', 40),

    -- ACTIVE RIGHT NOW (people at the bar)
    (sa01, user_06, pp, 'brewery', now() - interval '45 minutes', null, true, true, 'Porter Paul is in the house', 0),
    (sa02, user_07, pp, 'brewery', now() - interval '30 minutes', null, true, true, null, 0),
    (sa03, user_04, pp, 'brewery', now() - interval '20 minutes', null, true, true, 'Round 2. Sour again.', 0)
  ON CONFLICT (id) DO NOTHING;

  -- Today's beer logs
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, rating, flavor_tags, serving_style, comment, logged_at) VALUES
    (s101, user_01, beer_04, pp, 4.9, ARRAY['tropical','juicy','soft'], 'draft', 'This IPA keeps getting better', now() - interval '5 hours'),
    (s101, user_01, debug_ipa, pp, 4.5, ARRAY['citrus','hoppy','piney'], 'draft', null, now() - interval '5 hours' + interval '30 minutes'),
    (s101, user_01, beer_07, pp, 4.2, ARRAY['tropical','light'], 'draft', 'Palette cleanser', now() - interval '4 hours' - interval '30 minutes'),
    (s102, user_03, pixel_pils, pp, 4.7, ARRAY['floral','crisp','clean'], 'draft', 'Still the best pils in town', now() - interval '4 hours'),
    (s102, user_03, beer_01, pp, 4.4, ARRAY['crisp','clean','light'], 'draft', null, now() - interval '3 hours' - interval '45 minutes'),
    (s103, user_05, beer_01, pp, 4.5, ARRAY['crisp','refreshing'], 'draft', 'Kölsch on a warm day = perfection', now() - interval '3 hours'),
    (s103, user_05, legacy_lager, pp, 4.2, ARRAY['clean','malty','crisp'], 'draft', null, now() - interval '2 hours' - interval '30 minutes'),
    (s104, user_08, beer_10, pp, 4.6, ARRAY['malty','earthy','balanced'], 'draft', 'The ESB is criminally underrated', now() - interval '2 hours'),
    (s104, user_08, beer_02, pp, 4.3, ARRAY['caramel','toasty','smooth'], 'draft', null, now() - interval '1 hour' - interval '30 minutes'),
    (s105, user_02, dark_mode, pp, 5.0, ARRAY['chocolate','coffee','roasty'], 'draft', 'Five stars. Every. Single. Time.', now() - interval '3 hours' - interval '30 minutes'),
    (s105, user_02, beer_05, pp, 4.8, ARRAY['creamy','chocolate','espresso'], 'draft', 'Nitro chaser. Heaven.', now() - interval '3 hours'),
    (s106, user_04, stack_sour, pp, 4.7, ARRAY['tart','raspberry','fruity'], 'draft', 'This sour is next level today', now() - interval '3 hours'),
    (s106, user_04, beer_09, pp, 4.1, ARRAY['apple','ginger','dry'], 'draft', 'Cider for the palate reset', now() - interval '2 hours' - interval '30 minutes'),
    (s107, mktg_id, beer_06, pp, 4.4, ARRAY['spicy','dry','farmhouse'], 'draft', 'Great pour for the gram', now() - interval '4 hours'),
    -- Active session logs (people drinking RIGHT NOW)
    (sa01, user_06, kernel_porter, pp, 4.6, ARRAY['roasty','vanilla','smoky'], 'draft', 'Friday night porter', now() - interval '30 minutes'),
    (sa02, user_07, wheat_404, pp, 4.7, ARRAY['banana','clove','hazy'], 'draft', null, now() - interval '20 minutes'),
    (sa03, user_04, stack_sour, pp, 4.5, ARRAY['tart','fruity'], 'draft', 'Back for more', now() - interval '10 minutes')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- THIS WEEK'S SESSIONS (fills out the sparkline + analytics)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO sessions (id, user_id, brewery_id, context, started_at, ended_at, is_active, share_to_feed, note, xp_awarded) VALUES
    (s108, user_01, pp, 'brewery', now() - interval '1 day' - interval '6 hours', now() - interval '1 day' - interval '4 hours', false, true, 'Tuesday night flight', 50),
    (s109, user_02, pp, 'brewery', now() - interval '1 day' - interval '5 hours', now() - interval '1 day' - interval '3 hours', false, true, null, 45),
    (s110, user_04, pp, 'brewery', now() - interval '2 days' - interval '7 hours', now() - interval '2 days' - interval '5 hours', false, true, 'Sour Monday', 45),
    (s111, user_06, pp, 'brewery', now() - interval '2 days' - interval '5 hours', now() - interval '2 days' - interval '3 hours', false, true, null, 40),
    (s112, user_03, pp, 'brewery', now() - interval '3 days' - interval '6 hours', now() - interval '3 days' - interval '4 hours', false, true, 'Pilsner Pete returns', 40),
    (s113, user_07, pp, 'brewery', now() - interval '3 days' - interval '4 hours', now() - interval '3 days' - interval '2 hours', false, true, 'Wheat Wednesday', 40),
    (s114, user_05, pp, 'brewery', now() - interval '4 days' - interval '5 hours', now() - interval '4 days' - interval '3 hours', false, true, null, 35),
    (s115, user_08, pp, 'brewery', now() - interval '4 days' - interval '7 hours', now() - interval '4 days' - interval '5 hours', false, true, 'Red ale and a book', 40),
    (s116, user_01, pp, 'brewery', now() - interval '5 days' - interval '8 hours', now() - interval '5 days' - interval '5 hours', false, true, 'Friday night crew outing', 55),
    (s117, user_02, pp, 'brewery', now() - interval '5 days' - interval '7 hours', now() - interval '5 days' - interval '5 hours', false, true, null, 50),
    (s118, user_04, pp, 'brewery', now() - interval '5 days' - interval '6 hours', now() - interval '5 days' - interval '4 hours', false, true, 'Last Friday was legendary', 50),
    (s119, user_06, pp, 'brewery', now() - interval '6 days' - interval '5 hours', now() - interval '6 days' - interval '3 hours', false, true, null, 40),
    (s120, user_03, pp, 'brewery', now() - interval '6 days' - interval '6 hours', now() - interval '6 days' - interval '4 hours', false, true, 'Saturday session', 45)
  ON CONFLICT (id) DO NOTHING;

  -- This week's beer logs
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, rating, flavor_tags, serving_style, comment, logged_at) VALUES
    (s108, user_01, debug_ipa, pp, 4.6, ARRAY['hoppy','citrus'], 'draft', null, now() - interval '1 day' - interval '5 hours'),
    (s108, user_01, deploy_dipa, pp, 4.8, ARRAY['dank','tropical','resinous'], 'draft', 'Deploy Friday on a Tuesday. Living dangerously.', now() - interval '1 day' - interval '4 hours' - interval '30 minutes'),
    (s109, user_02, dark_mode, pp, 5.0, ARRAY['chocolate','coffee'], 'draft', null, now() - interval '1 day' - interval '4 hours'),
    (s109, user_02, kernel_porter, pp, 4.5, ARRAY['roasty','vanilla'], 'draft', null, now() - interval '1 day' - interval '3 hours' - interval '30 minutes'),
    (s110, user_04, stack_sour, pp, 4.6, ARRAY['tart','raspberry'], 'draft', null, now() - interval '2 days' - interval '6 hours'),
    (s110, user_04, beer_06, pp, 4.3, ARRAY['spicy','farmhouse'], 'draft', 'Saison pairs great with sours', now() - interval '2 days' - interval '5 hours' - interval '30 minutes'),
    (s111, user_06, kernel_porter, pp, 4.7, ARRAY['roasty','smoky','vanilla'], 'draft', null, now() - interval '2 days' - interval '4 hours'),
    (s112, user_03, pixel_pils, pp, 4.8, ARRAY['floral','crisp'], 'draft', 'Saaz hops forever', now() - interval '3 days' - interval '5 hours'),
    (s113, user_07, wheat_404, pp, 4.7, ARRAY['banana','clove'], 'draft', null, now() - interval '3 days' - interval '3 hours'),
    (s114, user_05, legacy_lager, pp, 4.3, ARRAY['clean','crisp'], 'draft', null, now() - interval '4 days' - interval '4 hours'),
    (s114, user_05, beer_01, pp, 4.4, ARRAY['crisp','light'], 'draft', null, now() - interval '4 days' - interval '3 hours' - interval '30 minutes'),
    (s115, user_08, beer_02, pp, 4.5, ARRAY['caramel','malty'], 'draft', null, now() - interval '4 days' - interval '6 hours'),
    (s115, user_08, beer_10, pp, 4.4, ARRAY['earthy','biscuit'], 'draft', null, now() - interval '4 days' - interval '5 hours' - interval '30 minutes'),
    (s116, user_01, beer_04, pp, 5.0, ARRAY['tropical','juicy','mango'], 'draft', 'Friday night NEIPA. Undefeated.', now() - interval '5 days' - interval '7 hours'),
    (s116, user_01, beer_08, pp, 4.8, ARRAY['toffee','warming','complex'], 'draft', 'Barleywine nightcap', now() - interval '5 days' - interval '5 hours' - interval '30 minutes'),
    (s117, user_02, beer_05, pp, 4.9, ARRAY['creamy','chocolate'], 'draft', null, now() - interval '5 days' - interval '6 hours'),
    (s118, user_04, stack_sour, pp, 4.5, ARRAY['tart','fruity'], 'draft', null, now() - interval '5 days' - interval '5 hours'),
    (s118, user_04, beer_09, pp, 4.2, ARRAY['apple','dry'], 'draft', null, now() - interval '5 days' - interval '4 hours' - interval '30 minutes'),
    (s119, user_06, dark_mode, pp, 4.6, ARRAY['roasty','chocolate'], 'draft', null, now() - interval '6 days' - interval '4 hours'),
    (s120, user_03, pixel_pils, pp, 4.7, ARRAY['crisp','floral'], 'draft', null, now() - interval '6 days' - interval '5 hours'),
    (s120, user_03, merge_marzen, pp, 4.3, ARRAY['toasty','malty','clean'], 'draft', 'Märzen underrated as always', now() - interval '6 days' - interval '4 hours' - interval '30 minutes')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- MORE COMMENTS ON TODAY'S SESSIONS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO session_comments (session_id, user_id, body, created_at) VALUES
    (s101, user_02, 'Save me an Infinite Loop!', now() - interval '5 hours' + interval '15 minutes'),
    (s101, user_04, 'That burger pairing is elite', now() - interval '4 hours' - interval '45 minutes'),
    (s101, j, 'Best IPA in 78701, confirmed', now() - interval '4 hours' - interval '30 minutes'),
    (s105, user_01, 'Dark Mode Stout AGAIN? Legend.', now() - interval '3 hours' - interval '15 minutes'),
    (s105, user_06, 'The nitro is pouring perfect today', now() - interval '3 hours'),
    (s106, user_07, 'How is the cider?', now() - interval '2 hours' - interval '45 minutes'),
    (s106, user_04, 'Surprisingly good! Ginger comes through nice', now() - interval '2 hours' - interval '30 minutes'),
    (sa01, user_02, 'Porter Paul in the building!', now() - interval '20 minutes'),
    (sa03, user_01, 'Friday round 2 lets gooo', now() - interval '15 minutes'),
    (sj01, user_01, 'Welcome to the Infinite Loop fan club, boss', now() - interval '1 hour' - interval '15 minutes'),
    (sj01, user_02, 'The founder has spoken', now() - interval '1 hour'),
    (sj04, user_02, 'That barleywine is INSANE', now() - interval '5 days' - interval '4 hours'),
    (sj04, user_08, 'Need to try this', now() - interval '5 days' - interval '3 hours' - interval '30 minutes')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- MORE REACTIONS (on today's + Joshua's sessions)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO reactions (user_id, session_id, type, created_at) VALUES
    (user_02, s101, 'flame', now() - interval '5 hours' + interval '10 minutes'),
    (user_04, s101, 'beer', now() - interval '5 hours' + interval '12 minutes'),
    (j,       s101, 'thumbs_up', now() - interval '4 hours' - interval '40 minutes'),
    (user_01, s105, 'flame', now() - interval '3 hours' - interval '20 minutes'),
    (user_06, s105, 'beer', now() - interval '3 hours' - interval '10 minutes'),
    (user_07, s106, 'thumbs_up', now() - interval '2 hours' - interval '40 minutes'),
    (user_01, sa01, 'beer', now() - interval '15 minutes'),
    (user_02, sa03, 'flame', now() - interval '5 minutes'),
    (user_01, sj01, 'flame', now() - interval '1 hour' - interval '10 minutes'),
    (user_02, sj01, 'beer', now() - interval '1 hour' - interval '5 minutes'),
    (user_04, sj01, 'thumbs_up', now() - interval '55 minutes'),
    (user_02, sj04, 'flame', now() - interval '5 days' - interval '4 hours' + interval '5 minutes'),
    (user_08, sj04, 'beer', now() - interval '5 days' - interval '3 hours' - interval '45 minutes'),
    (j, s116, 'flame', now() - interval '5 days' - interval '6 hours'),
    (j, s108, 'thumbs_up', now() - interval '1 day' - interval '4 hours')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- JOSHUA'S BREWERY REVIEW + BEER REVIEWS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at) VALUES
    (j, pp, 5.0, 'Obviously biased but the IPAs are world-class, the arcade games are a blast, and the team makes it special. Best brewery in Austin.', now() - interval '10 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment;

  INSERT INTO beer_reviews (user_id, beer_id, rating, comment, created_at) VALUES
    (j, beer_04, 5.0, 'Infinite Loop IPA is our flagship for a reason. Mango, pineapple, pillowy soft. The recipe took 6 iterations and it was worth every one.', now() - interval '2 hours'),
    (j, beer_08, 4.9, 'Binary Barleywine — 14 months in bourbon barrels. Toffee, dark fruit, warming. This is our pride and joy.', now() - interval '5 days'),
    (j, debug_ipa, 4.7, 'The original. West Coast IPA with grapefruit and pine. Where it all started.', now() - interval '10 days'),
    (j, beer_05, 4.8, 'Null Pointer Nitro — our nitro milk stout. That cascade pour is worth the wait.', now() - interval '8 days')
  ON CONFLICT (user_id, beer_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- JOSHUA'S LOYALTY CARD + ACHIEVEMENTS + WISHLIST
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO loyalty_cards (user_id, brewery_id, stamps, lifetime_stamps, last_stamp_at)
  VALUES (j, pp, 5, 15, now() - interval '2 hours')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET stamps = 5, lifetime_stamps = 15, last_stamp_at = now() - interval '2 hours';

  -- More achievements for Joshua
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT j, id, now() - interval '15 days' FROM achievements WHERE key = 'style_student'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT j, id, now() - interval '10 days' FROM achievements WHERE key = 'regular'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT j, id, now() - interval '5 days' FROM achievements WHERE key = 'critics_choice'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT j, id, now() - interval '8 days' FROM achievements WHERE key = 'brewery_tourist_10'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- MORE NOTIFICATIONS FOR JOSHUA (recent, unread)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO notifications (user_id, type, title, body, read, created_at) VALUES
    (j, 'friend_checkin', 'Friend Check-in', 'Hazy Hayes just checked in at Pint & Pixel', false, now() - interval '5 hours'),
    (j, 'friend_checkin', 'Friend Check-in', 'Sarah Darkwood is drinking at Pint & Pixel', false, now() - interval '4 hours'),
    (j, 'friend_checkin', 'Friend Check-in', 'Sam Tartley checked in at Pint & Pixel', false, now() - interval '3 hours'),
    (j, 'reaction', 'New Reaction', 'Hazy Hayes loved your session at Pint & Pixel', false, now() - interval '1 hour'),
    (j, 'session_comment', 'New Comment', 'Hazy Hayes commented: "Welcome to the Infinite Loop fan club, boss"', false, now() - interval '1 hour' - interval '15 minutes'),
    (j, 'session_comment', 'New Comment', 'Sarah Darkwood commented: "The founder has spoken"', false, now() - interval '1 hour'),
    (j, 'achievement_unlocked', 'Achievement Unlocked!', 'You earned the Critic''s Choice badge!', false, now() - interval '5 days'),
    (j, 'achievement_unlocked', 'Achievement Unlocked!', 'You earned the Brewery Tourist badge!', false, now() - interval '8 days'),
    (j, 'new_event', 'Upcoming Event', 'Barrel-Aged Release Party at Pint & Pixel in 2 weeks!', false, now() - interval '12 hours')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- UPDATE JOSHUA'S PROFILE STATS
  -- ═══════════════════════════════════════════════════════════════════════════
  UPDATE profiles SET
    total_checkins = 38, unique_beers = 28, unique_breweries = 12,
    xp = 850, level = 6, current_streak = 3, longest_streak = 5,
    last_session_date = CURRENT_DATE
  WHERE id = j;

  -- Also bump test user stats to be current
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_01;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_02;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_03;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_04;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_05;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_06;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_07;
  UPDATE profiles SET last_session_date = CURRENT_DATE WHERE id = user_08;

END $$;

NOTIFY pgrst, 'reload schema';
