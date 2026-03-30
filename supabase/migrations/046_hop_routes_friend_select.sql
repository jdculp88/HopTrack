-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 046: Allow friends to read active HopRoutes
--
-- The existing "Users can manage own hop routes" policy is FOR ALL, which
-- means SELECT is restricted to auth.uid() = user_id. This blocks the feed
-- from loading friends' active routes for the "Join them" CTA card.
--
-- This migration adds a separate SELECT policy that allows:
--   1. A user to read their own routes (all statuses)
--   2. Friends (accepted) to read active routes only
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the catch-all FOR ALL policy so we can split it cleanly
DROP POLICY IF EXISTS "Users can manage own hop routes" ON hop_routes;

-- Own routes — full access (SELECT + INSERT + UPDATE + DELETE)
CREATE POLICY "Users can manage own hop routes"
  ON hop_routes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Friends can read active routes
CREATE POLICY "Friends can view active hop routes"
  ON hop_routes FOR SELECT
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND addressee_id = hop_routes.user_id)
          OR
          (addressee_id = auth.uid() AND requester_id = hop_routes.user_id)
        )
    )
  );
