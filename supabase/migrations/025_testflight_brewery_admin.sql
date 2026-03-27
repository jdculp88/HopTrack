-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 025: Make TestFlight user a verified admin of Mountain Ridge Brewing
-- Allows demoing the brewery admin dashboard + The Board with the test account
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO brewery_accounts (user_id, brewery_id, role, verified, verified_at)
SELECT
  u.id,
  'dd000001-0000-0000-0000-000000000001'::uuid,
  'owner',
  true,
  now()
FROM auth.users u
WHERE u.email = 'testflight@hoptrack.beer'
ON CONFLICT (user_id, brewery_id) DO UPDATE SET
  role = 'owner',
  verified = true,
  verified_at = now();
