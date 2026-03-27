-- Migration 029: Glass types + pour sizes for all 20 demo beers
-- Sprint 19 — "The Pour"
-- Updates existing demo beers with glass_type and inserts beer_pour_sizes rows.

DO $$
DECLARE
  -- Mountain Ridge UUIDs
  mtn_b01 uuid := 'dd000004-0001-0000-0000-000000000001'; -- Ridgeline IPA
  mtn_b02 uuid := 'dd000004-0001-0000-0000-000000000002'; -- Summit Sunset Hazy (BOTW)
  mtn_b03 uuid := 'dd000004-0001-0000-0000-000000000003'; -- Trailhead Lager
  mtn_b04 uuid := 'dd000004-0001-0000-0000-000000000004'; -- Appalachian Amber
  mtn_b05 uuid := 'dd000004-0001-0000-0000-000000000005'; -- Dark Hollow Stout
  mtn_b06 uuid := 'dd000004-0001-0000-0000-000000000006'; -- Wildflower Wheat
  mtn_b07 uuid := 'dd000004-0001-0000-0000-000000000007'; -- Bear Creek DIPA
  mtn_b08 uuid := 'dd000004-0001-0000-0000-000000000008'; -- Basecamp Blonde

  -- River Bend UUIDs
  riv_b01 uuid := 'dd000004-0002-0000-0000-000000000001'; -- French Broad Belgian (BOTW)
  riv_b02 uuid := 'dd000004-0002-0000-0000-000000000002'; -- Riverside Saison
  riv_b03 uuid := 'dd000004-0002-0000-0000-000000000003'; -- Barrel Room Sour
  riv_b04 uuid := 'dd000004-0002-0000-0000-000000000004'; -- Cottonwood Kolsch
  riv_b05 uuid := 'dd000004-0002-0000-0000-000000000005'; -- Biltmore Pilsner
  riv_b06 uuid := 'dd000004-0002-0000-0000-000000000006'; -- Monks Garden Tripel

  -- Smoky Barrel UUIDs
  smk_b01 uuid := 'dd000004-0003-0000-0000-000000000001'; -- Smokehouse Porter (BOTW)
  smk_b02 uuid := 'dd000004-0003-0000-0000-000000000002'; -- Barrel-Aged Imperial
  smk_b03 uuid := 'dd000004-0003-0000-0000-000000000003'; -- Firepit Red
  smk_b04 uuid := 'dd000004-0003-0000-0000-000000000004'; -- Timber Creek Pale
  smk_b05 uuid := 'dd000004-0003-0000-0000-000000000005'; -- Mountain Mead
  smk_b06 uuid := 'dd000004-0003-0000-0000-000000000006'; -- Whittled Down Wit

BEGIN

-- ── Update glass types ────────────────────────────────────────────────────────

UPDATE public.beers SET glass_type = 'ipa_glass'     WHERE id = mtn_b01;
UPDATE public.beers SET glass_type = 'ipa_glass'     WHERE id = mtn_b02;
UPDATE public.beers SET glass_type = 'pilsner_glass' WHERE id = mtn_b03;
UPDATE public.beers SET glass_type = 'shaker_pint'   WHERE id = mtn_b04;
UPDATE public.beers SET glass_type = 'shaker_pint'   WHERE id = mtn_b05;
UPDATE public.beers SET glass_type = 'weizen_glass'  WHERE id = mtn_b06;
UPDATE public.beers SET glass_type = 'ipa_glass'     WHERE id = mtn_b07;
UPDATE public.beers SET glass_type = 'shaker_pint'   WHERE id = mtn_b08;

UPDATE public.beers SET glass_type = 'goblet_chalice' WHERE id = riv_b01;
UPDATE public.beers SET glass_type = 'tulip'          WHERE id = riv_b02;
UPDATE public.beers SET glass_type = 'tulip'          WHERE id = riv_b03;
UPDATE public.beers SET glass_type = 'stange'         WHERE id = riv_b04;
UPDATE public.beers SET glass_type = 'pilsner_glass'  WHERE id = riv_b05;
UPDATE public.beers SET glass_type = 'goblet_chalice' WHERE id = riv_b06;

UPDATE public.beers SET glass_type = 'nonic_pint'  WHERE id = smk_b01;
UPDATE public.beers SET glass_type = 'snifter'     WHERE id = smk_b02;
UPDATE public.beers SET glass_type = 'shaker_pint' WHERE id = smk_b03;
UPDATE public.beers SET glass_type = 'shaker_pint' WHERE id = smk_b04;
UPDATE public.beers SET glass_type = 'flute'       WHERE id = smk_b05;
UPDATE public.beers SET glass_type = 'weizen_glass' WHERE id = smk_b06;

-- ── Clear any existing pour sizes ─────────────────────────────────────────────
DELETE FROM public.beer_pour_sizes WHERE beer_id IN (
  mtn_b01,mtn_b02,mtn_b03,mtn_b04,mtn_b05,mtn_b06,mtn_b07,mtn_b08,
  riv_b01,riv_b02,riv_b03,riv_b04,riv_b05,riv_b06,
  smk_b01,smk_b02,smk_b03,smk_b04,smk_b05,smk_b06
);

-- ── Insert pour sizes ─────────────────────────────────────────────────────────

-- Mountain Ridge Brewing
-- Ridgeline IPA
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b01, 'Taster',    5,  3.00, 0),
  (mtn_b01, 'Half Pint', 8,  5.00, 1),
  (mtn_b01, 'Pint',      16, 7.00, 2),
  (mtn_b01, 'Growler',   32, 12.00, 3);

