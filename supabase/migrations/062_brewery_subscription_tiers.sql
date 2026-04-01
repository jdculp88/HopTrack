-- Migration 062: Set subscription tiers for demo breweries
-- Pint & Pixel + Mountain Ridge → barrel
-- River Bend Ales → cask
-- Smoky Barrel Craft Co. → tap

UPDATE breweries SET subscription_tier = 'barrel'
WHERE id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- Pint & Pixel Brewing Co.
  'dd000001-0000-0000-0000-000000000001'    -- Mountain Ridge Brewing
);

UPDATE breweries SET subscription_tier = 'cask'
WHERE id = 'dd000001-0000-0000-0000-000000000002';  -- River Bend Ales

UPDATE breweries SET subscription_tier = 'tap'
WHERE id = 'dd000001-0000-0000-0000-000000000003';  -- Smoky Barrel Craft Co.
