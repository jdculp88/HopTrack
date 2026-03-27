-- ============================================================================
-- Migration 020: Allow brewery admins to read loyalty card data for their brewery
-- Sprint 16 (S16-014)
-- ============================================================================

-- Brewery admins can view loyalty cards for their brewery (for dashboard analytics)
DROP POLICY IF EXISTS "loyalty_cards_brewery_admin_select" ON loyalty_cards;
CREATE POLICY "loyalty_cards_brewery_admin_select" ON loyalty_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = loyalty_cards.brewery_id
        AND brewery_accounts.user_id = auth.uid()
    )
  );
