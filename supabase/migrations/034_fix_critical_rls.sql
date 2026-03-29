-- Sprint 30: Fix 3 critical RLS policies found in testing audit
-- 1. notifications: INSERT policy (notifications have NEVER been created due to missing policy)
-- 2. beers: UPDATE/DELETE for brewery admins (tap list edits silently fail)
-- 3. user_achievements: public SELECT for authenticated users (friend achievements blocked)

-- 1. Notifications INSERT
CREATE POLICY "Authenticated users can insert notifications"
ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Beers UPDATE for brewery admins
CREATE POLICY "Brewery admins can update beers" ON beers FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM brewery_accounts ba
  WHERE ba.brewery_id = beers.brewery_id AND ba.user_id = auth.uid()
));

-- 3. Beers DELETE for brewery admins
CREATE POLICY "Brewery admins can delete beers" ON beers FOR DELETE
USING (EXISTS (
  SELECT 1 FROM brewery_accounts ba
  WHERE ba.brewery_id = beers.brewery_id AND ba.user_id = auth.uid()
));

-- 4. User achievements: authenticated users can read all (achievements are not sensitive)
CREATE POLICY "Authenticated users can read achievements"
ON user_achievements FOR SELECT TO authenticated USING (true);
