-- ─── Migration 053: Heist Brewery Profile Enhancement ──────────────────────
-- Sprint 80 — The Untappd Killer
-- Adds description and profile data to Heist Brewery for demo/sales
-- ────────────────────────────────────────────────────────────────────────────

UPDATE breweries SET
  description = 'Heist Brewery is a Charlotte, NC brewpub known for their award-winning hazy IPAs, creative stouts, and vibrant taproom atmosphere. Their flagship CitraQuench''l helped pioneer the hazy IPA movement in North Carolina. With two locations — NoDa and Barrel Arts — Heist has become a cornerstone of Charlotte''s craft beer scene since opening in 2012.',
  brewery_type = 'brewpub',
  website_url = 'https://heistbrewery.com'
WHERE external_id = '528481d4-f3c8-479a-aad9-fce4b9cfe36a';
