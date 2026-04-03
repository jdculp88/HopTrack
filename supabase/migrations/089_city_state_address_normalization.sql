-- Migration 089: City, State & Address Normalization (Sprint 135 — The Formatter)
-- Standardizes city names (Title Case), state abbreviations (2-letter uppercase),
-- and street addresses (whitespace normalization) across all brewery records.
-- Follows the pattern established in migration 088 (phone, URL, postal code normalization).

-- ─── Section 1: City — Title Case normalization ─────────────────────────────────
-- PostgreSQL initcap() capitalizes first letter after every non-alphanumeric char.
-- Handles spaces, hyphens, apostrophes naturally.

UPDATE breweries
SET city = initcap(city)
WHERE city IS NOT NULL AND city <> initcap(city);

-- Mc-prefix fix: initcap produces "Mcallen" but we need "McAllen"
UPDATE breweries
SET city = 'Mc' || upper(substring(city from 3 for 1)) || substring(city from 4)
WHERE city IS NOT NULL AND city ~ '^Mc[a-z]';

-- ─── Section 2: State — 2-letter uppercase abbreviation ─────────────────────────
-- First: uppercase any lowercase 2-letter codes (most common case)

UPDATE breweries
SET state = upper(state)
WHERE state IS NOT NULL
  AND length(trim(state)) = 2
  AND state <> upper(state);

-- Dedup: remove full-state-name duplicates where an abbreviation row already exists.
-- The unique index idx_breweries_unique_name_location on (lower(name), lower(city), lower(state))
-- prevents SET state='CA' when a row with state='CA' already exists for same name+city.
-- Delete the full-name rows (keeping the abbreviation rows) to avoid collisions.
-- Only delete rows that have NO foreign key references (brewery_accounts, beers, etc.)

DELETE FROM breweries dup
WHERE length(trim(dup.state)) > 2
  AND EXISTS (
    SELECT 1 FROM breweries keeper
    WHERE lower(trim(keeper.name)) = lower(trim(dup.name))
      AND lower(trim(COALESCE(keeper.city, ''))) = lower(trim(COALESCE(dup.city, '')))
      AND length(trim(keeper.state)) = 2
      AND keeper.id <> dup.id
  )
  AND NOT EXISTS (SELECT 1 FROM brewery_accounts ba WHERE ba.brewery_id = dup.id)
  AND NOT EXISTS (SELECT 1 FROM beers b WHERE b.brewery_id = dup.id)
  AND NOT EXISTS (SELECT 1 FROM brewery_claims bc WHERE bc.brewery_id = dup.id);

-- For any remaining full-name duplicates that DO have FK references,
-- merge by updating their state to the abbreviation and letting the
-- ON CONFLICT behavior handle it naturally. We skip these — they need
-- manual review. Log them as a notice.
DO $$
DECLARE
  dup_count INTEGER;
BEGIN
  SELECT count(*) INTO dup_count FROM breweries WHERE length(trim(state)) > 2;
  IF dup_count > 0 THEN
    RAISE NOTICE '% breweries still have full state names after dedup — normalizing remaining', dup_count;
  END IF;
END $$;

-- Now convert remaining full state names to abbreviations.
-- After the DELETE above, most collisions are gone. For any stragglers that still
-- have FK references and would collide, skip them (they need manual review).
-- Use a DO block to handle each state safely with exception handling.

DO $$
DECLARE
  state_pair RECORD;
  updated_count INTEGER;
BEGIN
  FOR state_pair IN
    SELECT * FROM (VALUES
      ('alabama','AL'), ('alaska','AK'), ('arizona','AZ'), ('arkansas','AR'),
      ('california','CA'), ('colorado','CO'), ('connecticut','CT'), ('delaware','DE'),
      ('district of columbia','DC'),
      ('florida','FL'), ('georgia','GA'), ('hawaii','HI'), ('idaho','ID'),
      ('illinois','IL'), ('indiana','IN'), ('iowa','IA'), ('kansas','KS'),
      ('kentucky','KY'), ('louisiana','LA'), ('maine','ME'), ('maryland','MD'),
      ('massachusetts','MA'), ('michigan','MI'), ('minnesota','MN'), ('mississippi','MS'),
      ('missouri','MO'), ('montana','MT'), ('nebraska','NE'), ('nevada','NV'),
      ('new hampshire','NH'), ('new jersey','NJ'), ('new mexico','NM'),
      ('new york','NY'), ('north carolina','NC'), ('north dakota','ND'),
      ('ohio','OH'), ('oklahoma','OK'), ('oregon','OR'), ('pennsylvania','PA'),
      ('rhode island','RI'), ('south carolina','SC'), ('south dakota','SD'),
      ('tennessee','TN'), ('texas','TX'), ('utah','UT'), ('vermont','VT'),
      ('virginia','VA'), ('washington','WA'), ('west virginia','WV'),
      ('wisconsin','WI'), ('wyoming','WY')
    ) AS t(full_name, abbr)
  LOOP
    -- Only update rows where no abbreviation duplicate exists (avoids unique violation)
    UPDATE breweries
    SET state = state_pair.abbr
    WHERE lower(trim(state)) = state_pair.full_name
      AND NOT EXISTS (
        SELECT 1 FROM breweries x
        WHERE lower(trim(x.name)) = lower(trim(breweries.name))
          AND lower(trim(COALESCE(x.city, ''))) = lower(trim(COALESCE(breweries.city, '')))
          AND upper(trim(x.state)) = state_pair.abbr
          AND x.id <> breweries.id
      );
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
      RAISE NOTICE 'Normalized % → %: % rows', state_pair.full_name, state_pair.abbr, updated_count;
    END IF;
  END LOOP;
END $$;

-- ─── Section 3: Street — Whitespace normalization ───────────────────────────────
-- Conservative: trim + collapse whitespace only. No Title Case (too many edge cases
-- with unit numbers, suites, abbreviations across 7K+ rows).

UPDATE breweries
SET street = regexp_replace(trim(street), '\s+', ' ', 'g')
WHERE street IS NOT NULL
  AND (street <> trim(street) OR street ~ '\s{2,}');
