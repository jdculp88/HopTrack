-- Migration 054: Challenges System
-- Sprint 81 — The Challenge
-- Brewery-created challenges that drive repeat visits

-- Challenges table (brewery-created)
CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '🍺',
  challenge_type text NOT NULL CHECK (challenge_type IN ('beer_count', 'specific_beers', 'visit_streak', 'style_variety')),
  target_value integer NOT NULL CHECK (target_value > 0),
  target_beer_ids uuid[] DEFAULT '{}',
  reward_description text,
  reward_xp integer NOT NULL DEFAULT 100,
  reward_loyalty_stamps integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  max_participants integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

-- Challenge participants table (user progress)
CREATE TABLE challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Indexes
CREATE INDEX challenges_brewery_id_idx ON challenges(brewery_id);
CREATE INDEX challenges_is_active_idx ON challenges(is_active) WHERE is_active = true;
CREATE INDEX challenge_participants_user_id_idx ON challenge_participants(user_id);
CREATE INDEX challenge_participants_challenge_id_idx ON challenge_participants(challenge_id);
CREATE INDEX challenge_participants_completed_at_idx ON challenge_participants(completed_at) WHERE completed_at IS NOT NULL;

-- RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Challenges: anyone can read active challenges
CREATE POLICY "challenges_select_public"
  ON challenges FOR SELECT
  USING (is_active = true);

-- Challenges: brewery admins can read all their challenges (including inactive)
CREATE POLICY "challenges_select_brewery_admin"
  ON challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = challenges.brewery_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'manager')
    )
  );

-- Challenges: brewery admins can create
CREATE POLICY "challenges_insert_brewery_admin"
  ON challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = challenges.brewery_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'manager')
    )
  );

-- Challenges: brewery admins can update
CREATE POLICY "challenges_update_brewery_admin"
  ON challenges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = challenges.brewery_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'manager')
    )
  );

-- Challenges: brewery admins can delete
CREATE POLICY "challenges_delete_brewery_admin"
  ON challenges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = challenges.brewery_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'manager')
    )
  );

-- Challenge participants: users can read their own progress
CREATE POLICY "challenge_participants_select_own"
  ON challenge_participants FOR SELECT
  USING (user_id = auth.uid());

-- Challenge participants: brewery admins can read progress for their challenges
CREATE POLICY "challenge_participants_select_brewery_admin"
  ON challenge_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenges
      JOIN brewery_accounts ON brewery_accounts.brewery_id = challenges.brewery_id
      WHERE challenges.id = challenge_participants.challenge_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'manager')
    )
  );

-- Challenge participants: authenticated users can join (insert)
CREATE POLICY "challenge_participants_insert_auth"
  ON challenge_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Challenge participants: users can update their own progress
-- (In practice, progress updates come from session-end API using service role,
--  but this allows direct updates for the user's own rows as a fallback)
CREATE POLICY "challenge_participants_update_own"
  ON challenge_participants FOR UPDATE
  USING (user_id = auth.uid());
