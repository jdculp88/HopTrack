-- 008_brewery_admin_session_rls.sql
-- Allow brewery admins to read sessions and beer_logs at their brewery.
-- Without this, dashboard queries fail — RLS only lets users see their OWN data.
-- Note: brewery_accounts.brewery_id is uuid, sessions/beer_logs.brewery_id is text — cast needed.

-- Brewery admins can view all sessions at their brewery
CREATE POLICY "Brewery admins can view sessions at their brewery" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.brewery_id::text = sessions.brewery_id
    )
  );

-- Brewery admins can view all beer logs at their brewery
CREATE POLICY "Brewery admins can view beer logs at their brewery" ON beer_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.brewery_id::text = beer_logs.brewery_id
    )
  );
