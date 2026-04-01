-- Migration 063: Mug Clubs — Digital Mug Club Memberships (F-020)
-- Sprint 94 — Mug Clubs + P2 Polish
-- Brewery-managed annual membership programs with perks tracking

-- ─── mug_clubs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mug_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id UUID NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  annual_fee NUMERIC(10,2) NOT NULL,
  max_members INTEGER,
  perks JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── mug_club_members ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mug_club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mug_club_id UUID NOT NULL REFERENCES mug_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(mug_club_id, user_id)
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_mug_clubs_brewery_id ON mug_clubs(brewery_id);
CREATE INDEX idx_mug_club_members_club_id ON mug_club_members(mug_club_id);
CREATE INDEX idx_mug_club_members_user_id ON mug_club_members(user_id);

-- ─── RLS: mug_clubs ────────────────────────────────────────────────────────
ALTER TABLE mug_clubs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read mug clubs (public discovery)
CREATE POLICY "users_read_mug_clubs" ON mug_clubs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Brewery admins can manage their own mug clubs
CREATE POLICY "brewery_admins_manage_mug_clubs" ON mug_clubs
  FOR ALL USING (
    brewery_id IN (
      SELECT ba.brewery_id FROM brewery_accounts ba
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
  );

-- Superadmins can manage all mug clubs
CREATE POLICY "superadmin_manage_mug_clubs" ON mug_clubs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_superadmin = true
    )
  );

-- ─── RLS: mug_club_members ─────────────────────────────────────────────────
ALTER TABLE mug_club_members ENABLE ROW LEVEL SECURITY;

-- Members can read their own membership
CREATE POLICY "members_read_own_membership" ON mug_club_members
  FOR SELECT USING (user_id = auth.uid());

-- Brewery admins can read all members of their clubs
CREATE POLICY "brewery_admins_read_members" ON mug_club_members
  FOR SELECT USING (
    mug_club_id IN (
      SELECT mc.id FROM mug_clubs mc
      JOIN brewery_accounts ba ON ba.brewery_id = mc.brewery_id
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
  );

-- Brewery admins can manage members of their clubs
CREATE POLICY "brewery_admins_manage_members" ON mug_club_members
  FOR ALL USING (
    mug_club_id IN (
      SELECT mc.id FROM mug_clubs mc
      JOIN brewery_accounts ba ON ba.brewery_id = mc.brewery_id
      WHERE ba.user_id = auth.uid()
      AND ba.role IN ('owner', 'manager')
    )
  );

-- Superadmins can manage all memberships
CREATE POLICY "superadmin_manage_members" ON mug_club_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.is_superadmin = true
    )
  );
