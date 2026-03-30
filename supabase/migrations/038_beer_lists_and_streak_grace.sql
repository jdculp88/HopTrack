-- Migration 038: Beer Lists + Streak Grace Period
-- Sprint 35 — The Social Layer

-- ─── Beer Lists ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beer_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beer_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES beer_lists(id) ON DELETE CASCADE,
  beer_id UUID NOT NULL REFERENCES beers(id) ON DELETE CASCADE,
  note TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, beer_id)
);

CREATE INDEX idx_beer_lists_user ON beer_lists(user_id);
CREATE INDEX idx_beer_list_items_list ON beer_list_items(list_id);
CREATE INDEX idx_beer_list_items_beer ON beer_list_items(beer_id);

-- RLS for beer_lists
ALTER TABLE beer_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read public lists"
  ON beer_lists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own lists"
  ON beer_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON beer_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON beer_lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for beer_list_items
ALTER TABLE beer_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items of public lists"
  ON beer_list_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM beer_lists
    WHERE beer_lists.id = beer_list_items.list_id
    AND (beer_lists.is_public = true OR beer_lists.user_id = auth.uid())
  ));

CREATE POLICY "List owners can insert items"
  ON beer_list_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM beer_lists
    WHERE beer_lists.id = beer_list_items.list_id
    AND beer_lists.user_id = auth.uid()
  ));

CREATE POLICY "List owners can update items"
  ON beer_list_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM beer_lists
    WHERE beer_lists.id = beer_list_items.list_id
    AND beer_lists.user_id = auth.uid()
  ));

CREATE POLICY "List owners can delete items"
  ON beer_list_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM beer_lists
    WHERE beer_lists.id = beer_list_items.list_id
    AND beer_lists.user_id = auth.uid()
  ));

-- ─── Streak Grace Period ────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_grace_used_at TIMESTAMPTZ;
