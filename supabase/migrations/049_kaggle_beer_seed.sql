-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 049: Kaggle Beer Study — US Craft Beer Seeds
-- 2361 beers matched to breweries from Open Brewery DB (migration 048)
-- Source: https://github.com/davestroud/BeerStudy
-- Styles mapped to HopTrack's 26 canonical styles (beerStyleColors.ts)
-- Generated: 2026-03-31
--
-- Drew 🍻: "Real beers at real breweries. Now we're talking."
-- Quinn ⚙️: "Matching by name+city+state. Existing beers stay safe."
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Beers by style ──
-- IPA: 466
-- Pale Ale: 257
-- Amber: 232
-- Lager: 181
-- Wheat: 116
-- Blonde Ale: 108
-- Double IPA: 105
-- Brown Ale: 96
-- Pilsner: 91
-- Porter: 71
-- Saison: 68
-- Witbier: 51
-- Sour: 50
-- Stout: 47
-- Red Ale: 45
-- Belgian: 42
-- Kölsch: 42
-- Hefeweizen: 41
-- American Black Ale: 36
-- Oktoberfest: 30
-- Cream Ale: 29
-- Imperial Stout: 20
-- Helles: 20
-- Oatmeal Stout: 18
-- Belgian Tripel: 11
-- Berliner Weisse: 11
-- Belgian Dubbel: 11
-- Milk Stout: 10
-- Gose: 10
-- Baltic Porter: 6
-- Wild Ale: 6
-- Dry Stout: 5
-- Maibock / Helles Bock: 5
-- Dunkel: 4
-- Quadrupel (Quad): 4
-- Barleywine: 3
-- English Barleywine: 3
-- Keller Bier / Zwickel Bier: 3
-- Abbey Single Ale: 2
-- Roggenbier: 2
-- Flanders Red: 1
-- American Malt Liquor: 1
-- Grisette: 1

-- Each beer is matched to its brewery via name + city + state lookup.
-- Beers whose brewery isn't found in our DB are silently skipped.
-- Existing beers (from migration 043) are preserved via name+brewery uniqueness.

-- 541 unique breweries with beer data

DO $$
DECLARE
  v_brewery_id uuid;
