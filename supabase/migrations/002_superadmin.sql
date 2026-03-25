-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Superadmin
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add is_superadmin to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- ADMIN ACTIONS audit log
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type    text NOT NULL,
  target_type    text NOT NULL,
  target_id      uuid,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user ON public.admin_actions (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions (target_type, target_id);

-- RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read
CREATE POLICY "admin_actions_superadmin_select"
  ON public.admin_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_superadmin = true
    )
  );

-- Only superadmins can insert (all writes are logged this way)
CREATE POLICY "admin_actions_superadmin_insert"
  ON public.admin_actions
  FOR INSERT
  WITH CHECK (
    admin_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_superadmin = true
    )
  );

-- Superadmins can update brewery_claims (approve/reject)
-- Drop existing restrictive policy and add superadmin override
CREATE POLICY "brewery_claims_superadmin_update"
  ON public.brewery_claims
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_superadmin = true
    )
  );

-- Superadmins can read all brewery_claims
CREATE POLICY "brewery_claims_superadmin_select"
  ON public.brewery_claims
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_superadmin = true
    )
  );

-- Superadmins can update brewery_accounts (set verified)
CREATE POLICY "brewery_accounts_superadmin_update"
  ON public.brewery_accounts
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_superadmin = true
    )
  );

-- Superadmins can read all profiles
CREATE POLICY "profiles_superadmin_select"
  ON public.profiles
  FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid()
        AND p2.is_superadmin = true
    )
  );
