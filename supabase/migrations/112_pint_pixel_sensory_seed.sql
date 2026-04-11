-- Sprint 176 — Pint & Pixel Sensory Seed
--
-- Seeds the test brewery (Pint & Pixel, UUID a1b2c3d4-e5f6-7890-abcd-ef1234567890)
-- with rich beer descriptions, SRM color values, aroma/taste/finish note
-- arrays, and the correct glass_type pick for every beer. The Board's
-- Slideshow format already reads all of these — once this migration lands
-- the brewery comes fully alive during demos and local dev.
--
-- Covers both beer rosters:
--   * The 10 "cccccccc-XXXX" dev-themed beers inserted by migration 074
--   * The 10 classic beers inserted by the legacy seed file
--     `supabase/seeds/002_test_brewery.sql` (Debug IPA, Pixel Perfect Pils,
--     Dark Mode Stout, Stack Overflow Sour, Merge Conflict Märzen, Pull
--     Request Pale, Kernel Panic Porter, 404 Wheat Not Found, Deploy Friday
--     DIPA, Legacy Code Lager)
--
-- Idempotent — uses UPDATE WHERE brewery_id AND name, so re-running is
-- safe and missing beers are silently skipped. Pure data update, no schema
-- changes.

DO $$
DECLARE
  pp_brewery uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN

  -- ═══════════════════════════════════════════════════════════════════════
  -- Sprint 115 roster (migration 074) — 10 dev-themed beers
  -- ═══════════════════════════════════════════════════════════════════════

  UPDATE public.beers SET
    description = 'Crisp German-style kölsch brewed with noble Tettnang hops and a whisper of orange peel. Light, snappy, and clean — the hard-reset beer for a long sprint.',
    srm          = 4,
    aroma_notes  = ARRAY['Bread', 'Honey', 'Floral', 'Lemon'],
    taste_notes  = ARRAY['Crisp', 'Bready', 'Clean', 'Light-bodied'],
    finish_notes = ARRAY['Dry', 'Snappy', 'Clean'],
    glass_type   = 'stange'
  WHERE brewery_id = pp_brewery AND name = 'Ctrl+Z Kölsch';

  UPDATE public.beers SET
    description = 'Irish-inspired red ale layered with caramel, toasted biscuit, and a clean hop bite. Pours a deep copper with a fluffy tan head — the kind of pint you nurse.',
    srm          = 13,
    aroma_notes  = ARRAY['Caramel', 'Toast', 'Biscuit', 'Earthy'],
    taste_notes  = ARRAY['Caramel', 'Bready', 'Toasty', 'Balanced', 'Medium-bodied'],
    finish_notes = ARRAY['Dry', 'Biscuity', 'Clean'],
    glass_type   = 'nonic_pint'
  WHERE brewery_id = pp_brewery AND name = 'Regex Red Ale';

  UPDATE public.beers SET
    description = 'Belgian golden strong ale fermented hot with a classic abbey yeast. Fruity esters, peppery phenols, and a deceptive 7.8% — one pour commits you.',
    srm          = 6,
    aroma_notes  = ARRAY['Banana', 'Clove', 'Pear', 'Pepper', 'Floral'],
    taste_notes  = ARRAY['Spicy', 'Peppery', 'Dry', 'Warming', 'Medium-bodied'],
    finish_notes = ARRAY['Dry', 'Warming', 'Peppery'],
    glass_type   = 'tulip'
  WHERE brewery_id = pp_brewery AND name = 'Git Blame Belgian';

  UPDATE public.beers SET
    description = 'Hazy New England IPA double dry-hopped with Citra, Mosaic, and Galaxy. Juice-forward mango and pineapple, pillowy oat mouthfeel, dangerously soft bitterness.',
    srm          = 5,
    aroma_notes  = ARRAY['Mango', 'Pineapple', 'Citrus', 'Tropical', 'Grapefruit'],
    taste_notes  = ARRAY['Juicy', 'Tropical', 'Creamy', 'Pillowy', 'Medium-bodied'],
    finish_notes = ARRAY['Smooth', 'Pillowy', 'Clean'],
    glass_type   = 'ipa_glass'
  WHERE brewery_id = pp_brewery AND name = 'Infinite Loop IPA';

  UPDATE public.beers SET
    description = 'Nitro milk stout poured slow for that cascading waterfall. Cocoa, cold-brew espresso, and a silky mouthfeel that tastes like a chocolate milkshake wearing a tux.',
    srm          = 38,
    aroma_notes  = ARRAY['Chocolate', 'Coffee', 'Cocoa', 'Vanilla', 'Roasty'],
    taste_notes  = ARRAY['Creamy', 'Roasty', 'Chocolate', 'Silky', 'Full-bodied'],
    finish_notes = ARRAY['Smooth', 'Creamy', 'Sweet Finish'],
    glass_type   = 'nonic_pint'
  WHERE brewery_id = pp_brewery AND name = 'Null Pointer Nitro';

  UPDATE public.beers SET
    description = 'Dry farmhouse saison fermented warm with lemon peel and cracked black pepper. Rustic, refreshing, and gently funky — like porch beer for distributed teams.',
    srm          = 5,
    aroma_notes  = ARRAY['Lemon', 'Pepper', 'Pear', 'Floral', 'Grassy'],
    taste_notes  = ARRAY['Dry', 'Spicy', 'Peppery', 'Light-bodied', 'Crisp'],
    finish_notes = ARRAY['Dry', 'Peppery', 'Crisp'],
    glass_type   = 'tulip'
  WHERE brewery_id = pp_brewery AND name = 'Syntax Error Saison';

  UPDATE public.beers SET
    description = 'Session-strength hazy pale loaded with Citra and El Dorado. Bright citrus and pineapple, soft bitter finish, endlessly crushable at 5%.',
    srm          = 5,
    aroma_notes  = ARRAY['Citrus', 'Grapefruit', 'Pineapple', 'Pine'],
    taste_notes  = ARRAY['Juicy', 'Citrus', 'Sessionable', 'Light-bodied'],
    finish_notes = ARRAY['Clean', 'Dry', 'Crisp'],
    glass_type   = 'shaker_pint'
  WHERE brewery_id = pp_brewery AND name = 'Hotfix Hazy Pale';

  UPDATE public.beers SET
    description = 'English barleywine aged six months on second-use bourbon barrels. Dark fruit, toffee, vanilla oak, and a warming 10.5% embrace. Sip slow. Handle with care.',
    srm          = 24,
    aroma_notes  = ARRAY['Toffee', 'Dark Fruit', 'Caramel', 'Raisin', 'Vanilla', 'Bourbon'],
    taste_notes  = ARRAY['Rich', 'Malty', 'Boozy', 'Warming', 'Full-bodied', 'Complex'],
    finish_notes = ARRAY['Warming', 'Long', 'Vanilla', 'Oaky'],
    glass_type   = 'snifter'
  WHERE brewery_id = pp_brewery AND name = 'Binary Barleywine';

  UPDATE public.beers SET
    description = 'Dry Northwest-style cider pressed from Honeycrisp and Granny Smith with a wink of fresh ginger. Gluten-free, bright, and dangerously sessionable.',
    srm          = 2,
    aroma_notes  = ARRAY['Apple', 'Floral', 'Pear'],
    taste_notes  = ARRAY['Tart', 'Crisp', 'Dry', 'Light-bodied', 'Apple'],
    finish_notes = ARRAY['Dry', 'Crisp', 'Clean'],
    glass_type   = 'tulip'
  WHERE brewery_id = pp_brewery AND name = 'Cache Miss Cider';

  UPDATE public.beers SET
    description = 'Traditional English Extra Special Bitter with floor-malted Maris Otter and whole-leaf East Kent Goldings. Biscuit malt, earthy hops, proper pub balance.',
    srm          = 14,
    aroma_notes  = ARRAY['Biscuit', 'Caramel', 'Earthy', 'Toast'],
    taste_notes  = ARRAY['Bready', 'Balanced', 'Malty', 'Medium-bodied'],
    finish_notes = ARRAY['Dry', 'Biscuity', 'Clean'],
    glass_type   = 'nonic_pint'
  WHERE brewery_id = pp_brewery AND name = 'Exception Handler ESB';

  -- ═══════════════════════════════════════════════════════════════════════
  -- Legacy roster (seeds/002_test_brewery.sql) — 10 classic beers
  -- ═══════════════════════════════════════════════════════════════════════

  UPDATE public.beers SET
    description = 'Classic West Coast IPA built on a bed of two-row malt and piled high with Simcoe, Centennial, and Amarillo. Resinous pine, bright grapefruit, and a firm bitter backbone.',
    srm          = 7,
    aroma_notes  = ARRAY['Pine', 'Grapefruit', 'Citrus', 'Resinous', 'Dank'],
    taste_notes  = ARRAY['Bitter', 'Piney', 'Citrus', 'Dank', 'Medium-bodied'],
    finish_notes = ARRAY['Lingering Bitter', 'Resinous Finish', 'Dry'],
    glass_type   = 'ipa_glass'
  WHERE brewery_id = pp_brewery AND name = 'Debug IPA';

  UPDATE public.beers SET
    description = 'Crystal-clear Czech-style pilsner decoction-mashed for a full cracker malt body and late-hopped with whole-leaf Saaz. Floral nose, honeyed finish, ruthless clarity.',
    srm          = 4,
    aroma_notes  = ARRAY['Bread', 'Honey', 'Floral', 'Grassy'],
    taste_notes  = ARRAY['Crisp', 'Clean', 'Malty', 'Bitter', 'Light-bodied'],
    finish_notes = ARRAY['Dry', 'Snappy', 'Refreshing'],
    glass_type   = 'pilsner_glass'
  WHERE brewery_id = pp_brewery AND name = 'Pixel Perfect Pils';

  UPDATE public.beers SET
    description = 'Russian imperial stout aged 12 months in Buffalo Trace barrels. Bittersweet chocolate, dark espresso, dark cherry, bourbon warmth. A beer for the deploy after midnight.',
    srm          = 40,
    aroma_notes  = ARRAY['Chocolate', 'Coffee', 'Dark Fruit', 'Roasty', 'Bourbon', 'Vanilla'],
    taste_notes  = ARRAY['Roasty', 'Chocolate', 'Boozy', 'Rich', 'Full-bodied', 'Warming'],
    finish_notes = ARRAY['Warming', 'Long', 'Bitter', 'Bourbon'],
    glass_type   = 'snifter'
  WHERE brewery_id = pp_brewery AND name = 'Dark Mode Stout';

  UPDATE public.beers SET
    description = 'Kettle-soured Berliner weisse conditioned on whole raspberries and fresh lemon peel. Puckeringly tart, jewel-toned magenta pour, bright fruit finish — the beer version of a page refresh.',
    srm          = 8,
    aroma_notes  = ARRAY['Raspberry', 'Tart', 'Floral', 'Lemon'],
    taste_notes  = ARRAY['Tart', 'Sour', 'Puckering', 'Berry', 'Light-bodied'],
    finish_notes = ARRAY['Tart', 'Dry', 'Crisp'],
    glass_type   = 'tulip'
  WHERE brewery_id = pp_brewery AND name = 'Stack Overflow Sour';

  UPDATE public.beers SET
    description = 'Authentic Oktoberfest-style Märzen: Munich and Vienna malt, Hallertau hops, cold-lagered for six weeks. Toasty bread crust, caramel richness, clean German finish.',
    srm          = 11,
    aroma_notes  = ARRAY['Bread', 'Caramel', 'Toast', 'Nutty'],
    taste_notes  = ARRAY['Malty', 'Bready', 'Toasty', 'Balanced', 'Medium-bodied'],
    finish_notes = ARRAY['Dry', 'Biscuity', 'Clean'],
    glass_type   = 'mug_stein'
  WHERE brewery_id = pp_brewery AND name = 'Merge Conflict Märzen';

  UPDATE public.beers SET
    description = 'American pale ale double dry-hopped with Mosaic and Citra. Juicy tropical fruit up front, soft bitter finish, an everyday beer that punches above its weight.',
    srm          = 6,
    aroma_notes  = ARRAY['Citrus', 'Tropical', 'Grapefruit', 'Pine', 'Mango'],
    taste_notes  = ARRAY['Juicy', 'Citrus', 'Tropical', 'Balanced', 'Medium-bodied'],
    finish_notes = ARRAY['Clean', 'Crisp', 'Lingering Bitter'],
    glass_type   = 'shaker_pint'
  WHERE brewery_id = pp_brewery AND name = 'Pull Request Pale';

  UPDATE public.beers SET
    description = 'Smoked porter brewed with cherrywood-smoked malt and conditioned on Madagascar vanilla beans. Campfire, dark chocolate, and a long smoky fade — build it once, sip it forever.',
    srm          = 32,
    aroma_notes  = ARRAY['Smoke', 'Vanilla', 'Chocolate', 'Roasty', 'Campfire'],
    taste_notes  = ARRAY['Smoky', 'Roasty', 'Chocolate', 'Vanilla', 'Medium-bodied'],
    finish_notes = ARRAY['Smoky', 'Roasty', 'Long'],
    glass_type   = 'nonic_pint'
  WHERE brewery_id = pp_brewery AND name = 'Kernel Panic Porter';

  UPDATE public.beers SET
    description = 'Bavarian hefeweizen fermented with Weihenstephan yeast. Banana and clove esters, hazy gold body, pillowy wheat mouthfeel — a stack-trace you actually want to read.',
    srm          = 5,
    aroma_notes  = ARRAY['Banana', 'Clove', 'Bread', 'Bubblegum'],
    taste_notes  = ARRAY['Creamy', 'Bready', 'Banana', 'Medium-bodied'],
    finish_notes = ARRAY['Smooth', 'Dry', 'Clean'],
    glass_type   = 'weizen_glass'
  WHERE brewery_id = pp_brewery AND name = '404 Wheat Not Found';

  UPDATE public.beers SET
    description = 'Double IPA for the brave. Dank and resinous up front, tropical fruit on the back, a warming 9.2% hiding behind a wall of Simcoe, Mosaic, and Nelson Sauvin.',
    srm          = 7,
    aroma_notes  = ARRAY['Tropical', 'Citrus', 'Pine', 'Resinous', 'Dank', 'Mango'],
    taste_notes  = ARRAY['Hoppy', 'Bitter', 'Juicy', 'Dank', 'Full-bodied', 'Boozy'],
    finish_notes = ARRAY['Lingering Bitter', 'Warming', 'Resinous Finish'],
    glass_type   = 'ipa_glass'
  WHERE brewery_id = pp_brewery AND name = 'Deploy Friday DIPA';

  UPDATE public.beers SET
    description = 'Classic American lager in the pre-Prohibition tradition. Six-row malt, flaked corn, noble Hallertau, lagered for a month. Clean, crisp, and deeply unopinionated.',
    srm          = 4,
    aroma_notes  = ARRAY['Bread', 'Grassy', 'Floral', 'Honey'],
    taste_notes  = ARRAY['Crisp', 'Clean', 'Malty', 'Balanced', 'Light-bodied'],
    finish_notes = ARRAY['Dry', 'Clean', 'Refreshing'],
    glass_type   = 'pilsner_glass'
  WHERE brewery_id = pp_brewery AND name = 'Legacy Code Lager';

END $$;

NOTIFY pgrst, 'reload schema';
