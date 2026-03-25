-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 004: Brewery Branding & Beer Polish for Pint & Pixel Brewing Co.
-- Adds cover images, rich descriptions, and realistic beer details.
-- Safe to re-run (all plain UPDATE ... WHERE id = ...).
-- Run AFTER 002_test_brewery.sql and 003_test_activity.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Brewery record ────────────────────────────────────────────────────────────

UPDATE public.breweries
SET
  cover_image_url = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80',
  description     = 'Pint & Pixel Brewing Co. is an Austin-born craft brewery where software culture meets serious beer craft — every tap handle tells a story only a developer could love. Tucked into East Austin''s buzzing creative corridor, our taproom feels like the best parts of a hackathon and a neighborhood bar rolled into one: reclaimed-wood communal tables, a rotating vinyl soundtrack, and 10 rotating taps poured by people who genuinely care what''s in your glass. We obsess over clean fermentation, locally sourced malt, and hops that make you forget your open pull requests. Come for the Debug IPA, stay for the Deploy Friday DIPA — just maybe not on a school night.',
  phone           = '(512) 555-0142',
  website_url     = 'https://pintandpixel.beer',
  street          = '2214 E. 6th Street'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';


-- ── Beer images and descriptions ──────────────────────────────────────────────

-- Debug IPA — bright golden West Coast IPA
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80',
  description     = 'Our flagship West Coast IPA throws bright grapefruit and pine resin at your palate, backed by a firm but clean bitterness that dries out beautifully on the finish. The name comes from the fact that it fixes everything — at least temporarily.',
  abv             = 6.8,
  ibu             = 65,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Debug IPA';

-- Pixel Perfect Pils — crystal-clear Czech-style pilsner
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80',
  description     = 'A Czech-style pilsner brewed to exacting tolerances — clear as a passing unit test, with delicate Saaz floral aroma and a dry, biscuit-malt backbone that makes it dangerously easy to order a second round. Every pixel in place.',
  abv             = 4.8,
  ibu             = 28,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Pixel Perfect Pils';

-- Dark Mode Stout — full-bodied oatmeal stout
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?w=600&q=80',
  description     = 'We activated Dark Mode and never looked back — this velvety oatmeal stout pours black as a midnight terminal window with a persistent tan head and deep notes of espresso, bittersweet chocolate, and a hint of bourbon vanilla. Your screen, your glass, your dark aesthetic.',
  abv             = 7.2,
  ibu             = 45,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Dark Mode Stout';

-- Stack Overflow Sour — kettle sour with raspberry and lemon
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1600788907416-456578634209?w=600&q=80',
  description     = 'Like every developer''s favorite Q&A site, this kettle sour has an answer for everything — puckering tartness up front, a burst of fresh raspberry, and just enough lemon zest to make you copy-paste another pint. Dangerously drinkable at a deceptively approachable ABV.',
  abv             = 5.1,
  ibu             = 10,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Stack Overflow Sour';

-- Merge Conflict Märzen — traditional Oktoberfest lager (seasonal)
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  description     = 'Two malt bills walked into a fermenter and somehow produced something beautiful — this traditional Märzen-style lager layers rich toasted bread, light caramel, and a clean lager finish that resolves all conflicts peacefully. Seasonal, because great things are worth waiting for.',
  abv             = 5.6,
  ibu             = 22,
  seasonal        = true
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Merge Conflict Märzen';

-- Pull Request Pale — American pale ale with Mosaic and Citra
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=600&q=80',
  description     = 'Awaiting your approval — this Mosaic and Citra hopped American pale ale comes in clean, with tropical mango and stone fruit up front and just enough hop bite to remind you it means business. Reviewed, approved, and ready to merge into your evening.',
  abv             = 5.3,
  ibu             = 38,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Pull Request Pale';

-- Kernel Panic Porter — robust porter with vanilla and smoked malt
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=600&q=80',
  description     = 'When the system crashes, you reach for this — a robust porter built on a foundation of smoked malt, dark chocolate, and a whisper of vanilla bean that keeps the whole stack from collapsing into chaos. Rich, warming, and deeply comforting in any operating environment.',
  abv             = 6.1,
  ibu             = 32,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Kernel Panic Porter';

-- 404 Wheat Not Found — Bavarian hefeweizen (seasonal)
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80',
  description     = 'You asked for a light summer wheat and — surprisingly — we found it. This Bavarian-style hefeweizen pours hazy gold with a pillowy white head and classic notes of ripe banana, clove, and fresh bread that make it the official beer of patio season. Seasonal, because summer doesn''t last forever.',
  abv             = 4.5,
  ibu             = 15,
  seasonal        = true
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = '404 Wheat Not Found';

-- Deploy Friday DIPA — big double IPA
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600&q=80',
  description     = 'Nobody should deploy on a Friday, and nobody should drink this alone — a massive West Coast double IPA loaded with dank, resinous hop oils, ripe tropical fruit, and a deep amber warmth that makes all your weekend decisions feel completely reasonable. You''ve been warned by your CTO and your liver.',
  abv             = 9.2,
  ibu             = 88,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Deploy Friday DIPA';

-- Legacy Code Lager — clean American lager
UPDATE public.beers
SET
  cover_image_url = 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=600&q=80',
  description     = 'Nobody wants to maintain it, but everyone''s glad it exists — this clean, crisp American lager is the workhorse of the tap list, delivering reliable refreshment with a light bready malt and a whisper of noble hop. Sometimes the classic approach is genuinely the best approach.',
  abv             = 4.2,
  ibu             = 18,
  seasonal        = false
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND name = 'Legacy Code Lager';


-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT
  'Brewery cover image set: ' || CASE WHEN cover_image_url IS NOT NULL THEN 'YES' ELSE 'NO' END AS result
FROM public.breweries
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Beers with cover images: ' || COUNT(*)::text
FROM public.beers
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND cover_image_url IS NOT NULL
UNION ALL
SELECT 'Seasonal beers: ' || COUNT(*)::text
FROM public.beers
WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  AND seasonal = true;
