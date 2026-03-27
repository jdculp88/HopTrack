-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 007: Josh's Universe — Full Live Demo Data
-- Jordan (Dev) — loads @josh with 60 days of history, 12 friends, 4 breweries,
-- sessions + beer_logs, achievements, loyalty cards, wishlist, home sessions.
-- Looks alive. Feels alive. Basically IS alive.
--
-- Run AFTER migrations 001–007 and seeds 002–006.
-- Safe to re-run (ON CONFLICT DO NOTHING / DO UPDATE throughout).
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Josh's account — finds the real user (not a @hoptrack.test test user)
  josh_id uuid;

  -- Demo brewery (already exists from seed 002)
  pp_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- Additional Austin-area breweries (fixed UUIDs for idempotency)
  bs_id  uuid := 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; -- Barrel & Stone Brewing
  hf_id  uuid := 'c3d4e5f6-a7b8-9012-cdef-012345678902'; -- Hopfield Brewing Co.
  lc_id  uuid := 'd4e5f6a7-b8c9-0123-defa-123456789003'; -- Lost Creek Brewing

  -- Beer IDs — Pint & Pixel (resolved by name)
  b_ipa     uuid; b_pils   uuid; b_stout  uuid; b_sour   uuid;
  b_marzen  uuid; b_pale   uuid; b_porter uuid; b_wheat  uuid;
  b_dipa    uuid; b_lager  uuid;

  -- Beer IDs — other breweries (fixed UUIDs)
  bs_amber   uuid := 'e5f6a7b8-c9d0-1234-efab-234567890104';
  bs_ipa     uuid := 'f6a7b8c9-d0e1-2345-fabc-345678901205';
  bs_wheat   uuid := 'a7b8c9d0-e1f2-3456-abcd-456789012306';
  hf_hazy    uuid := 'b8c9d0e1-f2a3-4567-bcde-567890123407';
  hf_saison  uuid := 'c9d0e1f2-a3b4-5678-cdef-678901234508';
  hf_porter  uuid := 'd0e1f2a3-b4c5-6789-defa-789012345609';
  lc_ipa     uuid := 'e1f2a3b4-c5d6-7890-efab-890123456700';
  lc_kolsch  uuid := 'f2a3b4c5-d6e7-8901-fabc-901234567801';
  lc_sour    uuid := 'a3b4c5d6-e7f8-9012-abcd-012345678902';

  -- Session IDs for josh
  s01 uuid := 'aa000001-0000-0000-0000-000000000001';
  s02 uuid := 'aa000001-0000-0000-0000-000000000002';
  s03 uuid := 'aa000001-0000-0000-0000-000000000003';
  s04 uuid := 'aa000001-0000-0000-0000-000000000004';
  s05 uuid := 'aa000001-0000-0000-0000-000000000005';
  s06 uuid := 'aa000001-0000-0000-0000-000000000006';
  s07 uuid := 'aa000001-0000-0000-0000-000000000007';
  s08 uuid := 'aa000001-0000-0000-0000-000000000008';
  s09 uuid := 'aa000001-0000-0000-0000-000000000009';
  s10 uuid := 'aa000001-0000-0000-0000-000000000010';
  s11 uuid := 'aa000001-0000-0000-0000-000000000011';
  s12 uuid := 'aa000001-0000-0000-0000-000000000012';
  s13 uuid := 'aa000001-0000-0000-0000-000000000013';
  s14 uuid := 'aa000001-0000-0000-0000-000000000014';
  s15 uuid := 'aa000001-0000-0000-0000-000000000015'; -- home session

  -- Test user UUIDs (from seed 003)
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

