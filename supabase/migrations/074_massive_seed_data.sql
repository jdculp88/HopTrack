-- ============================================================================
-- Migration 074: Massive Seed Data — Pint & Pixel + Test Accounts + Live Feeds
-- Sprint 115 — The Brand
-- ============================================================================
-- Creates test auth users, profiles, sessions, reviews, friendships, ads,
-- challenges, mug clubs, and social activity to make the app feel alive.
--
-- Test Accounts:
--   marketing@pintandpixel.test / HopTrack2026! (role: marketing)
--   business@pintandpixel.test  / HopTrack2026! (role: business)
--   staff@pintandpixel.test     / HopTrack2026! (role: staff)
--
-- Joshua's existing account (jdculp88@gmail.com) → Pint & Pixel owner
-- ============================================================================

DO $$
DECLARE
  -- Pint & Pixel brewery
  pp_brewery uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  -- Other demo breweries for cross-activity
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001';
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002';
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003';

  -- Joshua / Owner account (fresh, created here)
  joshua_id uuid := 'aaaaaaaa-0000-4000-8000-000000000000';

  -- Staff test user UUIDs
  mktg_id  uuid := 'aaaaaaaa-0001-4000-8000-000000000001';
  biz_id   uuid := 'aaaaaaaa-0002-4000-8000-000000000002';
  staff_id uuid := 'aaaaaaaa-0003-4000-8000-000000000003';

  -- Consumer test user UUIDs
  user_01 uuid := 'bbbbbbbb-0001-4000-8000-000000000001';
  user_02 uuid := 'bbbbbbbb-0002-4000-8000-000000000002';
  user_03 uuid := 'bbbbbbbb-0003-4000-8000-000000000003';
  user_04 uuid := 'bbbbbbbb-0004-4000-8000-000000000004';
  user_05 uuid := 'bbbbbbbb-0005-4000-8000-000000000005';
  user_06 uuid := 'bbbbbbbb-0006-4000-8000-000000000006';
  user_07 uuid := 'bbbbbbbb-0007-4000-8000-000000000007';
  user_08 uuid := 'bbbbbbbb-0008-4000-8000-000000000008';

  -- Beer UUIDs for new Pint & Pixel beers
  beer_01 uuid := 'cccccccc-0001-4000-8000-000000000001';
  beer_02 uuid := 'cccccccc-0002-4000-8000-000000000002';
  beer_03 uuid := 'cccccccc-0003-4000-8000-000000000003';
  beer_04 uuid := 'cccccccc-0004-4000-8000-000000000004';
  beer_05 uuid := 'cccccccc-0005-4000-8000-000000000005';
  beer_06 uuid := 'cccccccc-0006-4000-8000-000000000006';
  beer_07 uuid := 'cccccccc-0007-4000-8000-000000000007';
  beer_08 uuid := 'cccccccc-0008-4000-8000-000000000008';
  beer_09 uuid := 'cccccccc-0009-4000-8000-000000000009';
  beer_10 uuid := 'cccccccc-0010-4000-8000-000000000010';

  -- Session UUIDs
  sess_01 uuid := 'dddddddd-0001-4000-8000-000000000001';
  sess_02 uuid := 'dddddddd-0002-4000-8000-000000000002';
  sess_03 uuid := 'dddddddd-0003-4000-8000-000000000003';
  sess_04 uuid := 'dddddddd-0004-4000-8000-000000000004';
  sess_05 uuid := 'dddddddd-0005-4000-8000-000000000005';
  sess_06 uuid := 'dddddddd-0006-4000-8000-000000000006';
  sess_07 uuid := 'dddddddd-0007-4000-8000-000000000007';
  sess_08 uuid := 'dddddddd-0008-4000-8000-000000000008';
  sess_09 uuid := 'dddddddd-0009-4000-8000-000000000009';
  sess_10 uuid := 'dddddddd-0010-4000-8000-000000000010';
  sess_11 uuid := 'dddddddd-0011-4000-8000-000000000011';
  sess_12 uuid := 'dddddddd-0012-4000-8000-000000000012';
  sess_13 uuid := 'dddddddd-0013-4000-8000-000000000013';
  sess_14 uuid := 'dddddddd-0014-4000-8000-000000000014';
  sess_15 uuid := 'dddddddd-0015-4000-8000-000000000015';
  sess_16 uuid := 'dddddddd-0016-4000-8000-000000000016';
  sess_17 uuid := 'dddddddd-0017-4000-8000-000000000017';
  sess_18 uuid := 'dddddddd-0018-4000-8000-000000000018';
  sess_19 uuid := 'dddddddd-0019-4000-8000-000000000019';
  sess_20 uuid := 'dddddddd-0020-4000-8000-000000000020';
  sess_21 uuid := 'dddddddd-0021-4000-8000-000000000021';
  sess_22 uuid := 'dddddddd-0022-4000-8000-000000000022';
  sess_23 uuid := 'dddddddd-0023-4000-8000-000000000023';
  sess_24 uuid := 'dddddddd-0024-4000-8000-000000000024';
  sess_25 uuid := 'dddddddd-0025-4000-8000-000000000025';

  -- Mug club & challenge IDs
  mug_club_01 uuid := 'eeeeeeee-0001-4000-8000-000000000001';
  challenge_01 uuid := 'ffffffff-0001-4000-8000-000000000001';
  challenge_02 uuid := 'ffffffff-0002-4000-8000-000000000002';

  -- Existing beer IDs from Pint & Pixel (we'll reference by name)
  existing_beer_id uuid;

  -- Pre-computed bcrypt hash for "HopTrack2026!" (cost 10)
  -- Generated offline with htpasswd — no pgcrypto dependency
  pw_hash text := '$2y$10$6rYeUN3B6GkPEKFFgz8UQ.aZqzIzrsQ1Fv7oXxQVb3/E9NboeYQya';

BEGIN

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. CREATE JOSHUA / OWNER ACCOUNT
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES (joshua_id, '00000000-0000-0000-0000-000000000000', 'joshua@hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '60 days', now(), '', '{"provider":"email","providers":["email"]}', '{}')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, username, display_name, home_city, bio, xp, level, total_checkins, unique_beers, unique_breweries, is_public, is_superadmin)
  VALUES (joshua_id, 'joshuaculp', 'Joshua Culp', 'Asheville, NC', 'Founder of HopTrack. Track Every Pour.', 500, 5, 30, 25, 10, true, true)
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username, display_name = EXCLUDED.display_name, home_city = EXCLUDED.home_city,
    bio = EXCLUDED.bio, xp = EXCLUDED.xp, level = EXCLUDED.level, is_superadmin = true;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. UPDATE PINT & PIXEL BREWERY DETAILS
  -- ═══════════════════════════════════════════════════════════════════════════
  UPDATE breweries SET
    description = 'Where code meets craft. Austin''s home for dev-themed brews, retro arcade games, and the best IPA in 78701. Brew. Play. Repeat.',
    hop_route_eligible = true,
    hop_route_offer = '10% off your first pour when you check in with HopTrack',
    vibe_tags = ARRAY['lively', 'dog-friendly', 'live music', 'outdoor', 'food']
  WHERE id = pp_brewery;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. CREATE TEST AUTH USERS
  -- ═══════════════════════════════════════════════════════════════════════════

  -- Marketing user
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES (mktg_id, '00000000-0000-0000-0000-000000000000', 'marketing@pintandpixel.test', pw_hash, now(), 'authenticated', 'authenticated', now(), now(), '', '{"provider":"email","providers":["email"]}', '{}')
  ON CONFLICT (id) DO NOTHING;

  -- Business user
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES (biz_id, '00000000-0000-0000-0000-000000000000', 'business@pintandpixel.test', pw_hash, now(), 'authenticated', 'authenticated', now(), now(), '', '{"provider":"email","providers":["email"]}', '{}')
  ON CONFLICT (id) DO NOTHING;

  -- Staff user
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data)
  VALUES (staff_id, '00000000-0000-0000-0000-000000000000', 'staff@pintandpixel.test', pw_hash, now(), 'authenticated', 'authenticated', now(), now(), '', '{"provider":"email","providers":["email"]}', '{}')
  ON CONFLICT (id) DO NOTHING;

  -- Consumer test users
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at, confirmation_token, raw_app_meta_data, raw_user_meta_data) VALUES
    (user_01, '00000000-0000-0000-0000-000000000000', 'hazy.hayes@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '45 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_02, '00000000-0000-0000-0000-000000000000', 'stout.sarah@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '40 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_03, '00000000-0000-0000-0000-000000000000', 'pils.pete@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '38 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_04, '00000000-0000-0000-0000-000000000000', 'sour.sam@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '35 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_05, '00000000-0000-0000-0000-000000000000', 'lager.lisa@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '30 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_06, '00000000-0000-0000-0000-000000000000', 'porter.paul@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '28 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_07, '00000000-0000-0000-0000-000000000000', 'wheat.wendy@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '25 days', now(), '', '{"provider":"email","providers":["email"]}', '{}'),
    (user_08, '00000000-0000-0000-0000-000000000000', 'amber.alex@test.hoptrack.beer', pw_hash, now(), 'authenticated', 'authenticated', now() - interval '20 days', now(), '', '{"provider":"email","providers":["email"]}', '{}')
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. CREATE PROFILES
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO profiles (id, username, display_name, home_city, bio, xp, level, total_checkins, unique_beers, unique_breweries, is_public) VALUES
    (mktg_id,  'pp_marketing', 'Taylor Reed',     'Austin, TX', 'Marketing at Pint & Pixel. Craft beer evangelist.', 200, 3, 15, 12, 4, true),
    (biz_id,   'pp_business',  'Jordan Blake',    'Austin, TX', 'Business operations at Pint & Pixel Brewing.', 150, 2, 10, 8, 3, true),
    (staff_id, 'pp_staff',     'Casey Morgan',    'Austin, TX', 'Bartender at Pint & Pixel. Ask me about our IPAs.', 100, 2, 8, 6, 2, true),
    (user_01,  'hazyhayes',    'Hazy Hayes',      'Austin, TX', 'IPA evangelist. If it''s not hazy, I don''t want it.', 1250, 8, 85, 62, 18, true),
    (user_02,  'stoutsarah',   'Sarah Darkwood',  'Austin, TX', 'Dark beer devotee. Stouts, porters, dark lagers.', 980, 7, 72, 45, 15, true),
    (user_03,  'pilspete',     'Pete Keller',     'Round Rock, TX', 'Pilsner purist. Czech-style or bust.', 750, 6, 58, 38, 12, true),
    (user_04,  'soursam',      'Sam Tartley',     'Austin, TX', 'Kettle sours, fruited sours, wild ales. Pucker up.', 890, 7, 65, 50, 14, true),
    (user_05,  'lagerlisa',    'Lisa Brewer',     'Cedar Park, TX', 'Clean lagers, crisp pilsners, cold patios.', 620, 5, 45, 30, 10, true),
    (user_06,  'porterpaul',   'Paul Ashford',    'Austin, TX', 'Robust porter advocate. Vanilla stouts welcome too.', 540, 5, 40, 28, 9, true),
    (user_07,  'wheatwendy',   'Wendy Fields',    'Georgetown, TX', 'Hefeweizen lover. Banana, clove, sunshine.', 480, 4, 35, 25, 8, true),
    (user_08,  'amberalex',    'Alex Copperfield','Austin, TX', 'Amber ales, marzens, ESBs. The malt-forward crew.', 410, 4, 30, 22, 7, true)
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    home_city = EXCLUDED.home_city,
    bio = EXCLUDED.bio,
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    total_checkins = EXCLUDED.total_checkins,
    unique_beers = EXCLUDED.unique_beers,
    unique_breweries = EXCLUDED.unique_breweries;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 5. JOSHUA → PINT & PIXEL OWNER
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_accounts (user_id, brewery_id, role, verified, verified_at)
  VALUES (joshua_id, pp_brewery, 'owner', true, now())
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    role = 'owner', verified = true, verified_at = now();

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 6. STAFF BREWERY ACCOUNTS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_accounts (user_id, brewery_id, role, verified, verified_at) VALUES
    (mktg_id,  pp_brewery, 'marketing', true, now()),
    (biz_id,   pp_brewery, 'business',  true, now()),
    (staff_id, pp_brewery, 'staff',     true, now())
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    role = EXCLUDED.role, verified = true, verified_at = now();

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 7. NEW BEERS FOR PINT & PIXEL (10 more styles)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, price_per_pint) VALUES
    (beer_01, pp_brewery, 'Ctrl+Z Kölsch',        'Blonde Ale',   4.6, 20, 'Light, crisp German-style kölsch. The undo button for a long week.', true, 6.00),
    (beer_02, pp_brewery, 'Regex Red Ale',         'Amber',        5.4, 28, 'Irish-inspired red ale with toasted malt, caramel sweetness, and a clean finish.', true, 7.00),
    (beer_03, pp_brewery, 'Git Blame Belgian',     'Belgian',      7.8, 25, 'Belgian golden strong ale. Fruity esters, peppery phenols, deceptively strong.', true, 8.00),
    (beer_04, pp_brewery, 'Infinite Loop IPA',     'IPA',          7.0, 70, 'Hazy New England IPA. Mango, pineapple, pillowy soft. You won''t stop at one.', true, 8.00),
    (beer_05, pp_brewery, 'Null Pointer Nitro',    'Stout',        5.8, 30, 'Nitro milk stout. Creamy cascade, chocolate fudge, espresso roast.', true, 7.50),
    (beer_06, pp_brewery, 'Syntax Error Saison',   'Saison',       6.5, 22, 'Farmhouse saison with lemon peel and black pepper. Dry, spicy, refreshing.', true, 7.00),
    (beer_07, pp_brewery, 'Hotfix Hazy Pale',      'Pale Ale',     5.0, 35, 'Session-strength hazy pale. Citra and El Dorado hops. Crushable.', true, 6.50),
    (beer_08, pp_brewery, 'Binary Barleywine',     'Barleywine',  10.5, 85, 'English barleywine aged 6 months. Toffee, dark fruit, warming. Handle with care.', true, 12.00),
    (beer_09, pp_brewery, 'Cache Miss Cider',      'Cider',        5.5,  0, 'Dry apple cider with a hint of ginger. Gluten-free and dangerously sessionable.', true, 7.00),
    (beer_10, pp_brewery, 'Exception Handler ESB',  'ESB',         5.2, 40, 'English bitter. Biscuit malt, earthy hops, proper pub classic.', true, 6.50)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, style = EXCLUDED.style, abv = EXCLUDED.abv,
    description = EXCLUDED.description, is_on_tap = EXCLUDED.is_on_tap, price_per_pint = EXCLUDED.price_per_pint;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. BREWERY EVENTS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_events (brewery_id, title, description, event_date, start_time, end_time) VALUES
    (pp_brewery, 'Tap Takeover: Local Hops Only', 'Every beer on tap tonight is brewed with 100% Texas-grown hops. Meet the farmers. Taste the terroir.', now() + interval '3 days', '17:00', '22:00'),
    (pp_brewery, 'Trivia Night: Beer & Bytes', 'Test your knowledge of craft beer AND computer science. Winning team gets a $50 tab. Losers buy the next round.', now() + interval '7 days', '19:00', '21:30'),
    (pp_brewery, 'Barrel-Aged Release Party', 'We''re tapping our 14-month bourbon barrel-aged imperial stout. Only 2 barrels made. First come, first served.', now() + interval '14 days', '16:00', '23:00')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 9. MUG CLUB
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO mug_clubs (id, brewery_id, name, description, annual_fee, max_members, perks, is_active) VALUES
    (mug_club_01, pp_brewery, 'The Root Access Club', 'Our VIP mug club. Unlimited refills? No. But close.',
     120.00, 100,
     '[{"title":"$1 off every pint","description":"All day, every day"},{"title":"Exclusive barrel releases","description":"First access to limited releases"},{"title":"Custom branded mug","description":"16oz ceramic with your name on it"},{"title":"Birthday pint free","description":"One free pour on your birthday month"}]',
     true)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Add some members
  INSERT INTO mug_club_members (mug_club_id, user_id, status, joined_at, expires_at) VALUES
    (mug_club_01, user_01, 'active', now() - interval '60 days', now() + interval '305 days'),
    (mug_club_01, user_02, 'active', now() - interval '30 days', now() + interval '335 days'),
    (mug_club_01, user_04, 'active', now() - interval '15 days', now() + interval '350 days')
  ON CONFLICT (mug_club_id, user_id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 10. CHALLENGES
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO challenges (id, brewery_id, name, description, icon, challenge_type, target_value, reward_description, reward_xp, reward_loyalty_stamps, starts_at, ends_at, is_active) VALUES
    (challenge_01, pp_brewery, 'Pixel Perfect 10', 'Try 10 different Pint & Pixel beers. Earn a free pint and bragging rights.', '🎮', 'beer_count', 10, 'Free pint of any beer + Pixel Perfect badge', 200, 2, now() - interval '30 days', now() + interval '60 days', true),
    (challenge_02, pp_brewery, 'Style Sampler', 'Try 5 different beer styles at Pint & Pixel. Variety is the spice of life.', '🌈', 'style_variety', 5, 'Free flight of 4 tasters', 150, 1, now() - interval '14 days', now() + interval '45 days', true)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Challenge participants
  INSERT INTO challenge_participants (challenge_id, user_id, current_progress, joined_at) VALUES
    (challenge_01, user_01, 7, now() - interval '20 days'),
    (challenge_01, user_02, 4, now() - interval '15 days'),
    (challenge_01, user_03, 10, now() - interval '25 days'),
    (challenge_01, user_04, 6, now() - interval '18 days'),
    (challenge_02, user_01, 4, now() - interval '10 days'),
    (challenge_02, user_05, 3, now() - interval '8 days'),
    (challenge_02, user_06, 5, now() - interval '12 days')
  ON CONFLICT (challenge_id, user_id) DO UPDATE SET current_progress = EXCLUDED.current_progress;

  -- Mark user_03 as completed on challenge 01
  UPDATE challenge_participants SET completed_at = now() - interval '5 days'
  WHERE challenge_id = challenge_01 AND user_id = user_03;

  -- Mark user_06 as completed on challenge 02
  UPDATE challenge_participants SET completed_at = now() - interval '3 days'
  WHERE challenge_id = challenge_02 AND user_id = user_06;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 11. ADS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_ads (brewery_id, title, body, cta_label, cta_url, radius_km, impressions, clicks, starts_at, ends_at, is_active, tier_required) VALUES
    (pp_brewery, 'Happy Hour Every Day 4-6pm', '$2 off all pints for HopTrack members. Show your phone, get the deal.', 'Visit Us', 'https://pintandpixel.example.com/happy-hour', 25, 1847, 234, now() - interval '14 days', now() + interval '30 days', true, 'cask'),
    (pp_brewery, 'New Barrel-Aged Release', 'Our 14-month bourbon barrel imperial stout drops next Friday. You don''t want to miss this one.', 'Learn More', 'https://pintandpixel.example.com/barrel-aged', 50, 923, 156, now() - interval '7 days', now() + interval '21 days', true, 'cask'),
    (pp_brewery, 'Root Access Mug Club — Join Now', 'VIP perks: $1 off every pour, first access to releases, custom mug with your name. $120/year.', 'Join', 'https://pintandpixel.example.com/mug-club', 30, 2156, 312, now() - interval '21 days', now() + interval '60 days', true, 'barrel')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 12. SESSIONS (completed, with dates spread across last 30 days)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO sessions (id, user_id, brewery_id, context, started_at, ended_at, is_active, share_to_feed, note, xp_awarded) VALUES
    -- Hazy Hayes sessions (IPA lover, frequent visitor)
    (sess_01, user_01, pp_brewery, 'brewery', now() - interval '1 day' - interval '3 hours', now() - interval '1 day', false, true, 'Debug IPA is on point today', 45),
    (sess_02, user_01, pp_brewery, 'brewery', now() - interval '4 days' - interval '2 hours', now() - interval '4 days', false, true, 'Trying the new Infinite Loop IPA. Dangerously good.', 50),
    (sess_03, user_01, brew_mtn,   'brewery', now() - interval '7 days' - interval '4 hours', now() - interval '7 days', false, true, 'Mountain Ridge never disappoints', 40),
    (sess_04, user_01, pp_brewery, 'brewery', now() - interval '12 days' - interval '2 hours', now() - interval '12 days', false, true, 'Flight night with the crew', 55),
    (sess_05, user_01, brew_riv,   'brewery', now() - interval '18 days' - interval '3 hours', now() - interval '18 days', false, true, null, 35),

    -- Sarah Darkwood sessions (stout lover)
    (sess_06, user_02, pp_brewery, 'brewery', now() - interval '2 days' - interval '2 hours', now() - interval '2 days', false, true, 'Dark Mode Stout + Null Pointer Nitro back to back. Heaven.', 50),
    (sess_07, user_02, brew_smk,   'brewery', now() - interval '5 days' - interval '3 hours', now() - interval '5 days', false, true, 'Smoky Barrel has a new imperial stout', 45),
    (sess_08, user_02, pp_brewery, 'brewery', now() - interval '10 days' - interval '2 hours', now() - interval '10 days', false, true, null, 40),
    (sess_09, user_02, pp_brewery, 'brewery', now() - interval '20 days' - interval '4 hours', now() - interval '20 days', false, true, 'Binary Barleywine is incredible', 60),

    -- Pete Keller sessions
    (sess_10, user_03, pp_brewery, 'brewery', now() - interval '3 days' - interval '2 hours', now() - interval '3 days', false, true, 'Pixel Perfect Pils forever', 40),
    (sess_11, user_03, brew_mtn,   'brewery', now() - interval '8 days' - interval '3 hours', now() - interval '8 days', false, true, null, 35),
    (sess_12, user_03, pp_brewery, 'brewery', now() - interval '15 days' - interval '2 hours', now() - interval '15 days', false, true, 'Kölsch was a great add', 45),

    -- Sam Tartley sessions
    (sess_13, user_04, pp_brewery, 'brewery', now() - interval '1 day' - interval '4 hours', now() - interval '1 day', false, true, 'Stack Overflow Sour hits different today', 45),
    (sess_14, user_04, brew_riv,   'brewery', now() - interval '6 days' - interval '2 hours', now() - interval '6 days', false, true, 'River Bend has a new gose', 40),
    (sess_15, user_04, pp_brewery, 'brewery', now() - interval '14 days' - interval '3 hours', now() - interval '14 days', false, true, null, 35),

    -- Lisa Brewer sessions
    (sess_16, user_05, pp_brewery, 'brewery', now() - interval '2 days' - interval '3 hours', now() - interval '2 days', false, true, 'Legacy Code Lager is my go-to', 40),
    (sess_17, user_05, brew_mtn,   'brewery', now() - interval '9 days' - interval '2 hours', now() - interval '9 days', false, true, null, 35),

    -- Porter Paul sessions
    (sess_18, user_06, pp_brewery, 'brewery', now() - interval '3 days' - interval '2 hours', now() - interval '3 days', false, true, 'Kernel Panic Porter is a sleeper hit', 45),
    (sess_19, user_06, pp_brewery, 'brewery', now() - interval '11 days' - interval '3 hours', now() - interval '11 days', false, true, null, 40),

    -- Wendy Fields sessions
    (sess_20, user_07, pp_brewery, 'brewery', now() - interval '4 days' - interval '2 hours', now() - interval '4 days', false, true, '404 Wheat is perfection in a glass', 40),
    (sess_21, user_07, brew_smk,   'brewery', now() - interval '13 days' - interval '4 hours', now() - interval '13 days', false, true, null, 35),

    -- Alex Copperfield sessions
    (sess_22, user_08, pp_brewery, 'brewery', now() - interval '5 days' - interval '3 hours', now() - interval '5 days', false, true, 'Regex Red + Exception Handler ESB flight', 50),
    (sess_23, user_08, brew_riv,   'brewery', now() - interval '10 days' - interval '2 hours', now() - interval '10 days', false, true, null, 35),

    -- Staff sessions (they drink too!)
    (sess_24, mktg_id, pp_brewery, 'brewery', now() - interval '6 days' - interval '2 hours', now() - interval '6 days', false, true, 'Quality testing the new Saison. For work. Obviously.', 40),
    (sess_25, biz_id,  pp_brewery, 'brewery', now() - interval '8 days' - interval '3 hours', now() - interval '8 days', false, true, 'Barrel-aged review with the team', 45)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 13. BEER LOGS (2-3 per session)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO beer_logs (session_id, user_id, beer_id, brewery_id, rating, flavor_tags, serving_style, comment, logged_at) VALUES
    -- Hazy Hayes
    (sess_01, user_01, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = 'Debug IPA' LIMIT 1), pp_brewery, 4.5, ARRAY['hoppy','citrus','bitter'], 'draft', 'Classic. Never gets old.', now() - interval '1 day' - interval '2 hours'),
    (sess_01, user_01, beer_04, pp_brewery, 5.0, ARRAY['tropical','juicy','hazy'], 'draft', 'This might be the best hazy IPA in Austin', now() - interval '1 day' - interval '1 hour'),
    (sess_02, user_01, beer_04, pp_brewery, 4.8, ARRAY['tropical','mango','soft'], 'draft', 'Still amazing second time around', now() - interval '4 days' - interval '1 hour'),
    (sess_02, user_01, beer_07, pp_brewery, 4.2, ARRAY['citrus','tropical','light'], 'draft', 'Solid session pale', now() - interval '4 days'),
    (sess_04, user_01, beer_01, pp_brewery, 4.0, ARRAY['crisp','clean','light'], 'draft', 'Nice kölsch for a change of pace', now() - interval '12 days' - interval '1 hour'),
    (sess_04, user_01, beer_06, pp_brewery, 3.8, ARRAY['spicy','dry','peppery'], 'draft', 'Interesting saison. Growing on me.', now() - interval '12 days'),

    -- Sarah Darkwood
    (sess_06, user_02, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = 'Dark Mode Stout' LIMIT 1), pp_brewery, 5.0, ARRAY['chocolate','coffee','roasty'], 'draft', 'The best stout in Texas. Fight me.', now() - interval '2 days' - interval '1 hour'),
    (sess_06, user_02, beer_05, pp_brewery, 4.8, ARRAY['creamy','chocolate','espresso'], 'draft', 'Nitro is perfect. So silky.', now() - interval '2 days'),
    (sess_09, user_02, beer_08, pp_brewery, 4.9, ARRAY['toffee','dark-fruit','warming'], 'draft', 'This barleywine is a masterpiece', now() - interval '20 days' - interval '1 hour'),

    -- Pete Keller
    (sess_10, user_03, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = 'Pixel Perfect Pils' LIMIT 1), pp_brewery, 4.7, ARRAY['crisp','floral','clean'], 'draft', 'Textbook pilsner. Saaz hops shine.', now() - interval '3 days' - interval '1 hour'),
    (sess_12, user_03, beer_01, pp_brewery, 4.5, ARRAY['crisp','clean','refreshing'], 'draft', 'Great kölsch. Finally someone in Austin makes one.', now() - interval '15 days' - interval '1 hour'),
    (sess_12, user_03, beer_10, pp_brewery, 4.3, ARRAY['malty','earthy','balanced'], 'draft', 'Proper ESB. Respect.', now() - interval '15 days'),

    -- Sam Tartley
    (sess_13, user_04, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = 'Stack Overflow Sour' LIMIT 1), pp_brewery, 4.6, ARRAY['tart','fruity','raspberry'], 'draft', 'Raspberry sour on a hot day = perfection', now() - interval '1 day' - interval '3 hours'),
    (sess_13, user_04, beer_09, pp_brewery, 4.0, ARRAY['apple','dry','ginger'], 'draft', 'The cider is surprisingly good', now() - interval '1 day' - interval '2 hours'),
    (sess_15, user_04, beer_06, pp_brewery, 4.4, ARRAY['spicy','dry','citrus'], 'draft', 'Great saison for sour fans', now() - interval '14 days' - interval '1 hour'),

    -- Lisa Brewer
    (sess_16, user_05, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = 'Legacy Code Lager' LIMIT 1), pp_brewery, 4.3, ARRAY['clean','crisp','malty'], 'draft', 'Sometimes simple is best', now() - interval '2 days' - interval '2 hours'),
    (sess_16, user_05, beer_01, pp_brewery, 4.4, ARRAY['crisp','light','clean'], 'draft', 'Love the kölsch too', now() - interval '2 days' - interval '1 hour'),

    -- Porter Paul
    (sess_18, user_06, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = 'Kernel Panic Porter' LIMIT 1), pp_brewery, 4.6, ARRAY['roasty','vanilla','smoky'], 'draft', 'The vanilla and smoke combo is genius', now() - interval '3 days' - interval '1 hour'),
    (sess_18, user_06, beer_05, pp_brewery, 4.5, ARRAY['creamy','chocolate','smooth'], 'draft', null, now() - interval '3 days'),

    -- Wendy Fields
    (sess_20, user_07, (SELECT id FROM beers WHERE brewery_id = pp_brewery AND name = '404 Wheat Not Found' LIMIT 1), pp_brewery, 4.8, ARRAY['banana','clove','hazy'], 'draft', 'Perfect hefe. This is my happy place.', now() - interval '4 days' - interval '1 hour'),
    (sess_20, user_07, beer_07, pp_brewery, 4.0, ARRAY['citrus','tropical','light'], 'draft', null, now() - interval '4 days'),

    -- Alex Copperfield
    (sess_22, user_08, beer_02, pp_brewery, 4.4, ARRAY['caramel','malty','smooth'], 'draft', 'Red ale done right', now() - interval '5 days' - interval '2 hours'),
    (sess_22, user_08, beer_10, pp_brewery, 4.5, ARRAY['malty','earthy','biscuit'], 'draft', 'ESB is underrated. This proves it.', now() - interval '5 days' - interval '1 hour'),

    -- Staff logs
    (sess_24, mktg_id, beer_06, pp_brewery, 4.3, ARRAY['spicy','dry','farmhouse'], 'draft', 'This photographs beautifully for socials', now() - interval '6 days' - interval '1 hour'),
    (sess_25, biz_id, beer_08, pp_brewery, 4.7, ARRAY['toffee','complex','warming'], 'draft', 'We need to price this higher', now() - interval '8 days' - interval '2 hours')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 14. FRIENDSHIPS (everyone knows everyone — Austin craft beer scene)
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
    (user_01, user_02, 'accepted', now() - interval '40 days'),
    (user_01, user_03, 'accepted', now() - interval '38 days'),
    (user_01, user_04, 'accepted', now() - interval '35 days'),
    (user_02, user_04, 'accepted', now() - interval '30 days'),
    (user_02, user_06, 'accepted', now() - interval '28 days'),
    (user_03, user_05, 'accepted', now() - interval '25 days'),
    (user_04, user_07, 'accepted', now() - interval '22 days'),
    (user_05, user_08, 'accepted', now() - interval '20 days'),
    (user_06, user_07, 'accepted', now() - interval '18 days'),
    (user_07, user_08, 'accepted', now() - interval '15 days'),
    (user_08, user_01, 'accepted', now() - interval '12 days'),
    (user_03, user_06, 'accepted', now() - interval '10 days')
  ON CONFLICT DO NOTHING;

  -- Friend Joshua with several users
  INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
    (user_01, joshua_id, 'accepted', now() - interval '30 days'),
    (user_02, joshua_id, 'accepted', now() - interval '25 days'),
    (user_04, joshua_id, 'accepted', now() - interval '20 days'),
    (user_05, joshua_id, 'accepted', now() - interval '15 days'),
    (user_07, joshua_id, 'accepted', now() - interval '10 days'),
    (user_03, joshua_id, 'pending', now() - interval '2 days'),
    (user_08, joshua_id, 'pending', now() - interval '1 day')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 15. SESSION COMMENTS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO session_comments (session_id, user_id, body, created_at) VALUES
    (sess_01, user_02, 'Debug IPA is my second favorite after Dark Mode Stout obviously', now() - interval '1 day' + interval '30 minutes'),
    (sess_01, user_04, 'Save me one!', now() - interval '1 day' + interval '45 minutes'),
    (sess_06, user_01, 'Dark Mode AND Null Pointer? Legend.', now() - interval '2 days' + interval '20 minutes'),
    (sess_06, user_06, 'The nitro is SO good right now', now() - interval '2 days' + interval '40 minutes'),
    (sess_09, user_01, 'How is the barleywine? Been wanting to try it', now() - interval '20 days' + interval '15 minutes'),
    (sess_09, user_02, 'GET HERE NOW. It''s incredible.', now() - interval '20 days' + interval '20 minutes'),
    (sess_10, user_05, 'Pilsner crew represent!', now() - interval '3 days' + interval '25 minutes'),
    (sess_13, user_07, 'Is the sour as tart as last time?', now() - interval '1 day' + interval '35 minutes'),
    (sess_13, user_04, 'Even more tart. It''s perfect.', now() - interval '1 day' + interval '50 minutes'),
    (sess_16, user_03, 'Lager Lisa at it again', now() - interval '2 days' + interval '20 minutes'),
    (sess_18, user_02, 'Porter Paul knows what''s up', now() - interval '3 days' + interval '30 minutes'),
    (sess_20, user_08, 'That hefe is calling my name', now() - interval '4 days' + interval '15 minutes'),
    (sess_22, user_01, 'Red ale AND ESB? Old school vibes', now() - interval '5 days' + interval '25 minutes'),
    (sess_22, user_06, 'The ESB is sneaky good', now() - interval '5 days' + interval '40 minutes'),
    (sess_02, user_03, 'The haze craze continues', now() - interval '4 days' + interval '30 minutes'),
    (sess_04, user_08, 'Flight night! Wish I was there', now() - interval '12 days' + interval '15 minutes')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 16. REACTIONS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO reactions (user_id, session_id, type, created_at) VALUES
    (user_02, sess_01, 'beer', now() - interval '1 day' + interval '10 minutes'),
    (user_04, sess_01, 'thumbs_up', now() - interval '1 day' + interval '12 minutes'),
    (user_01, sess_06, 'flame', now() - interval '2 days' + interval '10 minutes'),
    (user_06, sess_06, 'beer', now() - interval '2 days' + interval '15 minutes'),
    (user_01, sess_09, 'flame', now() - interval '20 days' + interval '5 minutes'),
    (user_03, sess_10, 'thumbs_up', now() - interval '3 days' + interval '8 minutes'),
    (user_05, sess_10, 'beer', now() - interval '3 days' + interval '12 minutes'),
    (user_07, sess_13, 'thumbs_up', now() - interval '1 day' + interval '10 minutes'),
    (user_02, sess_18, 'beer', now() - interval '3 days' + interval '10 minutes'),
    (user_08, sess_20, 'flame', now() - interval '4 days' + interval '8 minutes'),
    (user_01, sess_22, 'thumbs_up', now() - interval '5 days' + interval '10 minutes'),
    (user_06, sess_22, 'beer', now() - interval '5 days' + interval '12 minutes'),
    (user_03, sess_02, 'flame', now() - interval '4 days' + interval '10 minutes'),
    (user_04, sess_16, 'thumbs_up', now() - interval '2 days' + interval '10 minutes'),
    (user_08, sess_04, 'beer', now() - interval '12 days' + interval '10 minutes')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 17. BREWERY REVIEWS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_reviews (user_id, brewery_id, rating, comment, created_at) VALUES
    (user_01, pp_brewery, 5.0, 'Best brewery in Austin, hands down. The IPAs are world-class and the arcade games are a blast.', now() - interval '25 days'),
    (user_02, pp_brewery, 4.8, 'Dark Mode Stout alone is worth the trip. Amazing stout selection and the vibe is perfect.', now() - interval '20 days'),
    (user_03, pp_brewery, 4.5, 'Finally a brewery that takes pilsners seriously. Clean, crisp, proper lagers.', now() - interval '18 days'),
    (user_04, pp_brewery, 4.7, 'Their sour game is strong. Stack Overflow Sour is my go-to summer beer.', now() - interval '15 days'),
    (user_05, pp_brewery, 4.3, 'Great lager selection and the outdoor patio is dog-friendly. What more do you need?', now() - interval '12 days'),
    (user_06, pp_brewery, 4.6, 'The porter with vanilla is something special. Cozy atmosphere too.', now() - interval '10 days'),
    (user_07, pp_brewery, 4.4, 'Love the hefeweizen here. Perfect for hot Texas afternoons.', now() - interval '8 days'),
    (user_08, pp_brewery, 4.5, 'Red ales and ESBs are an underappreciated art form. These folks get it.', now() - interval '5 days'),
    (user_01, brew_mtn, 4.2, 'Solid brewery with good variety. The pale ale is a highlight.', now() - interval '7 days'),
    (user_02, brew_smk, 4.4, 'Their smoked porter is incredible. Worth the drive.', now() - interval '5 days'),
    (user_04, brew_riv, 4.0, 'Decent gose selection. Patio could use some shade though.', now() - interval '6 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    rating = EXCLUDED.rating, comment = EXCLUDED.comment;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 18. BEER REVIEWS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO beer_reviews (user_id, beer_id, rating, comment, created_at) VALUES
    (user_01, beer_04, 5.0, 'The best hazy IPA in Austin. Mango and pineapple notes are incredible. Pillowy soft mouthfeel.', now() - interval '4 days'),
    (user_02, beer_05, 4.9, 'Nitro milk stout perfection. Cascading pour, creamy texture, chocolate fudge finish.', now() - interval '2 days'),
    (user_03, beer_01, 4.6, 'Proper kölsch. Clean, crisp, exactly what German brewmasters intended.', now() - interval '15 days'),
    (user_04, beer_09, 4.1, 'Surprisingly good cider from a brewery. The ginger is subtle but present.', now() - interval '1 day'),
    (user_06, beer_05, 4.7, 'That nitro cascade is mesmerizing. Tastes as good as it looks.', now() - interval '3 days'),
    (user_08, beer_02, 4.5, 'Red ale done right. Caramel sweetness with a clean malt backbone.', now() - interval '5 days'),
    (user_08, beer_10, 4.6, 'Proper ESB. Biscuit malt, earthy hops, pub classic. More breweries should make these.', now() - interval '5 days'),
    (user_07, beer_07, 4.2, 'Great session pale. Crushable on a hot day.', now() - interval '4 days'),
    (user_02, beer_08, 4.8, 'This barleywine is a masterpiece. Toffee, dark fruit, warming. Sip it slow.', now() - interval '20 days'),
    (user_01, beer_07, 4.3, 'Solid hazy pale. Not as intense as the NEIPA but very drinkable.', now() - interval '12 days')
  ON CONFLICT (user_id, beer_id) DO UPDATE SET
    rating = EXCLUDED.rating, comment = EXCLUDED.comment;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 19. BREWERY FOLLOWS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO brewery_follows (user_id, brewery_id, created_at) VALUES
    (user_01, pp_brewery, now() - interval '30 days'),
    (user_02, pp_brewery, now() - interval '25 days'),
    (user_03, pp_brewery, now() - interval '22 days'),
    (user_04, pp_brewery, now() - interval '20 days'),
    (user_05, pp_brewery, now() - interval '18 days'),
    (user_06, pp_brewery, now() - interval '15 days'),
    (user_07, pp_brewery, now() - interval '12 days'),
    (user_08, pp_brewery, now() - interval '10 days'),
    (user_01, brew_mtn,   now() - interval '20 days'),
    (user_02, brew_smk,   now() - interval '18 days'),
    (user_04, brew_riv,   now() - interval '15 days'),
    (user_05, brew_mtn,   now() - interval '12 days')
  ON CONFLICT (user_id, brewery_id) DO NOTHING;

  -- Joshua follows Pint & Pixel
  INSERT INTO brewery_follows (user_id, brewery_id, created_at)
  VALUES (joshua_id, pp_brewery, now() - interval '45 days')
  ON CONFLICT (user_id, brewery_id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 20. LOYALTY CARDS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO loyalty_cards (user_id, brewery_id, stamps, lifetime_stamps, last_stamp_at) VALUES
    (user_01, pp_brewery, 7, 17, now() - interval '1 day'),
    (user_02, pp_brewery, 4, 14, now() - interval '2 days'),
    (user_03, pp_brewery, 2, 12, now() - interval '3 days'),
    (user_04, pp_brewery, 6, 6, now() - interval '1 day'),
    (user_05, pp_brewery, 1, 1, now() - interval '2 days'),
    (user_06, pp_brewery, 3, 3, now() - interval '3 days'),
    (user_07, pp_brewery, 2, 2, now() - interval '4 days'),
    (user_08, pp_brewery, 2, 2, now() - interval '5 days')
  ON CONFLICT (user_id, brewery_id) DO UPDATE SET
    stamps = EXCLUDED.stamps, lifetime_stamps = EXCLUDED.lifetime_stamps, last_stamp_at = EXCLUDED.last_stamp_at;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 21. NOTIFICATIONS FOR JOSHUA
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO notifications (user_id, type, title, body, read, created_at) VALUES
    (joshua_id, 'friend_request', 'New Friend Request', 'Pete Keller wants to be your friend', false, now() - interval '2 days'),
    (joshua_id, 'friend_request', 'New Friend Request', 'Alex Copperfield wants to be your friend', false, now() - interval '1 day'),
    (joshua_id, 'friend_checkin', 'Friend Check-in', 'Hazy Hayes checked in at Pint & Pixel Brewing Co.', false, now() - interval '1 day'),
    (joshua_id, 'friend_checkin', 'Friend Check-in', 'Sarah Darkwood checked in at Pint & Pixel Brewing Co.', false, now() - interval '2 days'),
    (joshua_id, 'friend_checkin', 'Friend Check-in', 'Sam Tartley checked in at Pint & Pixel Brewing Co.', false, now() - interval '1 day'),
    (joshua_id, 'brewery_follow', 'New Follower', 'Wendy Fields followed Pint & Pixel Brewing Co.', false, now() - interval '12 days'),
    (joshua_id, 'brewery_follow', 'New Follower', 'Alex Copperfield followed Pint & Pixel Brewing Co.', false, now() - interval '10 days'),
    (joshua_id, 'reaction', 'New Reaction', 'Hazy Hayes reacted to a session at Pint & Pixel', true, now() - interval '5 days'),
    (joshua_id, 'session_comment', 'New Comment', 'Sarah Darkwood commented on a session', true, now() - interval '3 days'),
    (joshua_id, 'new_tap', 'New on Tap', 'Infinite Loop IPA is now on tap at Pint & Pixel', true, now() - interval '7 days'),
    (joshua_id, 'new_event', 'Upcoming Event', 'Tap Takeover: Local Hops Only is coming up in 3 days', false, now() - interval '1 day'),
    (joshua_id, 'achievement_unlocked', 'Achievement Unlocked!', 'You earned the First Step badge!', true, now() - interval '30 days')
  ON CONFLICT DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 22. WISHLIST ITEMS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO wishlist (user_id, beer_id, note, created_at) VALUES
    (user_01, beer_08, 'Need to try this barleywine', now() - interval '10 days'),
    (user_02, beer_01, 'Kölsch sounds refreshing', now() - interval '8 days'),
    (user_03, beer_03, 'Belgian strong? Curious.', now() - interval '7 days'),
    (user_05, beer_06, 'Saison for summer', now() - interval '5 days'),
    (user_07, beer_02, 'Red ale could be good', now() - interval '4 days')
  ON CONFLICT (user_id, beer_id) DO NOTHING;

  -- Joshua wishlist
  INSERT INTO wishlist (user_id, beer_id, note, created_at) VALUES
    (joshua_id, beer_08, 'The barleywine everyone is raving about', now() - interval '5 days'),
    (joshua_id, beer_03, 'Belgian golden strong — need to try', now() - interval '3 days')
  ON CONFLICT (user_id, beer_id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════════════════
  -- 23. ACHIEVEMENTS FOR TEST USERS
  -- ═══════════════════════════════════════════════════════════════════════════
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_01, id, now() - interval '30 days' FROM achievements WHERE key = 'first_step'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_01, id, now() - interval '20 days' FROM achievements WHERE key = 'getting_started'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_01, id, now() - interval '15 days' FROM achievements WHERE key = 'hop_head'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_01, id, now() - interval '10 days' FROM achievements WHERE key = 'style_student'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_02, id, now() - interval '25 days' FROM achievements WHERE key = 'first_step'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_02, id, now() - interval '15 days' FROM achievements WHERE key = 'dark_side'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_03, id, now() - interval '22 days' FROM achievements WHERE key = 'first_step'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_04, id, now() - interval '20 days' FROM achievements WHERE key = 'first_step'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT user_04, id, now() - interval '10 days' FROM achievements WHERE key = 'sour_patch'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  -- Joshua achievements
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT joshua_id, id, now() - interval '30 days' FROM achievements WHERE key = 'first_step'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  SELECT joshua_id, id, now() - interval '20 days' FROM achievements WHERE key = 'getting_started'
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

END $$;

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
