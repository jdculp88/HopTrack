-- Migration 041: HopRoute sponsored stop infrastructure + brewery vibe tags
-- Sprint 40 — HopRoute: Live + The Close

-- Sponsored stop fields on breweries
ALTER TABLE breweries
  ADD COLUMN IF NOT EXISTS hop_route_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hop_route_offer TEXT;

-- Vibe tags array on breweries (Drew: "vibe tags are how you get a rooftop into the right routes")
ALTER TABLE breweries
  ADD COLUMN IF NOT EXISTS vibe_tags TEXT[] DEFAULT '{}';

-- ── HopRoute achievements ──────────────────────────────────────────────────────
INSERT INTO achievements (key, name, description, icon, tier, category, badge_color, xp_reward)
VALUES
  (
    'first_hop_route',
    'First HopRoute',
    'Complete your first AI-powered brewery crawl.',
    '🗺️',
    'bronze',
    'social',
    '#CD7F32',
    100
  ),
  (
    'route_master',
    'Route Master',
    'Complete 5 HopRoutes.',
    '🏆',
    'gold',
    'social',
    '#D4A843',
    250
  )
ON CONFLICT (key) DO NOTHING;

-- Seed vibe tags for demo breweries
UPDATE breweries SET vibe_tags = ARRAY['rooftop', 'dog-friendly', 'live music', 'outdoor', 'lively']
  WHERE name = 'Mountain Ridge Brewing';

UPDATE breweries SET vibe_tags = ARRAY['waterfront', 'chill', 'food', 'outdoor', 'craft cocktails']
  WHERE name = 'River Bend Brewery';

UPDATE breweries SET vibe_tags = ARRAY['rustic', 'chill', 'dog-friendly', 'barrel-aged', 'small batch']
  WHERE name = 'Smoky Barrel Brewing Co';

-- Mark demo breweries as hop_route_eligible with sample offers
UPDATE breweries SET
  hop_route_eligible = TRUE,
  hop_route_offer = 'First pint free for HopRoute visitors! 🍺'
  WHERE name = 'Mountain Ridge Brewing';

UPDATE breweries SET
  hop_route_eligible = TRUE,
  hop_route_offer = 'Free pretzel with any pint for HopRoute groups'
  WHERE name = 'River Bend Brewery';
