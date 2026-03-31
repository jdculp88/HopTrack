-- ─── Migration 052: Heist Brewery Beer Seed ────────────────────────────────
-- Sprint 80 — The Untappd Killer
-- Source: heistbrewery.com/beer/untappd/ (Heist Brewery and Barrel Arts menu)
-- Crawled: 2026-03-31
-- 37 beers from Heist Brewery, Charlotte NC
-- ────────────────────────────────────────────────────────────────────────────

-- Insert beers for Heist Brewery (lookup by external_id from Open Brewery DB)
DO $$
DECLARE
  heist_id uuid;
BEGIN
  SELECT id INTO heist_id FROM breweries
    WHERE external_id = '528481d4-f3c8-479a-aad9-fce4b9cfe36a';

  IF heist_id IS NULL THEN
    RAISE NOTICE 'Heist Brewery not found by external_id, trying name lookup';
    SELECT id INTO heist_id FROM breweries
      WHERE name = 'Heist Brewery' AND city = 'Charlotte' AND state = 'North Carolina'
      LIMIT 1;
  END IF;

  IF heist_id IS NULL THEN
    RAISE EXCEPTION 'Heist Brewery not found in breweries table';
  END IF;

  -- Mark provenance on brewery
  UPDATE breweries SET
    data_source = 'crawled',
    last_crawled_at = NOW()
  WHERE id = heist_id;

  -- ── New Additions ──────────────────────────────────────────────────────
  INSERT INTO beers (brewery_id, name, style, abv, description, is_on_tap, is_featured, display_order, source, source_url, last_verified_at) VALUES
  (heist_id, 'CryoQuench''l', 'Hazy IPA', 7.1, 'Pushing the boundaries of our signature hazy, CitraQuench''l — all Citra Cryo hops amplify orange zest, grapefruit pith, and ripe mango.', true, true, 1, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Kolsch Minded', 'Kölsch', 5.1, 'Crisp, delicately balanced, with subtle fruit and hop character. Subdued maltiness leads into a refreshing, semi-dry finish.', true, false, 2, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── Lagers, Pilsners, + Kolsch ─────────────────────────────────────────
  (heist_id, 'Vienna Lager', 'Lager', 5.2, 'Brewed primarily with vienna malt, Magnum and Hallertau Mittelfruh hops. Light sweetness, caramel, and a long lingering finish with mild spice.', true, false, 3, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'AirDrip', 'Lager', 4.9, 'Dark Czech Lager collab with DuBious Brewing. Smooth, crisp — roasted malt with wet Zuper Saaz hops, toasted bread, subtle cocoa, and green hop spice.', true, false, 4, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Court Shoes Only', 'Lager', 5.0, 'Helles Lager collaboration with Salud Cerveceria.', true, false, 5, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Kolsch Encounters', 'Kölsch', 5.0, 'Kolsch style ale with all Czech Saaz hops. Bright and crisp with notes of black pepper, toasted bread, and a subtle citrus character.', true, false, 6, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'BraunBier', 'Lager', 4.9, 'Traditional Munich Dunkel with caramel color, lager body, layered with toasted breadcrumb and toffee.', true, false, 7, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Druid Pils South', 'Pilsner', 4.5, 'Super crushable German style pilsner brewed with 100% local malt and noble German hops.', true, false, 8, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── Sours ──────────────────────────────────────────────────────────────
  (heist_id, 'Big Pick''n (Raspberry)', 'Sour', 6.1, 'Bold and tart Berliner Weisse created with loads of raspberry fruit. Bumped up ABV for extra punch.', true, false, 9, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── Seltzer ────────────────────────────────────────────────────────────
  (heist_id, 'Fizzics: Orange Soda', 'Blonde Ale', 4.8, 'Lightly flavored orange soda hard seltzer meant to be insanely refreshing.', true, false, 10, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Fizzics: Strawberry Lemonade', 'Blonde Ale', 4.8, 'Lightly flavored strawberry lemonade hard seltzer meant to be insanely refreshing.', true, false, 11, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── Stout & Brown Ales ─────────────────────────────────────────────────
  (heist_id, 'French Toasted Joe', 'Imperial Stout', 10.0, 'Imperial stout with roasted malts, cold brew espresso, maple syrup, and cinnamon chips.', true, false, 12, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'For All the Cows Cookies & Cream', 'Milk Stout', 5.7, 'Milk stout with specialty malt, chocolate malt, flaked oats, and lactose. Notes of chocolate chips, toffee, and light roast coffee. Conditioned on twistable cookies.', true, false, 13, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Brunch Junkie', 'Stout', 7.5, 'Breakfast stout brewed with flaked oats and Sumatra Coffee from Central Coffee.', true, false, 14, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Global Happiness (Hazelnut & Vanilla)', 'Brown Ale', 4.8, 'Roasty brown ale conditioned on hazelnut and vanilla coffees. Coffee and beer in one glass.', true, false, 15, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── Hazy IPAs ──────────────────────────────────────────────────────────
  (heist_id, 'Suit of Nectaron', 'Hazy IPA', 7.2, 'Hazy IPA with Nectaron and Freestyle Hops Turkey''s Pick (Riwaka, Motueka, Moutere). Ripe peach, dank passionfruit, and juicy pineapple.', true, false, 16, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'CitraQuench''l', 'Hazy IPA', 7.1, 'Signature IPA. Brewed and double dry hopped with all Citra hops. Orange, tangerine, pink grapefruit, and citrus zest — one of NC''s original hazy brews.', true, false, 17, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Jack the S.I.P.A.', 'Session IPA', 4.8, 'Session IPA dry hopped with Citra, Amarillo, and El Dorado. Good things in small packages.', true, false, 18, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Ultimate Party Brigade', 'Hazy IPA', 7.1, 'Quadruple dry-hopped with Citra, Galaxy, Nelson, Strata, and Simcoe. Tropical fruits, citrus zest, and earthy undertones.', true, false, 19, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Existence From A Distance', 'Hazy IPA', 6.1, 'Hazy IPA double dry hopped with Sabro and Motueka. Pina coladas on the beach with lime and tangerine zest.', true, false, 20, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Not From Concentrate', 'Hazy IPA', 6.8, 'NFC — double dry hopped with Citra, Mosaic, Motueka, and Galaxy. Loaded with tropical fruit.', true, false, 21, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Game Night', 'Hazy IPA', 6.3, 'Hazy IPA with Galaxy, Citra, Strata, and Mosaic. Earthy citrus, dank tropical fruit, dark berries, and white peach.', true, false, 22, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Pacific Thunder', 'Hazy IPA', 6.8, 'Hazy IPA with Citra, Strata, and Nelson — double dry hopped. Tropical and dank with earthy white wine flavor.', true, false, 23, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'StrataQuench''l', 'Hazy IPA', 7.5, 'Citra, Citra Cryo, Strata, and Strata CGX at ~10 lbs per barrel. Big dank mango, passionfruit, tangerine zest, and grapefruit.', true, false, 24, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Atmospheric Disruption', 'Hazy IPA', 7.5, 'Triple dry hopped with Strata, Rakau, Waimea, Wakatu, and Azacca. Tropical, dank, and resinous.', true, false, 25, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Hive Fives', 'Pale Ale', 5.5, 'Hazy pale ale with local SC wildflower honey, dry hopped with Citra and Azacca. Bright and citrusy with subtle sweetness.', true, false, 26, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Maximum Frequency', 'Hazy IPA', 6.5, 'Hazy IPA with Galaxy, Mosaic, and Rakau. Tropical fruits with a slightly dank quality and a hint of bitterness.', true, false, 27, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Mo Citra, Motueka Problems', 'Hazy IPA', 6.7, 'Collab with Salud Cerveceria. Double dry hopped with Citra and Motueka. Orange zest, grapefruit, and a squeeze of lime.', true, false, 28, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Phase In/Out', 'Hazy IPA', 7.3, 'Double dry hopped with equal parts Citra and Mosaic. Incredibly approachable, citrusy and dank with bright tropical aroma.', true, false, 29, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Strange Clouds', 'Hazy IPA', 7.1, 'Brewed and double dry hopped with El Dorado and Mosaic. Dank tangerine, mango, bright pineapple, and citrus aromas.', true, false, 30, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'TropiQuench''l', 'Hazy IPA', 6.5, 'Signature hazy with tropical treatment — all Citra hops, conditioned on tangerine, cara cara orange, and passionfruit. Mimosa and grapefruit pith.', true, false, 31, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── West Coast ─────────────────────────────────────────────────────────
  (heist_id, 'Lovin'' the Dream', 'Pale Ale', 5.9, 'Classic west coast pale ale with Simcoe, Centennial, and Cascade. Piney, floral, with lingering subtle bitterness.', true, false, 32, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'When the Dance Gets Hot', 'IPA', 6.8, 'West coast IPA with Simcoe, Amarillo, and Chinook. Piney, big grapefruit, and a nice bitterness.', true, false, 33, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),
  (heist_id, 'Intro To Earth Science', 'Pale Ale', 5.6, 'West coast pale ale with all Strata hops. Dank, resinous — grapefruit, pineapple, and peach gummy rings.', true, false, 34, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW()),

  -- ── Cider ──────────────────────────────────────────────────────────────
  (heist_id, 'Bramblin'' Blackberry', 'Sour', 6.9, 'Fruit cider, dark plum color with alluring fruit forward aroma. Balanced, complex, slightly tart semi-dry finish.', true, false, 35, 'crawled', 'https://heistbrewery.com/beer/untappd/', NOW())

  ON CONFLICT DO NOTHING;

  -- Update brewery beer count
  UPDATE breweries SET
    crawl_beer_count = (SELECT COUNT(*) FROM beers WHERE brewery_id = heist_id AND is_on_tap = true)
  WHERE id = heist_id;

  RAISE NOTICE 'Heist Brewery beers inserted successfully. Brewery ID: %', heist_id;
END $$;
