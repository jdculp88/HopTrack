-- Migration 071: Smart Search — fuzzy search functions via pg_trgm
-- pg_trgm extension and GIN indexes on beers.name, breweries.name already exist

-- ─── search_beers_fuzzy ─────────────────────────────────────────────────────
-- Fuzzy beer search with brewery name join. Matches by trigram similarity
-- OR exact substring (ILIKE). Results ordered by relevance.
CREATE OR REPLACE FUNCTION search_beers_fuzzy(
  query text,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  style text,
  abv real,
  brewery_id uuid,
  brewery_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.name,
    b.style::text,
    b.abv,
    b.brewery_id,
    br.name AS brewery_name
  FROM beers b
  JOIN breweries br ON br.id = b.brewery_id
  WHERE
    similarity(b.name, query) > 0.15
    OR b.name ILIKE '%' || query || '%'
  ORDER BY similarity(b.name, query) DESC
  LIMIT max_results;
$$;

-- ─── search_breweries_fuzzy ─────────────────────────────────────────────────
-- Fuzzy brewery search. Matches name by trigram similarity OR exact substring,
-- plus city/state ILIKE fallback. Results ordered by name relevance.
CREATE OR REPLACE FUNCTION search_breweries_fuzzy(
  query text,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  state text,
  brewery_type text,
  latitude float8,
  longitude float8
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    br.id,
    br.name,
    br.city,
    br.state,
    br.brewery_type::text,
    br.latitude,
    br.longitude
  FROM breweries br
  WHERE
    similarity(br.name, query) > 0.15
    OR br.name ILIKE '%' || query || '%'
    OR br.city ILIKE '%' || query || '%'
    OR br.state ILIKE '%' || query || '%'
  ORDER BY similarity(br.name, query) DESC
  LIMIT max_results;
$$;

-- ─── search_all ─────────────────────────────────────────────────────────────
-- Combined typeahead: returns JSON with both beer and brewery results.
CREATE OR REPLACE FUNCTION search_all(
  query text,
  max_results int DEFAULT 5
)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'beers', COALESCE((
      SELECT json_agg(row_to_json(beer_row))
      FROM (
        SELECT
          b.id,
          b.name,
          b.style::text,
          b.abv,
          b.brewery_id,
          br.name AS brewery_name
        FROM beers b
        JOIN breweries br ON br.id = b.brewery_id
        WHERE
          similarity(b.name, query) > 0.15
          OR b.name ILIKE '%' || query || '%'
        ORDER BY similarity(b.name, query) DESC
        LIMIT max_results
      ) beer_row
    ), '[]'::json),
    'breweries', COALESCE((
      SELECT json_agg(row_to_json(brewery_row))
      FROM (
        SELECT
          br.id,
          br.name,
          br.city,
          br.state,
          br.brewery_type::text,
          br.latitude,
          br.longitude
        FROM breweries br
        WHERE
          similarity(br.name, query) > 0.15
          OR br.name ILIKE '%' || query || '%'
          OR br.city ILIKE '%' || query || '%'
          OR br.state ILIKE '%' || query || '%'
        ORDER BY similarity(br.name, query) DESC
        LIMIT max_results
      ) brewery_row
    ), '[]'::json)
  );
$$;

-- Reload PostgREST schema cache so new functions are immediately callable
NOTIFY pgrst, 'reload schema';