BEGIN

  -- ── 0. Find Josh ──────────────────────────────────────────────────────────
  SELECT id INTO josh_id
  FROM auth.users
  WHERE email NOT LIKE '%hoptrack.test%'
  ORDER BY created_at ASC
  LIMIT 1;

  IF josh_id IS NULL THEN
    RAISE EXCEPTION 'Could not find Josh''s user account. Make sure you''re logged in and run seed 002 first.';
  END IF;

  -- ── 1. Polish Josh's profile ──────────────────────────────────────────────
  UPDATE public.profiles SET
    display_name     = 'Josh',
    bio              = 'Founder of HopTrack. I built the app so I could obsessively track every beer I drink. Send help — and also IPAs.',
    home_city        = 'Austin, TX',
    avatar_url       = 'https://api.dicebear.com/7.x/avataaars/svg?seed=joshfounder',
    level            = 9,
    xp               = 4180,
    total_checkins   = 47,
    unique_beers     = 26,
    unique_breweries = 4,
    is_public        = true
  WHERE id = josh_id;

  -- ── 2. Three more Austin-area breweries ──────────────────────────────────
  INSERT INTO breweries (id, name, brewery_type, street, city, state, country, latitude, longitude, description, website_url, phone, verified)
  VALUES
    (bs_id, 'Barrel & Stone Brewing',  'microbrewery',   '1701 E. Cesar Chavez St', 'Austin', 'Texas', 'United States', 30.2571, -97.7201,
     'East Austin''s favorite barrel-aged haven. We age everything in local whiskey barrels and don''t apologize for it.',
     'https://barrelandstone.example.com', '(512) 555-0171', true),
    (hf_id, 'Hopfield Brewing Co.',    'brewpub',         '512 W. 6th Street',       'Austin', 'Texas', 'United States', 30.2699, -97.7496,
     'Downtown Austin brewpub serving food and fresh-hopped ales. The hazy IPA line is undefeated.',
     'https://hopfield.example.com',      '(512) 555-0512', true),
    (lc_id, 'Lost Creek Brewing',      'regional',        '9000 N. Lamar Blvd',      'Austin', 'Texas', 'United States', 30.3498, -97.7204,
     'North Austin brewing with a big patio and bigger pours. Known for the rotating sour program and killer Kölsch.',
     'https://lostcreek.example.com',     '(512) 555-0900', true)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- ── 3. Beers at the extra breweries ──────────────────────────────────────
  INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_active)
  VALUES
    -- Barrel & Stone
    (bs_amber, bs_id, 'Stave Amber',         'Amber Ale',     5.8, 28, 'Toasted oak and caramel malt. Bourbon barrel-finished. Your liver''s new nemesis.',                    true, true),
    (bs_ipa,   bs_id, 'Chip Shot IPA',        'IPA',           6.5, 58, 'Citrus-forward IPA dry-hopped in a used whiskey barrel. Chaotic, delicious.',                          true, true),
    (bs_wheat, bs_id, 'White Oak Wit',        'Witbier',       4.6, 12, 'Belgian-style wit aged briefly in oak. Soft citrus peel and a hint of vanilla.',                       true, true),
    -- Hopfield
    (hf_hazy,  hf_id, 'Hazy Daze',           'Hazy IPA',      6.8, 35, 'Pillowy, unfiltered, and dangerously smooth. Mango and passionfruit. Zero apology.',                   true, true),
    (hf_saison,hf_id, 'Circuit Saison',       'Saison',        5.4, 22, 'Farmhouse-style saison with subtle spice and a dry, effervescent finish. Pairs with everything.',      true, true),
    (hf_porter,hf_id, 'Dark Matter Porter',   'Porter',        6.3, 40, 'Cold-brew coffee and dark chocolate dominate. The kind of porter you get a second of.',                true, true),
    -- Lost Creek
    (lc_ipa,   lc_id, 'Spring Branch IPA',    'West Coast IPA',6.1, 62, 'Clean, resinous West Coast IPA. Pine and grapefruit. A classic.',                                     true, true),
    (lc_kolsch,lc_id, 'Barton Kölsch',        'Kölsch',        4.8, 20, 'Bright, crisp, and crushable. This is the beer you drink three of by accident.',                      true, true),
    (lc_sour,  lc_id, 'Greenbelt Gose',       'Gose',          4.2, 8,  'Salted gose with lime and cucumber. Dangerous poolside. Required at any outdoor event.',               true, true)
  ON CONFLICT (id) DO NOTHING;

  -- ── 4. Fetch Pint & Pixel beer IDs ───────────────────────────────────────
  SELECT id INTO b_ipa    FROM beers WHERE brewery_id = pp_id AND name = 'Debug IPA';
  SELECT id INTO b_pils   FROM beers WHERE brewery_id = pp_id AND name = 'Pixel Perfect Pils';
  SELECT id INTO b_stout  FROM beers WHERE brewery_id = pp_id AND name = 'Dark Mode Stout';
  SELECT id INTO b_sour   FROM beers WHERE brewery_id = pp_id AND name = 'Stack Overflow Sour';
  SELECT id INTO b_marzen FROM beers WHERE brewery_id = pp_id AND name = 'Merge Conflict Märzen';
  SELECT id INTO b_pale   FROM beers WHERE brewery_id = pp_id AND name = 'Pull Request Pale';
  SELECT id INTO b_porter FROM beers WHERE brewery_id = pp_id AND name = 'Kernel Panic Porter';
  SELECT id INTO b_wheat  FROM beers WHERE brewery_id = pp_id AND name = '404 Wheat Not Found';
  SELECT id INTO b_dipa   FROM beers WHERE brewery_id = pp_id AND name = 'Deploy Friday DIPA';
  SELECT id INTO b_lager  FROM beers WHERE brewery_id = pp_id AND name = 'Legacy Code Lager';

  -- ── 5. Create Josh's sessions ─────────────────────────────────────────────
  -- ~15 sessions over 60 days. Mix of all 4 breweries + 1 home session.
  INSERT INTO sessions (id, user_id, brewery_id, context, is_active, share_to_feed, xp_awarded, started_at, ended_at) VALUES

    -- Pint & Pixel visits (home brewery, most frequent)
    (s01, josh_id, pp_id, 'brewery', false, true,  135, now() - interval '58 days' + interval '18 hours', now() - interval '58 days' + interval '21 hours'),
    (s02, josh_id, pp_id, 'brewery', false, true,  160, now() - interval '51 days' + interval '17 hours', now() - interval '51 days' + interval '20 hours'),
    (s03, josh_id, pp_id, 'brewery', false, true,  185, now() - interval '44 days' + interval '18 hours', now() - interval '44 days' + interval '22 hours'),
    (s04, josh_id, pp_id, 'brewery', false, true,  145, now() - interval '37 days' + interval '19 hours', now() - interval '37 days' + interval '22 hours'),
    (s05, josh_id, pp_id, 'brewery', false, true,  160, now() - interval '30 days' + interval '17 hours', now() - interval '30 days' + interval '20 hours'),
    (s06, josh_id, pp_id, 'brewery', false, true,  195, now() - interval '23 days' + interval '18 hours', now() - interval '23 days' + interval '22 hours'),
    (s07, josh_id, pp_id, 'brewery', false, true,  170, now() - interval '16 days' + interval '17 hours', now() - interval '16 days' + interval '21 hours'),
    (s08, josh_id, pp_id, 'brewery', false, true,  185, now() - interval '9 days'  + interval '18 hours', now() - interval '9 days'  + interval '22 hours'),
    (s09, josh_id, pp_id, 'brewery', false, true,  150, now() - interval '2 days'  + interval '16 hours', now() - interval '2 days'  + interval '19 hours'),

    -- Barrel & Stone (discovered mid-run)
    (s10, josh_id, bs_id, 'brewery', false, true,  185, now() - interval '49 days' + interval '14 hours', now() - interval '49 days' + interval '17 hours'),
    (s11, josh_id, bs_id, 'brewery', false, true,  160, now() - interval '28 days' + interval '15 hours', now() - interval '28 days' + interval '18 hours'),

    -- Hopfield Brewing
    (s12, josh_id, hf_id, 'brewery', false, true,  195, now() - interval '42 days' + interval '12 hours', now() - interval '42 days' + interval '16 hours'),
    (s13, josh_id, hf_id, 'brewery', false, true,  170, now() - interval '14 days' + interval '17 hours', now() - interval '14 days' + interval '20 hours'),

    -- Lost Creek
    (s14, josh_id, lc_id, 'brewery', false, true,  160, now() - interval '21 days' + interval '13 hours', now() - interval '21 days' + interval '16 hours'),

    -- Home session (Sunday couch beer research)
    (s15, josh_id, NULL,  'home',    false, true,  100, now() - interval '5 days'  + interval '20 hours', now() - interval '5 days'  + interval '22 hours')

  ON CONFLICT (id) DO NOTHING;

  -- ── 6. Beer logs for each session ─────────────────────────────────────────
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, quantity, rating, flavor_tags, serving_style, comment, logged_at) VALUES

    -- s01: First P&P visit (2 beers, excited energy)
    (s01, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', 'Ok this is why I built this app. Debug IPA is exactly the beer I wanted to exist.',          now() - interval '58 days' + interval '18 hours' + interval '10 min'),
    (s01, josh_id, b_stout,  pp_id, 1, 4.5, ARRAY['roasty','chocolate'],     'draft', 'Dark Mode Stout — the name alone. Silky and deep. Came back from the bar with two.',          now() - interval '58 days' + interval '19 hours' + interval '20 min'),

    -- s02: Second P&P visit (branching out)
    (s02, josh_id, b_ipa,    pp_id, 2, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', 'Had two. Would do it again. Zero regrets logged here.',                                        now() - interval '51 days' + interval '17 hours' + interval '15 min'),
    (s02, josh_id, b_sour,   pp_id, 1, 4.5, ARRAY['tart','fruity','crisp'],   'draft', 'Stack Overflow Sour is the error I never want to fix.',                                        now() - interval '51 days' + interval '18 hours' + interval '5 min'),
    (s02, josh_id, b_pils,   pp_id, 1, 4.5, ARRAY['crisp','floral','clean'],  'draft', 'Ordered a pilsner to "slow down." Didn''t slow down.',                                        now() - interval '51 days' + interval '18 hours' + interval '45 min'),

    -- s03: Big Friday night (4 beers, squad was there)
    (s03, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', 'Opening beer. Non-negotiable.',                                                                now() - interval '44 days' + interval '18 hours'),
    (s03, josh_id, b_dipa,   pp_id, 1, 4.5, ARRAY['dank','tropical','resinous'],'draft','Deploy Friday DIPA on an actual Friday. The poetry is not lost on me.',                      now() - interval '44 days' + interval '19 hours'),
    (s03, josh_id, b_porter, pp_id, 1, 4.5, ARRAY['smoky','vanilla','roasty'], 'draft', 'Kernel Panic Porter — the name, the taste, the whole deal. Obsessed.',                       now() - interval '44 days' + interval '20 hours'),
    (s03, josh_id, b_marzen, pp_id, 1, 4.0, ARRAY['malty','toasty','clean'],  'draft', 'Merge Conflict Märzen to close the night. Smooth landing.',                                   now() - interval '44 days' + interval '21 hours'),

    -- s04: Shorter visit, 2 beers
    (s04, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', NULL,                                                                                           now() - interval '37 days' + interval '19 hours'),
    (s04, josh_id, b_wheat,  pp_id, 1, 4.0, ARRAY['banana','clove','hazy'],   'draft', '404 Wheat Not Found but I found it and I''m glad I did.',                                     now() - interval '37 days' + interval '20 hours'),

    -- s05: Back again (comfort run)
    (s05, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine'],           'draft', NULL,                                                                                           now() - interval '30 days' + interval '17 hours'),
    (s05, josh_id, b_stout,  pp_id, 1, 4.5, ARRAY['chocolate','roasty'],     'draft', 'Dark Mode Stout: my emotional support beer.',                                                  now() - interval '30 days' + interval '18 hours'),
    (s05, josh_id, b_sour,   pp_id, 1, 5.0, ARRAY['tart','fruity'],          'draft', NULL,                                                                                           now() - interval '30 days' + interval '18 hours' + interval '45 min'),

    -- s06: Showing it off to someone new (brought a friend)
    (s06, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', 'Brought my friend who said they "don''t really like IPAs." They ordered a second.',          now() - interval '23 days' + interval '18 hours'),
    (s06, josh_id, b_dipa,   pp_id, 1, 5.0, ARRAY['dank','tropical'],        'draft', 'DIPA after the IPA. Classic escalation arc.',                                                 now() - interval '23 days' + interval '19 hours'),
    (s06, josh_id, b_pale,   pp_id, 1, 4.0, ARRAY['tropical','citrus'],      'draft', 'Pull Request Pale for the responsible round.',                                                 now() - interval '23 days' + interval '20 hours'),
    (s06, josh_id, b_lager,  pp_id, 1, 3.5, ARRAY['clean','crisp'],          'draft', 'Legacy Code Lager as the nightcap. Sometimes simple is right.',                               now() - interval '23 days' + interval '21 hours'),

    -- s07: Mid-week stop, just two
    (s07, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine'],           'draft', NULL,                                                                                           now() - interval '16 days' + interval '17 hours'),
    (s07, josh_id, b_porter, pp_id, 1, 5.0, ARRAY['vanilla','smoky'],        'draft', 'Kernel Panic Porter — every time I drink this I think we should sponsor these guys.',         now() - interval '16 days' + interval '18 hours'),

    -- s08: Thorough Friday (long session)
    (s08, josh_id, b_ipa,    pp_id, 2, 5.0, ARRAY['citrus','pine','hoppy'],   'draft', 'Two IPAs to start. The app made me log it. Correctly.',                                       now() - interval '9 days' + interval '18 hours'),
    (s08, josh_id, b_sour,   pp_id, 1, 4.5, ARRAY['tart','fruity','crisp'],  'draft', NULL,                                                                                           now() - interval '9 days' + interval '19 hours'),
    (s08, josh_id, b_stout,  pp_id, 1, 4.5, ARRAY['roasty','chocolate'],     'draft', 'Dark Mode + rain outside = the correct life choice.',                                          now() - interval '9 days' + interval '20 hours'),
    (s08, josh_id, b_pils,   pp_id, 1, 4.5, ARRAY['crisp','clean','floral'], 'draft', 'Pixel Perfect Pils to clean the palate. Good call.',                                          now() - interval '9 days' + interval '21 hours'),

    -- s09: Recent quick visit
    (s09, josh_id, b_ipa,    pp_id, 1, 5.0, ARRAY['citrus','pine'],           'draft', 'Came in to use the wifi. Stayed for two hours.',                                              now() - interval '2 days' + interval '16 hours'),
    (s09, josh_id, b_marzen, pp_id, 1, 4.5, ARRAY['malty','toasty'],         'draft', NULL,                                                                                           now() - interval '2 days' + interval '17 hours'),

    -- s10: Barrel & Stone first visit (discovery!)
    (s10, josh_id, bs_amber, bs_id, 1, 4.5, ARRAY['oak','caramel','bourbon'], 'draft', 'Barrel & Stone is the real deal. Stave Amber is everything. First of many visits.',          now() - interval '49 days' + interval '14 hours'),
    (s10, josh_id, bs_ipa,   bs_id, 1, 4.5, ARRAY['citrus','whiskey','hoppy'],'draft', 'IPA aged in whiskey barrel — chaotic genius. Drink it.',                                     now() - interval '49 days' + interval '15 hours'),
    (s10, josh_id, bs_wheat, bs_id, 1, 4.0, ARRAY['vanilla','citrus','oak'],  'draft', 'Oak-aged wit. Didn''t know I needed this. I needed this.',                                   now() - interval '49 days' + interval '16 hours'),

    -- s11: Barrel & Stone return
    (s11, josh_id, bs_amber, bs_id, 1, 5.0, ARRAY['oak','caramel','bourbon'], 'draft', 'Came back specifically for the Stave Amber. Correct decision.',                              now() - interval '28 days' + interval '15 hours'),
    (s11, josh_id, bs_ipa,   bs_id, 1, 4.5, ARRAY['citrus','whiskey'],        'draft', NULL,                                                                                           now() - interval '28 days' + interval '16 hours'),

    -- s12: Hopfield first visit
    (s12, josh_id, hf_hazy,  hf_id, 1, 5.0, ARRAY['hazy','tropical','mango'], 'draft', 'Hazy Daze is stupid good. Mango and passionfruit in a pint glass. Thanks Hopfield.',        now() - interval '42 days' + interval '12 hours'),
    (s12, josh_id, hf_saison,hf_id, 1, 4.5, ARRAY['spicy','dry','effervescent'],'draft','Circuit Saison hit different. Crisp and weird and great.',                                  now() - interval '42 days' + interval '13 hours'),
    (s12, josh_id, hf_porter,hf_id, 1, 4.5, ARRAY['coffee','chocolate'],     'draft', 'Dark Matter Porter — that cold brew coffee flavor is FORWARD. I loved every sip.',           now() - interval '42 days' + interval '14 hours'),

    -- s13: Hopfield return
    (s13, josh_id, hf_hazy,  hf_id, 2, 5.0, ARRAY['hazy','tropical'],        'draft', 'Back for the Hazy Daze. Had two. Would do it again.',                                        now() - interval '14 days' + interval '17 hours'),
    (s13, josh_id, hf_porter,hf_id, 1, 4.5, ARRAY['coffee','chocolate'],     'draft', NULL,                                                                                           now() - interval '14 days' + interval '18 hours'),

    -- s14: Lost Creek discovery
    (s14, josh_id, lc_ipa,   lc_id, 1, 4.5, ARRAY['pine','grapefruit','resinous'],'draft','Spring Branch IPA — clean and classic. Underrated brewery tbh.',                          now() - interval '21 days' + interval '13 hours'),
    (s14, josh_id, lc_kolsch,lc_id, 3, 4.5, ARRAY['crisp','clean','light'],  'draft', 'Had three of the Barton Kölsch. The app will know. I accept this.',                          now() - interval '21 days' + interval '14 hours'),
    (s14, josh_id, lc_sour,  lc_id, 1, 5.0, ARRAY['tart','lime','salty'],    'draft', 'Greenbelt Gose with lime and cucumber — this is summer in a glass. Austin nailed it.',       now() - interval '21 days' + interval '15 hours'),

    -- s15: Home session (couch research, Sunday night)
    (s15, josh_id, hf_hazy,  NULL,  1, 5.0, ARRAY['hazy','tropical'],        'can',  'Picked up a 4-pack of Hazy Daze. Conducting important couch-based research.',                 now() - interval '5 days' + interval '20 hours'),
    (s15, josh_id, lc_sour,  NULL,  1, 4.5, ARRAY['tart','lime'],            'can',  'Greenbelt Gose from the fridge. Still great at home. Science confirmed.',                     now() - interval '5 days' + interval '21 hours')

  ON CONFLICT DO NOTHING;

  -- ── 7. Friendships — Josh is friends with all 12 test users ──────────────
  INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
    (josh_id, u01, 'accepted', now() - interval '55 days'),
    (josh_id, u02, 'accepted', now() - interval '50 days'),
    (josh_id, u03, 'accepted', now() - interval '48 days'),
    (u04,     josh_id, 'accepted', now() - interval '45 days'), -- Derek requested Josh
    (u05,     josh_id, 'accepted', now() - interval '42 days'),
    (josh_id, u06, 'accepted', now() - interval '40 days'),
    (josh_id, u07, 'accepted', now() - interval '35 days'),
    (u08,     josh_id, 'accepted', now() - interval '30 days'), -- Jessica requested Josh
    (josh_id, u09, 'accepted', now() - interval '25 days'),
    (u10,     josh_id, 'accepted', now() - interval '20 days'),
    (josh_id, u11, 'accepted', now() - interval '15 days'),
    (josh_id, u12, 'accepted', now() - interval '10 days')
  ON CONFLICT (requester_id, addressee_id) DO UPDATE SET status = 'accepted';

  -- ── 8. Brewery visits ─────────────────────────────────────────────────────
  INSERT INTO brewery_visits (user_id, brewery_id, total_visits, unique_beers_tried, first_visit_at, last_visit_at)
  VALUES
    (josh_id, pp_id, 9, 10, now() - interval '58 days', now() - interval '2 days'),
    (josh_id, bs_id, 2,  3, now() - interval '49 days', now() - interval '28 days'),
    (josh_id, hf_id, 2,  3, now() - interval '42 days', now() - interval '14 days'),
    (josh_id, lc_id, 1,  3, now() - interval '21 days', now() - interval '21 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    total_visits      = EXCLUDED.total_visits,
    unique_beers_tried = EXCLUDED.unique_beers_tried,
    last_visit_at     = EXCLUDED.last_visit_at;

  -- ── 9. Loyalty card at Pint & Pixel ──────────────────────────────────────
  INSERT INTO loyalty_cards (user_id, brewery_id, stamps, lifetime_stamps, last_stamp_at)
  VALUES (josh_id, pp_id, 7, 9, now() - interval '2 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    stamps          = 7,
    lifetime_stamps = 9,
    last_stamp_at   = now() - interval '2 days';

  -- ── 10. Legacy checkins (for backwards compat + feed) ────────────────────
  -- A handful of checkins so the legacy feed / analytics have Josh data too
  INSERT INTO checkins (user_id, brewery_id, beer_id, rating, serving_style, comment, share_to_feed, created_at)
  VALUES
    (josh_id, pp_id, b_ipa,    5.0, 'draft', 'Ok this is why I built this app. Debug IPA is exactly the beer I wanted to exist.',        true, now() - interval '58 days' + interval '18 hours' + interval '10 min'),
    (josh_id, pp_id, b_stout,  4.5, 'draft', 'Dark Mode Stout. Silky and deep.',                                                         true, now() - interval '58 days' + interval '19 hours'),
    (josh_id, pp_id, b_sour,   4.5, 'draft', 'Stack Overflow Sour is the error I never want to fix.',                                    true, now() - interval '51 days' + interval '18 hours'),
    (josh_id, pp_id, b_dipa,   4.5, 'draft', 'Deploy Friday DIPA on an actual Friday. The poetry is not lost on me.',                    true, now() - interval '44 days' + interval '19 hours'),
    (josh_id, pp_id, b_porter, 4.5, 'draft', 'Kernel Panic Porter — the name, the taste, the whole deal. Obsessed.',                    true, now() - interval '44 days' + interval '20 hours'),
    (josh_id, bs_id, bs_amber, 4.5, 'draft', 'Barrel & Stone is the real deal. Stave Amber is everything.',                             true, now() - interval '49 days' + interval '14 hours'),
    (josh_id, hf_id, hf_hazy,  5.0, 'draft', 'Hazy Daze is stupid good. Mango and passionfruit in a pint glass.',                      true, now() - interval '42 days' + interval '12 hours'),
    (josh_id, lc_id, lc_sour,  5.0, 'draft', 'Greenbelt Gose with lime and cucumber — this is summer in a glass.',                     true, now() - interval '21 days' + interval '15 hours'),
    (josh_id, pp_id, b_ipa,    5.0, 'draft', 'Came in to use the wifi. Stayed for two hours.',                                          true, now() - interval '2 days'  + interval '16 hours')
  ON CONFLICT DO NOTHING;

  -- ── 11. Achievements ──────────────────────────────────────────────────────
  -- Ensure base achievement records exist (safe to run even if they're already there)
  INSERT INTO achievements (key, name, description, icon, xp_reward, badge_color, tier, category)
  VALUES
    ('first_checkin',    'First Pour',         'Logged your first beer.',                               '🍺', 50,  '#D4A843', 'bronze',   'quantity'),
    ('getting_started',  'Getting Started',    'Logged 5 sessions.',                                    '🌟', 100, '#D4A843', 'bronze',   'quantity'),
    ('regular',          'Regular',            'Logged 10 sessions. You''re basically part of the decor.','🏠', 200, '#C0C0C0','silver',   'quantity'),
    ('session_sampler',  'Session Sampler',    'Had 3+ different beers in a single session.',            '🍻', 75,  '#D4A843', 'bronze',   'variety'),
    ('explorer',         'Explorer',           'Visited 3 different breweries.',                         '🗺️', 150, '#C0C0C0', 'silver',  'explorer'),
    ('craft_curious',    'Craft Curious',      'Tried 10 unique beers.',                                 '🔍', 100, '#D4A843', 'bronze',   'variety'),
    ('beer_nerd',        'Beer Nerd',          'Tried 25 unique beers. You know too much now.',          '🧠', 300, '#FFD700', 'gold',     'variety'),
    ('home_brewer',      'Home Drinker',       'Logged your first home session.',                        '🛋️', 50,  '#D4A843', 'bronze',  'explorer'),
    ('quantity_five',    'Five Visits',        'Visited one brewery 5 times.',                           '⭐', 150, '#C0C0C0', 'silver',   'quantity')
  ON CONFLICT (key) DO NOTHING;

  -- Award achievements to Josh
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '58 days' FROM achievements WHERE key = 'first_checkin'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '49 days' FROM achievements WHERE key = 'getting_started'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '37 days' FROM achievements WHERE key = 'regular'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '44 days' FROM achievements WHERE key = 'session_sampler'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '42 days' FROM achievements WHERE key = 'explorer'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '30 days' FROM achievements WHERE key = 'craft_curious'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '9 days' FROM achievements WHERE key = 'beer_nerd'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '5 days' FROM achievements WHERE key = 'home_brewer'
  ON CONFLICT DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT josh_id, id, now() - interval '16 days' FROM achievements WHERE key = 'quantity_five'
  ON CONFLICT DO NOTHING;

  -- ── 12. Wishlist — beers Josh wants to try ───────────────────────────────
  INSERT INTO wishlist (user_id, beer_id, note)
  SELECT josh_id, id, 'Alex Chen keeps talking about this one. Need to try it.'
  FROM beers WHERE name = 'Dark Mode Stout' AND brewery_id = pp_id
  ON CONFLICT DO NOTHING;

  INSERT INTO wishlist (user_id, beer_id, note)
  SELECT josh_id, id, 'Everyone at Barrel & Stone was raving about this.'
  FROM beers WHERE id = bs_wheat
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Josh''s universe seeded. User ID: %', josh_id;
  RAISE NOTICE '   15 sessions · 40 beer logs · 12 friends · 4 breweries · 9 achievements';

END $$;

-- ── Update beer stats with Josh's ratings ─────────────────────────────────────
UPDATE beers SET
  avg_rating    = sub.avg_r,
  total_ratings = sub.cnt
FROM (
  SELECT beer_id::uuid, ROUND(AVG(rating)::numeric, 2) AS avg_r, COUNT(*) AS cnt
  FROM beer_logs
  WHERE beer_id IS NOT NULL AND rating IS NOT NULL
  GROUP BY beer_id
) sub
WHERE beers.id = sub.beer_id;

-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT 'Sessions for Josh: '   || COUNT(*)::text AS result FROM sessions   WHERE user_id = (SELECT id FROM auth.users WHERE email NOT LIKE '%hoptrack.test%' ORDER BY created_at LIMIT 1)
UNION ALL
SELECT 'Beer logs for Josh: '  || COUNT(*)::text FROM beer_logs WHERE user_id = (SELECT id FROM auth.users WHERE email NOT LIKE '%hoptrack.test%' ORDER BY created_at LIMIT 1)
UNION ALL
SELECT 'Friends: '             || COUNT(*)::text FROM friendships WHERE requester_id = (SELECT id FROM auth.users WHERE email NOT LIKE '%hoptrack.test%' ORDER BY created_at LIMIT 1) OR addressee_id = (SELECT id FROM auth.users WHERE email NOT LIKE '%hoptrack.test%' ORDER BY created_at LIMIT 1)
UNION ALL
SELECT 'Achievements earned: ' || COUNT(*)::text FROM user_achievements WHERE user_id = (SELECT id FROM auth.users WHERE email NOT LIKE '%hoptrack.test%' ORDER BY created_at LIMIT 1)
UNION ALL
SELECT 'Breweries visited: '   || COUNT(*)::text FROM brewery_visits WHERE user_id = (SELECT id FROM auth.users WHERE email NOT LIKE '%hoptrack.test%' ORDER BY created_at LIMIT 1);
