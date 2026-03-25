-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 002: Test Brewery for Demo / Development
-- Run AFTER migration 001_brewery_accounts.sql
-- This creates a brewery and connects it to YOUR account (the logged-in user)
-- ─────────────────────────────────────────────────────────────────────────────

-- Use a fixed UUID so every reference below stays consistent
-- (same UUID every time this seed is re-run — safe to run multiple times)
DO $$
DECLARE
  demo_brewery_id uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN

  -- ── Step 1: Insert the test brewery ────────────────────────────────────────
  INSERT INTO breweries (id, name, brewery_type, street, city, state, country, latitude, longitude, website_url, phone)
  VALUES (
    demo_brewery_id,
    'Pint & Pixel Brewing Co.',
    'microbrewery',
    '42 Hop Street',
    'Austin',
    'Texas',
    'United States',
    30.2672,
    -97.7431,
    'https://pintandpixel.example.com',
    '(512) 555-0142'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    state = EXCLUDED.state;

  -- ── Step 2: Insert beers ────────────────────────────────────────────────────
  INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap)
  VALUES
    (gen_random_uuid(), demo_brewery_id, 'Debug IPA',           'IPA',        6.8, 65, 'A bright, citrusy West Coast IPA with notes of grapefruit, pine, and dry hop aroma. Crisp finish.', true),
    (gen_random_uuid(), demo_brewery_id, 'Pixel Perfect Pils',  'Pilsner',    4.8, 28, 'Crystal-clear Czech-style pilsner. Floral Saaz hops, biscuit malt, refreshing and clean.', true),
    (gen_random_uuid(), demo_brewery_id, 'Dark Mode Stout',     'Stout',      7.2, 45, 'Full-bodied oatmeal stout. Roasted coffee, dark chocolate, and a silky smooth finish.', true),
    (gen_random_uuid(), demo_brewery_id, 'Stack Overflow Sour', 'Sour',       5.1, 10, 'Kettle sour with raspberry and lemon. Tart, fruity, dangerously drinkable.', true),
    (gen_random_uuid(), demo_brewery_id, 'Merge Conflict Märzen','Amber',     5.6, 22, 'Traditional Oktoberfest-style lager. Rich toasted malt, clean fermentation, great for pairs.', true),
    (gen_random_uuid(), demo_brewery_id, 'Pull Request Pale',   'Pale Ale',   5.3, 38, 'American pale ale with Mosaic and Citra hops. Tropical fruit, easy-drinking session beer.', true),
    (gen_random_uuid(), demo_brewery_id, 'Kernel Panic Porter', 'Porter',     6.1, 32, 'Robust porter with vanilla and smoked malt character. Campfire warmth, smooth roast.', true),
    (gen_random_uuid(), demo_brewery_id, '404 Wheat Not Found', 'Hefeweizen', 4.5, 15, 'Bavarian-style hefeweizen. Banana, clove, hazy golden body. Perfect summer pour.', true),
    (gen_random_uuid(), demo_brewery_id, 'Deploy Friday DIPA',  'Double IPA', 9.2, 88, 'Double IPA for the brave. Dank, resinous, tropical. Not for the faint of heart. Or HR.', true),
    (gen_random_uuid(), demo_brewery_id, 'Legacy Code Lager',   'Lager',      4.2, 18, 'Clean, approachable American lager. Sometimes the classic approach is best.', false)
  ON CONFLICT DO NOTHING;

  -- ── Step 3: Create loyalty program ─────────────────────────────────────────
  INSERT INTO loyalty_programs (brewery_id, name, description, stamps_required, reward_description, is_active)
  VALUES (
    demo_brewery_id,
    'The Hop Club',
    'Check in 10 times and earn a free pint of your choice.',
    10,
    'One free pint — any beer, any size.',
    true
  )
  ON CONFLICT DO NOTHING;

  -- ── Step 4: Add a test promotion ───────────────────────────────────────────
  INSERT INTO promotions (brewery_id, title, description, discount_type, discount_value, ends_at, is_active)
  VALUES (
    demo_brewery_id,
    'Happy Hour — $2 Off All Pints',
    'Every weekday 4–6pm. HopTrack members get the deal automatically — show your app at the bar.',
    'fixed',
    2.00,
    now() + interval '30 days',
    true
  )
  ON CONFLICT DO NOTHING;

END $$;

-- ── Step 5: Connect YOUR account as owner ────────────────────────────────────
-- auth.uid() must be called outside a DO block to resolve correctly
INSERT INTO brewery_accounts (user_id, brewery_id, role, verified, verified_at)
VALUES (
  auth.uid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'owner',
  true,
  now()
)
ON CONFLICT (user_id, brewery_id) DO UPDATE SET
  role        = 'owner',
  verified    = true,
  verified_at = now();

-- ── Confirm results ───────────────────────────────────────────────────────────
SELECT 'Brewery: ' || name AS result
  FROM breweries WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Beers loaded: ' || COUNT(*)::text
  FROM beers WHERE brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
UNION ALL
SELECT 'Your role: ' || role
  FROM brewery_accounts
  WHERE user_id = auth.uid()
    AND brewery_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
