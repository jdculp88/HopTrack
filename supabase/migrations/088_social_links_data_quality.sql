-- Sprint 132: The Clean Slate — Social links + data normalization
-- Adds social media columns and standardizes phone, URL, and postal code data

-- ============================================================
-- Section 1: Social link columns
-- ============================================================
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE breweries ADD COLUMN IF NOT EXISTS untappd_url TEXT;

-- ============================================================
-- Section 2: Normalize phone numbers (strip non-digits, drop US leading 1)
-- ============================================================
UPDATE breweries
SET phone = regexp_replace(phone, '[^0-9]', '', 'g')
WHERE phone IS NOT NULL
  AND phone ~ '[^0-9]';

UPDATE breweries
SET phone = substring(phone from 2)
WHERE phone IS NOT NULL
  AND length(phone) = 11
  AND phone LIKE '1%';

-- ============================================================
-- Section 3: Normalize website URLs (http → https, add protocol)
-- ============================================================
UPDATE breweries
SET website_url = 'https://' || substring(website_url from 8)
WHERE website_url IS NOT NULL
  AND website_url LIKE 'http://%';

UPDATE breweries
SET website_url = 'https://' || website_url
WHERE website_url IS NOT NULL
  AND website_url NOT LIKE 'https://%'
  AND website_url NOT LIKE 'http://%';

-- ============================================================
-- Section 4: Normalize US postal codes (5+4 → 5 digit)
-- ============================================================
UPDATE breweries
SET postal_code = substring(postal_code from 1 for 5)
WHERE postal_code IS NOT NULL
  AND postal_code ~ '^\d{5}-\d{4}$';
