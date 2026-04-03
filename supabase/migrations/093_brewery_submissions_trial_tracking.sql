-- Migration 093: brewery_submissions table + trial tracking columns
-- Sprint 145 — The Revenue Push
-- Owner: Quinn (Infrastructure Engineer)

-- ── brewery_submissions — captures "Can't find your brewery?" requests ──

CREATE TABLE IF NOT EXISTS brewery_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  website_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Users can insert their own submissions and read them
ALTER TABLE brewery_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own submissions"
  ON brewery_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own submissions"
  ON brewery_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can read all submissions"
  ON brewery_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true
    )
  );

CREATE POLICY "Superadmins can update submissions"
  ON brewery_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_superadmin = true
    )
  );

-- Index for admin review queue
CREATE INDEX idx_brewery_submissions_status ON brewery_submissions(status) WHERE status = 'pending';
CREATE INDEX idx_brewery_submissions_user_id ON brewery_submissions(user_id);

-- ── Trial tracking columns on breweries ──

ALTER TABLE breweries
  ADD COLUMN IF NOT EXISTS trial_warning_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_expired_sent_at timestamptz;

-- ── Notify PostgREST to reload schema cache ──
NOTIFY pgrst, 'reload schema';
