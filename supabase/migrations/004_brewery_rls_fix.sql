-- Migration 004: Fix breweries table RLS policies
-- Adds brewery_accounts role-based UPDATE policy to match loyalty_programs/promotions pattern

-- Drop the weak creator-only UPDATE policy
DROP POLICY IF EXISTS "Creators can update their breweries" ON public.breweries;

-- Add role-based UPDATE policy: original creator OR any brewery_accounts member
CREATE POLICY "Brewery members can update their brewery" ON public.breweries
  FOR UPDATE USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE brewery_id = breweries.id
        AND user_id = auth.uid()
    )
  );
