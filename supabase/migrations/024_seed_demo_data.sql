-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 024: Demo Breweries, Beers & Events
-- Creates 3 Asheville-area breweries with 20 beers (with prices) and 7 events.
-- User-dependent data (profiles, sessions, beer_logs, friendships, loyalty)
-- must be seeded after auth users exist (use seeds/ or the app).
-- Safe to re-run (ON CONFLICT throughout). Run AFTER migrations 001-023.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001';
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002';
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003';
  mtn_b01 uuid := 'dd000004-0001-0000-0000-000000000001';
  mtn_b02 uuid := 'dd000004-0001-0000-0000-000000000002';
  mtn_b03 uuid := 'dd000004-0001-0000-0000-000000000003';
  mtn_b04 uuid := 'dd000004-0001-0000-0000-000000000004';
  mtn_b05 uuid := 'dd000004-0001-0000-0000-000000000005';
  mtn_b06 uuid := 'dd000004-0001-0000-0000-000000000006';
  mtn_b07 uuid := 'dd000004-0001-0000-0000-000000000007';
  mtn_b08 uuid := 'dd000004-0001-0000-0000-000000000008';
  riv_b01 uuid := 'dd000004-0002-0000-0000-000000000001';
  riv_b02 uuid := 'dd000004-0002-0000-0000-000000000002';
  riv_b03 uuid := 'dd000004-0002-0000-0000-000000000003';
  riv_b04 uuid := 'dd000004-0002-0000-0000-000000000004';
  riv_b05 uuid := 'dd000004-0002-0000-0000-000000000005';
  riv_b06 uuid := 'dd000004-0002-0000-0000-000000000006';
  smk_b01 uuid := 'dd000004-0003-0000-0000-000000000001';
  smk_b02 uuid := 'dd000004-0003-0000-0000-000000000002';
  smk_b03 uuid := 'dd000004-0003-0000-0000-000000000003';
  smk_b04 uuid := 'dd000004-0003-0000-0000-000000000004';
  smk_b05 uuid := 'dd000004-0003-0000-0000-000000000005';
  smk_b06 uuid := 'dd000004-0003-0000-0000-000000000006';
BEGIN

-- 1. BREWERIES
INSERT INTO breweries (id, name, brewery_type, street, city, state, country, latitude, longitude, description, website_url, phone, verified) VALUES
  (brew_mtn, 'Mountain Ridge Brewing', 'brewpub', '42 Ridgeline Dr', 'Asheville', 'North Carolina', 'United States', 35.5951, -82.5515,
   'Perched on the Blue Ridge with panoramic mountain views. Bold, hop-forward ales inspired by the Appalachian wilderness. Dog-friendly patio, live music Fridays.',
   'https://mountainridgebrewing.example.com', '(828) 555-0042', true),
  (brew_riv, 'River Bend Ales', 'microbrewery', '118 French Broad Ave', 'Asheville', 'North Carolina', 'United States', 35.5846, -82.5620,
   'Riverfront microbrewery specializing in Belgian-inspired ales and wild fermentations. 40+ oak barrels aging sours and saisons.',
   'https://riverbendales.example.com', '(828) 555-0118', true),
  (brew_smk, 'Smoky Barrel Craft Co.', 'brewpub', '7 Montreat Rd', 'Black Mountain', 'North Carolina', 'United States', 35.6176, -82.3215,
   'Small-batch craft in Black Mountain. We smoke our own malts and age everything in local whiskey barrels. Cozy taproom with board games and a fireplace.',
   'https://smokybarrelcraft.example.com', '(828) 555-0007', true)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description;

