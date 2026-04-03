-- Migration 092: Admin user notes + tags for superadmin user detail pages
-- Sprint 142 — The Superadmin II

-- Admin notes on individual user profiles
CREATE TABLE IF NOT EXISTS admin_user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_user_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_user_notes_user_id ON admin_user_notes(user_id);
CREATE INDEX idx_admin_user_notes_updated ON admin_user_notes(user_id, updated_at DESC);

-- One note per admin per user (latest wins)
CREATE UNIQUE INDEX idx_admin_user_notes_unique ON admin_user_notes(user_id, admin_user_id);

-- Manual tags for admin segmentation
CREATE TABLE IF NOT EXISTS admin_user_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_user_tags_user_id ON admin_user_tags(user_id);
CREATE UNIQUE INDEX idx_admin_user_tags_unique ON admin_user_tags(user_id, tag);

-- RLS: superadmin only
ALTER TABLE admin_user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_read_user_notes" ON admin_user_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "superadmin_write_user_notes" ON admin_user_notes
  FOR INSERT WITH CHECK (
    admin_user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "superadmin_update_user_notes" ON admin_user_notes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "superadmin_read_user_tags" ON admin_user_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "superadmin_write_user_tags" ON admin_user_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );

CREATE POLICY "superadmin_delete_user_tags" ON admin_user_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true)
  );