BEGIN

  -- ── 10 Barrel Brewing Company (Bend, OR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('10 Barrel Brewing Company') AND LOWER(city) = LOWER('Bend') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pub Beer', 'Lager', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 18th Street Brewery (Gary, IN) — 14 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('18th Street Brewery') AND LOWER(city) = LOWER('Gary') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Devil''s Cup', 'Pale Ale', 0.066, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rise of the Phoenix', 'IPA', 0.071, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sinister', 'Double IPA', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sex and Candy', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Exodus', 'Oatmeal Stout', 0.077, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lake Street Express', 'Pale Ale', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Foreman', 'Porter', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jade', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cone Crusher', 'Double IPA', 0.086, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sophomoric Saison', 'Saison', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Regional Ring Of Fire', 'Saison', 0.073, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Garce Selé', 'Saison', 0.069, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Troll Destroyer', 'IPA', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bitter Bitch', 'Pale Ale', 0.061, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 21st Amendment Brewery (San Francisco, CA) — 19 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('21st Amendment Brewery') AND LOWER(city) = LOWER('San Francisco') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'He Said Baltic-Style Porter', 'Baltic Porter', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'He Said Belgian-Style Tripel', 'Belgian Tripel', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lower De Boom', 'Barleywine', 0.099, 92, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fireside Chat', 'Amber', 0.079, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Marooned On Hog Island', 'Stout', 0.079, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bitter American', 'Pale Ale', 0.044, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hell or High Watermelon Wheat (2009)', 'Sour', 0.049, 17, true, true),
      (gen_random_uuid(), v_brewery_id, '21st Amendment Watermelon Wheat Beer (2006)', 'Sour', 0.049, 17, true, true),
      (gen_random_uuid(), v_brewery_id, '21st Amendment IPA (2006)', 'IPA', 0.07, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brew Free! or Die IPA (2008)', 'IPA', 0.07, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brew Free! or Die IPA (2009)', 'IPA', 0.07, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Special Edition: Allies Win The War!', 'Red Ale', 0.085, 52, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Crisis', 'Double IPA', 0.097, 94, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bitter American (2011)', 'Pale Ale', 0.044, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fireside Chat (2010)', 'Amber', 0.079, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back in Black', 'American Black Ale', 0.068, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Monk''s Blood', 'Belgian', 0.083, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brew Free! or Die IPA', 'IPA', 0.07, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hell or High Watermelon Wheat', 'Sour', 0.049, 17, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 3 Daughters Brewing (St Petersburg, FL) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('3 Daughters Brewing') AND LOWER(city) = LOWER('St Petersburg') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bimini Twist', 'IPA', 0.07, 82, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beach Blonde', 'Blonde Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rod Bender Red', 'Amber', 0.059, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 4 Hands Brewing Company (Saint Louis, MO) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('4 Hands Brewing Company') AND LOWER(city) = LOWER('Saint Louis') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Passion Fruit Prussia', 'Berliner Weisse', 0.035, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Send Help', 'Blonde Ale', 0.045, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cast Iron Oatmeal Brown', 'Brown Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Reprise Centennial Red', 'Amber', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alter Ego', 'American Black Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Divided Sky', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Resurrected', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Contact High', 'Wheat', 0.05, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 450 North Brewing Company (Columbus, IN) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('450 North Brewing Company') AND LOWER(city) = LOWER('Columbus') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Galaxyfest', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Citrafest', 'IPA', 0.05, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barn Yeti', 'Belgian Dubbel', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Scarecrow', 'IPA', 0.069, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ironman', 'Red Ale', 0.09, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Honey Kolsch', 'Kölsch', 0.046, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Copperhead Amber', 'Belgian', 0.052, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 7 Seas Brewing Company (Gig Harbor, WA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('7 Seas Brewing Company') AND LOWER(city) = LOWER('Gig Harbor') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rude Parrot IPA', 'IPA', 0.059, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'British Pale Ale (2010)', 'Pale Ale', 0.054, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'British Pale Ale', 'Pale Ale', 0.054, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ballz Deep Double IPA', 'Double IPA', 0.084, 82, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── 7venth Sun (Dunedin, FL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('7venth Sun') AND LOWER(city) = LOWER('Dunedin') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wolfman''s Berliner', 'Berliner Weisse', 0.038, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── AC Golden Brewing Company (Golden, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('AC Golden Brewing Company') AND LOWER(city) = LOWER('Golden') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Colorado Native', 'Lager', 0.055, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Colorado Native (2011)', 'Lager', 0.055, 26, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Abita Brewing Company (Abita Springs, LA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Abita Brewing Company') AND LOWER(city) = LOWER('Abita Springs') AND state = 'LA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jockamo IPA', 'IPA', 0.065, 52, true, true),
      (gen_random_uuid(), v_brewery_id, 'Purple Haze', 'Sour', 0.042, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abita Amber', 'Lager', 0.045, 17, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Against The Grain Brewery (Louisville, KY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Against The Grain Brewery') AND LOWER(city) = LOWER('Louisville') AND state = 'KY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Citra Ass Down', 'IPA', 0.082, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Brown Note', 'Brown Ale', 0.05, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Against the Grain Brewery (Louisville, KY) — 13 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Against the Grain Brewery') AND LOWER(city) = LOWER('Louisville') AND state = 'KY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Citra Ass Down', 'Double IPA', 0.08, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'London Balling', 'English Barleywine', 0.125, 80, true, true),
      (gen_random_uuid(), v_brewery_id, '35 K', 'Milk Stout', 0.077, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'A Beer', 'Pale Ale', 0.042, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rules are Rules', 'Pilsner', 0.05, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flesh Gourd''n', 'Amber', 0.066, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sho''nuff', 'Belgian', 0.04, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bloody Show', 'Pilsner', 0.055, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rico Sauvin', 'Double IPA', 0.076, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'Coq de la Marche', 'Saison', 0.051, 38, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kamen Knuddeln', 'Wild Ale', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pile of Face', 'IPA', 0.06, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Brown Note', 'Brown Ale', 0.05, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Airways Brewing Company (Kent, WA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Airways Brewing Company') AND LOWER(city) = LOWER('Kent') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Maylani''s Coconut Stout', 'Stout', 0.053, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oatmeal PSA', 'Pale Ale', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pre Flight Pilsner', 'Pilsner', 0.052, 33, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Alameda Brewing (Portland, OR) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Alameda Brewing') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'P-Town Pilsner', 'Pilsner', 0.04, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Klickitat Pale Ale', 'Pale Ale', 0.053, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yellow Wolf Imperial IPA', 'Double IPA', 0.082, 103, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Alaskan Brewing Company (Juneau, AK) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Alaskan Brewing Company') AND LOWER(city) = LOWER('Juneau') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Freeride APA', 'Pale Ale', 0.053, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alaskan Amber', 'Amber', 0.053, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ale Asylum (Madison, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ale Asylum') AND LOWER(city) = LOWER('Madison') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hopalicious', 'Pale Ale', 0.057, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Alltech's Lexington Brewing Company (Lexington, KY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Alltech''s Lexington Brewing Company') AND LOWER(city) = LOWER('Lexington') AND state = 'KY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Kentucky Kölsch', 'Kölsch', 0.043, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kentucky IPA', 'IPA', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Amnesia Brewing Company (Washougal, WA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Amnesia Brewing Company') AND LOWER(city) = LOWER('Washougal') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dusty Trail Pale Ale', 'Pale Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Damnesia', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Desolation IPA', 'IPA', 0.062, 43, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Anchor Brewing Company (San Francisco, CA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Anchor Brewing Company') AND LOWER(city) = LOWER('San Francisco') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Liberty Ale', 'IPA', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'IPA', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Wheat', 'Wheat', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'California Lager', 'Lager', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brotherhood Steam', 'Lager', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Anderson Valley Brewing Company (Boonville, CA) — 17 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Anderson Valley Brewing Company') AND LOWER(city) = LOWER('Boonville') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blood Orange Gose', 'Gose', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Keebarlin'' Pale Ale', 'Pale Ale', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'the Kimmie, the Yink and the Holy Gose', 'Gose', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fall Hornin''', 'Amber', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barney Flats Oatmeal Stout', 'Oatmeal Stout', 0.057, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Solstice', 'Cream Ale', 0.056, 4, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Ottin'' IPA', 'IPA', 0.07, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boont Amber Ale', 'Amber', 0.058, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'El Steinber Dark Lager', 'Lager', 0.055, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boont Amber Ale (2010)', 'Amber', 0.058, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Solstice Cerveza Crema (2009)', 'Cream Ale', 0.056, 4, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barney Flats Oatmeal Stout (2012)', 'Oatmeal Stout', 0.057, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Winter Solstice', 'Amber', 0.069, 6, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Ottin'' IPA (2011)', 'IPA', 0.07, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boont Amber Ale (2011)', 'Amber', 0.058, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Solstice (2011)', 'Cream Ale', 0.056, 4, true, true),
      (gen_random_uuid(), v_brewery_id, 'Poleeko Gold Pale Ale (2009)', 'Pale Ale', 0.055, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Angry Minnow (Hayward, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Angry Minnow') AND LOWER(city) = LOWER('Hayward') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Charlie''s Rye IPA', 'IPA', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Angry Minnow Brewing Company (Hayward, WI) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Angry Minnow Brewing Company') AND LOWER(city) = LOWER('Hayward') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'River Pig Pale Ale', 'Pale Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oaky''s Oatmeal Stout', 'Oatmeal Stout', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Anthem Brewing Company (Oklahoma City, OK) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Anthem Brewing Company') AND LOWER(city) = LOWER('Oklahoma City') AND state = 'OK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Golden One', 'Belgian', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Arjuna', 'Witbier', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Uroboros', 'Stout', 0.085, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Appalachian Mountain Brewery (Boone, NC) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Appalachian Mountain Brewery') AND LOWER(city) = LOWER('Boone') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Long Leaf', 'IPA', 0.071, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Honey Badger Blonde', 'Blonde Ale', 0.047, 19, true, true),
      (gen_random_uuid(), v_brewery_id, 'Porter (a/k/a Black Gold Porter)', 'Porter', 0.06, 23, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Arcadia Brewing Company (Battle Creek, MI) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Arcadia Brewing Company') AND LOWER(city) = LOWER('Battle Creek') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sky High Rye', 'Pale Ale', 0.06, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Whitsun', 'Wheat', 0.062, 17, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Arctic Craft Brewery (Colorado Springs, CO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Arctic Craft Brewery') AND LOWER(city) = LOWER('Colorado Springs') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'On-On Ale (2008)', 'Pale Ale', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Armadillo Ale Works (Denton, TX) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Armadillo Ale Works') AND LOWER(city) = LOWER('Denton') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Quakertown Stout', 'Imperial Stout', 0.092, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Greenbelt Farmhouse Ale', 'Saison', 0.051, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Armstrong Brewing Company (South San Francisco, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Armstrong Brewing Company') AND LOWER(city) = LOWER('South San Francisco') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mo''s Gose', 'Gose', 0.052, 10, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Asher Brewing Company (Boulder, CO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Asher Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Green Bullet Organic India Pale Ale', 'IPA', 0.07, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Asheville Brewing Company (Asheville, NC) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Asheville Brewing Company') AND LOWER(city) = LOWER('Asheville') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rocket Girl', 'Kölsch', 0.032, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ninja Porter', 'Porter', 0.053, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shiva IPA', 'IPA', 0.06, 69, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Aslan Brewing Company (Bellingham, WA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Aslan Brewing Company') AND LOWER(city) = LOWER('Bellingham') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Aslan Kölsch', 'Kölsch', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aslan IPA', 'IPA', 0.077, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aslan Amber', 'Amber', 0.077, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Aspen Brewing Company (Aspen, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Aspen Brewing Company') AND LOWER(city) = LOWER('Aspen') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'This Season''s Blonde', 'Blonde Ale', 0.056, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Independence Pass Ale', 'IPA', 0.07, 67, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Astoria Brewing Company (Astoria, OR) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Astoria Brewing Company') AND LOWER(city) = LOWER('Astoria') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Trolley Stop Stout', 'Stout', 0.057, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bitter Bitch Imperial IPA', 'Double IPA', 0.082, 138, true, true),
      (gen_random_uuid(), v_brewery_id, 'Poop Deck Porter', 'Porter', 0.062, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Red Beard Amber Ale', 'Amber', 0.06, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Atwater Brewery (Detroit, MI) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Atwater Brewery') AND LOWER(city) = LOWER('Detroit') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hop A-Peel', 'Double IPA', 0.075, 115, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vanilla Java Porter', 'Porter', 0.055, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Michelada', 'Sour', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dirty Blonde Ale', 'Blonde Ale', 0.045, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grand Circus IPA', 'IPA', 0.05, 62, true, true),
      (gen_random_uuid(), v_brewery_id, 'Atwater''s Lager', 'Helles', 0.05, 12, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Austin Beerworks (Austin, TX) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Austin Beerworks') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Heavy Machinery IPA Series #1: Heavy Fist', 'American Black Ale', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fire Eagle IPA', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Peacemaker', 'Pale Ale', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pearl-Snap', 'Pilsner', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Thunder', 'Lager', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Avery Brewing Company (Boulder, CO) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Avery Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Raja', 'Double IPA', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Perzik Saison', 'Saison', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Avery Joe’s Premium American Pilsner', 'Pilsner', 0.047, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Rascal', 'Witbier', 0.056, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Avery India Pale Ale', 'IPA', 0.063, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ellie’s Brown Ale', 'Brown Ale', 0.055, 17, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Aviator Brewing Company (Fuquay-Varina, NC) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Aviator Brewing Company') AND LOWER(city) = LOWER('Fuquay-Varina') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pumpkin Beast', 'Amber', 0.062, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'OktoberBeast', 'Oktoberfest', 0.072, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mad Beach', 'Wheat', 0.048, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hog Wild India Pale Ale', 'IPA', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Devils Tramping Ground Tripel', 'Belgian Tripel', 0.092, 5, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hot Rod Red', 'Amber', 0.061, 41, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Back East Brewing Company (Bloomfield, CT) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Back East Brewing Company') AND LOWER(city) = LOWER('Bloomfield') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Palate Mallet', 'Double IPA', 0.086, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back East Porter', 'Porter', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back East Golden Ale', 'Blonde Ale', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Misty Mountain IPA', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back East Ale', 'Amber', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Back Forty Beer Company (Gadsden, AL) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Back Forty Beer Company') AND LOWER(city) = LOWER('Gadsden') AND state = 'AL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Truck Stop Honey Brown Ale', 'Brown Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Naked Pig Pale Ale', 'Pale Ale', 0.06, 43, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bale Breaker Brewing Company (Yakima, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bale Breaker Brewing Company') AND LOWER(city) = LOWER('Yakima') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Topcutter India Pale Ale', 'IPA', 0.068, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Field 41 Pale Ale', 'Pale Ale', 0.044, 38, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ballast Point Brewing Company (San Diego, CA) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ballast Point Brewing Company') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Grapefruit Sculpin', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Even Keel', 'IPA', 0.038, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ballast Point Pale Ale', 'Kölsch', 0.052, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Eye India Pale Ale', 'IPA', 0.07, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Longfin Lager', 'Helles', 0.046, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sculpin IPA', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Banner Beer Company (Williamsburg, MA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Banner Beer Company') AND LOWER(city) = LOWER('Williamsburg') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'All Nighter Ale', 'Amber', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Banner American Rye', 'Wheat', 0.045, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Banner American Ale', 'Amber', 0.035, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bare Hands Brewery (Granger, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bare Hands Brewery') AND LOWER(city) = LOWER('Granger') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Thai.p.a', 'IPA', 0.07, 46, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Barrio Brewing Company (Tucson, AZ) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Barrio Brewing Company') AND LOWER(city) = LOWER('Tucson') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Barrio Blanco', 'IPA', 0.06, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barrio Tucson Blonde', 'Blonde Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Base Camp Brewing Co. (Portland, OR) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Base Camp Brewing Co.') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hop in the ‘Pool Helles', 'Pilsner', 0.049, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ultra Gnar Gnar IPA', 'IPA', 0.067, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'In-Tents India Pale Lager', 'Lager', 0.068, 62, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lost Meridian Wit', 'Witbier', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Celestial Meridian Cascadian Dark Lager', 'Lager', 0.051, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bauhaus Brew Labs (Minneapolis, MN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bauhaus Brew Labs') AND LOWER(city) = LOWER('Minneapolis') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wagon Party', 'Lager', 0.054, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sky-Five', 'IPA', 0.067, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stargrazer', 'Lager', 0.05, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wonderstuff', 'Pilsner', 0.054, 48, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Baxter Brewing Company (Lewiston, ME) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Baxter Brewing Company') AND LOWER(city) = LOWER('Lewiston') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tarnation California-Style Lager', 'Lager', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'On the Count of 3 (2015)', 'Hefeweizen', 0.07, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Swelter', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Phantom Punch Winter Stout', 'Stout', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hayride Autumn Ale', 'Wheat', 0.066, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Celsius Summer Ale (2012)', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Amber Road', 'Amber', 0.055, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pamola Xtra Pale Ale', 'Pale Ale', 0.049, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stowaway IPA', 'IPA', 0.069, 69, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Beach Brewing Company (Virginia Beach, VA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Beach Brewing Company') AND LOWER(city) = LOWER('Virginia Beach') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hoptopus Double IPA', 'Double IPA', 0.088, 108, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Beer Works Brewery (Lowell, MA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Beer Works Brewery') AND LOWER(city) = LOWER('Lowell') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Watermelon Ale', 'Sour', 0.05, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fenway American Pale Ale', 'Pale Ale', 0.058, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back Bay IPA', 'IPA', 0.068, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bell's Brewery (Kalamazoo, MI) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bell''s Brewery') AND LOWER(city) = LOWER('Kalamazoo') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Oberon', 'Wheat', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Smitten', 'Wheat', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Winter White', 'Witbier', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Two Hearted', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Best Brown', 'Brown Ale', 0.058, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bent Brewstillery (Roseville, MN) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bent Brewstillery') AND LOWER(city) = LOWER('Roseville') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Moar', 'IPA', 0.044, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'Uber Lupin Schwarz IPA', 'Double IPA', 0.083, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nordic Blonde', 'Blonde Ale', 0.057, 27, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bent Paddle Brewing Company (Duluth, MN) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bent Paddle Brewing Company') AND LOWER(city) = LOWER('Duluth') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cold Press', 'American Black Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harness the Winter', 'IPA', 0.072, 87, true, true),
      (gen_random_uuid(), v_brewery_id, '14° ESB', 'Amber', 0.056, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bent Hop Golden IPA', 'IPA', 0.062, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bent Paddle Black Ale', 'American Black Ale', 0.06, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Venture Pils', 'Pilsner', 0.05, 38, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Berkshire Brewing Company (South Deerfield, MA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Berkshire Brewing Company') AND LOWER(city) = LOWER('South Deerfield') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lost Sailor IPA', 'IPA', 0.055, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Steel Rail Extra Pale Ale', 'Pale Ale', 0.053, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Bend Brewing Company (Alpine, TX) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Bend Brewing Company') AND LOWER(city) = LOWER('Alpine') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'La Frontera Premium IPA', 'IPA', 0.078, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tejas Lager', 'Pilsner', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Number 22 Porter', 'Porter', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Bend Hefeweizen', 'Hefeweizen', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Terlingua Gold', 'Blonde Ale', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Choice Brewing (Broomfield, CO) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Choice Brewing') AND LOWER(city) = LOWER('Broomfield') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Aprè Shred', 'Red Ale', 0.081, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hemlock Double IPA', 'Double IPA', 0.095, 104, true, true),
      (gen_random_uuid(), v_brewery_id, 'West Portal Colorado Common Summer Ale', 'Lager', 0.041, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Disconnected Red', 'Amber', 0.067, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Elm Brewing (Sheffield, MA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Elm Brewing') AND LOWER(city) = LOWER('Sheffield') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big Elm IPA', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gerry Dog Stout', 'Stout', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '413 Farmhouse Ale', 'Saison', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Lake Brewing (Holland, MI) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Lake Brewing') AND LOWER(city) = LOWER('Holland') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dark Star', 'Stout', 0.08, 54, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ryecoe', 'IPA', 0.062, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Muddy Brewing (Murphysboro, IL) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Muddy Brewing') AND LOWER(city) = LOWER('Murphysboro') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blueberry Blonde', 'Sour', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Galaxy IPA', 'IPA', 0.075, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big River Brewing Company (Chattanooga, TN) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big River Brewing Company') AND LOWER(city) = LOWER('Chattanooga') AND state = 'TN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big River Pilsner', 'Pilsner', 0.05, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'House Brand IPA', 'IPA', 0.06, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Sky Brewing Company (Missoula, MT) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Sky Brewing Company') AND LOWER(city) = LOWER('Missoula') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big Sky IPA', 'IPA', 0.062, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Scape Goat Pale Ale', 'Pale Ale', 0.05, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Montana Trout Slayer Ale', 'Wheat', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moose Drool Brown Ale', 'Brown Ale', 0.051, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Powder Hound Winter Ale', 'Red Ale', 0.072, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moose Drool Brown Ale (2011)', 'Brown Ale', 0.051, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Montana Trout Slayer Ale (2012)', 'Wheat', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Sky IPA (2012)', 'IPA', 0.062, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Honey', 'Blonde Ale', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Scape Goat Pale Ale (2010)', 'Pale Ale', 0.05, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Montana Trout Slayer Ale (2009)', 'Wheat', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moose Drool Brown Ale (2009)', 'Brown Ale', 0.051, 26, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Storm Brewing Company (Odessa, FL) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Storm Brewing Company') AND LOWER(city) = LOWER('Odessa') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Arcus IPA', 'IPA', 0.069, 81, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wavemaker', 'Amber', 0.058, 38, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Big Wood Brewery (Vadnais Heights, MN) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Big Wood Brewery') AND LOWER(city) = LOWER('Vadnais Heights') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jack Pine Savage', 'Pale Ale', 0.053, 43, true, true),
      (gen_random_uuid(), v_brewery_id, 'Forest Fire Imperial Smoked Rye', 'Wheat', 0.099, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bad Axe Imperial IPA', 'Double IPA', 0.098, 76, true, true),
      (gen_random_uuid(), v_brewery_id, 'Morning Wood', 'Oatmeal Stout', 0.055, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bark Bite IPA', 'IPA', 0.066, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Birdsong Brewing Company (Charlotte, NC) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Birdsong Brewing Company') AND LOWER(city) = LOWER('Charlotte') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jalapeno Pale Ale', 'Pale Ale', 0.055, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bitter Root Brewing (Hamilton, MT) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bitter Root Brewing') AND LOWER(city) = LOWER('Hamilton') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blown Out Brown', 'Brown Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Single Hop Ale', 'Pale Ale', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sawtooth Ale', 'Blonde Ale', 0.054, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Black Acre Brewing Co. (Indianapolis, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Black Acre Brewing Co.') AND LOWER(city) = LOWER('Indianapolis') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Saucy Intruder', 'Wheat', 0.072, 75, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Black Market Brewing Company (Temecula, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Black Market Brewing Company') AND LOWER(city) = LOWER('Temecula') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Deception', 'Blonde Ale', 0.045, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blackmarket Rye IPA', 'IPA', 0.075, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Market Hefeweizen', 'Hefeweizen', 0.05, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aftermath Pale Ale', 'Pale Ale', 0.058, 44, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Black Shirt Brewing Company (Denver, CO) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Black Shirt Brewing Company') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'American India Red Ale', 'Red Ale', 0.071, 83, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Red Porter', 'Porter', 0.071, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Red Saison', 'Saison', 0.078, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Colorado Red Ale', 'Amber', 0.066, 44, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Black Tooth Brewing Company (Sheridan, WY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Black Tooth Brewing Company') AND LOWER(city) = LOWER('Sheridan') AND state = 'WY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Saddle Bronc Brown Ale', 'Brown Ale', 0.048, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bomber Mountain Amber Ale', 'Amber', 0.046, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blackrocks Brewery (Marquette, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blackrocks Brewery') AND LOWER(city) = LOWER('Marquette') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Flying Sailor', 'Wheat', 0.073, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blackrocks Brewery (Marquette, MI) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blackrocks Brewery') AND LOWER(city) = LOWER('Marquette') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Nordskye', 'IPA', 0.048, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'North Third Stout', 'Stout', 0.06, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Honey Lav', 'Wheat', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Coconut Brown Ale', 'Brown Ale', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '51K IPA', 'IPA', 0.07, 51, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grand Rabbits', 'Cream Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blue Blood Brewing Company (Lincoln, NE) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blue Blood Brewing Company') AND LOWER(city) = LOWER('Lincoln') AND state = 'NE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '1800 Big Log Wheat (2012)', 'Wheat', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Play Pilsner', 'Pilsner', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brewerhood Brown Ale', 'Brown Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Last Call Imperial Amber Ale', 'Amber', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pernicious Double IPA', 'Double IPA', 0.096, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '6-4-3 Double Play Pilsner', 'Pilsner', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'N Street Drive-In 50th Anniversary IPA', 'Double IPA', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '467 Ethan''s Stout', 'Stout', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '1335 Wicked Snout', 'Saison', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '543 Skull Creek Fresh Hopped Pale Ale', 'Pale Ale', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '1327 Pod''s ESB', 'Amber', 0.056, 37, true, true),
      (gen_random_uuid(), v_brewery_id, '834 Happy As Ale', 'Pale Ale', 0.046, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blue Hills Brewery (Canton, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blue Hills Brewery') AND LOWER(city) = LOWER('Canton') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Quarter Mile Double IPA', 'Double IPA', 0.08, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blue Mountain Brewery (Afton, VA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blue Mountain Brewery') AND LOWER(city) = LOWER('Afton') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Full Nelson Pale Ale', 'Pale Ale', 0.059, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Steel Wheels ESB', 'Amber', 0.065, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blue Mountain Classic Lager', 'Lager', 0.053, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Full Nelson Pale Ale (2010)', 'Pale Ale', 0.059, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blue Mountain Brewery (Arrington, VA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blue Mountain Brewery') AND LOWER(city) = LOWER('Arrington') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Kölsch 151', 'Kölsch', 0.049, 16, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blue Owl Brewing (Austin, TX) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blue Owl Brewing') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Professor Black', 'Stout', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Little Boss', 'Wheat', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Van Dayum!', 'Amber', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Spirit Animal', 'Pale Ale', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Blue Point Brewing Company (Patchogue, NY) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Blue Point Brewing Company') AND LOWER(city) = LOWER('Patchogue') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Toxic Sludge', 'American Black Ale', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blue Point White IPA', 'IPA', 0.06, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blue Point Summer Ale', 'Blonde Ale', 0.044, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Toasted Lager', 'Lager', 0.055, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bohemian Brewery (Midvale, UT) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bohemian Brewery') AND LOWER(city) = LOWER('Midvale') AND state = 'UT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bohemian Export Lager', 'Lager', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Altus Bohemes Altbier', 'Amber', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cherny Bock', 'Lager', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Czech Pilsner', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Viennese Lager', 'Lager', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bold City Brewery (Jacksonville, FL) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bold City Brewery') AND LOWER(city) = LOWER('Jacksonville') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mad Manatee IPA', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Killer Whale Cream Ale', 'Cream Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Duke''s Cold Nose Brown Ale', 'Brown Ale', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bolero Snort Brewery (Ridgefield Park, NJ) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bolero Snort Brewery') AND LOWER(city) = LOWER('Ridgefield Park') AND state = 'NJ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Longhop IPA', 'IPA', 0.042, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lucky Buck', 'Dry Stout', 0.04, 34, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bomb Beer Company (New York, NY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bomb Beer Company') AND LOWER(city) = LOWER('New York') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bomb Lager (New Recipe)', 'Helles', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bomb Lager (Old Recipe)', 'Helles', 0.045, 27, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bonfire Brewing Company (Eagle, CO) — 18 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bonfire Brewing Company') AND LOWER(city) = LOWER('Eagle') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Firestarter India Pale Ale', 'IPA', 0.066, 72, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kilt Dropper Scotch Ale', 'Red Ale', 0.075, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wood Splitter Pilsner', 'Pilsner', 0.048, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gyptoberfest', 'Oktoberfest', 0.056, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmer Wirtz India Pale Ale', 'IPA', 0.07, 94, true, true),
      (gen_random_uuid(), v_brewery_id, 'Slow & Steady Golden Ale', 'Blonde Ale', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pink-I Raspberry IPA', 'IPA', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moe''s Original Bar B Que ''Bama Brew Golden Ale', 'Blonde Ale', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Live Local Golden Ale', 'Blonde Ale', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Screaming Eagle Special Ale ESB', 'Amber', 0.048, 38, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dirtbag Dunkel', 'Lager', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kindler Pale Ale', 'Pale Ale', 0.053, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mistress Winter Wheat', 'Amber', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tent Pole Vanilla Porter', 'Porter', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Awry Rye Pale Ale', 'Pale Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Demshitz Brown Ale', 'Brown Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wood Splitter Pilsner (2012)', 'Pilsner', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brush Creek Blonde', 'Blonde Ale', 0.048, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Borderlands Brewing Company (Tucson, AZ) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Borderlands Brewing Company') AND LOWER(city) = LOWER('Tucson') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Noche Dulce', 'Porter', 0.071, 16, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Boston Beer Company (Boston, MA) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Boston Beer Company') AND LOWER(city) = LOWER('Boston') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Porch Rocker', 'Lager', 0.045, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rebel IPA', 'IPA', 0.065, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cold Snap', 'Witbier', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Samuel Adams Winter Lager', 'Lager', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boston Lager', 'Lager', 0.049, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Samuel Adams Octoberfest', 'Oktoberfest', 0.053, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Samuel Adams Summer Ale', 'Wheat', 0.053, 7, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Boulder Beer Company (Boulder, CO) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Boulder Beer Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hazed & Infused', 'Pale Ale', 0.049, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hoopla Pale Ale', 'Pale Ale', 0.057, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hazed & Infused (2010)', 'Pale Ale', 0.049, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Boulevard Brewing Company (Kansas City, MO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Boulevard Brewing Company') AND LOWER(city) = LOWER('Kansas City') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Heavy Lifting', 'IPA', 0.062, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Boxcar Brewing Company (West Chester, PA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Boxcar Brewing Company') AND LOWER(city) = LOWER('West Chester') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '1492', 'Pale Ale', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mango Ginger', 'IPA', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Passenger', 'Brown Ale', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Bozeman Brewing Company (Bozeman, MT) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Bozeman Brewing Company') AND LOWER(city) = LOWER('Bozeman') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Plum St. Porter', 'Porter', 0.06, 52, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bozone HopZone IPA', 'IPA', 0.07, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bozone Hefe Weizen', 'Hefeweizen', 0.06, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bozone Select Amber Ale', 'Amber', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Branchline Brewing Company (San Antonio, TX) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Branchline Brewing Company') AND LOWER(city) = LOWER('San Antonio') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Evil Owl', 'Amber', 0.052, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Breakside Brewery (Portland, OR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Breakside Brewery') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Post Time Kölsch', 'Kölsch', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Breckenridge Brewery (Denver, CO) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Breckenridge Brewery') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Agave Wheat', 'Wheat', 0.042, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'SummerBright Ale', 'Wheat', 0.045, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lucky U IPA', 'IPA', 0.062, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'Avalanche Ale', 'Amber', 0.054, 19, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Brew Bus Brewing (Tampa, FL) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Brew Bus Brewing') AND LOWER(city) = LOWER('Tampa') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'You''re My Boy, Blue', 'Sour', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Last Stop IPA', 'IPA', 0.072, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rollin Dirty Red Ale', 'Red Ale', 0.05, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Are Wheat There Yet?', 'Wheat', 0.055, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Brew Link Brewing (Plainfield, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Brew Link Brewing') AND LOWER(city) = LOWER('Plainfield') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Insert Hop Reference', 'Pale Ale', 0.058, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Brewery Terra Firma (Traverse City, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Brewery Terra Firma') AND LOWER(city) = LOWER('Traverse City') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Manitou Amber', 'Amber', 0.053, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Brewery Vivant (Grand Rapids, MI) — 62 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Brewery Vivant') AND LOWER(city) = LOWER('Grand Rapids') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Belfort', 'Saison', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Star Runner', 'Belgian', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tart Side of the Barrel', 'Imperial Stout', 0.098, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Linnaeus Mango IPA', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beasts A''Burnin''', 'Porter', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Verdun', 'Saison', 0.077, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barrel Aged Triomphe', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cherry Doppelbock', 'Lager', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tropical Saison', 'Saison', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beach Patrol', 'Witbier', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nuit Serpent', 'IPA', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Paris', 'Saison', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Grand Army', 'IPA', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Acidulated Trip', 'Saison', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Root Stock', 'Wheat', 0.066, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mind Games', 'Dunkel', 0.041, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sous Chef', 'Belgian', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dubbelicious', 'Belgian Dubbel', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Psychopomp', 'Belgian', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fat Paczki', 'Belgian', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Earth-Like Planets', 'Belgian', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ski Patrol', 'Witbier', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Viking Ice Hole', 'Oatmeal Stout', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rye Porter', 'Porter', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wizard Burial Ground', 'Quadrupel (Quad)', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Smoky Wheat', 'Porter', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'BRIPA', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mela', 'Belgian', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'W.I.P.A Snappa', 'IPA', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pepper in the Rye', 'Wheat', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moe Lasses''', 'Stout', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpkin Tart', 'Sour', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Undertaker', 'Belgian', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Undertaker (2014)', 'Belgian', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Coq D''Or', 'Belgian', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'North French', 'Saison', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Agent a Deux', 'Belgian', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Belgian Wit', 'Witbier', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pothole Stout', 'Stout', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tree Bucket', 'IPA', 0.093, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Le Flaneur Ale', 'Wild Ale', 0.073, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Maize & Blueberry', 'Sour', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Trebuchet Double IPA', 'Double IPA', 0.093, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Contemplation', 'Saison', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Rabbit', 'American Black Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Zaison', 'Saison', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vivant Tripel', 'Belgian Tripel', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tart Side of the Moon', 'Belgian', 0.098, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Red Coq', 'Amber', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hubris Quadrupel Anniversary Ale', 'Quadrupel (Quad)', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Plow Horse Belgian Style Imperial Stout', 'Imperial Stout', 0.095, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Escoffier Bretta Ale', 'Wild Ale', 0.092, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Contemplation (2012)', 'Saison', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vivant Belgian Style Imperial Stout (2012)', 'Imperial Stout', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Red Coq (2012)', 'Amber', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Zaison (2012)', 'Saison', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vivant Tripel (2012)', 'Belgian Tripel', 0.092, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Trebuchet Double IPA (2012)', 'IPA', 0.097, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kludde', 'Belgian Dubbel', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farm Hand', 'Saison', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Solitude', 'Belgian', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Triomphe', 'IPA', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Brindle Dog Brewing Company (Tampa Bay, FL) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Brindle Dog Brewing Company') AND LOWER(city) = LOWER('Tampa Bay') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tampa Pale Ale', 'Pale Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Orange Grove Wheat Ale', 'Wheat', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Broad Brook Brewing LLC (East Windsor, CT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Broad Brook Brewing LLC') AND LOWER(city) = LOWER('East Windsor') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Broad Brook Ale', 'Amber', 0.061, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Broken Tooth Brewing Company (Anchorage, AK) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Broken Tooth Brewing Company') AND LOWER(city) = LOWER('Anchorage') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Northern Lights Amber Ale', 'Amber', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Polar Pale Ale', 'Pale Ale', 0.052, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chugach Session Ale', 'Cream Ale', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fairweather IPA', 'IPA', 0.061, 64, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Brooklyn Brewery (Brooklyn, NY) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Brooklyn Brewery') AND LOWER(city) = LOWER('Brooklyn') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'East India Pale Ale', 'IPA', 0.068, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brooklyn Summer Ale', 'Amber', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brooklyn Summer Ale (2011)', 'Amber', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brooklyn Lager (16 oz.)', 'Lager', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brooklyn Lager (12 oz.)', 'Lager', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Buckbean Brewing Company (Reno, NV) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Buckbean Brewing Company') AND LOWER(city) = LOWER('Reno') AND state = 'NV'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tour de Nez Belgian IPA (Current)', 'IPA', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Roler Bock (Current)', 'Maibock / Helles Bock', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Adder IBA (Current)', 'American Black Ale', 0.073, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Very Noddy Lager (Current)', 'Lager', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tule Duck Red Ale (Current)', 'Amber', 0.062, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Original Orange Blossom Ale (Current)', 'Saison', 0.058, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Noddy Lager (Current)', 'Lager', 0.052, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Buckeye Brewing (Cleveland, OH) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Buckeye Brewing') AND LOWER(city) = LOWER('Cleveland') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cleveland Beer Week 2013', 'Helles', 0.053, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── BuckleDown Brewing (Lyons, IL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('BuckleDown Brewing') AND LOWER(city) = LOWER('Lyons') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Painted Turtle', 'Pale Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Buffalo Bayou Brewing Company (Houston, TX) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Buffalo Bayou Brewing Company') AND LOWER(city) = LOWER('Houston') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '1836', 'Blonde Ale', 0.06, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer''s Wit', 'Witbier', 0.06, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'More Cowbell', 'Double IPA', 0.09, 118, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Burn 'Em Brewing (Michigan City, IN) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Burn ''Em Brewing') AND LOWER(city) = LOWER('Michigan City') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wrath of Pele', 'Brown Ale', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Beer''d', 'American Black Ale', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mr. Tea', 'Sour', 0.078, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pale Alement', 'Pale Ale', 0.055, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopkick Dropkick', 'Double IPA', 0.099, 115, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kreamed Corn', 'Cream Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Coconoats', 'Wheat', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Joey Wheat', 'Wheat', 0.068, 16, true, true),
      (gen_random_uuid(), v_brewery_id, '3:33 Black IPA', 'IPA', 0.072, 86, true, true),
      (gen_random_uuid(), v_brewery_id, 'MCA', 'IPA', 0.068, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Burnside Brewing Co. (Portland, OR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Burnside Brewing Co.') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Couch Select Lager', 'Lager', 0.05, 14, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Butcher's Brewing (Carlsbad, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Butcher''s Brewing') AND LOWER(city) = LOWER('Carlsbad') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mucho Aloha Hawaiian Pale Ale', 'Pale Ale', 0.056, 36, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Butternuts Beer and Ale (Garrattsville, NY) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Butternuts Beer and Ale') AND LOWER(city) = LOWER('Garrattsville') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Heinnieweisse Weissebier', 'Hefeweizen', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snapperhead IPA', 'IPA', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moo Thunder Stout', 'Milk Stout', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Porkslap Pale Ale', 'Pale Ale', 0.043, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── COAST Brewing Company (Charleston, SC) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('COAST Brewing Company') AND LOWER(city) = LOWER('Charleston') AND state = 'SC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blackbeard', 'Imperial Stout', 0.093, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rye Knot', 'Brown Ale', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dead Arm', 'Pale Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '32°/50° Kölsch', 'Kölsch', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'HopArt', 'IPA', 0.077, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boy King', 'Double IPA', 0.097, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── COOP Ale Works (Oklahoma City, OK) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('COOP Ale Works') AND LOWER(city) = LOWER('Oklahoma City') AND state = 'OK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gran Sport', 'Porter', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Horny Toad Cerveza', 'Blonde Ale', 0.053, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Native Amber', 'Amber', 0.063, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'F5 IPA', 'IPA', 0.068, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Native Amber (2013)', 'Amber', 0.063, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Horny Toad Cerveza (2013)', 'Blonde Ale', 0.053, 25, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Caldera Brewing Company (Ashland, OR) — 14 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Caldera Brewing Company') AND LOWER(city) = LOWER('Ashland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hopportunity Knocks IPA', 'IPA', 0.068, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pilot Rock Porter', 'Porter', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera Pale Ale', 'Pale Ale', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lawnmower Lager', 'Lager', 0.039, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ashland Amber Ale (2009)', 'Amber', 0.054, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera IPA (2009)', 'IPA', 0.061, 94, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera IPA (2007)', 'IPA', 0.061, 94, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera Pale Ale (2010)', 'Pale Ale', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera Pale Ale (2009)', 'Pale Ale', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera Pale Ale (2005)', 'Pale Ale', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera Pale Ale (2007)', 'Pale Ale', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera Pale Ale (2011)', 'Pale Ale', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ashland Amber Ale', 'Amber', 0.054, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Caldera IPA', 'IPA', 0.061, 94, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cambridge Brewing Company (Cambridge, MA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cambridge Brewing Company') AND LOWER(city) = LOWER('Cambridge') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Remain in Light', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flower Child (2014)', 'IPA', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cans Bar and Canteen (Charlotte, NC) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cans Bar and Canteen') AND LOWER(city) = LOWER('Charlotte') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'THP White (2006)', 'Witbier', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'THP Amber (2006)', 'Amber', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'THP Light (2006)', 'Blonde Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'THP Dark (2006)', 'Brown Ale', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cape Ann Brewing Company (Gloucester, MA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cape Ann Brewing Company') AND LOWER(city) = LOWER('Gloucester') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Imperial Pumpkin Stout', 'Amber', 0.099, 43, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dead-Eye DIPA', 'Double IPA', 0.09, 130, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fisherman''s IPA', 'IPA', 0.055, 64, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fisherman''s Pils', 'Pilsner', 0.054, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fisherman''s Brew', 'Amber', 0.055, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cape Cod Beer (Hyannis, MA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cape Cod Beer') AND LOWER(city) = LOWER('Hyannis') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cape Cod Red', 'Amber', 0.055, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beach Blonde', 'Blonde Ale', 0.049, 10, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Capital Brewery (Middleton, WI) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Capital Brewery') AND LOWER(city) = LOWER('Middleton') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dark Voyage Black IPA (2013)', 'American Black Ale', 0.065, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wisconsin Amber', 'Lager', 0.052, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lake House', 'Helles', 0.046, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ghost Ship White IPA', 'IPA', 0.056, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mutiny IPA', 'IPA', 0.062, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wisconsin Amber (1998)', 'Lager', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Island Wheat', 'Wheat', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wisconsin Amber (2013)', 'Lager', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'U.S. Pale Ale', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Supper Club Lager', 'Lager', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Carolina Beer & Beverage (Mooresville, NC) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Carolina Beer & Beverage') AND LOWER(city) = LOWER('Mooresville') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Carolina Lighthouse (2007)', 'Blonde Ale', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Carolina Blonde (2006)', 'Blonde Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Carolina Blonde Light (2005)', 'Blonde Ale', 0.035, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Carolina Brewery (Pittsboro, NC) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Carolina Brewery') AND LOWER(city) = LOWER('Pittsboro') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Santa''s Secret', 'Amber', 0.059, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flagship IPA', 'IPA', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sky Blue Golden Ale', 'Kölsch', 0.051, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Carton Brewing Company (Atlantic Highlands, NJ) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Carton Brewing Company') AND LOWER(city) = LOWER('Atlantic Highlands') AND state = 'NJ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Epitome', 'American Black Ale', 0.099, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Monkey Chased the Weasel', 'Berliner Weisse', 0.039, 9, true, true),
      (gen_random_uuid(), v_brewery_id, '077XX', 'Double IPA', 0.078, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boat Beer', 'IPA', 0.042, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Catawba Brewing Company (Morganton, NC) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Catawba Brewing Company') AND LOWER(city) = LOWER('Morganton') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Farmer Ted''s Cream Ale', 'Cream Ale', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Firewater India Pale Ale', 'IPA', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Zombie Ale', 'Witbier', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'King Winterbolt Winter Ale', 'Amber', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmer Ted''s Farmhouse Cream Ale', 'Cream Ale', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Catawba Island Brewing (Port Clinton, OH) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Catawba Island Brewing') AND LOWER(city) = LOWER('Port Clinton') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Whitecap Wit', 'Witbier', 0.048, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Seiche Scottish Ale', 'Amber', 0.078, 16, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Catawba Valley Brewing Company (Morganton, NC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Catawba Valley Brewing Company') AND LOWER(city) = LOWER('Morganton') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Peanut Butter Jelly Time', 'Brown Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'King Coconut', 'Porter', 0.054, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cedar Creek Brewery (Seven Points, TX) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cedar Creek Brewery') AND LOWER(city) = LOWER('Seven Points') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gone A-Rye', 'Double IPA', 0.085, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dankosaurus', 'IPA', 0.068, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Scruffy''s Smoked Alt', 'Porter', 0.051, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elliott''s Phoned Home Pale Ale', 'Pale Ale', 0.051, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Lawn Ranger', 'Cream Ale', 0.05, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Centennial Beer Company (Edwards, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Centennial Beer Company') AND LOWER(city) = LOWER('Edwards') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'All American Blonde Ale', 'Blonde Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'All American Red Ale', 'Amber', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Center of the Universe Brewing C... (Ashland, VA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Center of the Universe Brewing C...') AND LOWER(city) = LOWER('Ashland') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Main St. Virginia Ale', 'Amber', 0.05, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chin Music Amber Lager', 'Lager', 0.045, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ray Ray’s Pale Ale', 'Pale Ale', 0.052, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Central Coast Brewing Company (San Luis Obispo, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Central Coast Brewing Company') AND LOWER(city) = LOWER('San Luis Obispo') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Chai Ale', 'Saison', 0.051, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lucky Day IPA', 'IPA', 0.072, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Terrace Hill Double IPA', 'Double IPA', 0.095, 99, true, true),
      (gen_random_uuid(), v_brewery_id, 'Catch 23', 'American Black Ale', 0.075, 77, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Champion Brewing Company (Charlottesville, VA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Champion Brewing Company') AND LOWER(city) = LOWER('Charlottesville') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Stickin'' In My Rye', 'Wheat', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Me Stout', 'Stout', 0.06, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Killer Kolsch', 'Kölsch', 0.05, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Missile IPA', 'IPA', 0.07, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Chapman's Brewing (Angola, IN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Chapman''s Brewing') AND LOWER(city) = LOWER('Angola') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Enlighten', 'Kölsch', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ale Cider', 'Sour', 0.065, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pail Ale', 'Pale Ale', 0.055, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Englishman', 'Brown Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Chatham Brewing (Chatham, NY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Chatham Brewing') AND LOWER(city) = LOWER('Chatham') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '8 Barrel', 'Red Ale', 0.08, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest', 'Oktoberfest', 0.055, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cheboygan Brewing Company (Cheboygan, MI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cheboygan Brewing Company') AND LOWER(city) = LOWER('Cheboygan') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'IPA #11', 'IPA', 0.057, 58, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blood Orange Honey', 'Sour', 0.057, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lighthouse Amber', 'Amber', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Christian Moerlein Brewing Company (Cincinnati, OH) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Christian Moerlein Brewing Company') AND LOWER(city) = LOWER('Cincinnati') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bay of Bengal Double IPA (2014)', 'Double IPA', 0.089, 126, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Churchkey Can Company (Seattle, WA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Churchkey Can Company') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Churchkey Pilsner Style Beer', 'Pilsner', 0.049, 29, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cigar City Brewing Company (Tampa, FL) — 24 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cigar City Brewing Company') AND LOWER(city) = LOWER('Tampa') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cubano Espresso', 'Lager', 0.055, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Operation Homefront', 'IPA', 0.062, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wandering Pelican', 'American Black Ale', 0.082, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sugar Plum', 'Brown Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest', 'Oktoberfest', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Puppy''s Breath Porter', 'Porter', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Happening Now', 'IPA', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopped on the High Seas (Hop #529)', 'IPA', 0.07, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopped on the High Seas (Calypso)', 'IPA', 0.07, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wiregrass Post-Prohibition Ale', 'Pale Ale', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dry-Hopped On The High Seas Caribbean-Style IPA', 'IPA', 0.07, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopped on the High Seas (Citra)', 'IPA', 0.07, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopped on the High Seas (Ahtanum)', 'IPA', 0.07, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gwar Beer', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tropical Heatwave', 'Wheat', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Humidor Series India Pale Ale', 'IPA', 0.075, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jai Alai IPA Aged on White Oak', 'IPA', 0.075, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'José Martí American Porter', 'Porter', 0.08, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Invasion Pale Ale', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Maduro Brown Ale', 'Brown Ale', 0.055, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hotter Than Helles Lager', 'Helles', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tocobaga Red Ale', 'Amber', 0.072, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jai Alai IPA', 'IPA', 0.075, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Florida Cracker Belgian Wit', 'Witbier', 0.05, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cisco Brewers (Nantucket, MA) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cisco Brewers') AND LOWER(city) = LOWER('Nantucket') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Shark Tracker Light lager', 'Lager', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumple Drumkin', 'Amber', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grey Lady', 'Witbier', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer of Lager', 'Helles', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Indie Pale Ale', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sankaty Light Lager', 'Lager', 0.038, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Whale''s Tale Pale Ale', 'Pale Ale', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Claremont Craft Ales (Claremont, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Claremont Craft Ales') AND LOWER(city) = LOWER('Claremont') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jacaranada Rye IPA', 'IPA', 0.067, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Coalition Brewing Company (Portland, OR) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Coalition Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cascadian Dark Ale', 'American Black Ale', 0.06, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wheat the People', 'Wheat', 0.044, 13, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Coastal Empire Beer Company (Savannah, GA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Coastal Empire Beer Company') AND LOWER(city) = LOWER('Savannah') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tybee Island Blonde', 'Blonde Ale', 0.047, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Savannah Brown Ale', 'Brown Ale', 0.062, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Coastal Extreme Brewing Company (Newport, RI) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Coastal Extreme Brewing Company') AND LOWER(city) = LOWER('Newport') AND state = 'RI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rhode Island Blueberry', 'Kölsch', 0.046, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Newport Storm IPA', 'IPA', 0.065, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hurricane Amber Ale (2004)', 'Amber', 0.052, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hurricane Amber Ale', 'Amber', 0.052, 24, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── College Street Brewhouse and Pub (Lake Havasu City, AZ) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('College Street Brewhouse and Pub') AND LOWER(city) = LOWER('Lake Havasu City') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big Blue Van', 'Sour', 0.058, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Confluence Brewing Company (Des Moines, IA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Confluence Brewing Company') AND LOWER(city) = LOWER('Des Moines') AND state = 'IA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Des Moines IPA', 'IPA', 0.068, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Capital Gold Golden Lager', 'Pilsner', 0.048, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmer John''s Multi-Grain Ale', 'Blonde Ale', 0.056, 21, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Core Brewing & Distilling Company (Springdale, AR) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Core Brewing & Distilling Company') AND LOWER(city) = LOWER('Springdale') AND state = 'AR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Behemoth', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Arkansas Red', 'Amber', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Core Oatmeal Stout', 'Oatmeal Stout', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Core ESB', 'Amber', 0.061, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cottrell Brewing (Pawcatuck, CT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cottrell Brewing') AND LOWER(city) = LOWER('Pawcatuck') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Chester''s Beer (2005)', 'Lager', 0.038, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Covington Brewhouse (Covington, LA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Covington Brewhouse') AND LOWER(city) = LOWER('Covington') AND state = 'LA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Heiner Brau Kölsch', 'Kölsch', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Crabtree Brewing Company (Greeley, CO) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Crabtree Brewing Company') AND LOWER(city) = LOWER('Greeley') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Trigger Blonde Ale', 'Blonde Ale', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Crabtree Oatmeal Stout', 'Oatmeal Stout', 0.075, 29, true, true),
      (gen_random_uuid(), v_brewery_id, 'Eclipse Black IPA', 'American Black Ale', 0.077, 71, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Crazy Mountain Brewing Company (Edwards, CO) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Crazy Mountain Brewing Company') AND LOWER(city) = LOWER('Edwards') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Neomexicanus Native', 'Pale Ale', 0.06, 46, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Soul', 'Belgian', 0.075, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snowcat Coffee Stout', 'Stout', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'WinterWonderGrass Festival Ale', 'Amber', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boohai Red Ale', 'Amber', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lava Lake Wit', 'Witbier', 0.052, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mountain Livin'' Pale Ale', 'Pale Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Crazy Mountain Amber Ale', 'Amber', 0.052, 25, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Creature Comforts (Athens, GA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Creature Comforts') AND LOWER(city) = LOWER('Athens') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tropicalia', 'IPA', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Athena', 'Berliner Weisse', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Crooked Fence Brewing Company (Garden City, ID) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Crooked Fence Brewing Company') AND LOWER(city) = LOWER('Garden City') AND state = 'ID'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Aviator Raspberry Blonde', 'Blonde Ale', 0.049, 25, true, true),
      (gen_random_uuid(), v_brewery_id, '3 Picket Porter', 'Porter', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rusty Nail Pale Ale', 'Pale Ale', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Crow Peak Brewing Company (Spearfish, SD) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Crow Peak Brewing Company') AND LOWER(city) = LOWER('Spearfish') AND state = 'SD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Red Water Irish Style Red', 'Amber', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mjöllnir', 'Saison', 0.066, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bear Butte Nut Brown Ale', 'Brown Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Easy Livin'' Summer Ale', 'Blonde Ale', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Canyon Cream Ale', 'Cream Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pile O''Dirt Porter', 'Porter', 0.069, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '11th Hour IPA', 'IPA', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Crystal Springs Brewing Company (Boulder, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Crystal Springs Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'South Ridge Amber Ale', 'Amber', 0.06, 31, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summertime Ale', 'Kölsch', 0.052, 23, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Cutters Brewing Company (Avon, IN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Cutters Brewing Company') AND LOWER(city) = LOWER('Avon') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lost River Blonde Ale', 'Blonde Ale', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Monon Wheat', 'Witbier', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Floyd''s Folly', 'Amber', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Half Court IPA', 'IPA', 0.063, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── D.L. Geary Brewing Company (Portland, ME) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('D.L. Geary Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Geary''s Pale Ale', 'Pale Ale', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Geary''s Summer Ale', 'Kölsch', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── DC Brau Brewing Company (Washington, DC) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('DC Brau Brewing Company') AND LOWER(city) = LOWER('Washington') AND state = 'DC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Stone of Arbroath', 'Red Ale', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Tradition', 'Blonde Ale', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'El Hefe Speaks', 'Hefeweizen', 0.053, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Penn Quarter Porter', 'Porter', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'On the Wings of Armageddon', 'Double IPA', 0.092, 115, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Corruption', 'IPA', 0.065, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Citizen', 'Belgian', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Public', 'Pale Ale', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dad & Dude's Breweria (Aurora, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dad & Dude''s Breweria') AND LOWER(city) = LOWER('Aurora') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dank IPA', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dank IPA (2012)', 'IPA', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Daredevil Brewing Company (Shelbyville, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Daredevil Brewing Company') AND LOWER(city) = LOWER('Shelbyville') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lift Off IPA', 'IPA', 0.072, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dave's Brewfarm (Wilson, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dave''s Brewfarm') AND LOWER(city) = LOWER('Wilson') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'BrewFarm Select Golden Lager', 'Lager', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── David's Ale Works (Diamond Springs, CA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('David''s Ale Works') AND LOWER(city) = LOWER('Diamond Springs') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sprocket Blonde Ale (2006)', 'Blonde Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sprocket Pale Ale (2006)', 'Pale Ale', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dead Armadillo Craft Brewing (Tulsa, OK) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dead Armadillo Craft Brewing') AND LOWER(city) = LOWER('Tulsa') AND state = 'OK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dead Armadillo Amber Ale', 'Amber', 0.063, 37, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Deep Ellum Brewing Company (Dallas, TX) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Deep Ellum Brewing Company') AND LOWER(city) = LOWER('Dallas') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Neato Bandito', 'Lager', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oak Cliff Coffee Ale', 'Brown Ale', 0.075, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dream Crusher Double IPA', 'Double IPA', 0.085, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Deep Ellum Pale Ale', 'Pale Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Brown Stout', 'Baltic Porter', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmhouse Wit', 'Saison', 0.048, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rye Pils Session Lager', 'Pilsner', 0.046, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dallas Blonde', 'Blonde Ale', 0.052, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Deep Ellum IPA', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Defiance Brewing Company (Hays, KS) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Defiance Brewing Company') AND LOWER(city) = LOWER('Hays') AND state = 'KS'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Thrasher Session India Pale Ale', 'IPA', 0.045, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gutch English Style Mild Ale', 'Amber', 0.05, 16, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Denali Brewing Company (Talkeetna, AK) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Denali Brewing Company') AND LOWER(city) = LOWER('Talkeetna') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Chuli Stout', 'Dry Stout', 0.059, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mother Ale', 'Blonde Ale', 0.056, 46, true, true),
      (gen_random_uuid(), v_brewery_id, 'Twister Creek India Pale Ale', 'IPA', 0.065, 71, true, true),
      (gen_random_uuid(), v_brewery_id, 'Single Engine Red', 'Red Ale', 0.058, 46, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Denver Beer Company (Denver, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Denver Beer Company') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Incredible Pedal IPA', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Graham Cracker Porter', 'Porter', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Deschutes Brewery (Bend, OR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Deschutes Brewery') AND LOWER(city) = LOWER('Bend') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mirror Pond Pale Ale', 'Pale Ale', 0.05, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Destihl Brewery (Bloomington, IL) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Destihl Brewery') AND LOWER(city) = LOWER('Bloomington') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Weissenheimer', 'Hefeweizen', 0.052, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abbey''s Single (2015- )', 'Abbey Single Ale', 0.049, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vertex IPA', 'IPA', 0.063, 76, true, true),
      (gen_random_uuid(), v_brewery_id, 'Here Gose Nothin''', 'Gose', 0.05, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Strawberry Blonde', 'Sour', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hoperation Overload', 'Double IPA', 0.096, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abbey''s Single Ale (Current)', 'Abbey Single Ale', 0.049, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Devil's Backbone Brewing Company (Lexington, VA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Devil''s Backbone Brewing Company') AND LOWER(city) = LOWER('Lexington') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bravo Four Point', 'Pale Ale', 0.044, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Striped Bass Pale Ale', 'Pale Ale', 0.052, 26, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Devil's Canyon Brewery (Belmont, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Devil''s Canyon Brewery') AND LOWER(city) = LOWER('Belmont') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Deadicated Amber', 'Amber', 0.054, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kaleidoscope Collaboration 2012', 'American Black Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'California Sunshine Rye IPA', 'IPA', 0.071, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Full Boar Scotch Ale', 'Red Ale', 0.074, 12, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dick's Brewing Company (Centralia, WA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dick''s Brewing Company') AND LOWER(city) = LOWER('Centralia') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '12 Man Pale Ale', 'Pale Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dirty Bucket Brewing Company (Woodinville, WA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dirty Bucket Brewing Company') AND LOWER(city) = LOWER('Woodinville') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Filthy Hoppin'' IPA', 'IPA', 0.065, 72, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dock Street Brewery (Philadelphia, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dock Street Brewery') AND LOWER(city) = LOWER('Philadelphia') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dock Street Amber Beer (1992)', 'Amber', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dolores River Brewery (Dolores, CO) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dolores River Brewery') AND LOWER(city) = LOWER('Dolores') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dolores River Hefeweizen', 'Hefeweizen', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dolores River ESB', 'Amber', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snaggletooth Double Pale Ale', 'Double IPA', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dolores River Pale Ale', 'Pale Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dolores River Dry Stout', 'Dry Stout', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dolores River Mild', 'Brown Ale', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dry Dock Brewing Company (Aurora, CO) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dry Dock Brewing Company') AND LOWER(city) = LOWER('Aurora') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hop Abomination', 'IPA', 0.066, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Apricot Blonde', 'Sour', 0.051, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dry Dock Hefeweizen', 'Hefeweizen', 0.043, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dry Dock Amber Ale', 'Amber', 0.058, 49, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Due South Brewing Company (Boynton Beach, FL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Due South Brewing Company') AND LOWER(city) = LOWER('Boynton Beach') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Category 3 IPA', 'IPA', 0.061, 64, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Dundee Brewing Company (Rochester, NY) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Dundee Brewing Company') AND LOWER(city) = LOWER('Rochester') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dundee Summer Wheat Beer', 'Wheat', 0.045, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Eddyline Brewery & Restaurant (Buena Vista, CO) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Eddyline Brewery & Restaurant') AND LOWER(city) = LOWER('Buena Vista') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pumpkin Patch Ale', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Crank Yanker IPA', 'IPA', 0.078, 74, true, true),
      (gen_random_uuid(), v_brewery_id, 'River Runners Pale Ale', 'Pale Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpkin Patch Ale (2012)', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mountain Fairy Raspberry Wheat', 'Sour', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boater Beer', 'Pilsner', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Crank Yanker IPA (2011)', 'IPA', 0.078, 74, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Elevator Brewing Company (Columbus, OH) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Elevator Brewing Company') AND LOWER(city) = LOWER('Columbus') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bleeding Buckeye Red Ale', 'Amber', 0.057, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Emerald City Beer Company (Seattle, WA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Emerald City Beer Company') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dottie Seattle Lager', 'Lager', 0.049, 25, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Engine 15 Brewing (Jacksonville Beach, FL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Engine 15 Brewing') AND LOWER(city) = LOWER('Jacksonville Beach') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Nut Sack Imperial Brown Ale', 'Brown Ale', 0.07, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Engine House 9 (Tacoma, WA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Engine House 9') AND LOWER(city) = LOWER('Tacoma') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Underachiever', 'Lager', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Epic Brewing (Denver, CO) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Epic Brewing') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lil'' Brainless Raspberries', 'Sour', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Element 29', 'Pale Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Syndrome', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Escape to Colorado', 'IPA', 0.062, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Everybody's Brewing (White Salmon, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Everybody''s Brewing') AND LOWER(city) = LOWER('White Salmon') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Little Sister India Style Session Ale', 'IPA', 0.043, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Country Boy IPA', 'IPA', 0.062, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Evil Czech Brewery (Mishawaka, IN) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Evil Czech Brewery') AND LOWER(city) = LOWER('Mishawaka') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blonde Czich', 'Blonde Ale', 0.049, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Reaper', 'IPA', 0.07, 61, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bobblehead', 'Wheat', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lucky Dog', 'Pale Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Voodoo', 'Porter', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'General George Patton Pilsner', 'Pilsner', 0.054, 48, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Evil Twin Brewing (Brooklyn, NY) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Evil Twin Brewing') AND LOWER(city) = LOWER('Brooklyn') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Nomader Weiss', 'Berliner Weisse', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Molotov Lite', 'Double IPA', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hipster Ale (Two Roads Brewing)', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bikini Beer', 'IPA', 0.027, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hipster Ale (Westbrook Brewing)', 'Pale Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fargo Brewing Company (Fargo, ND) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fargo Brewing Company') AND LOWER(city) = LOWER('Fargo') AND state = 'ND'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Iron Horse Pale Ale', 'Pale Ale', 0.05, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stone''s Throw IPA', 'Amber', 0.045, 19, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wood Chipper India Pale Ale', 'IPA', 0.067, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fat Head's Brewery (Middleburg Heights, OH) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fat Head''s Brewery') AND LOWER(city) = LOWER('Middleburg Heights') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Trail Head', 'Pale Ale', 0.063, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Stalker Fresh Hop IPA', 'IPA', 0.07, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fate Brewing Company (Boulder, CO) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fate Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sudice American Stout', 'Stout', 0.07, 58, true, true),
      (gen_random_uuid(), v_brewery_id, 'Parcae Belgian Style Pale Ale', 'Belgian', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Norns Roggenbier', 'Roggenbier', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Laimas Kölsch Style Ale', 'Kölsch', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Moirai India Pale Ale', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fearless Brewing Company (Estacada, OR) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fearless Brewing Company') AND LOWER(city) = LOWER('Estacada') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Loki Red Ale', 'Amber', 0.075, 53, true, true),
      (gen_random_uuid(), v_brewery_id, 'Peaches & Cream', 'Sour', 0.046, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Quaff India Style Session Ale', 'IPA', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Loki Red Ale (2013)', 'Amber', 0.075, 53, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mjolnir Imperial IPA', 'Double IPA', 0.069, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fearless Scottish Ale', 'Amber', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fiddlehead Brewing Company (Shelburne, VT) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fiddlehead Brewing Company') AND LOWER(city) = LOWER('Shelburne') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mastermind', 'Double IPA', 0.081, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hyzer Flip', 'Double IPA', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Second Fiddle', 'Double IPA', 0.082, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hodad Porter', 'Porter', 0.055, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Figueroa Mountain Brewing Company (Buellton, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Figueroa Mountain Brewing Company') AND LOWER(city) = LOWER('Buellton') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Weiss Weiss Baby', 'Hefeweizen', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Czech Yo Self', 'Pilsner', 0.055, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'FMB 101', 'Kölsch', 0.048, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Finch's Beer Company (Chicago, IL) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Finch''s Beer Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hardcore Chimera', 'Double IPA', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sobek & Set', 'American Black Ale', 0.08, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nuclear Winter', 'Belgian Dubbel', 0.086, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wet Hot American Wheat Ale', 'Wheat', 0.05, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Secret Stache Stout', 'Stout', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fascist Pig Ale', 'Amber', 0.08, 72, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cut Throat Pale Ale', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Threadless IPA', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cut Throat Pale Ale (2011)', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden Wing Blonde Ale', 'Blonde Ale', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Firestone Walker Brewing Company (Paso Robles, CA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Firestone Walker Brewing Company') AND LOWER(city) = LOWER('Paso Robles') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Easy Jack', 'IPA', 0.045, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'Union Jack', 'IPA', 0.075, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pivo Pils', 'Pilsner', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '805 Blonde Ale', 'Blonde Ale', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '805', 'Blonde Ale', 0.047, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Flat 12 Bierwerks (Indianapolis, IN) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Flat 12 Bierwerks') AND LOWER(city) = LOWER('Indianapolis') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Deflator', 'Lager', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hinchtown Hammer Down', 'Blonde Ale', 0.05, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Half Cycle IPA', 'IPA', 0.06, 104, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Flat Rock Brewing Company (Smithton, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Flat Rock Brewing Company') AND LOWER(city) = LOWER('Smithton') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Inclined Plane Ale', 'IPA', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Flesk Brewing Company (Lombard, IL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Flesk Brewing Company') AND LOWER(city) = LOWER('Lombard') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Moped Traveler', 'Pale Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Flying Dog Brewery (Frederick, MD) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Flying Dog Brewery') AND LOWER(city) = LOWER('Frederick') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Snake Dog IPA', 'IPA', 0.071, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Underdog Atlantic Lager', 'Lager', 0.047, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Flying Mouse Brewery (Troutville, VA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Flying Mouse Brewery') AND LOWER(city) = LOWER('Troutville') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Flying Mouse 8', 'Porter', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flying Mouse 4', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Foolproof Brewing Company (Pawtucket, RI) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Foolproof Brewing Company') AND LOWER(city) = LOWER('Pawtucket') AND state = 'RI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'La Ferme Urbaine Farmhouse Ale', 'Saison', 0.078, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Backyahd IPA', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Raincloud Robust Porter', 'Porter', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barstool American Golden Ale', 'Blonde Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Forgotten Boardwalk (Cherry Hill, NJ) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Forgotten Boardwalk') AND LOWER(city) = LOWER('Cherry Hill') AND state = 'NJ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'What the Butler Saw', 'Witbier', 0.05, 18, true, true),
      (gen_random_uuid(), v_brewery_id, '1916 Shore Shiver', 'IPA', 0.069, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fort George Brewery (Astoria, OR) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fort George Brewery') AND LOWER(city) = LOWER('Astoria') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Quick WIT', 'Belgian', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Optimist', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Suicide Squeeze IPA', 'IPA', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Java the Hop', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Next Adventure Black IPA', 'American Black Ale', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '3-Way IPA (2013)', 'IPA', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tender Loving Empire NWPA', 'Pale Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Quick Wit Belgianesque Ale', 'Witbier', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunrise Oatmeal Pale Ale', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cavatica Stout', 'Imperial Stout', 0.088, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '1811 Lager', 'Lager', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vortex IPA', 'IPA', 0.074, 97, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fort Pitt Brewing Company (Latrobe, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fort Pitt Brewing Company') AND LOWER(city) = LOWER('Latrobe') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Fort Pitt Ale', 'Amber', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fort Point Beer Company (San Francisco, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fort Point Beer Company') AND LOWER(city) = LOWER('San Francisco') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Park', 'Wheat', 0.047, 19, true, true),
      (gen_random_uuid(), v_brewery_id, 'Westfalia', 'Amber', 0.056, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'KSA', 'Kölsch', 0.046, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Villager', 'IPA', 0.063, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Founders Brewing Company (Grand Rapids, MI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Founders Brewing Company') AND LOWER(city) = LOWER('Grand Rapids') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dirty Bastard', 'Red Ale', 0.085, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Centennial IPA', 'IPA', 0.072, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'All Day IPA', 'IPA', 0.047, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Four Corners Brewing Company (Dallas, TX) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Four Corners Brewing Company') AND LOWER(city) = LOWER('Dallas') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'El Chingon IPA', 'IPA', 0.076, 73, true, true),
      (gen_random_uuid(), v_brewery_id, 'Block Party Robust Porter', 'Porter', 0.057, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Local Buzz', 'Blonde Ale', 0.052, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Four Fathers Brewing (Valparaiso, IN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Four Fathers Brewing') AND LOWER(city) = LOWER('Valparaiso') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Feel Like Maplin'' Love', 'Oatmeal Stout', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Father''s Beer', 'Belgian', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The 26th', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Gadget', 'IPA', 0.064, 90, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Four Horsemen Brewing Company (South Bend, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Four Horsemen Brewing Company') AND LOWER(city) = LOWER('South Bend') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Leprechaun Lager', 'Lager', 0.04, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Four Peaks Brewing Company (Tempe, AZ) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Four Peaks Brewing Company') AND LOWER(city) = LOWER('Tempe') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sunbru Kölsch', 'Kölsch', 0.052, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpkin Porter', 'Porter', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Four Peaks Peach Ale', 'Sour', 0.042, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Knot IPA', 'IPA', 0.067, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kilt Lifter Scottish-Style Ale (2009)', 'Amber', 0.06, 21, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Four String Brewing Company (Columbus, OH) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Four String Brewing Company') AND LOWER(city) = LOWER('Columbus') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Four String Vanilla Porter', 'Porter', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Suncaster Summer Wheat', 'Wheat', 0.05, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brass Knuckle Pale Ale', 'Pale Ale', 0.057, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Star White IPA', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Frankenmuth Brewery (Frankenmuth, MI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Frankenmuth Brewery') AND LOWER(city) = LOWER('Frankenmuth') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Old Detroit', 'Amber', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Batch 69 IPA', 'IPA', 0.069, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Twisted Helles Summer Lager', 'Helles', 0.055, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Freetail Brewing Company (San Antonio, TX) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Freetail Brewing Company') AND LOWER(city) = LOWER('San Antonio') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Texicali', 'Brown Ale', 0.065, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pinata Protest', 'Witbier', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bat Outta Helles', 'Helles', 0.042, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Original', 'Amber', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rye Wit', 'Witbier', 0.042, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Soul Doubt', 'IPA', 0.059, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yo Soy Un Berliner', 'Berliner Weisse', 0.044, 5, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fremont Brewing Company (Seattle, WA) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fremont Brewing Company') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '77 Fremont Select Spring Session IPA', 'IPA', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fremont Organic Pale Ale', 'Pale Ale', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abominable Ale', 'Red Ale', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harvest Ale', 'Saison', 0.065, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fremont Summer Ale', 'Pale Ale', 0.065, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Universale Pale Ale', 'Pale Ale', 0.056, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Interurban IPA', 'IPA', 0.065, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── French Broad Brewery (Asheville, NC) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('French Broad Brewery') AND LOWER(city) = LOWER('Asheville') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gateway Kolsch Style Ale', 'Kölsch', 0.053, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wee-Heavy-Er Scotch Ale', 'Red Ale', 0.07, 24, true, true),
      (gen_random_uuid(), v_brewery_id, '13 Rebels ESB', 'Amber', 0.052, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Frog Level Brewing Company (Waynesville, NC) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Frog Level Brewing Company') AND LOWER(city) = LOWER('Waynesville') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Salamander Slam', 'IPA', 0.07, 73, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Fullsteam Brewery (Durham, NC) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Fullsteam Brewery') AND LOWER(city) = LOWER('Durham') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cack-A-Lacky', 'Pale Ale', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Geneva Lake Brewing Company (Lake Geneva, WI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Geneva Lake Brewing Company') AND LOWER(city) = LOWER('Lake Geneva') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'No Wake IPA', 'IPA', 0.072, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boathouse Blonde', 'Blonde Ale', 0.049, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cedar Point', 'Amber', 0.05, 26, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Glabrous Brewing Company (Pineland, ME) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Glabrous Brewing Company') AND LOWER(city) = LOWER('Pineland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Clean Shave IPA', 'IPA', 0.067, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Golden Road Brewing (Los Angeles, CA) — 14 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Golden Road Brewing') AND LOWER(city) = LOWER('Los Angeles') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Might As Well IPL', 'Lager', 0.072, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saison Pamplemousse', 'Saison', 0.058, 35, true, true),
      (gen_random_uuid(), v_brewery_id, '2020 IPA', 'IPA', 0.074, 74, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wolf Among Weeds IPA', 'IPA', 0.08, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Better Weather IPA', 'IPA', 0.094, 92, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point the Way IPA', 'IPA', 0.059, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden Road Hefeweizen', 'Hefeweizen', 0.046, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Heal the Bay IPA', 'IPA', 0.068, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cabrillo Kölsch', 'Kölsch', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Get Up Offa That Brown', 'Brown Ale', 0.055, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Burning Bush Smoked IPA', 'IPA', 0.08, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wolf Among Weeds IPA (2012)', 'IPA', 0.08, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point the Way IPA (2012)', 'IPA', 0.059, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden Road Hefeweizen (2012)', 'Hefeweizen', 0.046, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Gonzo's BiggDogg Brewing (Kalamazoo, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Gonzo''s BiggDogg Brewing') AND LOWER(city) = LOWER('Kalamazoo') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Vanilla Porter', 'Porter', 0.07, 11, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Good Life Brewing Company (Bend, OR) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Good Life Brewing Company') AND LOWER(city) = LOWER('Bend') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Descender IPA', 'IPA', 0.07, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sweet As Pacific Ale', 'Wheat', 0.06, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Good People Brewing Company (Birmingham, AL) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Good People Brewing Company') AND LOWER(city) = LOWER('Birmingham') AND state = 'AL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Good People Pale Ale', 'Pale Ale', 0.056, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snake Handler Double IPA', 'Double IPA', 0.093, 103, true, true),
      (gen_random_uuid(), v_brewery_id, 'Coffee Oatmeal Stout', 'Oatmeal Stout', 0.06, 54, true, true),
      (gen_random_uuid(), v_brewery_id, 'Good People IPA', 'IPA', 0.06, 64, true, true),
      (gen_random_uuid(), v_brewery_id, 'Good People American Brown Ale', 'Brown Ale', 0.058, 36, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Goodlife Brewing Co. (Bend, OR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Goodlife Brewing Co.') AND LOWER(city) = LOWER('Bend') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mountain Rescue Pale Ale', 'Pale Ale', 0.055, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Goose Island Brewery Company (Chicago, IL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Goose Island Brewery Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Goose Island India Pale Ale', 'IPA', 0.059, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Goose Island Brewing Company (Chicago, IL) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Goose Island Brewing Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '312 Urban Pale Ale', 'Pale Ale', 0.054, 30, true, true),
      (gen_random_uuid(), v_brewery_id, '312 Urban Wheat Ale', 'Wheat', 0.042, 18, true, true),
      (gen_random_uuid(), v_brewery_id, '312 Urban Wheat Ale (2012)', 'Wheat', 0.042, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Gore Range Brewery (Edwards, CO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Gore Range Brewery') AND LOWER(city) = LOWER('Edwards') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Beaver Logger', 'Lager', 0.052, 19, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Grand Canyon Brewing Company (Williams, AZ) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Grand Canyon Brewing Company') AND LOWER(city) = LOWER('Williams') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'White Water Wheat', 'Wheat', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grand Canyon American Pilsner', 'Pilsner', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grand Canyon Sunset Amber Ale', 'Amber', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Iron India Pale Ale', 'IPA', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Grapevine Craft Brewery (Farmers Branch, TX) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Grapevine Craft Brewery') AND LOWER(city) = LOWER('Farmers Branch') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Monarch Classic American Wheat', 'Wheat', 0.043, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sir William''s English Brown Ale', 'Brown Ale', 0.049, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lakefire Rye Pale Ale', 'Pale Ale', 0.055, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Great Crescent Brewery (Aurora, IN) — 20 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Great Crescent Brewery') AND LOWER(city) = LOWER('Aurora') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Beer Agent Re-Ignition', 'Blonde Ale', 0.053, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cherry Ale', 'Sour', 0.057, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon Barrel Aged Coconut Porter', 'Porter', 0.056, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent IPA', 'IPA', 0.062, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aurora Lager', 'Lager', 0.057, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Blonde Ale', 'Blonde Ale', 0.053, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Coconut Porter', 'Porter', 0.056, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Oktoberfest Lager', 'Oktoberfest', 0.057, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Brown Ale', 'Brown Ale', 0.045, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cherry Ale (1)', 'Sour', 0.057, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aurora Lager (2011)', 'Lager', 0.057, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Frosted Fields Winter Wheat', 'Lager', 0.06, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Belgian Style Wit', 'Witbier', 0.051, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon''s Barrel Stout', 'Stout', 0.075, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Stout', 'Stout', 0.08, 66, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Coconut Porter (2012)', 'Porter', 0.056, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Dark Lager', 'Lager', 0.057, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Mild Ale', 'Brown Ale', 0.042, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent IPA (2011)', 'IPA', 0.062, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great Crescent Blonde Ale (2011)', 'Blonde Ale', 0.053, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Great Divide Brewing Company (Denver, CO) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Great Divide Brewing Company') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Denver Pale Ale (Artist Series No. 1)', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hibernation Ale', 'Brown Ale', 0.087, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Whitewater', 'Wheat', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rumble', 'IPA', 0.071, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Orabelle', 'Belgian Tripel', 0.083, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lasso', 'IPA', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yeti  Imperial Stout', 'Imperial Stout', 0.095, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Colette', 'Saison', 0.073, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Titan IPA', 'IPA', 0.071, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Great Northern Brewing Company (Whitefish, MT) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Great Northern Brewing Company') AND LOWER(city) = LOWER('Whitefish') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Black Star Double Hopped Golden Lager (24 oz.)', 'Lager', 0.045, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Star Double Hopped Golden Lager (12 oz.)', 'Lager', 0.045, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Great Raft Brewing Company (Shreveport, LA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Great Raft Brewing Company') AND LOWER(city) = LOWER('Shreveport') AND state = 'LA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Commotion APA', 'Pale Ale', 0.052, 49, true, true),
      (gen_random_uuid(), v_brewery_id, 'Southern Drawl Pale Lager', 'Lager', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Great River Brewery (Davenport, IA) — 18 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Great River Brewery') AND LOWER(city) = LOWER('Davenport') AND state = 'IA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Chickawawa Lemonale', 'Sour', 0.05, 5, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barrel Aged Farmer', 'Brown Ale', 0.07, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Great River Golden Ale', 'Blonde Ale', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dirty Blonde Chocolate Ale', 'Blonde Ale', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dos Pistolas', 'Lager', 0.048, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Owney Irish Style Red Ale', 'Red Ale', 0.05, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aaah Bock Lager', 'Lager', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Widespread Wit', 'Witbier', 0.055, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Roller Dam Red Ale', 'Red Ale', 0.054, 30, true, true),
      (gen_random_uuid(), v_brewery_id, '483 Pale Ale', 'Pale Ale', 0.053, 48, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop A Potamus Double Dark Rye Pale Ale', 'Wheat', 0.09, 99, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmer Brown Ale', 'Brown Ale', 0.07, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Cock IPA', 'IPA', 0.07, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest', 'Oktoberfest', 0.059, 25, true, true),
      (gen_random_uuid(), v_brewery_id, '40th Annual Bix Street Fest Copper Ale (Current)', 'Amber', 0.048, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Redband Stout', 'Stout', 0.06, 36, true, true),
      (gen_random_uuid(), v_brewery_id, '483 Pale Ale (2010)', 'Pale Ale', 0.053, 48, true, true),
      (gen_random_uuid(), v_brewery_id, 'Roller Dam Red Ale (2010)', 'Red Ale', 0.054, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Green Room Brewing (Jacksonville, FL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Green Room Brewing') AND LOWER(city) = LOWER('Jacksonville') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pablo Beach Pale Ale', 'Pale Ale', 0.05, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Greenbrier Valley Brewing Company (Lewisburg, WV) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Greenbrier Valley Brewing Company') AND LOWER(city) = LOWER('Lewisburg') AND state = 'WV'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wild Trail Pale Ale', 'Pale Ale', 0.057, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mothman Black IPA', 'American Black Ale', 0.067, 71, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Grey Sail Brewing Company (Westerly, RI) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Grey Sail Brewing Company') AND LOWER(city) = LOWER('Westerly') AND state = 'RI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Autumn Winds Fest Beer', 'Oktoberfest', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Captain''s Daughter', 'Double IPA', 0.085, 69, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Grey Sail Brewing of Rhode Island (Westerly, RI) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Grey Sail Brewing of Rhode Island') AND LOWER(city) = LOWER('Westerly') AND state = 'RI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Autumn Winds', 'Oktoberfest', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flying Jenny Extra Pale Ale', 'Pale Ale', 0.06, 54, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hazy Day Belgian-Style Wit', 'Witbier', 0.04, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bring Back the Beach Blonde Ale', 'Blonde Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Leaning Chimney Smoked Porter', 'Porter', 0.06, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flying Jenny Extra Pale Ale (2012)', 'Pale Ale', 0.06, 54, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flagship Ale', 'Cream Ale', 0.049, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Griffin Claw Brewing Company (Birmingham, MI) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Griffin Claw Brewing Company') AND LOWER(city) = LOWER('Birmingham') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mr. Blue Sky', 'Wheat', 0.045, 6, true, true),
      (gen_random_uuid(), v_brewery_id, '3 Scrooges', 'Amber', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Screamin’ Pumpkin', 'Amber', 0.05, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grand Trunk Bohemian Pils', 'Pilsner', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'El Rojo', 'Amber', 0.065, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Norm''s Raggedy Ass IPA', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grind Line', 'Pale Ale', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Norm''s Gateway IPA', 'IPA', 0.04, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lemon Shandy Tripel', 'Belgian Tripel', 0.09, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Grimm Brothers Brewhouse (Loveland, CO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Grimm Brothers Brewhouse') AND LOWER(city) = LOWER('Loveland') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Little Red Cap', 'Amber', 0.063, 43, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hale's Ales (Seattle, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hale''s Ales') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Supergoose IPA', 'IPA', 0.069, 67, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hale''s Pale American Ale', 'Pale Ale', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Half Acre Beer Company (Chicago, IL) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Half Acre Beer Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Heyoka IPA', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Guest Lager', 'Pilsner', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pony Pilsner', 'Pilsner', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Akari Shogun American Wheat Ale', 'Wheat', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Meat Wave', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Over Ale', 'Brown Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gossamer Golden Ale', 'Blonde Ale', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Daisy Cutter Pale Ale', 'Pale Ale', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Half Full Brewery (Stamford, CT) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Half Full Brewery') AND LOWER(city) = LOWER('Stamford') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pursuit', 'IPA', 0.07, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Half Full Bright Ale', 'Blonde Ale', 0.052, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hangar 24 Craft Brewery (Redlands, CA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hangar 24 Craft Brewery') AND LOWER(city) = LOWER('Redlands') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Orange Wheat', 'Sour', 0.046, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hangar 24 Helles Lager', 'Helles', 0.043, 14, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hardywood Park Craft Brewery (Richmond, VA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hardywood Park Craft Brewery') AND LOWER(city) = LOWER('Richmond') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'The Great Return', 'IPA', 0.075, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hardywood Cream Ale', 'Cream Ale', 0.044, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Capital Trail Pale Ale', 'Pale Ale', 0.056, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Harpoon Brewery (Boston, MA) — 11 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Harpoon Brewery') AND LOWER(city) = LOWER('Boston') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'UFO Gingerland', 'Saison', 0.052, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Long Thaw White IPA', 'IPA', 0.062, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon Summer Beer', 'Kölsch', 0.05, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon IPA', 'IPA', 0.059, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'UFO Pumpkin', 'Amber', 0.059, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon Octoberfest', 'Oktoberfest', 0.055, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon IPA (2012)', 'IPA', 0.059, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon Summer Beer (2012)', 'Kölsch', 0.05, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'UFO White', 'Wheat', 0.048, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon Summer Beer (2010)', 'Kölsch', 0.05, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harpoon IPA (2010)', 'IPA', 0.059, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Harvest Moon Brewing Company (Belt, MT) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Harvest Moon Brewing Company') AND LOWER(city) = LOWER('Belt') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Great Falls Select Pale Ale', 'Blonde Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beltian White', 'Witbier', 0.048, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hawai'i Nui Brewing Co. (Hilo, HI) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hawai''i Nui Brewing Co.') AND LOWER(city) = LOWER('Hilo') AND state = 'HI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Kaua''i Golden Ale', 'Blonde Ale', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunset Amber', 'Pale Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hapa Brown Ale', 'Brown Ale', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Southern Cross', 'Flanders Red', 0.083, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Headlands Brewing Company (Mill Valley, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Headlands Brewing Company') AND LOWER(city) = LOWER('Mill Valley') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Groupe G', 'IPA', 0.076, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pt. Bonita Rustic Lager', 'Lager', 0.062, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hill 88 Double IPA', 'Double IPA', 0.088, 77, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Heavy Seas Beer (Halethorpe, MD) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Heavy Seas Beer') AND LOWER(city) = LOWER('Halethorpe') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Loose Cannon', 'IPA', 0.072, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'AARGHtoberfest!', 'Oktoberfest', 0.06, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Davy Jones Lager', 'Cream Ale', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hess Brewing Company (San Diego, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hess Brewing Company') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Grazias', 'Cream Ale', 0.063, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Habitus IPA', 'IPA', 0.08, 86, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ex Umbris Rye Imperial Stout', 'Imperial Stout', 0.099, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── High Hops Brewery (Windsor, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('High Hops Brewery') AND LOWER(city) = LOWER('Windsor') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'The Golden One', 'Pilsner', 0.063, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Power of Zeus', 'Pale Ale', 0.07, 68, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── High Noon Saloon And Brewery (Leavenworth, KS) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('High Noon Saloon And Brewery') AND LOWER(city) = LOWER('Leavenworth') AND state = 'KS'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tonganoxie Honey Wheat', 'Wheat', 0.044, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oregon Trail Unfiltered Raspberry Wheat', 'Sour', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Annie''s Amber Ale', 'Amber', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hilliard's Beer (Seattle, WA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hilliard''s Beer') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'The 12th Can™', 'Pale Ale', 0.045, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hilliard''s Pils', 'Pilsner', 0.055, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hilliard''s Blonde', 'Blonde Ale', 0.049, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hilliard''s Amber Ale', 'Amber', 0.055, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hilliard''s Saison', 'Saison', 0.066, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hinterland Brewery (Green Bay, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hinterland Brewery') AND LOWER(city) = LOWER('Green Bay') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'White Cap White IPA', 'IPA', 0.042, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hop Farm Brewing Company (Pittsburgh, PA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hop Farm Brewing Company') AND LOWER(city) = LOWER('Pittsburgh') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Provision', 'Saison', 0.042, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'One Nut Brown', 'Brown Ale', 0.047, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Farm IPA', 'IPA', 0.058, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hop Valley Brewing Company (Springfield, OR) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hop Valley Brewing Company') AND LOWER(city) = LOWER('Springfield') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Double D Blonde', 'Blonde Ale', 0.049, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Festeroo Winter Ale', 'Red Ale', 0.078, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Proxima IPA', 'IPA', 0.063, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double D Blonde (2013)', 'Blonde Ale', 0.049, 20, true, true),
      (gen_random_uuid(), v_brewery_id, '541 American Lager', 'Lager', 0.048, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alphadelic IPA', 'IPA', 0.065, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alphadelic IPA (2011)', 'IPA', 0.065, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double D Blonde (2011)', 'Blonde Ale', 0.049, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hops & Grain Brewery (Austin, TX) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hops & Grain Brewery') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Green House India Pale Ale', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The One They Call Zoe', 'Lager', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alteration', 'Amber', 0.051, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pale Dog', 'Pale Ale', 0.06, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hops & Grains Brewing Company (Austin, TX) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hops & Grains Brewing Company') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Porter Culture', 'Porter', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Hopworks Urban Brewery (Portland, OR) — 11 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Hopworks Urban Brewery') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Totally Radler', 'Lager', 0.027, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nonstop Hef Hop', 'Wheat', 0.039, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rise Up Red', 'Amber', 0.058, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Survival Stout', 'Stout', 0.058, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopworks IPA', 'IPA', 0.066, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abominable Winter Ale', 'Red Ale', 0.073, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pigwar White India Pale Ale', 'IPA', 0.06, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rise-Up Red (2014)', 'Amber', 0.058, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abominable Winter Ale (2012)', 'Red Ale', 0.073, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'HUB Lager', 'Pilsner', 0.051, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopworks IPA (2012)', 'IPA', 0.066, 75, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Horny Goat Brew Pub (Milwaukee, WI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Horny Goat Brew Pub') AND LOWER(city) = LOWER('Milwaukee') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Watermelon Wheat', 'Wheat', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Laka Laka Pineapple', 'Hefeweizen', 0.051, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest', 'Oktoberfest', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Howard Brewing Company (Lenoir, NC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Howard Brewing Company') AND LOWER(city) = LOWER('Lenoir') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Trail Maker Pale Ale', 'Pale Ale', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Action Man Lager', 'Lager', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Indeed Brewing Company (Minneapolis, MN) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Indeed Brewing Company') AND LOWER(city) = LOWER('Minneapolis') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Let It Ride IPA', 'IPA', 0.068, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stir Crazy Winter Ale', 'Amber', 0.065, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sweet Yamma Jamma Ale', 'Sour', 0.05, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shenanigans Summer Ale', 'Wheat', 0.046, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Midnight Ryder', 'American Black Ale', 0.065, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Day Tripper Pale Ale', 'Pale Ale', 0.054, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Independence Brewing Company (Austin, TX) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Independence Brewing Company') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Oklahoma Suks', 'Amber', 0.048, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Power & Light', 'Pale Ale', 0.055, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Rabbit', 'Witbier', 0.059, 27, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Indiana City Brewing (Indianapolis, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Indiana City Brewing') AND LOWER(city) = LOWER('Indianapolis') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tribute', 'Pale Ale', 0.058, 58, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Infamous Brewing Company (Austin, TX) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Infamous Brewing Company') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Infamous IPA', 'IPA', 0.07, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hijack', 'Cream Ale', 0.055, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Intuition Ale Works (Jacksonville, FL) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Intuition Ale Works') AND LOWER(city) = LOWER('Jacksonville') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jon Boat Coastal Ale', 'Blonde Ale', 0.045, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'I-10 IPA', 'IPA', 0.068, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'People''s Pale Ale', 'Pale Ale', 0.053, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ipswich Ale Brewery (Ipswich, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ipswich Ale Brewery') AND LOWER(city) = LOWER('Ipswich') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Summer Ale', 'Blonde Ale', 0.049, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Iron Hill Brewery & Restaurant (Wilmington, DE) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Iron Hill Brewery & Restaurant') AND LOWER(city) = LOWER('Wilmington') AND state = 'DE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Appreciation Ale', 'IPA', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Jack's Abby Craft Lagers (Framingham, MA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Jack''s Abby Craft Lagers') AND LOWER(city) = LOWER('Framingham') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'House Lager', 'Keller Bier / Zwickel Bier', 0.052, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Leisure Time', 'Lager', 0.048, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Excess IPL', 'Lager', 0.072, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hoponius Union', 'Lager', 0.067, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Calyptra', 'Lager', 0.049, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Jackalope Brewing Company (Nashville, TN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Jackalope Brewing Company') AND LOWER(city) = LOWER('Nashville') AND state = 'TN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Thunder Ann', 'Pale Ale', 0.055, 37, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Jackie O's Pub & Brewery (Athens, OH) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Jackie O''s Pub & Brewery') AND LOWER(city) = LOWER('Athens') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Razz Wheat', 'Sour', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Ryot', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mystic Mama IPA', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Firefly Amber Ale', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chomolungma Honey Nut Brown Ale', 'Brown Ale', 0.067, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Jailbreak Brewing Company (Laurel, MD) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Jailbreak Brewing Company') AND LOWER(city) = LOWER('Laurel') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Welcome to Scoville', 'IPA', 0.069, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── James Page Brewing Company (Stevens Point, WI) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('James Page Brewing Company') AND LOWER(city) = LOWER('Stevens Point') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bastian', 'Red Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Healani', 'Hefeweizen', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yabba Dhaba Chai Tea Porter', 'Porter', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'A Capella Gluten Free Pale Ale', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Casper White Stout', 'Blonde Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'JP''s Ould Sod Irish Red IPA', 'IPA', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Joseph James Brewing Company (Henderson, NV) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Joseph James Brewing Company') AND LOWER(city) = LOWER('Henderson') AND state = 'NV'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Weize Guy', 'Hefeweizen', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fox Tail Gluten Free Ale', 'Pale Ale', 0.05, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Box Imperial IPA', 'Double IPA', 0.093, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Joseph James American Lager', 'Lager', 0.052, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Kalona Brewing Company (Kalona, IA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Kalona Brewing Company') AND LOWER(city) = LOWER('Kalona') AND state = 'IA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sucha Much IPA', 'IPA', 0.071, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lewbricator Wheat Dopplebock', 'Lager', 0.075, 24, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Karbach Brewing Company (Houston, TX) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Karbach Brewing Company') AND LOWER(city) = LOWER('Houston') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Weisse Versa (2012)', 'Hefeweizen', 0.052, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mother in Lager', 'Lager', 0.058, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Weekend Warrior Pale Ale', 'Pale Ale', 0.055, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Karbachtoberfest', 'Oktoberfest', 0.055, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Love Street Summer Seasonal (2014)', 'Kölsch', 0.047, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barn Burner Saison', 'Saison', 0.066, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rodeo Clown Double IPA', 'Double IPA', 0.095, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sympathy for the Lager', 'Lager', 0.049, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Weisse Versa', 'Hefeweizen', 0.052, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopadillo India Pale Ale', 'IPA', 0.066, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── KelSo Beer Company (Brooklyn, NY) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('KelSo Beer Company') AND LOWER(city) = LOWER('Brooklyn') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'KelSo Nut Brown Lager', 'Lager', 0.057, 19, true, true),
      (gen_random_uuid(), v_brewery_id, 'KelSo India Pale Ale', 'IPA', 0.06, 64, true, true),
      (gen_random_uuid(), v_brewery_id, 'KelSo Pilsner', 'Pilsner', 0.055, 23, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Kenai River Brewing Company (Soldotna, AK) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Kenai River Brewing Company') AND LOWER(city) = LOWER('Soldotna') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Skilak Scottish Ale', 'Amber', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Peninsula Brewers Reserve (PBR)', 'Blonde Ale', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunken Island IPA', 'IPA', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Skilak Scottish Ale (2011)', 'Amber', 0.058, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Kettle House Brewing Company (Missoula, MT) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Kettle House Brewing Company') AND LOWER(city) = LOWER('Missoula') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cold Smoke Scotch Ale (2007)', 'Red Ale', 0.065, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Haul IPA (2009)', 'IPA', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Haul IPA (2006)', 'IPA', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Eddy Out Pale Ale', 'Pale Ale', 0.055, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Haul IPA', 'IPA', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cold Smoke Scotch Ale', 'Red Ale', 0.065, 11, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Keweenaw Brewing Company (Houghton, MI) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Keweenaw Brewing Company') AND LOWER(city) = LOWER('Houghton') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'U. P. Witbier', 'Witbier', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'November Gale Pale Ale', 'Pale Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Olde Ore Dock Scottish Ale', 'Amber', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Widow Maker Black Ale', 'Brown Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lift Bridge Brown Ale', 'Brown Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pick Axe Blonde Ale', 'Blonde Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Red Jacket Amber Ale', 'Amber', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── King Street Brewing Company (Anchorage, AK) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('King Street Brewing Company') AND LOWER(city) = LOWER('Anchorage') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Amber Ale', 'Amber', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'King Street Pilsner', 'Pilsner', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'King Street IPA', 'IPA', 0.06, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'King Street Hefeweizen', 'Hefeweizen', 0.057, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'King Street Blonde Ale', 'Blonde Ale', 0.049, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Kirkwood Station Brewing Company (Kirkwood, MO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Kirkwood Station Brewing Company') AND LOWER(city) = LOWER('Kirkwood') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'India Pale Ale', 'IPA', 0.063, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blackberry Wheat', 'Wheat', 0.048, 11, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Kona Brewing Company (Kona, HI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Kona Brewing Company') AND LOWER(city) = LOWER('Kona') AND state = 'HI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Longboard Island Lager', 'Lager', 0.046, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Krebs Brewing Company (Pete's Pl... (Krebs, OK) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Krebs Brewing Company (Pete''s Pl...') AND LOWER(city) = LOWER('Krebs') AND state = 'OK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Choc Beer (2003)', 'Lager', 0.04, 9, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Kulshan Brewery (Bellingham, WA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Kulshan Brewery') AND LOWER(city) = LOWER('Bellingham') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bellingham Beer Week 2013 Collaboration', 'Belgian Dubbel', 0.08, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── La Cumbre Brewing Company (Albuquerque, NM) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('La Cumbre Brewing Company') AND LOWER(city) = LOWER('Albuquerque') AND state = 'NM'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'A Slice of Hefen', 'Hefeweizen', 0.054, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elevated IPA', 'IPA', 0.072, 100, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lancaster Brewing Company (Lancaster, PA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lancaster Brewing Company') AND LOWER(city) = LOWER('Lancaster') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rumspringa Golden Bock', 'Maibock / Helles Bock', 0.066, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lancaster German Style Kölsch', 'Kölsch', 0.048, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Latitude 42 Brewing Company (Portage, MI) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Latitude 42 Brewing Company') AND LOWER(city) = LOWER('Portage') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Beach Cruiser', 'Hefeweizen', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'I.P. Eh!', 'IPA', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schoolhouse Honey', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '10 Degrees of Separation', 'Brown Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Laughing Dog Brewing Company (Ponderay, ID) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Laughing Dog Brewing Company') AND LOWER(city) = LOWER('Ponderay') AND state = 'ID'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Laughing Dog Cream Ale', 'Cream Ale', 0.05, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Two-One Niner', 'Pilsner', 0.048, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Laughing Dog IPA', 'IPA', 0.064, 66, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lavery Brewing Company (Erie, PA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lavery Brewing Company') AND LOWER(city) = LOWER('Erie') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Madra Allta', 'IPA', 0.064, 95, true, true),
      (gen_random_uuid(), v_brewery_id, 'Duluchan India Pale Ale', 'IPA', 0.056, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lazy Monk Brewing (Eau Claire, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lazy Monk Brewing') AND LOWER(city) = LOWER('Eau Claire') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lazy Monk Bohemian Pilsner', 'Pilsner', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lewis and Clark Brewing Company (Helena, MT) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lewis and Clark Brewing Company') AND LOWER(city) = LOWER('Helena') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Yellowstone Golden Ale', 'Kölsch', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tumbleweed IPA', 'IPA', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lewis & Clark Amber Ale', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Miner''s Gold Hefeweizen', 'Hefeweizen', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back Country Scottish Ale', 'Amber', 0.057, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lift Bridge Brewing Company (Stillwater, MN) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lift Bridge Brewing Company') AND LOWER(city) = LOWER('Stillwater') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Getaway', 'Pilsner', 0.052, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farm Girl Saison', 'Saison', 0.06, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Liquid Hero Brewery (York, PA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Liquid Hero Brewery') AND LOWER(city) = LOWER('York') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Adam''s Stout', 'Stout', 0.058, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Hero', 'Amber', 0.057, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schweet Ale', 'Sour', 0.052, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Irregardless IPA', 'IPA', 0.065, 75, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lone Tree Brewing Company (Lone Tree, CO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lone Tree Brewing Company') AND LOWER(city) = LOWER('Lone Tree') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Peach Pale Ale', 'Pale Ale', 0.057, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lonerider Brewing Company (Raleigh, NC) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lonerider Brewing Company') AND LOWER(city) = LOWER('Raleigh') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Deadeye Jack', 'Porter', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pistols at Dawn', 'Stout', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Peacemaker Pale Ale', 'Pale Ale', 0.057, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shotgun Betty', 'Hefeweizen', 0.058, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sweet Josie', 'Brown Ale', 0.061, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Long Trail Brewing Company (Bridgewater Corners, VT) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Long Trail Brewing Company') AND LOWER(city) = LOWER('Bridgewater Corners') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Long Trail IPA', 'IPA', 0.059, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Long Trail Ale', 'Amber', 0.046, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Bag', 'Amber', 0.072, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blackbeary Wheat', 'Sour', 0.04, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Long Trail Ale (1)', 'Amber', 0.046, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lost Nation Brewing (East Fairfield, VT) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lost Nation Brewing') AND LOWER(city) = LOWER('East Fairfield') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gose', 'Gose', 0.046, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vermont Pilsner', 'Pilsner', 0.048, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mosaic Single Hop IPA', 'IPA', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lost Galaxy', 'IPA', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lost Rhino Brewing Company (Ashburn, VA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lost Rhino Brewing Company') AND LOWER(city) = LOWER('Ashburn') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Face Plant IPA', 'IPA', 0.062, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rhino Chasers Pilsner', 'Pilsner', 0.056, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lucette Brewing Company (Menominee, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lucette Brewing Company') AND LOWER(city) = LOWER('Menominee') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Slow Hand Stout', 'Stout', 0.052, 29, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lucette Brewing Company (Menominie, WI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lucette Brewing Company') AND LOWER(city) = LOWER('Menominie') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hips Don''t Lie', 'Hefeweizen', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ride Again Pale Ale', 'Pale Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Farmer''s Daughter', 'Blonde Ale', 0.048, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lucky Town Brewing Company (Jackson, MS) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lucky Town Brewing Company') AND LOWER(city) = LOWER('Jackson') AND state = 'MS'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pub Ale', 'Brown Ale', 0.038, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ballistic Blonde', 'Belgian', 0.051, 31, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Lumberyard Brewing Company (Flagstaff, AZ) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Lumberyard Brewing Company') AND LOWER(city) = LOWER('Flagstaff') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Knotty Pine', 'Pale Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lumberyard Pilsner', 'Pilsner', 0.053, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lumberyard IPA', 'IPA', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lumberyard Red Ale', 'Amber', 0.058, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── MacTarnahans Brewing Company (Portland, OR) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('MacTarnahans Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mac''s Highlander Pale Ale (2000)', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mac''s Scottish Style Amber Ale (2000)', 'Amber', 0.051, 32, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Macon Beer Company (Macon, GA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Macon Beer Company') AND LOWER(city) = LOWER('Macon') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Macon Progress Ale', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Macon History Ale', 'Brown Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Madtree Brewing Company (Cincinnati, OH) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Madtree Brewing Company') AND LOWER(city) = LOWER('Cincinnati') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Galaxy High', 'Double IPA', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sol Drifter', 'Blonde Ale', 0.043, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Thunder Snow', 'Amber', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Great Pumpcan', 'Sour', 0.079, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'LIFT', 'Kölsch', 0.047, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'SPRYE', 'Pale Ale', 0.05, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Psychopathy', 'IPA', 0.069, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gnarly Brown', 'Brown Ale', 0.07, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Happy Amber', 'Amber', 0.06, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Magic Hat Brewing Company (South Burlington, VT) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Magic Hat Brewing Company') AND LOWER(city) = LOWER('South Burlington') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '#9', 'Sour', 0.051, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elder Betty', 'Hefeweizen', 0.055, 13, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mammoth Brewing Company (Mammoth Lakes, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mammoth Brewing Company') AND LOWER(city) = LOWER('Mammoth Lakes') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'High Country Pilsner (Current)', 'Pilsner', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Epic IPA', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden Trout Pilsner', 'Pilsner', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Real McCoy Amber Ale (Current)', 'Amber', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Manayunk Brewing Company (Philadelphia, PA) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Manayunk Brewing Company') AND LOWER(city) = LOWER('Philadelphia') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Festivus (1)', 'Amber', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Manayunk Oktoberfest', 'Oktoberfest', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Belgian Style Session Ale', 'Belgian', 0.045, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Manayunk IPA', 'IPA', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yunkin'' Punkin''', 'Amber', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Paradise', 'Wheat', 0.05, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Monk from the ''Yunk', 'Belgian Tripel', 0.09, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schuylkill Punch', 'Sour', 0.06, 14, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dreamin'' Double IPA', 'Double IPA', 0.085, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Manzanita Brewing Company (Santee, CA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Manzanita Brewing Company') AND LOWER(city) = LOWER('Santee') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Chaotic Double IPA', 'Double IPA', 0.099, 93, true, true),
      (gen_random_uuid(), v_brewery_id, 'Manzanita IPA', 'IPA', 0.08, 88, true, true),
      (gen_random_uuid(), v_brewery_id, 'Riverwalk Blonde Ale', 'Blonde Ale', 0.06, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gillespie Brown Ale', 'Brown Ale', 0.095, 49, true, true),
      (gen_random_uuid(), v_brewery_id, 'Manzanita Pale Ale', 'Pale Ale', 0.066, 44, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Marble Brewery (Albuquerque, NM) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Marble Brewery') AND LOWER(city) = LOWER('Albuquerque') AND state = 'NM'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Marble Pilsner', 'Pilsner', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Marble India Pale Ale', 'IPA', 0.062, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Marshall Wharf Brewing Company (Belfast, ME) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Marshall Wharf Brewing Company') AND LOWER(city) = LOWER('Belfast') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Toughcats IPA', 'IPA', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tug Pale Ale', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sexy Chaos', 'Imperial Stout', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ace Hole American Pale Ale', 'Pale Ale', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cant Dog Imperial Pale Ale', 'Double IPA', 0.097, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Martin House Brewing Company (Fort Worth, TX) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Martin House Brewing Company') AND LOWER(city) = LOWER('Fort Worth') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'River House', 'Saison', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pretzel Stout', 'Stout', 0.065, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rubberneck Red', 'Amber', 0.05, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Imperial Texan', 'Double IPA', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Day Break 4-Grain Breakfast Beer', 'Wheat', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'River House Saison', 'Saison', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'There Will Be Stout', 'Stout', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Matt Brewing Company (Utica, NY) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Matt Brewing Company') AND LOWER(city) = LOWER('Utica') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Our Legacy IPA', 'IPA', 0.065, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Shandy', 'Lager', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Golden Pilsener (2003)', 'Pilsner', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Adirondack Light (2002)', 'Lager', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'DAX Light (1998)', 'Lager', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Traditional Lager (2000)', 'Lager', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pomegranate Wheat (2008)', 'Sour', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blueberry Blonde Ale', 'Blonde Ale', 0.05, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac White IPA', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Summer Ale (2011)', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Pale Ale (12 oz.)', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saranac Pale Ale (16 oz.)', 'Pale Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Maui Brewing Company (Lahaina, HI) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Maui Brewing Company') AND LOWER(city) = LOWER('Lahaina') AND state = 'HI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lahaina Town Brown', 'Brown Ale', 0.051, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pau Hana Pilsner', 'Pilsner', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lemongrass Saison', 'Saison', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aloha B’ak’tun', 'Belgian Dubbel', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Liquid Breadfruit', 'Sour', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sobrehumano Palena''ole', 'Amber', 0.06, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'La Perouse White', 'Witbier', 0.05, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flyin'' HI.P.Hay', 'IPA', 0.068, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mana Wheat', 'Wheat', 0.055, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bikini Blonde Lager', 'Helles', 0.045, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'CoCoNut Porter', 'Porter', 0.057, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Swell IPA', 'IPA', 0.062, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mavericks Beer Company (Half Moon Bay, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mavericks Beer Company') AND LOWER(city) = LOWER('Half Moon Bay') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pit Stop Chocolate Porter', 'Porter', 0.037, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pace Setter Belgian Style Wit', 'Witbier', 0.037, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Back in the Saddle Rye Pale Ale', 'Pale Ale', 0.037, 53, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mehana Brewing Co. (Hilo, HI) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mehana Brewing Co.') AND LOWER(city) = LOWER('Hilo') AND state = 'HI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tsunami IPA', 'IPA', 0.072, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Humpback Blonde Ale', 'Blonde Ale', 0.042, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hawaiian Crow Porter', 'Porter', 0.052, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Volcano Red Ale', 'Amber', 0.052, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mauna Kea Pale Ale', 'Pale Ale', 0.054, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Miami Brewing Company (Miami, FL) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Miami Brewing Company') AND LOWER(city) = LOWER('Miami') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Shark Bait', 'Sour', 0.053, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gator Tail Brown Ale', 'Brown Ale', 0.053, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Miami Vice IPA', 'IPA', 0.071, 62, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Rod Coconut Ale', 'Blonde Ale', 0.053, 16, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mickey Finn's Brewery (Libertyville, IL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mickey Finn''s Brewery') AND LOWER(city) = LOWER('Libertyville') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mickey Finn''s Amber Ale', 'Amber', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Midnight Sun Brewing Company (Anchorage, AK) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Midnight Sun Brewing Company') AND LOWER(city) = LOWER('Anchorage') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pleasure Town', 'IPA', 0.063, 61, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pleasure Town IPA', 'IPA', 0.063, 61, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snowshoe White Ale', 'Witbier', 0.048, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kodiak Brown Ale', 'Brown Ale', 0.05, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sockeye Red IPA', 'IPA', 0.057, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mike Hess Brewing Company (San Diego, CA) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mike Hess Brewing Company') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Habitus (2014)', 'Double IPA', 0.08, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Solis', 'IPA', 0.075, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jucundus', 'Wheat', 0.06, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Habitus', 'Double IPA', 0.08, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grazias', 'Cream Ale', 0.063, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Claritas', 'Kölsch', 0.058, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mikerphone Brewing (Chicago, IL) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mikerphone Brewing') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Vinyl Frontier', 'Double IPA', 0.083, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Disco Superfly', 'IPA', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Misty Mountain Hop', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'One-Hit Wonderful', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'En Parfaite Harmonie', 'Saison', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Daft Funk', 'Berliner Weisse', 0.043, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'Love In An Ellavator', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Spin Doctor', 'Pale Ale', 0.053, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mikkeller (Pottstown, PA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mikkeller') AND LOWER(city) = LOWER('Pottstown') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Keeper (Current)', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Better Half', 'IPA', 0.068, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── MillKing It Productions (Royal Oak, MI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('MillKing It Productions') AND LOWER(city) = LOWER('Royal Oak') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'SNO White Ale', 'Witbier', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'BRIK Irish Red Ale', 'Red Ale', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'AXL Pale Ale', 'Pale Ale', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Milwaukee Brewing Company (Milwaukee, WI) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Milwaukee Brewing Company') AND LOWER(city) = LOWER('Milwaukee') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hop Freak', 'Double IPA', 0.087, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Louie''s Demise Amber Ale', 'Amber', 0.051, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Happy', 'IPA', 0.075, 51, true, true),
      (gen_random_uuid(), v_brewery_id, 'Booyah Farmhouse Ale', 'Saison', 0.065, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'O-Gii', 'Witbier', 0.092, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flaming Damsel Lager (2010)', 'Lager', 0.048, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Louie’s Demise Immort-Ale (2010)', 'Amber', 0.051, 24, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Minhas Craft Brewery (Monroe, WI) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Minhas Craft Brewery') AND LOWER(city) = LOWER('Monroe') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Axe Head Malt Liquor', 'American Malt Liquor', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Huber Bock (2014)', 'Lager', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Minhas Light (2012)', 'Lager', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Huber', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Clear Creek Ice', 'Lager', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mountain Crest', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mountain Creek (2013)', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boxer', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boxer Light', 'Lager', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boxer Ice', 'Lager', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mission Brewery (San Diego, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mission Brewery') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cortez Gold', 'Belgian', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mission IPA', 'IPA', 0.068, 66, true, true),
      (gen_random_uuid(), v_brewery_id, 'El Conquistador Extra Pale Ale', 'Pale Ale', 0.048, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shipwrecked Double IPA', 'Double IPA', 0.092, 75, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Moab Brewery (Moab, UT) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Moab Brewery') AND LOWER(city) = LOWER('Moab') AND state = 'UT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Squeaky Bike Nut Brown Ale', 'Brown Ale', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dead Horse Amber', 'Wheat', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rocket Bike American Lager', 'Lager', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Johnny''s American IPA', 'IPA', 0.04, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Moat Mountain Smoke House & Brew... (North Conway, NH) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Moat Mountain Smoke House & Brew...') AND LOWER(city) = LOWER('North Conway') AND state = 'NH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Boneshaker Brown Ale', 'Brown Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Iron Mike Pale Ale', 'Pale Ale', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Modern Monks Brewery (Lincoln, NE) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Modern Monks Brewery') AND LOWER(city) = LOWER('Lincoln') AND state = 'NE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Monkadelic', 'Pale Ale', 0.042, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Modern Times Beer (San Diego, CA) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Modern Times Beer') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'City of the Sun', 'IPA', 0.075, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Booming Rollers', 'IPA', 0.068, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oneida', 'Pale Ale', 0.052, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Aurora', 'Amber', 0.067, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lomaland', 'Saison', 0.055, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fortunate Islands', 'Wheat', 0.047, 46, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black House', 'Stout', 0.058, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blazing World', 'Amber', 0.065, 115, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mogollon Brewing Company (Flagstaff, AZ) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mogollon Brewing Company') AND LOWER(city) = LOWER('Flagstaff') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wapiti Amber Ale', 'Amber', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Monkey Paw Pub & Brewery (San Diego, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Monkey Paw Pub & Brewery') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sweet Georgia Brown', 'Brown Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rich Man''s IIPA', 'Double IPA', 0.087, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Monkey Paw Oatmeal Pale Ale', 'Pale Ale', 0.058, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Montauk Brewing Company (Montauk, NY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Montauk Brewing Company') AND LOWER(city) = LOWER('Montauk') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Montauk Summer Ale', 'Blonde Ale', 0.056, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Driftwood Ale', 'Amber', 0.06, 49, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Morgan Street Brewery (Saint Louis, MO) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Morgan Street Brewery') AND LOWER(city) = LOWER('Saint Louis') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'When Helles Freezes Over', 'Helles', 0.056, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Morgan Street Oktoberfest', 'Oktoberfest', 0.049, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Honey Wheat', 'Wheat', 0.047, 14, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Bear Dark Lager', 'Lager', 0.046, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden Pilsner', 'Pilsner', 0.05, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mother Earth Brew Company (Vista, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mother Earth Brew Company') AND LOWER(city) = LOWER('Vista') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cali Creamin''', 'Cream Ale', 0.052, 21, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mother Earth Brewing Company (Kinston, NC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mother Earth Brewing Company') AND LOWER(city) = LOWER('Kinston') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Second Wind Pale Ale', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunny Haze', 'Hefeweizen', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mother's Brewing (Springfield, MO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mother''s Brewing') AND LOWER(city) = LOWER('Springfield') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Towhead', 'Blonde Ale', 0.052, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lil'' Helper', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mountain Town Brewing Company (Mount Pleasant, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mountain Town Brewing Company') AND LOWER(city) = LOWER('Mount Pleasant') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Train Wreck', 'Amber', 0.082, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mudshark Brewing Company (Lake Havasu City, AZ) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mudshark Brewing Company') AND LOWER(city) = LOWER('Lake Havasu City') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Full Moon Belgian White Ale', 'Witbier', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Desert Magic IPA', 'IPA', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Up River Light', 'Lager', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Full Moon Belgian White Ale (2007)', 'Witbier', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dry Heat Hefeweizen (2006)', 'Hefeweizen', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Mustang Brewing Company (Mustang, OK) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Mustang Brewing Company') AND LOWER(city) = LOWER('Mustang') AND state = 'OK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mustang Sixty-Six', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mustang ''33', 'Lager', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Session ''33 (2011)', 'Lager', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mustang Golden Ale', 'Blonde Ale', 0.053, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Washita Wheat', 'Wheat', 0.053, 14, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Narragansett Brewing Company (Providence, RI) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Narragansett Brewing Company') AND LOWER(city) = LOWER('Providence') AND state = 'RI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gansett Light', 'Lager', 0.037, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bohemian Pils', 'Pilsner', 0.052, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Autocrat Coffee Milk Stout', 'Milk Stout', 0.053, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Narragansett Bohemian Pilsner', 'Pilsner', 0.086, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Narragansett Summer Ale', 'Wheat', 0.042, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Narragansett Cream Ale', 'Cream Ale', 0.05, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Narragansett Porter', 'Porter', 0.07, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Narragansett Bock', 'Lager', 0.065, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Narragansett Fest Lager', 'Oktoberfest', 0.055, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Natian Brewery (Portland, OR) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Natian Brewery') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Undun Blonde Ale', 'Blonde Ale', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'CuDa Cascadian Dark Ale', 'American Black Ale', 0.074, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Grogham Imperial India Pale Ale', 'Double IPA', 0.085, 86, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Grogham Imperial India Pale Ale (2012)', 'Double IPA', 0.085, 86, true, true),
      (gen_random_uuid(), v_brewery_id, 'CuDa Cascadian Dark Ale (2012)', 'American Black Ale', 0.074, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Undun Blonde Ale (2012)', 'Blonde Ale', 0.053, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Nebraska Brewing Company (Papillion, NE) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Nebraska Brewing Company') AND LOWER(city) = LOWER('Papillion') AND state = 'NE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wick For Brains', 'Amber', 0.061, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nebraska India Pale Ale', 'IPA', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'EOS Hefeweizen', 'Hefeweizen', 0.048, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brunette Nut Brown Ale', 'Brown Ale', 0.048, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cardinal Pale Ale', 'Pale Ale', 0.057, 29, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Neshaminy Creek Brewing Company (Croydon, PA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Neshaminy Creek Brewing Company') AND LOWER(city) = LOWER('Croydon') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'County Line IPA', 'IPA', 0.066, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Trauger Pilsner', 'Pilsner', 0.048, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── New Belgium Brewing Company (Fort Collins, CO) — 14 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('New Belgium Brewing Company') AND LOWER(city) = LOWER('Fort Collins') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Slow Ride', 'IPA', 0.045, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ranger IPA', 'IPA', 0.065, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shift', 'Lager', 0.05, 29, true, true),
      (gen_random_uuid(), v_brewery_id, '1554 Black Lager', 'Lager', 0.056, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blue Paddle', 'Pilsner', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'California Route', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snapshot', 'Wheat', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunshine Wheat Beer', 'Wheat', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fat Tire Amber Ale', 'Amber', 0.052, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shift (1)', 'Lager', 0.05, 29, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fat Tire Amber Ale (2011)', 'Amber', 0.052, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ranger IPA (Current)', 'IPA', 0.065, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunshine Wheat Beer (2009)', 'Wheat', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fat Tire Amber Ale (2008)', 'Amber', 0.052, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── New England Brewing Company (Woodbridge, CT) — 11 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('New England Brewing Company') AND LOWER(city) = LOWER('Woodbridge') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Weiss Trash Culture', 'Berliner Weisse', 0.034, 6, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sea Hag IPA', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elm City Pilsner', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Atlantic Amber Ale (2004)', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '668 Neighbor of the Beast12 oz.', 'Belgian', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gandhi-Bot Double IPA (12 oz.)', 'Double IPA', 0.088, 85, true, true),
      (gen_random_uuid(), v_brewery_id, '668 Neighbor of the Beast (16 oz.) (2010)', 'Belgian', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gandhi-Bot Double IPA (16 oz.) (2010)', 'Double IPA', 0.088, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elm City Lager (2007)', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Atlantic Amber Ale (2007)', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sea Hag IPA (Current)', 'IPA', 0.062, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── New Orleans Lager & Ale Brewing ... (New Orleans, LA) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('New Orleans Lager & Ale Brewing ...') AND LOWER(city) = LOWER('New Orleans') AND state = 'LA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rebirth Pale Ale', 'Pale Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Irish Channel Stout', 'Stout', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'MechaHopzilla', 'Double IPA', 0.088, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopitoulas IPA', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'NOLA Brown Ale', 'Brown Ale', 0.039, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'NOLA Blonde Ale', 'Blonde Ale', 0.049, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── New Republic Brewing Company (College Station, TX) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('New Republic Brewing Company') AND LOWER(city) = LOWER('College Station') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Skylight', 'Dunkel', 0.056, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kadigan', 'Blonde Ale', 0.056, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dammit Jim!', 'Amber', 0.052, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── New South Brewing Company (Myrtle Beach, SC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('New South Brewing Company') AND LOWER(city) = LOWER('Myrtle Beach') AND state = 'SC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Nut Brown Ale', 'Brown Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Ale', 'Witbier', 0.046, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Newburgh Brewing Company (Newburgh, NY) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Newburgh Brewing Company') AND LOWER(city) = LOWER('Newburgh') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cream Ale', 'Cream Ale', 0.042, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Newburyport Brewing Company (Newburyport, MA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Newburyport Brewing Company') AND LOWER(city) = LOWER('Newburyport') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Green Head IPA', 'IPA', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Plum Island Belgian White', 'Witbier', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Newburyport Pale Ale', 'Pale Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Night Shift Brewing (Everett, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Night Shift Brewing') AND LOWER(city) = LOWER('Everett') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Marblehead', 'Amber', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── NoDa Brewing Company (Charlotte, NC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('NoDa Brewing Company') AND LOWER(city) = LOWER('Charlotte') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jam Session', 'Pale Ale', 0.051, 31, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Drop ''N Roll IPA', 'IPA', 0.072, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── North Country Brewing Company (Slippery Rock, PA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('North Country Brewing Company') AND LOWER(city) = LOWER('Slippery Rock') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Paleo IPA', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Buck Snort Stout', 'Stout', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Station 33 Firehouse Red', 'Red Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Slimy Pebble Pils', 'Pilsner', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── NorthGate Brewing (Minneapolis, MN) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('NorthGate Brewing') AND LOWER(city) = LOWER('Minneapolis') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Get Together', 'IPA', 0.045, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Maggie''s Leap', 'Milk Stout', 0.049, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wall''s End', 'Brown Ale', 0.048, 19, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpion', 'Amber', 0.06, 38, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stronghold', 'Porter', 0.06, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Parapet ESB', 'Amber', 0.056, 47, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Northampton Brewery (Northamtpon, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Northampton Brewery') AND LOWER(city) = LOWER('Northamtpon') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blue Boots IPA', 'IPA', 0.069, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Northwest Brewing Company (Pacific, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Northwest Brewing Company') AND LOWER(city) = LOWER('Pacific') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hoppy Bitch IPA', 'IPA', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Three Skulls Ale Pale Ale', 'Pale Ale', 0.063, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Northwoods Brewpub (Eau Claire, WI) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Northwoods Brewpub') AND LOWER(city) = LOWER('Eau Claire') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Walter''s Premium Pilsener Beer', 'Pilsner', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Floppin'' Crappie', 'Wheat', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Notch Brewing Company (Ipswich, MA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Notch Brewing Company') AND LOWER(city) = LOWER('Ipswich') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Left of the Dial IPA', 'IPA', 0.043, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Notch Session Pils', 'Pilsner', 0.04, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── O'Fallon Brewery (O'Fallon, MO) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('O''Fallon Brewery') AND LOWER(city) = LOWER('O''Fallon') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'O''Fallon Pumpkin Beer', 'Amber', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '5 Day IPA', 'IPA', 0.061, 66, true, true),
      (gen_random_uuid(), v_brewery_id, 'O''Fallon Wheach', 'Sour', 0.051, 7, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Oakshire Brewing (Eugene, OR) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Oakshire Brewing') AND LOWER(city) = LOWER('Eugene') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Watershed IPA', 'IPA', 0.067, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oakshire Amber Ale', 'Amber', 0.054, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Overcast Espresso Stout', 'Stout', 0.058, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Watershed IPA (2013)', 'IPA', 0.067, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Oasis Texas Brewing Company (Austin, TX) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Oasis Texas Brewing Company') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lake Monster', 'Baltic Porter', 0.082, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'London Homesick Ale', 'Amber', 0.049, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Luchesa Lager', 'Keller Bier / Zwickel Bier', 0.048, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Slow Ride', 'Pale Ale', 0.048, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Occidental Brewing Company (Portland, OR) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Occidental Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Occidental Hefeweizen', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Occidental Dunkel', 'Dunkel', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Occidental Altbier', 'Amber', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Occidental Kölsch', 'Kölsch', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Odyssey Beerwerks (Arvada, CO) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Odyssey Beerwerks') AND LOWER(city) = LOWER('Arvada') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Perpetual Darkness', 'Belgian Dubbel', 0.092, 72, true, true),
      (gen_random_uuid(), v_brewery_id, 'Clan Warrior', 'Red Ale', 0.087, 29, true, true),
      (gen_random_uuid(), v_brewery_id, 'Psycho Penguin Vanilla Porter', 'Porter', 0.054, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Heliocentric Hefeweizen', 'Hefeweizen', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ghose Drifter Pale Ale', 'Pale Ale', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ghost Rider Pale Ale (2013)', 'Pale Ale', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Helios Hefeweizen (2013)', 'Hefeweizen', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Okoboji Brewing Company (Spirit Lake, IA) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Okoboji Brewing Company') AND LOWER(city) = LOWER('Spirit Lake') AND state = 'IA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'The Hole in Hadrian''s Wall', 'Amber', 0.095, 19, true, true),
      (gen_random_uuid(), v_brewery_id, '33 Select Brown Ale', 'Brown Ale', 0.065, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Midwest Charm Farmhouse Ale', 'Saison', 0.06, 29, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boji Blue Pale Ale', 'Pale Ale', 0.05, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Winter Games Select #32 Stout', 'Stout', 0.057, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boji Beach Golden Rye Ale', 'Wheat', 0.05, 23, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Old Forge Brewing Company (Danville, PA) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Old Forge Brewing Company') AND LOWER(city) = LOWER('Danville') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hopsmith Pale Lager', 'Lager', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Falling Down Brown Ale', 'Brown Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Resolution Rye Stout', 'Stout', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Plowshare Porter', 'Porter', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Forge Pumpkin Ale', 'Amber', 0.046, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Endless Sun Ale', 'Wheat', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Celestial Blonde Ale', 'Blonde Ale', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Overbite IPA', 'IPA', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'T-Rail Pale Ale', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Endless Summer Ale (2011)', 'Wheat', 0.048, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Orlison Brewing Company (Airway Heights, WA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Orlison Brewing Company') AND LOWER(city) = LOWER('Airway Heights') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Clem''s Gold', 'Lager', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lizzy''s Red', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Orlison India Pale Lager', 'Lager', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brünette', 'Lager', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Havanüther', 'Lager', 0.041, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Orpheus Brewing (Atlanta, GA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Orpheus Brewing') AND LOWER(city) = LOWER('Atlanta') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lyric Ale', 'Saison', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Atalanta', 'Saison', 0.053, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Oskar Blues Brewery (Longmont, CO) — 26 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Oskar Blues Brewery') AND LOWER(city) = LOWER('Longmont') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pinner Throwback IPA', 'IPA', 0.049, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Centennial State Pale Ale', 'Pale Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chub NITRO', 'Red Ale', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Icey.P.A.', 'IPA', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'One Nut Brown', 'Brown Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Birth IPA', 'IPA', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mama''s Little Yella Pils', 'Pilsner', 0.053, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'oSKAr the G''Rauch', 'IPA', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Deuce', 'Brown Ale', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (10 Year Anniversary)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2012)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gordon Imperial Red (2010)', 'Double IPA', 0.087, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2011)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2010)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'G''KNIGHT (16 oz.)', 'Double IPA', 0.087, 85, true, true),
      (gen_random_uuid(), v_brewery_id, '15th Anniversary Abbey Ale (2012)', 'Belgian', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chaka', 'Belgian', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'HGH (Home Grown Hops): Part Duh', 'Red Ale', 0.08, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Deviant Dale''s IPA', 'Double IPA', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'One Hit Wonder', 'Double IPA', 0.09, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'G''KNIGHT (12 oz.)', 'Double IPA', 0.087, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ten Fidy Imperial Stout', 'Imperial Stout', 0.099, 98, true, true),
      (gen_random_uuid(), v_brewery_id, 'GUBNA Imperial IPA', 'Double IPA', 0.099, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chub', 'Amber', 0.08, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gordon Ale (2009)', 'Double IPA', 0.087, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Oskar Blues Brewery (Lyons, CO) — 13 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Oskar Blues Brewery') AND LOWER(city) = LOWER('Lyons') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gordon (2005)', 'Double IPA', 0.092, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ten Fidy Imperial Stout (2008)', 'Imperial Stout', 0.095, 98, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ten Fidy Imperial Stout (2007)', 'Imperial Stout', 0.099, 98, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chub (2008)', 'Amber', 0.08, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chub (2004)', 'Amber', 0.08, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chub (2003)', 'Amber', 0.08, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2008)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2006)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2004)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2003)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale (2002)', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Leroy (2005)', 'Brown Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gordon Beer (2006)', 'Double IPA', 0.087, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Oskar Blues Brewery (North Carol... (Brevard, NC) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Oskar Blues Brewery (North Carol...') AND LOWER(city) = LOWER('Brevard') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'G''KNIGHT', 'Double IPA', 0.087, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ten Fidy', 'Imperial Stout', 0.099, 98, true, true),
      (gen_random_uuid(), v_brewery_id, 'Deviant Dale''s IPA', 'Double IPA', 0.08, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chub', 'Amber', 0.08, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dale''s Pale Ale', 'Pale Ale', 0.065, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Otter Creek Brewing (Middlebury, VT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Otter Creek Brewing') AND LOWER(city) = LOWER('Middlebury') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Fresh Slice White IPA', 'IPA', 0.055, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Otter Creek Brewing (Waterbury, VT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Otter Creek Brewing') AND LOWER(city) = LOWER('Waterbury') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Overgrown American Pale Ale', 'Pale Ale', 0.055, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ozark Beer Company (Rogers, AR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ozark Beer Company') AND LOWER(city) = LOWER('Rogers') AND state = 'AR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Ozark American Pale Ale', 'Pale Ale', 0.04, 39, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Palisade Brewing Company (Palisade, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Palisade Brewing Company') AND LOWER(city) = LOWER('Palisade') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hula Hoppie Session IPA', 'IPA', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dirty Hippie Dark Wheat', 'Lager', 0.053, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pateros Creek Brewing Company (Fort Collins, CO) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pateros Creek Brewing Company') AND LOWER(city) = LOWER('Fort Collins') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rustic Red', 'Red Ale', 0.052, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stimulator Pale Ale', 'Pale Ale', 0.053, 48, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Town Ale', 'Kölsch', 0.045, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Car 21', 'Amber', 0.044, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cache La Porter', 'Porter', 0.05, 24, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Payette Brewing Company (Garden City, ID) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Payette Brewing Company') AND LOWER(city) = LOWER('Garden City') AND state = 'ID'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rodeo Rye Pale Ale', 'Pale Ale', 0.042, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Outlaw IPA', 'IPA', 0.062, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'North Fork Lager', 'Lager', 0.044, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Payette Pale Ale', 'Pale Ale', 0.048, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mutton Buster', 'Brown Ale', 0.055, 25, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Peace Tree Brewing Company (Knoxville, IA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Peace Tree Brewing Company') AND LOWER(city) = LOWER('Knoxville') AND state = 'IA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Side Kick Kölsch', 'Kölsch', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Peak Organic Brewing Company (Portland, ME) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Peak Organic Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Fresh Cut Pilsner', 'Pilsner', 0.046, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Session Ale', 'Wheat', 0.05, 61, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pedernales Brewing Company (Fredericksburg, TX) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pedernales Brewing Company') AND LOWER(city) = LOWER('Fredericksburg') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lobo Lito', 'Lager', 0.04, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Robert Earl Keen Honey Pils', 'Pilsner', 0.05, 17, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── People's Brewing Company (Lafayette, IN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('People''s Brewing Company') AND LOWER(city) = LOWER('Lafayette') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mound Builder IPA', 'IPA', 0.065, 77, true, true),
      (gen_random_uuid(), v_brewery_id, 'Amazon Princess IPA', 'IPA', 0.062, 62, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmer''s Daughter Wheat', 'Wheat', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'People''s Pilsner', 'Pilsner', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Perrin Brewing Company (Comstock Park, MI) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Perrin Brewing Company') AND LOWER(city) = LOWER('Comstock Park') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hotbox Brown', 'Brown Ale', 0.055, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gold', 'Blonde Ale', 0.048, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black', 'American Black Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '98 Problems (Cuz A Hop Ain''t One)', 'IPA', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Veteran’s Pale Ale (VPA)', 'Pale Ale', 0.05, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grapefruit IPA', 'IPA', 0.05, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pete's Brewing Company (San Antonio, TX) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pete''s Brewing Company') AND LOWER(city) = LOWER('San Antonio') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pete''s ESP Lager (1998)', 'Lager', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pete''s Wicked Summer Brew (1995)', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pete''s Wicked Bohemian Pilsner (1997)', 'Pilsner', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pete''s Wicked Pale Ale (1997)', 'Pale Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pete''s Wicked Summer Brew (2002)', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pete''s Wicked Summer Brew (1997)', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pete''s Wicked Summer Brew (1996)', 'Wheat', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Petoskey Brewing (Petoskey, MI) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Petoskey Brewing') AND LOWER(city) = LOWER('Petoskey') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sparkle', 'Lager', 0.041, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'North 45 Amber Ale', 'Amber', 0.059, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Horny Monk', 'Belgian Dubbel', 0.069, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mind''s Eye PA', 'IPA', 0.067, 74, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Phoenix Ale Brewery (Phoenix, AZ) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Phoenix Ale Brewery') AND LOWER(city) = LOWER('Phoenix') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Camelback', 'IPA', 0.061, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pikes Peak Brewing Company (Monument, CO) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pikes Peak Brewing Company') AND LOWER(city) = LOWER('Monument') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Local 5 Pale Ale', 'Pale Ale', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Devils Head Red Ale', 'Amber', 0.073, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elephant Rock IPA', 'IPA', 0.07, 75, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pine Street Brewery (San Francisco, CA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pine Street Brewery') AND LOWER(city) = LOWER('San Francisco') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Black Bay Milk Stout', 'Milk Stout', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Atom Splitter Pale Ale', 'Pale Ale', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Piney River Brewing Company (Bucryus, MO) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Piney River Brewing Company') AND LOWER(city) = LOWER('Bucryus') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hot Date Ale', 'Amber', 0.06, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Masked Bandit IPA', 'American Black Ale', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sweet Potato Ale', 'Sour', 0.06, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Float Trip Ale', 'Blonde Ale', 0.045, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Tom Porter', 'Porter', 0.055, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black Walnut Wheat', 'Lager', 0.045, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'McKinney Eddy Amber Ale', 'Amber', 0.055, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Missouri Mule India Pale Ale', 'IPA', 0.07, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pipeworks Brewing Company (Chicago, IL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pipeworks Brewing Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blood of the Unicorn', 'Amber', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pisgah Brewing Company (Black Mountain, NC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pisgah Brewing Company') AND LOWER(city) = LOWER('Black Mountain') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'GreyBeard™ IPA', 'IPA', 0.069, 51, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pisgah Pale Ale', 'Pale Ale', 0.057, 31, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pizza Port Brewing Company (Carlsbad, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pizza Port Brewing Company') AND LOWER(city) = LOWER('Carlsbad') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'PONTO S.I.P.A.', 'IPA', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chronic Ale', 'Amber', 0.049, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Swami''s India Pale Ale', 'IPA', 0.068, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Platform Beer Company (Cleveland, OH) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Platform Beer Company') AND LOWER(city) = LOWER('Cleveland') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'New Cleveland Palesner', 'Pilsner', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pollyanna Brewing Company (Lemont, IL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pollyanna Brewing Company') AND LOWER(city) = LOWER('Lemont') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mazzie', 'Pale Ale', 0.054, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Portside Brewery (Cleveland, OH) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Portside Brewery') AND LOWER(city) = LOWER('Cleveland') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big Chuck Barleywine', 'Barleywine', 0.099, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Prescott Brewing Company (Prescott, AZ) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Prescott Brewing Company') AND LOWER(city) = LOWER('Prescott') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Ponderosa IPA', 'IPA', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Liquid Amber Ale', 'Amber', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pug Ryan's Brewery (Dillon, CO) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pug Ryan''s Brewery') AND LOWER(city) = LOWER('Dillon') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Morning Wood Wheat (Current)', 'Wheat', 0.059, 14, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hideout Helles', 'Helles', 0.069, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dead Eye Dunkel', 'Lager', 0.06, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Peacemaker Pilsner', 'Pilsner', 0.058, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Over the Rail Pale Ale', 'Pale Ale', 0.057, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pallavicini Pilsner (2009)', 'Pilsner', 0.058, 21, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Pyramid Breweries (Seattle, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Pyramid Breweries') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pyramid Hefeweizen (2011)', 'Hefeweizen', 0.052, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Haywire Hefeweizen (2010)', 'Hefeweizen', 0.052, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Quest Brewing Company (Greenville, SC) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Quest Brewing Company') AND LOWER(city) = LOWER('Greenville') AND state = 'SC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Golden Fleece', 'Belgian', 0.045, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Smoking Mirror', 'Porter', 0.055, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rahr & Sons Brewing Company (Fort Worth, TX) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rahr & Sons Brewing Company') AND LOWER(city) = LOWER('Fort Worth') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rahr''s Blonde', 'Helles', 0.046, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pride of Texas Pale Ale', 'Pale Ale', 0.058, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Real Ale Brewing Company (Blanco, TX) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Real Ale Brewing Company') AND LOWER(city) = LOWER('Blanco') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '18th Anniversary Gose', 'Gose', 0.044, 5, true, true),
      (gen_random_uuid(), v_brewery_id, 'White (2015)', 'Witbier', 0.046, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'BLAKKR', 'American Black Ale', 0.099, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Firemans #4 Blonde Ale (2013)', 'Blonde Ale', 0.051, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Sword Iron Swan Ale', 'Pale Ale', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hans'' Pils (2015)', 'Pilsner', 0.053, 52, true, true),
      (gen_random_uuid(), v_brewery_id, 'Four Squared (2015)', 'Blonde Ale', 0.06, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Firemans #4 Blonde Ale (2015)', 'Blonde Ale', 0.051, 21, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Red Hare Brewing Company (Marietta, GA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Red Hare Brewing Company') AND LOWER(city) = LOWER('Marietta') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Watership Brown Ale', 'Brown Ale', 0.072, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gangway IPA', 'IPA', 0.062, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Long Day Lager', 'Pilsner', 0.049, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Red Shedman Farm Brewery and Hop... (Mt. Airy, MD) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Red Shedman Farm Brewery and Hop...') AND LOWER(city) = LOWER('Mt. Airy') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Farmer''s Daughter Blonde', 'Blonde Ale', 0.051, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pump House IPA', 'IPA', 0.055, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Suicide Blonde IPA', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vanilla Porter', 'Porter', 0.047, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Honey Rye', 'Wheat', 0.058, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Redhook Brewery (Woodinville, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Redhook Brewery') AND LOWER(city) = LOWER('Woodinville') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Long Hammer IPA', 'IPA', 0.065, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'Copper Hook (2011)', 'Amber', 0.058, 27, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Refuge Brewery (Temecula, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Refuge Brewery') AND LOWER(city) = LOWER('Temecula') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blood Orange Wit', 'Witbier', 0.05, 16, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Renegade Brewing Company (Denver, CO) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Renegade Brewing Company') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Consilium', 'Pale Ale', 0.05, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hammer & Sickle', 'Imperial Stout', 0.09, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Redacted Rye IPA', 'IPA', 0.07, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Elevation Triple India Pale Ale', 'Double IPA', 0.099, 100, true, true),
      (gen_random_uuid(), v_brewery_id, '5:00 O''Clock Afternoon Ale', 'Blonde Ale', 0.05, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ryeteous Rye IPA (2012)', 'IPA', 0.07, 100, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Revolution Brewing (Paonia, CO) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Revolution Brewing') AND LOWER(city) = LOWER('Paonia') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Stout Ol'' Friend', 'Stout', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stout Ol'' Friend (2012)', 'Stout', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rye Porter', 'Porter', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Miner''s Gold', 'Blonde Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vienna Lager', 'Lager', 0.046, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jessie''s Garage', 'Pale Ale', 0.056, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Colorado Red Ale', 'Amber', 0.062, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Revolution Brewing Company (Chicago, IL) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Revolution Brewing Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Fist City', 'Pale Ale', 0.055, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'A Little Crazy', 'Belgian', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rosa Hibiscus Ale', 'Saison', 0.058, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fistmas Ale', 'Saison', 0.061, 31, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest Revolution', 'Oktoberfest', 0.057, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Eugene Porter', 'Porter', 0.068, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Anti-Hero IPA', 'IPA', 0.065, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bottom Up Belgian Wit', 'Witbier', 0.05, 14, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rhinegeist Brewery (Cincinnati, OH) — 8 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rhinegeist Brewery') AND LOWER(city) = LOWER('Cincinnati') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hustle', 'Amber', 0.057, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pure Fury', 'Pale Ale', 0.055, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dad', 'Amber', 0.06, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Panther', 'Porter', 0.058, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Franz', 'Oktoberfest', 0.052, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Zen', 'Pale Ale', 0.043, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Truth', 'IPA', 0.072, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cougar', 'Blonde Ale', 0.048, 25, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Right Brain Brewery (Traverse City, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Right Brain Brewery') AND LOWER(city) = LOWER('Traverse City') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Smooth Operator', 'Cream Ale', 0.038, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rising Tide Brewing Company (Portland, ME) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rising Tide Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Gose', 'Gose', 0.035, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Maine Island Trail Ale', 'Pale Ale', 0.043, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── River North Brewery (Denver, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('River North Brewery') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'River North White Ale', 'Witbier', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'River North Ale', 'Amber', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rivertown Brewing Company (Lockland, OH) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rivertown Brewing Company') AND LOWER(city) = LOWER('Lockland') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lil SIPA', 'IPA', 0.05, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Bomber Rye Pale Ale', 'Pale Ale', 0.055, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rivertowne Brewing Company (Export, PA) — 15 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rivertowne Brewing Company') AND LOWER(city) = LOWER('Export') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Jah Mon', 'IPA', 0.05, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest', 'Oktoberfest', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Headless Wylie', 'Amber', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dayman IPA', 'IPA', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'All Aboard! Anniversary Stout', 'Oatmeal Stout', 0.071, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Lace', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'OH-PA Session Pale Ale', 'Pale Ale', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Patrick''s Poison', 'Amber', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rudolph''s Red', 'Amber', 0.081, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Babbling Blonde', 'Blonde Ale', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Maxwell''s Scottish Ale', 'Amber', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grateful White', 'Witbier', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'RT Lager', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Wylie''s IPA', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hala Kahiki Pineapple Beer', 'Sour', 0.048, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Roanoke Railhouse Brewery (Roanoke, VA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Roanoke Railhouse Brewery') AND LOWER(city) = LOWER('Roanoke') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Track 1 Amber Lager', 'Lager', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rochester Mills Brewing Company (Rochester, MI) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rochester Mills Brewing Company') AND LOWER(city) = LOWER('Rochester') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pine Knob Pilsner', 'Pilsner', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cal and Co. Black Cherry Porter', 'Porter', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lazy Daze Lager', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rochester Red Ale', 'Amber', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Milkshake Stout', 'Milk Stout', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cornerstone IPA', 'IPA', 0.07, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Rogue Ales (Newport, OR) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Rogue Ales') AND LOWER(city) = LOWER('Newport') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rogue American Amber Ale', 'Amber', 0.051, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── RoughTail Brewing Company (Midwest City, OK) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('RoughTail Brewing Company') AND LOWER(city) = LOWER('Midwest City') AND state = 'OK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '12th Round', 'Red Ale', 0.076, 78, true, true),
      (gen_random_uuid(), v_brewery_id, 'RoughTail IPA', 'IPA', 0.07, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Polar Night Stout', 'Stout', 0.08, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Round Guys Brewing (Lansdale, PA) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Round Guys Brewing') AND LOWER(city) = LOWER('Lansdale') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sundown', 'Saison', 0.071, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sanctified', 'Belgian', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fear of a Brett Planet', 'Pale Ale', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Original Slacker Ale', 'Brown Ale', 0.056, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alpha Blackback', 'American Black Ale', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kiss Off IPA', 'IPA', 0.063, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dog Days Summer Ale', 'Kölsch', 0.045, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ruhstaller Beer Company (Sacramento, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ruhstaller Beer Company') AND LOWER(city) = LOWER('Sacramento') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '1881 California Red', 'Amber', 0.056, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'CAPT Black IPA', 'American Black Ale', 0.073, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ruhstaller''s Gilt Edge Lager Beer', 'Lager', 0.048, 42, true, true),
      (gen_random_uuid(), v_brewery_id, '1881 California Red Ale', 'Amber', 0.056, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Saint Archer Brewery (San Diego, CA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Saint Archer Brewery') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Saint Archer White Ale', 'Witbier', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saint Archer IPA', 'IPA', 0.068, 66, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saint Archer Pale Ale', 'Pale Ale', 0.052, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saint Archer Blonde', 'Kölsch', 0.048, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── SanTan Brewing Company (Chandler, AZ) — 19 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('SanTan Brewing Company') AND LOWER(city) = LOWER('Chandler') AND state = 'AZ'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sex Panther', 'Porter', 0.069, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Winter Warmer (Vault Series)', 'Amber', 0.095, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Count Hopula (Vault Series)', 'Double IPA', 0.091, 99, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest', 'Oktoberfest', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'SunSpot Golden Ale', 'Blonde Ale', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'I.W.A. (2011)', 'Wheat', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Supermonk I.P.A.', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Epicenter Amber Ale', 'Amber', 0.055, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'SanTan HefeWeizen', 'Hefeweizen', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Shock IPA', 'IPA', 0.07, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sex Panther (2014)', 'Porter', 0.069, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Devil’s Ale', 'Pale Ale', 0.055, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rail Slide Imperial Spiced Ale', 'Saison', 0.081, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mr. Pineapple', 'Sour', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Idiot Ale (2012)', 'Pale Ale', 0.055, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Shock IPA (2010)', 'IPA', 0.07, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'SanTan HefeWeizen (2010)', 'Hefeweizen', 0.05, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Devil’s Ale (2010)', 'Pale Ale', 0.055, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Epicenter Amber Ale (2010)', 'Amber', 0.055, 20, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sanitas Brewing Company (Boulder, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sanitas Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sanitas Saison Ale', 'Saison', 0.058, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sanitas Black IPA', 'American Black Ale', 0.068, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Santa Cruz Mountain Brewing (Santa Cruz, CA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Santa Cruz Mountain Brewing') AND LOWER(city) = LOWER('Santa Cruz') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Giant DIPA', 'Double IPA', 0.089, 88, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dread Brown Ale', 'Brown Ale', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Casinos IPA', 'IPA', 0.07, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Santa Fe Brewing Company (Santa Fe, NM) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Santa Fe Brewing Company') AND LOWER(city) = LOWER('Santa Fe') AND state = 'NM'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Saison 88', 'Saison', 0.055, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Black IPA', 'American Black Ale', 0.071, 95, true, true),
      (gen_random_uuid(), v_brewery_id, 'Santa Fe Irish Red Ale', 'Red Ale', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Santa Fe Oktoberfest', 'Oktoberfest', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Imperial Java Stout', 'Imperial Stout', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Freestyle Pilsner', 'Pilsner', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Happy Camper IPA', 'IPA', 0.066, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Saugatuck Brewing Company (Douglas, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Saugatuck Brewing Company') AND LOWER(city) = LOWER('Douglas') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Oval Beach Blonde Ale', 'Blonde Ale', 0.05, 11, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Schlafly Brewing Company (Saint Louis, MO) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Schlafly Brewing Company') AND LOWER(city) = LOWER('Saint Louis') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Schlafly Yakima Wheat Ale', 'Wheat', 0.05, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schlafly Black Lager', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schlafly IPA', 'IPA', 0.045, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schlafly American Brown Ale', 'Brown Ale', 0.05, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schlafly Hefeweizen', 'Hefeweizen', 0.041, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Schlafly Summer Lager', 'Helles', 0.045, 17, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sea Dog Brewing Company (Portland, ME) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sea Dog Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sea Dog Wild Blueberry Wheat Ale', 'Sour', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Seabright Brewery (Santa Cruz, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Seabright Brewery') AND LOWER(city) = LOWER('Santa Cruz') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blur India Pale Ale', 'IPA', 0.074, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Seven Brides Brewery (Silverton, OR) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Seven Brides Brewery') AND LOWER(city) = LOWER('Silverton') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Frankenlou''s IPA', 'IPA', 0.07, 105, true, true),
      (gen_random_uuid(), v_brewery_id, 'Becky''s Black Cat Porter', 'Porter', 0.07, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Seventh Son Brewing Company (Columbus, OH) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Seventh Son Brewing Company') AND LOWER(city) = LOWER('Columbus') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Seventh Son of a Seventh Son', 'Red Ale', 0.077, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stone Fort Brown Ale', 'Brown Ale', 0.053, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Seventh Son Hopped Red Ale', 'Amber', 0.077, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Humulus Nimbus Super Pale Ale', 'Pale Ale', 0.06, 53, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden Ratio IPA', 'IPA', 0.07, 68, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Shebeen Brewing Company (Wolcott, CT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Shebeen Brewing Company') AND LOWER(city) = LOWER('Wolcott') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Black Hop IPA', 'American Black Ale', 0.068, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sherwood Forest Brewers (Marlborough, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sherwood Forest Brewers') AND LOWER(city) = LOWER('Marlborough') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Archer''s Ale (2004)', 'Pale Ale', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Shipyard Brewing Company (Portland, ME) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Shipyard Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Monkey Fist IPA', 'IPA', 0.069, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shipyard Summer Ale', 'Wheat', 0.051, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpkinhead Ale', 'Amber', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Shipyard Export', 'Blonde Ale', 0.051, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sierra Nevada Brewing Company (Chico, CA) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sierra Nevada Brewing Company') AND LOWER(city) = LOWER('Chico') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Nooner', 'Pilsner', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Torpedo', 'IPA', 0.072, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yonder Bock', 'Maibock / Helles Bock', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'CANfusion Rye Bock', 'Wheat', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sierra Nevada Pale Ale', 'Pale Ale', 0.056, 37, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Chico Crystal Wheat', 'Wheat', 0.048, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summerfest', 'Pilsner', 0.05, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Silverton Brewery (Silverton, CO) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Silverton Brewery') AND LOWER(city) = LOWER('Silverton') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bear Ass Brown', 'Brown Ale', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Red Mountain Ale', 'Amber', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ice Pick Ale', 'IPA', 0.068, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sixpoint Craft Ales (Brooklyn, NY) — 24 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sixpoint Craft Ales') AND LOWER(city) = LOWER('Brooklyn') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '4Beans', 'Baltic Porter', 0.1, 52, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jammer', 'Gose', 0.042, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abigale', 'Belgian', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rad', 'Sour', 0.032, 7, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bengali', 'IPA', 0.065, 62, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sensi Harvest', 'Pale Ale', 0.047, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hi-Res', 'Double IPA', 0.099, 111, true, true),
      (gen_random_uuid(), v_brewery_id, 'Global Warmer', 'Red Ale', 0.07, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Autumnation (2013)', 'IPA', 0.067, 74, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Crisp', 'Pilsner', 0.054, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sweet Action', 'Cream Ale', 0.052, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Righteous Ale', 'Wheat', 0.063, 57, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bengali Tiger', 'IPA', 0.064, 62, true, true),
      (gen_random_uuid(), v_brewery_id, '3Beans', 'Baltic Porter', 0.099, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brownstone', 'Brown Ale', 0.059, 47, true, true),
      (gen_random_uuid(), v_brewery_id, 'Apollo', 'Wheat', 0.052, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Harbinger', 'Saison', 0.049, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Resin', 'Double IPA', 0.091, 103, true, true),
      (gen_random_uuid(), v_brewery_id, 'Diesel', 'Stout', 0.063, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Autumnation (2011-12) (2011)', 'Amber', 0.06, 48, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Crisp (2011)', 'Pilsner', 0.054, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sweet Action (2011)', 'Cream Ale', 0.052, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Righteous Ale (2011)', 'Wheat', 0.063, 57, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bengali Tiger (2011)', 'IPA', 0.064, 62, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ska Brewing Company (Durango, CO) — 11 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ska Brewing Company') AND LOWER(city) = LOWER('Durango') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rudie Session IPA', 'IPA', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Taster''s Choice', 'Lager', 0.074, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Modus Hoperandi', 'IPA', 0.068, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Estival Cream Stout', 'Stout', 0.058, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vernal Minthe Stout', 'Stout', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hibernal Vinifera Stout', 'Stout', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Autumnal Molé Stout', 'Stout', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mexican Logger', 'Lager', 0.042, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'True Blonde Ale', 'Blonde Ale', 0.053, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Euphoria Pale Ale', 'Pale Ale', 0.061, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'ESB Special Ale', 'Amber', 0.057, 58, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Slanted Rock Brewing Company (Meridian, ID) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Slanted Rock Brewing Company') AND LOWER(city) = LOWER('Meridian') AND state = 'ID'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Iron Butt Red Ale', 'Amber', 0.058, 39, true, true),
      (gen_random_uuid(), v_brewery_id, 'Initial Point India Pale Ale', 'IPA', 0.071, 92, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── SlapShot Brewing Company (Chicago, IL) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('SlapShot Brewing Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Monkey Dancing On A Razor Blade', 'IPA', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tripel Deke', 'Belgian Tripel', 0.082, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sleeping Lady Brewing Company (Anchorage, AK) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sleeping Lady Brewing Company') AND LOWER(city) = LOWER('Anchorage') AND state = 'AK'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Urban Wilderness Pale Ale', 'Pale Ale', 0.049, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sly Fox Brewing Company (Phoenixville, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sly Fox Brewing Company') AND LOWER(city) = LOWER('Phoenixville') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Homefront IPA', 'IPA', 0.06, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sly Fox Brewing Company (Pottstown, PA) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sly Fox Brewing Company') AND LOWER(city) = LOWER('Pottstown') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sly Fox Christmas Ale 2013', 'Amber', 0.055, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grisette', 'Grisette', 0.056, 25, true, true),
      (gen_random_uuid(), v_brewery_id, '360° India Pale Ale', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Helles Golden Lager', 'Helles', 0.049, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sly Fox Christmas Ale 2012 (2012)', 'Amber', 0.055, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Odyssey Imperial IPA', 'Double IPA', 0.084, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oktoberfest Lager', 'Oktoberfest', 0.058, 25, true, true),
      (gen_random_uuid(), v_brewery_id, '113 IPA', 'IPA', 0.07, 113, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dunkel Lager', 'Lager', 0.053, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Royal Weisse Ale', 'Hefeweizen', 0.056, 11, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pikeland Pils', 'Pilsner', 0.049, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'Phoenix Pale Ale', 'Pale Ale', 0.051, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Smartmouth Brewing Company (Norfolk, VA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Smartmouth Brewing Company') AND LOWER(city) = LOWER('Norfolk') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Rule G IPA', 'IPA', 0.07, 88, true, true),
      (gen_random_uuid(), v_brewery_id, 'Murphy''s Law', 'Amber', 0.058, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alter Ego', 'Saison', 0.062, 33, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Snake River Brewing Company (Jackson, WY) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Snake River Brewing Company') AND LOWER(city) = LOWER('Jackson') AND state = 'WY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Monarch Pilsner', 'Pilsner', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snow King Pale Ale', 'Pale Ale', 0.06, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Zonker Stout', 'Stout', 0.054, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'OB-1 Organic Ale', 'Brown Ale', 0.05, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snake River Lager', 'Lager', 0.05, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Snake River Pale Ale', 'Pale Ale', 0.052, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pako’s EyePA', 'IPA', 0.068, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sockeye Brewing Company (Boise, ID) — 15 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sockeye Brewing Company') AND LOWER(city) = LOWER('Boise') AND state = 'ID'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Thanksgiving Ale', 'Kölsch', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Dagger Imperial IPA', 'Double IPA', 0.092, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dagger Falls IPA', 'IPA', 0.063, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Socktoberfest', 'Oktoberfest', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopnoxious Imperial IPA', 'Double IPA', 0.079, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Barrel Aged Seven Devils Imperial Stout', 'Imperial Stout', 0.099, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Boise Co-Op Two Score Ale', 'Saison', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sockeye Belgian Style Summer Ale', 'Witbier', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sockeye Maibock', 'Maibock / Helles Bock', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Devil''s Tooth', 'Barleywine', 0.099, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Galena Golden', 'Blonde Ale', 0.043, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hell-Diver Pale Ale', 'Pale Ale', 0.052, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Woolybugger Wheat', 'Wheat', 0.046, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Power House Porter', 'Porter', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Winterfest', 'Red Ale', 0.084, 90, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── South Austin Brewery (South Austin, TX) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('South Austin Brewery') AND LOWER(city) = LOWER('South Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'LuckenBock', 'Lager', 0.07, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Texas Pale Ale (TPA)', 'IPA', 0.055, 40, true, true),
      (gen_random_uuid(), v_brewery_id, '6 String Saison', 'Saison', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kol'' Beer', 'Kölsch', 0.05, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Southampton Publick House (Southampton, NY) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Southampton Publick House') AND LOWER(city) = LOWER('Southampton') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Montauk Light', 'Lager', 0.035, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Southern Oregon Brewing Company (Medford, OR) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Southern Oregon Brewing Company') AND LOWER(city) = LOWER('Medford') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Na Zdraví Pilsner', 'Pilsner', 0.048, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nice Rack IPA', 'IPA', 0.055, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Southern Prohibition Brewing Com... (Hattiesburg, MS) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Southern Prohibition Brewing Com...') AND LOWER(city) = LOWER('Hattiesburg') AND state = 'MS'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '2014 IPA Cicada Series', 'IPA', 0.075, 72, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sinister Minister Black IPA', 'IPA', 0.077, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jack the Sipper', 'Amber', 0.053, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Devil''s Harvest Extra Pale Ale', 'Pale Ale', 0.058, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Suzy B Dirty Blonde Ale', 'Blonde Ale', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mississippi Fire Ant', 'Amber', 0.08, 80, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hipster Breakfast', 'Oatmeal Stout', 0.058, 40, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Southern Star Brewing Company (Conroe, TX) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Southern Star Brewing Company') AND LOWER(city) = LOWER('Conroe') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pine Belt Pale Ale', 'Pale Ale', 0.065, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Walloon', 'Saison', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Le Mort Vivant', 'Saison', 0.069, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Red Cockaded Ale', 'Double IPA', 0.085, 110, true, true),
      (gen_random_uuid(), v_brewery_id, 'Valkyrie Double IPA', 'Double IPA', 0.092, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Red Cockaded Ale (2013)', 'Double IPA', 0.085, 110, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Potentate', 'Brown Ale', 0.072, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bombshell Blonde', 'Blonde Ale', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'PRO-AM (2012) (2012)', 'Double IPA', 0.099, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Walloon (2014)', 'Saison', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Le Mort Vivant (2011)', 'Saison', 0.069, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Buried Hatchet Stout', 'Stout', 0.083, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Speakasy Ales & Lagers (San Francisco, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Speakasy Ales & Lagers') AND LOWER(city) = LOWER('San Francisco') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Baby Daddy Session IPA', 'IPA', 0.047, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Spilker Ales (Cortland, NE) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Spilker Ales') AND LOWER(city) = LOWER('Cortland') AND state = 'NE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hopluia (2004)', 'IPA', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Spiteful Brewing Company (Chicago, IL) — 11 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Spiteful Brewing Company') AND LOWER(city) = LOWER('Chicago') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Ball & Chain (2014)', 'Pale Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bitter Biker Double IPA', 'Double IPA', 0.096, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'God Damn Pigeon Porter', 'Porter', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Working for the Weekend', 'Double IPA', 0.079, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Angry Adam', 'Amber', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Freedom Fries', 'Stout', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ghost Bike Pale Ale', 'Pale Ale', 0.073, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Spiteful IPA', 'IPA', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alley Time', 'Pale Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fat Badger', 'Red Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'In the Weeds', 'Wheat', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sprecher Brewing Company (Glendale, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sprecher Brewing Company') AND LOWER(city) = LOWER('Glendale') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Special Amber', 'Lager', 0.05, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Spring House Brewing Company (Conestoga, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Spring House Brewing Company') AND LOWER(city) = LOWER('Conestoga') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Seven Gates Pale Ale', 'Pale Ale', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Starr Hill Brewery (Crozet, VA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Starr Hill Brewery') AND LOWER(city) = LOWER('Crozet') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Starr Pils', 'Pilsner', 0.042, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Northern Lights India Pale Ale', 'IPA', 0.065, 52, true, true),
      (gen_random_uuid(), v_brewery_id, 'Festie', 'Oktoberfest', 0.048, 12, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Steamworks Brewing Company (Durango, CO) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Steamworks Brewing Company') AND LOWER(city) = LOWER('Durango') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Third Eye Enlightened Pale Ale', 'Pale Ale', 0.065, 65, true, true),
      (gen_random_uuid(), v_brewery_id, 'Colorado Kölsch', 'Kölsch', 0.049, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Steam Engine Lager', 'Lager', 0.057, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Third Eye Pale Ale', 'IPA', 0.065, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Stevens Point Brewery (Stevens Point, WI) — 18 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Stevens Point Brewery') AND LOWER(city) = LOWER('Stevens Point') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Point Special (Current)', 'Lager', 0.047, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Special', 'Lager', 0.047, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Cascade Pale Ale (2013)', 'Pale Ale', 0.054, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Onyx Black Ale', 'American Black Ale', 0.052, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beyond The Pale IPA', 'IPA', 0.063, 64, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Special (2013)', 'Lager', 0.047, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Special (2012)', 'Lager', 0.047, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Special Lager', 'Lager', 0.047, 9, true, true),
      (gen_random_uuid(), v_brewery_id, 'St. Benedict''s Winter Ale', 'Amber', 0.062, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Oktoberfest', 'Oktoberfest', 0.057, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Nude Beach Summer Wheat', 'Wheat', 0.052, 7, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Nude Beach Summer Wheat (2011)', 'Wheat', 0.05, 7, true, true),
      (gen_random_uuid(), v_brewery_id, 'Drop Dead Blonde', 'Blonde Ale', 0.035, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Three Kings Ale', 'Kölsch', 0.049, 13, true, true),
      (gen_random_uuid(), v_brewery_id, '2012 Black Ale', 'Brown Ale', 0.054, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Nude Beach Summer Wheat (2010)', 'Wheat', 0.05, 7, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Cascade Pale Ale', 'Pale Ale', 0.054, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Point Amber Classic', 'Lager', 0.047, 14, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Stillmank Beer Company (Green Bay, WI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Stillmank Beer Company') AND LOWER(city) = LOWER('Green Bay') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wisco Disco', 'Amber', 0.051, 31, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Stillwater Artisanal Ales (Baltimore, MD) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Stillwater Artisanal Ales') AND LOWER(city) = LOWER('Baltimore') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Brontide', 'American Black Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Classique', 'Saison', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Stone Coast Brewing Company (Portland, ME) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Stone Coast Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'ME'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sunsplash Golden Ale (2004)', 'Blonde Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Straight to Ale (Huntsville, AL) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Straight to Ale') AND LOWER(city) = LOWER('Huntsville') AND state = 'AL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Sand Island Lighthouse', 'Kölsch', 0.051, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lily Flagg Milk Stout', 'Milk Stout', 0.05, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Monkeynaut IPA', 'IPA', 0.072, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Straub Brewery (St Mary's, PA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Straub Brewery') AND LOWER(city) = LOWER('St Mary''s') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Straub Beer (Current)', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Lager', 'Lager', 0.041, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Amber', 'Lager', 0.041, 8, true, true),
      (gen_random_uuid(), v_brewery_id, 'American Light', 'Lager', 0.032, 13, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Summit Brewing Company (St Paul, MN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Summit Brewing Company') AND LOWER(city) = LOWER('St Paul') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Extra Pale Ale', 'Pale Ale', 0.053, 49, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Summit Brewing Company (St. Paul, MN) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Summit Brewing Company') AND LOWER(city) = LOWER('St. Paul') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Make It So', 'Amber', 0.053, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hopvale Organic Ale', 'Pale Ale', 0.047, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Unchained #18 Hop Silo', 'Double IPA', 0.083, 100, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sun King Brewing Company (Indianapolis, IN) — 38 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sun King Brewing Company') AND LOWER(city) = LOWER('Indianapolis') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tip Off', 'Amber', 0.052, 29, true, true),
      (gen_random_uuid(), v_brewery_id, 'Java Mac', 'Amber', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cowbell', 'Porter', 0.054, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Up Offa That Brett (2014)', 'Belgian', 0.058, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'PV Muckle (2013)', 'Red Ale', 0.083, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon Barrel Batch 666: Sympathy for the Devil', 'Belgian', 0.099, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Whip Fight', 'Red Ale', 0.09, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Port Barrel Wee Mac', 'Red Ale', 0.053, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fistful Of Hops Red', 'IPA', 0.064, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fistful of Hops Orange', 'IPA', 0.063, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fistful Of Hops Blue', 'IPA', 0.064, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fistful of Hops Green', 'IPA', 0.064, 75, true, true),
      (gen_random_uuid(), v_brewery_id, '30 Min Coma', 'IPA', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wee Muckle', 'Red Ale', 0.09, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Royal Brat', 'Amber', 0.065, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grapefruit Jungle (GFJ)', 'IPA', 0.075, 77, true, true),
      (gen_random_uuid(), v_brewery_id, 'Osiris Pale Ale', 'Pale Ale', 0.056, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon Barrel Aged Timmie', 'Imperial Stout', 0.099, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stupid Sexy Flanders', 'Sour', 0.063, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon Barrel Cowbell', 'Porter', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Popcorn Pilsner', 'Pilsner', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ring of Dingle', 'Dry Stout', 0.071, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon Barrel Wee Mac', 'Amber', 0.054, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bourbon Barrel Johan', 'English Barleywine', 0.099, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Deuce', 'Brown Ale', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Velvet Fog', 'Quadrupel (Quad)', 0.09, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sun King Oktoberfest', 'Oktoberfest', 0.055, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Indianapolis Indians Lager', 'Lager', 0.052, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Indians Victory Lager (2012)', 'Lager', 0.052, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chaka', 'Belgian', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Isis', 'Double IPA', 0.091, 91, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wee Muckle (2011)', 'Red Ale', 0.09, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grapefruit Jungle (GFJ) (2011)', 'IPA', 0.075, 77, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sun King Oktoberfest (2011)', 'Oktoberfest', 0.055, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Johan the Barleywine', 'English Barleywine', 0.099, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wee Mac Scottish-Style Ale', 'Amber', 0.054, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunlight Cream Ale', 'Cream Ale', 0.053, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Osiris Pale Ale (2010)', 'Pale Ale', 0.056, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Sunken City Brewing Company (Hardy, VA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Sunken City Brewing Company') AND LOWER(city) = LOWER('Hardy') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dam Lager', 'Lager', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Red Clay IPA', 'IPA', 0.07, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Surly Brewing Company (Brooklyn Center, MN) — 13 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Surly Brewing Company') AND LOWER(city) = LOWER('Brooklyn Center') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Todd the Axe Man', 'IPA', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Doomtree', 'Amber', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'BLAKKR', 'American Black Ale', 0.099, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Overrated! West Coast Style IPA', 'IPA', 0.073, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'WET', 'IPA', 0.075, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bitter Brewer', 'Amber', 0.04, 37, true, true),
      (gen_random_uuid(), v_brewery_id, 'SurlyFest', 'Wheat', 0.055, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Coffee Bender', 'Brown Ale', 0.051, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bender', 'Brown Ale', 0.051, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Abrasive Ale', 'Double IPA', 0.097, 120, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hell', 'Keller Bier / Zwickel Bier', 0.051, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'CynicAle', 'Saison', 0.067, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Furious', 'IPA', 0.062, 99, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Swamp Head Brewery (Gainesville, FL) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Swamp Head Brewery') AND LOWER(city) = LOWER('Gainesville') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big Nose', 'IPA', 0.073, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cotton Mouth', 'Witbier', 0.05, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Stump Knocker Pale Ale', 'Pale Ale', 0.056, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Midnight Oil', 'Oatmeal Stout', 0.05, 38, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wild Night', 'Cream Ale', 0.059, 18, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Swashbuckler Brewing Company (Manheim, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Swashbuckler Brewing Company') AND LOWER(city) = LOWER('Manheim') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bermuda Triangle Ginger Beer', 'Saison', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── SweetWater Brewing Company (Atlanta, GA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('SweetWater Brewing Company') AND LOWER(city) = LOWER('Atlanta') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Take Two Pils', 'Pilsner', 0.055, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Waterkeeper', 'Hefeweizen', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'SweetWater IPA', 'IPA', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '420 Extra Pale Ale', 'Pale Ale', 0.054, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── TailGate Beer (San Diego, CA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('TailGate Beer') AND LOWER(city) = LOWER('San Diego') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Dodgy Knight Imperial IPA', 'Double IPA', 0.08, 95, true, true),
      (gen_random_uuid(), v_brewery_id, 'TailGate Saison', 'Saison', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'TailGate IPA', 'IPA', 0.05, 44, true, true),
      (gen_random_uuid(), v_brewery_id, 'TailGate Hefeweizen', 'Hefeweizen', 0.049, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blacktop Blonde', 'Blonde Ale', 0.05, 19, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tallgrass Brewing Company (Manhattan, KS) — 17 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tallgrass Brewing Company') AND LOWER(city) = LOWER('Manhattan') AND state = 'KS'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wooden Rooster', 'Belgian Tripel', 0.085, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ginger Peach Saison', 'Saison', 0.048, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Zombie Monkie', 'Porter', 0.062, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wild Plum Farmhouse Ale', 'Saison', 0.056, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Vanilla Bean Buffalo Sweat', 'Oatmeal Stout', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ethos IPA', 'IPA', 0.068, 110, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tallgrass Pub Ale', 'Brown Ale', 0.044, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oasis', 'Amber', 0.072, 93, true, true),
      (gen_random_uuid(), v_brewery_id, 'Buffalo Sweat', 'Milk Stout', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Halcyon Unfiltered Wheat', 'Wheat', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, '8-Bit Pale Ale', 'Pale Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Velvet Rooster', 'Belgian Tripel', 0.085, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Köld Lager (2010)', 'Pilsner', 0.05, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Oasis (2010)', 'Double IPA', 0.072, 93, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tallgrass Ale', 'Brown Ale', 0.044, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Buffalo Sweat (2010)', 'Milk Stout', 0.05, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tallgrass IPA', 'IPA', 0.063, 60, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tamarack Brewing Company (Lakeside, MT) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tamarack Brewing Company') AND LOWER(city) = LOWER('Lakeside') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hat Trick Hop IPA', 'IPA', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yard Sale Amber Ale', 'Amber', 0.056, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tampa Bay Brewing Company (Tampa, FL) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tampa Bay Brewing Company') AND LOWER(city) = LOWER('Tampa') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Loafin Bräu', 'Amber', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Elephant Foot IPA', 'IPA', 0.07, 80, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tapistry Brewing (Bridgman, MI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tapistry Brewing') AND LOWER(city) = LOWER('Bridgman') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Peck''s Porter', 'Porter', 0.065, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Reactor', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Mr. Orange', 'Witbier', 0.057, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Taxman Brewing Company (Bargersville, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Taxman Brewing Company') AND LOWER(city) = LOWER('Bargersville') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Deduction', 'Belgian Dubbel', 0.08, 22, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Telluride Brewing Company (Telluride, CO) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Telluride Brewing Company') AND LOWER(city) = LOWER('Telluride') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Face Down Brown Ale', 'Brown Ale', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tempter IPA', 'IPA', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bridal Veil Rye Pale Ale', 'Pale Ale', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Temperance Beer Company (Evanston, IL) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Temperance Beer Company') AND LOWER(city) = LOWER('Evanston') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Smittytown', 'Amber', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Greenwood Beach', 'Sour', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gatecrasher', 'IPA', 0.066, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Terrapin Brewing Company (Athens, GA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Terrapin Brewing Company') AND LOWER(city) = LOWER('Athens') AND state = 'GA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'RecreationAle', 'Pale Ale', 0.047, 42, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Texian Brewing Co. (Richmond, TX) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Texian Brewing Co.') AND LOWER(city) = LOWER('Richmond') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'First Stand', 'Saison', 0.055, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Battle LIne', 'Brown Ale', 0.063, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Broken Bridge', 'Dunkel', 0.056, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Brutus', 'IPA', 0.071, 69, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Alchemist (Waterbury, VT) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Alchemist') AND LOWER(city) = LOWER('Waterbury') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Petit Mutant', 'Wild Ale', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'The Crusher', 'Double IPA', 0.096, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Beelzebub', 'Imperial Stout', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Focal Banger', 'IPA', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Heady Topper', 'Double IPA', 0.08, 120, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Black Tooth Brewing Company (Sheridan, WY) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Black Tooth Brewing Company') AND LOWER(city) = LOWER('Sheridan') AND state = 'WY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bomber Mountain Amber Ale (2013)', 'Amber', 0.046, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Indian Paintbrush IPA', 'IPA', 0.07, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Saddle Bronc Brown Ale (2013)', 'Brown Ale', 0.048, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wagon Box Wheat Beer', 'Wheat', 0.059, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Brewer's Art (Baltimore, MD) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Brewer''s Art') AND LOWER(city) = LOWER('Baltimore') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Birdhouse Pale Ale', 'Belgian', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ozzy', 'Belgian', 0.073, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Resurrection', 'Belgian Dubbel', 0.07, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Bronx Brewery (Bronx, NY) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Bronx Brewery') AND LOWER(city) = LOWER('Bronx') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Bronx Summer Pale Ale', 'Pale Ale', 0.052, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bronx Black Pale Ale', 'American Black Ale', 0.057, 46, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bronx Pale Ale', 'Pale Ale', 0.063, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Dudes' Brewing Company (Torrance, CA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Dudes'' Brewing Company') AND LOWER(city) = LOWER('Torrance') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Surfrider', 'Pale Ale', 0.052, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Kolschtal Eddy', 'Kölsch', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'South Bay Session IPA', 'IPA', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Grandma''s Pecan', 'Brown Ale', 0.069, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'Double Trunk', 'Double IPA', 0.099, 101, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Just Beer Project (Burlington, VT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Just Beer Project') AND LOWER(city) = LOWER('Burlington') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Just IPA', 'IPA', 0.046, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Lion Brewery (Wilkes-Barre, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Lion Brewery') AND LOWER(city) = LOWER('Wilkes-Barre') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lionshead', 'Pilsner', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Manhattan Brewing Company (New York, NY) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Manhattan Brewing Company') AND LOWER(city) = LOWER('New York') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Manhattan Gold Lager (1990)', 'Lager', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Mitten Brewing Company (Grand Rapids, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Mitten Brewing Company') AND LOWER(city) = LOWER('Grand Rapids') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'G. B. Russo’s Italian Pistachio Pale Ale', 'Pale Ale', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Right Brain Brewery (Traverse City, MI) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Right Brain Brewery') AND LOWER(city) = LOWER('Traverse City') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Northern Hawk Owl Amber', 'Amber', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'CEO Stout', 'Stout', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Will Power Pale Ale', 'Pale Ale', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── The Traveler Beer Company (Burlington, VT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('The Traveler Beer Company') AND LOWER(city) = LOWER('Burlington') AND state = 'VT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Curious Traveler Shandy', 'Lager', 0.044, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Third Street Brewhouse (Cold Spring, MN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Third Street Brewhouse') AND LOWER(city) = LOWER('Cold Spring') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hunny Do Wheat', 'Wheat', 0.048, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Three Way Pale Ale', 'Pale Ale', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rise to the Top', 'Cream Ale', 0.041, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lost Trout Brown Ale', 'Brown Ale', 0.049, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Thomas Hooker Brewing Company (Bloomfield, CT) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Thomas Hooker Brewing Company') AND LOWER(city) = LOWER('Bloomfield') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Watermelon Ale', 'Sour', 0.051, 11, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Three Creeks Brewing (Sisters, OR) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Three Creeks Brewing') AND LOWER(city) = LOWER('Sisters') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Knotty Blonde Ale', 'Blonde Ale', 0.04, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Fivepine Chocolate Porter', 'Porter', 0.062, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hoodoo Voodoo IPA', 'IPA', 0.062, 82, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Three Notch'd Brewing Company (Charlottesville, VA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Three Notch''d Brewing Company') AND LOWER(city) = LOWER('Charlottesville') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hydraulion Red', 'Red Ale', 0.053, 22, true, true),
      (gen_random_uuid(), v_brewery_id, '40 Mile IPA', 'IPA', 0.06, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Three Pints Brewing (Martinsville, IN) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Three Pints Brewing') AND LOWER(city) = LOWER('Martinsville') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Citra Faced', 'Wheat', 0.055, 64, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pole Barn Stout', 'Oatmeal Stout', 0.055, 31, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pale', 'Pale Ale', 0.054, 37, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yoshi''s Nectar', 'Lager', 0.053, 27, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Thunderhead Brewing Company (Kearney, NE) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Thunderhead Brewing Company') AND LOWER(city) = LOWER('Kearney') AND state = 'NE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Leatherhead Red', 'Amber', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cropduster Mid-American IPA', 'IPA', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cornstalker Dark Wheat', 'Lager', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tin Man Brewing Company (Evansville, IN) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tin Man Brewing Company') AND LOWER(city) = LOWER('Evansville') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cafe Leche', 'Porter', 0.058, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Damascene Apricot Sour', 'Sour', 0.052, 12, true, true),
      (gen_random_uuid(), v_brewery_id, 'Csar', 'Imperial Stout', 0.12, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Klingon Warnog Roggen Dunkel', 'Roggenbier', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Overlord Imperial IPA', 'Double IPA', 0.085, 115, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alloy', 'IPA', 0.058, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rivet Irish Red Ale', 'Red Ale', 0.051, 22, true, true),
      (gen_random_uuid(), v_brewery_id, '3 Gear Robust Porter', 'Porter', 0.052, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Circuit Bohemian Pilsner', 'Pilsner', 0.045, 35, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tin Roof Brewing Company (Baton Rouge, LA) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tin Roof Brewing Company') AND LOWER(city) = LOWER('Baton Rouge') AND state = 'LA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Turnrow Harvest Ale', 'Blonde Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Juke Joint IPA', 'IPA', 0.07, 60, true, true),
      (gen_random_uuid(), v_brewery_id, 'Parade Ground Coffee Porter', 'Porter', 0.07, 35, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tin Roof Watermelon Wheat', 'Sour', 0.05, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tin Roof Blonde Ale', 'Blonde Ale', 0.045, 18, true, true),
      (gen_random_uuid(), v_brewery_id, 'Voodoo Bengal Pale Ale', 'Pale Ale', 0.055, 37, true, true),
      (gen_random_uuid(), v_brewery_id, 'Perfect Tin Amber', 'Amber', 0.045, 28, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tommyknocker Brewery (Idaho Springs, CO) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tommyknocker Brewery') AND LOWER(city) = LOWER('Idaho Springs') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'IPA & a Half', 'IPA', 0.073, 87, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ornery Amber Lager (2003)', 'Lager', 0.055, 33, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tonka Beer Company (Minnetonka, MN) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tonka Beer Company') AND LOWER(city) = LOWER('Minnetonka') AND state = 'MN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Big Island Shandy', 'Lager', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Preservation IPA', 'IPA', 0.068, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tractor Brewing Company (Albuquerque, NM) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tractor Brewing Company') AND LOWER(city) = LOWER('Albuquerque') AND state = 'NM'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Almanac IPA', 'IPA', 0.062, 72, true, true),
      (gen_random_uuid(), v_brewery_id, 'Milk Mustachio Stout', 'Milk Stout', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Farmer''s Tan Red Ale', 'Amber', 0.06, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Triangle Brewing Company (Durham, NC) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Triangle Brewing Company') AND LOWER(city) = LOWER('Durham') AND state = 'NC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Triangle India Pale Ale', 'IPA', 0.057, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Triangle White Ale', 'Witbier', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Triangle Belgian Golden Ale', 'Belgian', 0.08, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Tröegs Brewing Company (Hershey, PA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Tröegs Brewing Company') AND LOWER(city) = LOWER('Hershey') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Troegenator', 'Lager', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Nugget Nectar', 'Amber', 0.075, 93, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sunshine Pils', 'Pilsner', 0.045, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Troegenator Doublebock', 'Lager', 0.082, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Perpetual IPA', 'IPA', 0.075, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Twin Lakes Brewing Company (Greenville, DE) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Twin Lakes Brewing Company') AND LOWER(city) = LOWER('Greenville') AND state = 'DE'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Greenville Pale Ale', 'Pale Ale', 0.055, 52, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Twisted Pine Brewing Company (Boulder, CO) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Twisted Pine Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hoppy Boy', 'IPA', 0.062, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Twisted X Brewing Company (Dripping Springs, TX) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Twisted X Brewing Company') AND LOWER(city) = LOWER('Dripping Springs') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Cow Creek', 'Lager', 0.054, 26, true, true),
      (gen_random_uuid(), v_brewery_id, 'Chupahopra', 'IPA', 0.075, 63, true, true),
      (gen_random_uuid(), v_brewery_id, 'Twisted X', 'Lager', 0.051, 19, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Two Beers Brewing Company (Seattle, WA) — 12 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Two Beers Brewing Company') AND LOWER(city) = LOWER('Seattle') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Day Hike Session', 'IPA', 0.041, 41, true, true),
      (gen_random_uuid(), v_brewery_id, 'Trailhead ISA', 'IPA', 0.048, 48, true, true),
      (gen_random_uuid(), v_brewery_id, 'Immersion Amber', 'Amber', 0.052, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Evo IPA', 'IPA', 0.062, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Presidential Pils', 'Pilsner', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Evolutionary IPA (2012)', 'IPA', 0.062, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Persnickety Pale', 'Pale Ale', 0.057, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'SoDo Brown Ale', 'Brown Ale', 0.054, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Immersion Amber Ale (2011)', 'Amber', 0.052, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Evolutionary IPA (2011)', 'IPA', 0.062, 70, true, true),
      (gen_random_uuid(), v_brewery_id, 'Trailhead India Style Session Ale (2011)', 'IPA', 0.048, 48, true, true),
      (gen_random_uuid(), v_brewery_id, 'Panorama Wheat Ale', 'Wheat', 0.046, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Two Brothers Brewing Company (Warrenville, IL) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Two Brothers Brewing Company') AND LOWER(city) = LOWER('Warrenville') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wobble', 'IPA', 0.063, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Night Cat', 'Lager', 0.058, 43, true, true),
      (gen_random_uuid(), v_brewery_id, 'Night Cat (2014)', 'Lager', 0.058, 43, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dog Days Lager', 'Lager', 0.051, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Sidekick Extra Pale Ale', 'Pale Ale', 0.051, 36, true, true),
      (gen_random_uuid(), v_brewery_id, 'Atom Smasher', 'Oktoberfest', 0.077, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Testudo', 'Saison', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hobnob B & B Pale Ale', 'Pale Ale', 0.065, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cane and Ebel', 'Red Ale', 0.07, 68, true, true),
      (gen_random_uuid(), v_brewery_id, 'Outlaw IPA (2015)', 'IPA', 0.065, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Two Henrys Brewing Company (Plant City, FL) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Two Henrys Brewing Company') AND LOWER(city) = LOWER('Plant City') AND state = 'FL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'The Gilded Age', 'Helles', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Two Roads Brewing Company (Stratford, CT) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Two Roads Brewing Company') AND LOWER(city) = LOWER('Stratford') AND state = 'CT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'No Limits Hefeweizen', 'Hefeweizen', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Honeyspot Road White IPA', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Road 2 Ruin Double IPA', 'Double IPA', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Workers Comp Saison', 'Saison', 0.048, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ol'' Factory Pils', 'Pilsner', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Uinta Brewing Company (Salt Lake City, UT) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Uinta Brewing Company') AND LOWER(city) = LOWER('Salt Lake City') AND state = 'UT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'PUNK''N', 'Amber', 0.05, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Yard Sale Winter Lager', 'Lager', 0.04, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Trader Session IPA', 'IPA', 0.04, 42, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Nosh IPA', 'IPA', 0.073, 83, true, true),
      (gen_random_uuid(), v_brewery_id, 'SUM''R', 'Blonde Ale', 0.04, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Organic Baba Black Lager', 'Lager', 0.04, 32, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Notch IPA (2013)', 'IPA', 0.073, 82, true, true),
      (gen_random_uuid(), v_brewery_id, 'Cutthroat Pale Ale', 'Pale Ale', 0.04, 34, true, true),
      (gen_random_uuid(), v_brewery_id, 'WYLD Extra Pale Ale', 'Pale Ale', 0.04, 29, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Ukiah Brewing Company (Ukiah, CA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Ukiah Brewing Company') AND LOWER(city) = LOWER('Ukiah') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Pilsner Ukiah', 'Pilsner', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Uncle Billy's Brewery and Smokeh... (Austin, TX) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Uncle Billy''s Brewery and Smokeh...') AND LOWER(city) = LOWER('Austin') AND state = 'TX'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'The Green Room', 'IPA', 0.06, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Humbucker Helles', 'Maibock / Helles Bock', 0.047, 25, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Uncommon Brewers (Santa Cruz, CA) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Uncommon Brewers') AND LOWER(city) = LOWER('Santa Cruz') AND state = 'CA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Scotty K NA', 'Lager', 0.001, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bacon Brown Ale', 'Brown Ale', 0.068, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Golden State Ale', 'Belgian', 0.064, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Baltic Porter', 'Baltic Porter', 0.078, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Siamese twin', 'Belgian Dubbel', 0.085, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Union Craft Brewing (Baltimore, MD) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Union Craft Brewing') AND LOWER(city) = LOWER('Baltimore') AND state = 'MD'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Double Duckpin', 'Double IPA', 0.085, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Old Pro', 'Gose', 0.042, 10, true, true),
      (gen_random_uuid(), v_brewery_id, 'Duckpin Pale Ale', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Balt Altbier', 'Amber', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Upland Brewing Company (Bloomington, IN) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Upland Brewing Company') AND LOWER(city) = LOWER('Bloomington') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Campside Session IPA', 'IPA', 0.045, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upland Wheat Ale', 'Witbier', 0.045, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Dragonfly IPA', 'IPA', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Upslope Brewing Company (Boulder, CO) — 18 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Upslope Brewing Company') AND LOWER(city) = LOWER('Boulder') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Lee Hill Series Vol. 5 - Belgian Style Quadrupel Ale', 'Quadrupel (Quad)', 0.128, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lee Hill Series Vol. 4 - Manhattan Style Rye Ale', 'Wheat', 0.104, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lee Hill Series Vol. 2 - Wild Saison', 'Wild Ale', 0.068, 24, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lee Hill Series Vol. 3 - Barrel Aged Imperial Stout', 'Imperial Stout', 0.099, 51, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lee Hill Series Vol. 1 - Barrel Aged Brown Ale', 'Brown Ale', 0.076, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blood Orange Saison', 'Saison', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Thai Style White IPA', 'IPA', 0.065, 33, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ferus Fluxus Wild Belgian Pale Ale', 'Wild Ale', 0.075, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Imperial India Pale Ale', 'Double IPA', 0.099, 90, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Christmas Ale', 'Amber', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Pumpkin Ale', 'Amber', 0.077, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Belgian Style Pale Ale', 'Belgian', 0.075, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Foreign Style Stout', 'Stout', 0.069, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Top Rope Mexican-style Craft Lager', 'Lager', 0.048, 15, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Craft Lager', 'Lager', 0.048, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Brown Ale', 'Brown Ale', 0.067, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope Pale Ale', 'Pale Ale', 0.058, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upslope India Pale Ale', 'IPA', 0.072, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Upstate Brewing Company (Elmira, NY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Upstate Brewing Company') AND LOWER(city) = LOWER('Elmira') AND state = 'NY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Common Sense Kentucky Common Ale', 'Brown Ale', 0.053, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Upstate I.P.W.', 'IPA', 0.065, 70, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Utah Brewers Cooperative (Salt Lake City, UT) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Utah Brewers Cooperative') AND LOWER(city) = LOWER('Salt Lake City') AND state = 'UT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Squatters Full Suspension Pale Ale', 'Pale Ale', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Squatters Hop Rising Double IPA', 'Double IPA', 0.09, 75, true, true),
      (gen_random_uuid(), v_brewery_id, 'Devastator Double Bock', 'Lager', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wasatch Ghostrider White IPA', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wasatch Ghostrider White IPA (2014)', 'IPA', 0.06, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wasatch Apricot Hefeweizen', 'Sour', 0.04, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Squatters Hop Rising Double IPA (2014)', 'Double IPA', 0.09, 75, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Vault Brewing Company (Yardley, PA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Vault Brewing Company') AND LOWER(city) = LOWER('Yardley') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Nitro Can Coffee Stout', 'Stout', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Voodoo Brewery (Meadville, PA) — 6 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Voodoo Brewery') AND LOWER(city) = LOWER('Meadville') AND state = 'PA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Voodoo Love Child', 'Belgian Tripel', 0.092, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Magick of the Sun', 'Witbier', 0.079, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wynona''s Big Brown Ale', 'Brown Ale', 0.075, 31, true, true),
      (gen_random_uuid(), v_brewery_id, 'Gran Met', 'Belgian', 0.092, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Good Vibes IPA', 'IPA', 0.073, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pilzilla', 'Pilsner', 0.075, 85, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wachusett Brewing Company (Westminster, MA) — 10 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wachusett Brewing Company') AND LOWER(city) = LOWER('Westminster') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wachusett Light IPA', 'IPA', 0.04, 37, true, true),
      (gen_random_uuid(), v_brewery_id, 'Green Monsta IPA', 'IPA', 0.06, 55, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wachusett IPA', 'IPA', 0.056, 50, true, true),
      (gen_random_uuid(), v_brewery_id, 'Strawberry White', 'Witbier', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Larry Imperial IPA', 'Double IPA', 0.085, 85, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wachusett Summer', 'Wheat', 0.047, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Country Pale Ale', 'Pale Ale', 0.051, 17, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wachusett Light IPA (2013)', 'IPA', 0.04, 37, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpkan', 'Amber', 0.052, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wachusett Blueberry Ale', 'Sour', 0.045, 10, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Warbird Brewing Company (Fort Wayne, IN) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Warbird Brewing Company') AND LOWER(city) = LOWER('Fort Wayne') AND state = 'IN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'T-6 Red Ale (2004)', 'Amber', 0.047, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Warped Wing Brewing Company (Dayton, OH) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Warped Wing Brewing Company') AND LOWER(city) = LOWER('Dayton') AND state = 'OH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Self Starter', 'IPA', 0.052, 67, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ermal''s', 'Cream Ale', 0.054, 20, true, true),
      (gen_random_uuid(), v_brewery_id, '10 Ton', 'Oatmeal Stout', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Flyin'' Rye', 'IPA', 0.07, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── West Sixth Brewing (Lexington, KY) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('West Sixth Brewing') AND LOWER(city) = LOWER('Lexington') AND state = 'KY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Christmas Ale', 'Saison', 0.09, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pay It Forward Cocoa Porter', 'Porter', 0.07, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'West Sixth Amber Ale', 'Amber', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'West Sixth IPA', 'IPA', NULL, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Westbrook Brewing Company (Mt. Pleasant, SC) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Westbrook Brewing Company') AND LOWER(city) = LOWER('Mt. Pleasant') AND state = 'SC'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'One Claw', 'Pale Ale', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Westbrook Gose', 'Gose', 0.04, 5, true, true),
      (gen_random_uuid(), v_brewery_id, 'White Thai', 'Witbier', 0.05, 16, true, true),
      (gen_random_uuid(), v_brewery_id, 'Westbrook IPA', 'IPA', 0.068, 65, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Westfield River Brewing Company (Westfield, MA) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Westfield River Brewing Company') AND LOWER(city) = LOWER('Westfield') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Westfield Octoberfest', 'Oktoberfest', 0.057, 22, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pop''s Old Fashioned Lager', 'Lager', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Charlie in the Rye', 'IPA', 0.058, 55, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Weston Brewing Company (Weston, MO) — 7 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Weston Brewing Company') AND LOWER(city) = LOWER('Weston') AND state = 'MO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Royal Lager', 'Lager', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rip Van Winkle (Current)', 'Lager', 0.08, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'O’Malley’s Stout', 'Stout', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'O’Malley’s IPA', 'IPA', 0.075, 89, true, true),
      (gen_random_uuid(), v_brewery_id, 'O’Malley’s Irish Style Cream Ale', 'Cream Ale', NULL, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'L''il Lucy''s Hot Pepper Ale', 'Amber', 0.049, 28, true, true),
      (gen_random_uuid(), v_brewery_id, 'Drop Kick Ale', 'Amber', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── White Birch Brewing (Hooksett, NH) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('White Birch Brewing') AND LOWER(city) = LOWER('Hooksett') AND state = 'NH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Raspberry Berliner Weisse', 'Berliner Weisse', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Session', 'IPA', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Blueberry Berliner Weisse', 'Berliner Weisse', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Berliner Weisse', 'Berliner Weisse', 0.055, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── White Flame Brewing Company (Hudsonville, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('White Flame Brewing Company') AND LOWER(city) = LOWER('Hudsonville') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Super G IPA', 'IPA', 0.06, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Widmer Brothers Brewing Company (Portland, OR) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Widmer Brothers Brewing Company') AND LOWER(city) = LOWER('Portland') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hefe Lemon', 'Lager', 0.049, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hefe Black', 'Hefeweizen', 0.049, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Widmer Brothers Hefeweizen', 'Hefeweizen', 0.049, 30, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wild Onion Brewing Company (Lake Barrington, IL) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wild Onion Brewing Company') AND LOWER(city) = LOWER('Lake Barrington') AND state = 'IL'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Hop Slayer Double IPA', 'Double IPA', 0.082, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Pumpkin Ale', 'Amber', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Big Bowl Blonde Ale', 'Brown Ale', 0.05, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Phat Chance', 'Blonde Ale', 0.052, 27, true, true),
      (gen_random_uuid(), v_brewery_id, 'Hop Slayer Double IPA (2011)', 'Double IPA', 0.082, 100, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wild Onion Summer Wit', 'Witbier', 0.042, 13, true, true),
      (gen_random_uuid(), v_brewery_id, 'Jack Stout', 'Oatmeal Stout', 0.06, 23, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wild Onion Pumpkin Ale (2010)', 'Amber', 0.045, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Paddy Pale Ale', 'Pale Ale', 0.056, 41, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wild Wolf Brewing Company (Nellysford, VA) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wild Wolf Brewing Company') AND LOWER(city) = LOWER('Nellysford') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Blonde Hunny', 'Belgian', 0.068, 21, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wild Wolf Wee Heavy Scottish Style Ale', 'Red Ale', 0.057, 20, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wild Wolf American Pilsner', 'Pilsner', 0.045, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Alpha Ale', 'Pale Ale', 0.051, 45, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wildwood Brewing Company (Stevensville, MT) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wildwood Brewing Company') AND LOWER(city) = LOWER('Stevensville') AND state = 'MT'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Mystical Stout', 'Dry Stout', 0.054, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Bodacious Bock', 'Lager', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ambitious Lager', 'Helles', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wind River Brewing Company (Pinedale, WY) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wind River Brewing Company') AND LOWER(city) = LOWER('Pinedale') AND state = 'WY'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wyoming Pale Ale', 'Pale Ale', 0.072, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wind River Blonde Ale', 'Blonde Ale', 0.05, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wingman Brewers (Tacoma, WA) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wingman Brewers') AND LOWER(city) = LOWER('Tacoma') AND state = 'WA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Ace IPA', 'IPA', 0.074, 83, true, true),
      (gen_random_uuid(), v_brewery_id, 'P-51 Porter', 'Porter', 0.08, 31, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wisconsin Brewing Company (Verona, WI) — 4 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wisconsin Brewing Company') AND LOWER(city) = LOWER('Verona') AND state = 'WI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '#001 Golden Amber Lager', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '#002 American I.P.A.', 'IPA', 0.071, 60, true, true),
      (gen_random_uuid(), v_brewery_id, '#003 Brown & Robust Porter', 'Porter', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, '#004 Session I.P.A.', 'IPA', 0.048, 38, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wiseacre Brewing Company (Memphis, TN) — 3 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wiseacre Brewing Company') AND LOWER(city) = LOWER('Memphis') AND state = 'TN'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Tarasque', 'Saison', 0.059, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Ananda India Pale Ale', 'IPA', 0.062, 61, true, true),
      (gen_random_uuid(), v_brewery_id, 'Tiny Bomb', 'Pilsner', 0.045, 23, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Witch's Hat Brewing Company (South Lyon, MI) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Witch''s Hat Brewing Company') AND LOWER(city) = LOWER('South Lyon') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Train Hopper', 'IPA', 0.058, 72, true, true),
      (gen_random_uuid(), v_brewery_id, 'Edward’s Portly Brown', 'Brown Ale', 0.045, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wolf Hills Brewing Company (Abingdon, VA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wolf Hills Brewing Company') AND LOWER(city) = LOWER('Abingdon') AND state = 'VA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Troopers Alley IPA', 'IPA', 0.059, 135, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wolverine State Brewing Company (Ann Arbor, MI) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wolverine State Brewing Company') AND LOWER(city) = LOWER('Ann Arbor') AND state = 'MI'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Wolverine Premium Lager', 'Lager', 0.047, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Woodstock Inn, Station & Brewery (North Woodstock, NH) — 2 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Woodstock Inn, Station & Brewery') AND LOWER(city) = LOWER('North Woodstock') AND state = 'NH'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, '4000 Footer IPA', 'IPA', 0.065, 82, true, true),
      (gen_random_uuid(), v_brewery_id, 'Summer Brew', 'Pilsner', 0.028, 15, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wormtown Brewery (Worcester, MA) — 1 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wormtown Brewery') AND LOWER(city) = LOWER('Worcester') AND state = 'MA'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Be Hoppy IPA', 'IPA', 0.065, 69, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Worthy Brewing Company (Bend, OR) — 5 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Worthy Brewing Company') AND LOWER(city) = LOWER('Bend') AND state = 'OR'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Worthy IPA', 'IPA', 0.069, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Easy Day Kolsch', 'Kölsch', 0.045, 25, true, true),
      (gen_random_uuid(), v_brewery_id, 'Lights Out Vanilla Cream Extra Stout', 'Double IPA', 0.077, 30, true, true),
      (gen_random_uuid(), v_brewery_id, 'Worthy IPA (2013)', 'IPA', 0.069, 69, true, true),
      (gen_random_uuid(), v_brewery_id, 'Worthy Pale', 'Pale Ale', 0.06, 50, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── Wynkoop Brewing Company (Denver, CO) — 9 beers ──
  SELECT id INTO v_brewery_id FROM breweries
    WHERE LOWER(name) = LOWER('Wynkoop Brewing Company') AND LOWER(city) = LOWER('Denver') AND state = 'CO'
    LIMIT 1;

  IF v_brewery_id IS NOT NULL THEN
    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)
    VALUES
      (gen_random_uuid(), v_brewery_id, 'Patty''s Chile Beer', 'Amber', 0.042, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Colorojo Imperial Red Ale', 'Red Ale', 0.082, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Wynkoop Pumpkin Ale', 'Amber', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rocky Mountain Oyster Stout', 'Stout', 0.075, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Belgorado', 'IPA', 0.067, 45, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rail Yard Ale', 'Amber', 0.052, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'B3K Black Lager', 'Lager', 0.055, NULL, true, true),
      (gen_random_uuid(), v_brewery_id, 'Silverback Pale Ale', 'Pale Ale', 0.055, 40, true, true),
      (gen_random_uuid(), v_brewery_id, 'Rail Yard Ale (2009)', 'Amber', 0.052, NULL, true, true)
    ON CONFLICT DO NOTHING;
  END IF;

END $$;

-- ── Summary ──
-- Breweries with beer data: 541
-- Total beers: 2279
-- Note: Only beers whose brewery exists in our DB (migration 048) will be inserted.
-- Brewery owners can always add/update their own beers after claiming.