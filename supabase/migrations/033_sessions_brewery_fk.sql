-- 033_sessions_brewery_fk.sql
-- Fix sessions.brewery_id and beer_logs.brewery_id: text → uuid with FK to breweries.
-- Without this, PostgREST (PGRST200) cannot auto-join sessions→breweries, causing
-- all session feed queries to silently return null.
--
-- Safe: all existing values are valid UUIDs or NULL (home sessions).
-- Apply with: supabase db push

-- Drop the index first (it's on the text column)
DROP INDEX IF EXISTS sessions_brewery_id_idx;
DROP INDEX IF EXISTS beer_logs_brewery_id_idx;

-- Also drop RLS policy that casts brewery_id::text (will recreate without cast)
DROP POLICY IF EXISTS "Brewery admins can view sessions at their brewery" ON sessions;
DROP POLICY IF EXISTS "Brewery admins can view beer logs at their brewery" ON beer_logs;

-- Change sessions.brewery_id from text → uuid
-- First cast to uuid, then null out any IDs that don't exist in breweries
ALTER TABLE sessions
  ALTER COLUMN brewery_id TYPE uuid USING brewery_id::uuid;

UPDATE sessions
  SET brewery_id = NULL
  WHERE brewery_id IS NOT NULL
    AND brewery_id NOT IN (SELECT id FROM breweries);

ALTER TABLE sessions
  ADD CONSTRAINT sessions_brewery_id_fkey
  FOREIGN KEY (brewery_id) REFERENCES breweries(id) ON DELETE SET NULL;

-- Change beer_logs.brewery_id from text → uuid
ALTER TABLE beer_logs
  ALTER COLUMN brewery_id TYPE uuid USING brewery_id::uuid;

UPDATE beer_logs
  SET brewery_id = NULL
  WHERE brewery_id IS NOT NULL
    AND brewery_id NOT IN (SELECT id FROM breweries);

ALTER TABLE beer_logs
  ADD CONSTRAINT beer_logs_brewery_id_fkey
  FOREIGN KEY (brewery_id) REFERENCES breweries(id) ON DELETE SET NULL;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS sessions_brewery_id_idx ON sessions(brewery_id);
CREATE INDEX IF NOT EXISTS beer_logs_brewery_id_idx ON beer_logs(brewery_id);

-- Recreate brewery admin RLS policies (no more cast needed)
CREATE POLICY "Brewery admins can view sessions at their brewery" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
        AND ba.brewery_id = sessions.brewery_id
    )
  );

CREATE POLICY "Brewery admins can view beer logs at their brewery" ON beer_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
        AND ba.brewery_id = beer_logs.brewery_id
    )
  );