-- 2. BEERS (20 total with prices, styles, ABVs)
INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, is_featured, display_order, price_per_pint) VALUES
  (mtn_b01, brew_mtn, 'Ridgeline IPA',      'IPA',        6.8, 65, 'Juicy tropical citrus with a piney finish. Our flagship.', true, false, 0, 7),
  (mtn_b02, brew_mtn, 'Summit Sunset Hazy',  'Hazy IPA',   7.2, 45, 'Pillowy soft with mango and guava.',                      true, true,  1, 8),
  (mtn_b03, brew_mtn, 'Trailhead Lager',     'Lager',      4.5, 20, 'Crisp, clean, crushable. Perfect after a hike.',           true, false, 2, 6),
  (mtn_b04, brew_mtn, 'Appalachian Amber',   'Amber',      5.4, 30, 'Caramel malt backbone with subtle hop bitterness.',        true, false, 3, 6),
  (mtn_b05, brew_mtn, 'Dark Hollow Stout',   'Stout',      6.2, 35, 'Roasty, chocolatey, silky smooth.',                        true, false, 4, 7),
  (mtn_b06, brew_mtn, 'Wildflower Wheat',    'Wheat',      4.8, 15, 'Light and refreshing with honey and chamomile.',            true, false, 5, 6),
  (mtn_b07, brew_mtn, 'Bear Creek DIPA',     'Double IPA', 8.5, 80, 'Big, bold, resinous. Not for the faint of heart.',          true, false, 6, 9),
  (mtn_b08, brew_mtn, 'Basecamp Blonde',     'Blonde Ale', 4.2, 12, 'Easy-drinking gateway craft.',                             false, false, 7, 5),
  (riv_b01, brew_riv, 'French Broad Belgian','Belgian',     7.8, 25, 'Complex yeast character. Fruity esters and mild spice.',    true, true,  0, 8),
  (riv_b02, brew_riv, 'Riverside Saison',    'Saison',     6.5, 28, 'Bone-dry with peppery yeast and citrus zest.',              true, false, 1, 7),
  (riv_b03, brew_riv, 'Barrel Room Sour',    'Sour',       5.2, 8,  'Oak-aged mixed fermentation. Tart cherry and funk.',        true, false, 2, 9),
  (riv_b04, brew_riv, 'Cottonwood Kolsch',   'Kolsch',     4.8, 22, 'Bright, delicate, effervescent.',                           true, false, 3, 6),
  (riv_b05, brew_riv, 'Biltmore Pilsner',    'Pilsner',    5.0, 35, 'Noble hops, bready malt. A proper Czech pils.',             true, false, 4, 6),
  (riv_b06, brew_riv, 'Monks Garden Tripel', 'Belgian',    9.2, 30, 'Golden, strong, deceptively smooth.',                       true, false, 5, 10),
  (smk_b01, brew_smk, 'Smokehouse Porter',   'Porter',     5.8, 30, 'Beechwood-smoked malt with chocolate and vanilla.',         true, true,  0, 7),
  (smk_b02, brew_smk, 'Barrel-Aged Imperial','Imperial Stout',10.5,50,'Aged 12 months in local bourbon barrels.',                true, false, 1, 12),
  (smk_b03, brew_smk, 'Firepit Red',         'Red Ale',    5.5, 28, 'Toasty caramel malt with a kiss of smoke.',                 true, false, 2, 6),
  (smk_b04, brew_smk, 'Timber Creek Pale',   'Pale Ale',   5.2, 40, 'Classic American pale ale. Citrus and floral hops.',        true, false, 3, 6),
  (smk_b05, brew_smk, 'Mountain Mead',       'Mead',       8.0, 0,  'Wildflower honey mead. Dry, effervescent, floral.',         true, false, 4, 9),
  (smk_b06, brew_smk, 'Whittled Down Wit',   'Hefeweizen', 4.6, 14, 'Coriander, orange peel, and a cloud of wheat.',             true, false, 5, 6)
ON CONFLICT (id) DO UPDATE SET price_per_pint=EXCLUDED.price_per_pint, is_featured=EXCLUDED.is_featured, display_order=EXCLUDED.display_order;

-- 3. BREWERY EVENTS (upcoming)
INSERT INTO brewery_events (brewery_id, title, description, event_date, start_time, is_active) VALUES
  (brew_mtn,'Trivia Night','Teams of 4. Prizes for top 3.',(now()+interval '2d')::date,'19:00'::time,true),
  (brew_mtn,'Live Music: The Hops','Indie folk on the patio.',(now()+interval '5d')::date,'20:00'::time,true),
  (brew_mtn,'Tap Takeover: Sours','6 guest sour beers from NC.',(now()+interval '12d')::date,'16:00'::time,true),
  (brew_riv,'Barrel Room Tour','Behind the scenes of our 40-barrel program.',(now()+interval '3d')::date,'14:00'::time,true),
  (brew_riv,'Belgian Night','All Belgian styles on special.',(now()+interval '8d')::date,'18:00'::time,true),
  (brew_smk,'Fireside Storytelling','Local authors by the fireplace.',(now()+interval '4d')::date,'19:00'::time,true),
  (brew_smk,'Mead & Cheese Pairing','Mountain mead + NC artisan cheeses.',(now()+interval '10d')::date,'17:00'::time,true)
ON CONFLICT DO NOTHING;

RAISE NOTICE '== Demo data seeded: 3 breweries, 20 beers (with prices), 7 events ==';
RAISE NOTICE '   Note: User-dependent data (sessions, beer_logs, friendships, loyalty) requires auth users.';
RAISE NOTICE '   Use the app to create sessions, or run seeds/ scripts after creating auth users.';
END $$;