-- Summit Sunset Hazy (Beer of the Week)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b02, 'Taster',    5,  3.00, 0),
  (mtn_b02, 'Half Pint', 8,  5.00, 1),
  (mtn_b02, 'Pint',      16, 8.00, 2),
  (mtn_b02, 'Growler',   32, 14.00, 3);

-- Trailhead Lager
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b03, 'Taster',    5,  2.00, 0),
  (mtn_b03, 'Half Pint', 8,  4.00, 1),
  (mtn_b03, 'Pint',      16, 6.00, 2),
  (mtn_b03, 'Growler',   32, 11.00, 3);

-- Appalachian Amber
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b04, 'Taster',    5,  2.00, 0),
  (mtn_b04, 'Half Pint', 8,  4.00, 1),
  (mtn_b04, 'Pint',      16, 6.00, 2),
  (mtn_b04, 'Growler',   32, 11.00, 3);

-- Dark Hollow Stout
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b05, 'Taster',    5,  3.00, 0),
  (mtn_b05, 'Half Pint', 8,  5.00, 1),
  (mtn_b05, 'Pint',      16, 7.00, 2);

-- Wildflower Wheat
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b06, 'Taster',    5,  2.00, 0),
  (mtn_b06, 'Half Pint', 8,  4.00, 1),
  (mtn_b06, 'Pint',      16, 6.00, 2),
  (mtn_b06, 'Growler',   32, 11.00, 3);

-- Bear Creek DIPA (high-ABV — no growler)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b07, 'Taster',    5,  4.00, 0),
  (mtn_b07, 'Half Pint', 8,  6.00, 1),
  (mtn_b07, 'Pint',      16, 9.00, 2);

-- Basecamp Blonde (off tap, just pint price)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (mtn_b08, 'Pint', 16, 5.00, 0);

-- River Bend Ales
-- French Broad Belgian (Beer of the Week)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (riv_b01, 'Taster',    5,  3.00, 0),
  (riv_b01, 'Half Pint', 8,  5.00, 1),
  (riv_b01, 'Pint',      16, 8.00, 2);

-- Riverside Saison
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (riv_b02, 'Taster',    5,  3.00, 0),
  (riv_b02, 'Half Pint', 8,  5.00, 1),
  (riv_b02, 'Pint',      16, 7.00, 2),
  (riv_b02, 'Growler',   32, 12.00, 3);

-- Barrel Room Sour (pricier, no growler)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (riv_b03, 'Taster',    5,  4.00, 0),
  (riv_b03, 'Half Pint', 8,  6.00, 1),
  (riv_b03, 'Pint',      16, 9.00, 2);

-- Cottonwood Kolsch (sessionable — flight available)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (riv_b04, 'Flight',    null, 3.00, 0),
  (riv_b04, 'Taster',    5,    2.00, 1),
  (riv_b04, 'Half Pint', 8,    4.00, 2),
  (riv_b04, 'Pint',      16,   6.00, 3),
  (riv_b04, 'Growler',   32,   11.00, 4);

-- Biltmore Pilsner
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (riv_b05, 'Taster',    5,  2.00, 0),
  (riv_b05, 'Half Pint', 8,  4.00, 1),
  (riv_b05, 'Pint',      16, 6.00, 2),
  (riv_b05, 'Growler',   32, 11.00, 3);

-- Monks Garden Tripel (strong — tasters and halves only)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (riv_b06, 'Taster',    5,  4.00, 0),
  (riv_b06, 'Half Pint', 8,  7.00, 1),
  (riv_b06, 'Goblet',    13, 10.00, 2);

-- Smoky Barrel Brewing
-- Smokehouse Porter (Beer of the Week)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (smk_b01, 'Taster',    5,  3.00, 0),
  (smk_b01, 'Half Pint', 8,  5.00, 1),
  (smk_b01, 'Pint',      16, 7.00, 2),
  (smk_b01, 'Growler',   32, 13.00, 3);

-- Barrel-Aged Imperial (10.5% — snifter only, small pours)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (smk_b02, 'Taster',  4, 5.00, 0),
  (smk_b02, 'Half',    8, 9.00, 1),
  (smk_b02, 'Snifter', 12, 12.00, 2);

-- Firepit Red
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (smk_b03, 'Taster',    5,  2.00, 0),
  (smk_b03, 'Half Pint', 8,  4.00, 1),
  (smk_b03, 'Pint',      16, 6.00, 2),
  (smk_b03, 'Growler',   32, 11.00, 3);

-- Timber Creek Pale
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (smk_b04, 'Taster',    5,  2.00, 0),
  (smk_b04, 'Half Pint', 8,  4.00, 1),
  (smk_b04, 'Pint',      16, 6.00, 2),
  (smk_b04, 'Growler',   32, 11.00, 3);

-- Mountain Mead (flute presentation — flight, half flute, full flute)
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (smk_b05, 'Flight',    null, 4.00, 0),
  (smk_b05, 'Half Flute', 6,  6.00, 1),
  (smk_b05, 'Flute',     10,  9.00, 2);

-- Whittled Down Wit
INSERT INTO public.beer_pour_sizes (beer_id, label, oz, price, display_order) VALUES
  (smk_b06, 'Taster',    5,  2.00, 0),
  (smk_b06, 'Half Pint', 8,  4.00, 1),
  (smk_b06, 'Pint',      16, 6.00, 2),
  (smk_b06, 'Growler',   32, 11.00, 3);

RAISE NOTICE '== Migration 029 complete: glass types + pour sizes added to 20 demo beers ==';

END $$;
