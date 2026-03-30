-- Migration 039: Referral system + Group sessions V1
-- Sprint 37 — Grow Together

-- ── Referral Codes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT NOT NULL UNIQUE,
  use_count     INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS referral_codes_user_idx ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes(code);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral code"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral code use_count"
  ON referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow reading by code for redemption (unauthenticated lookup)
CREATE POLICY "Anyone can look up referral codes by code"
  ON referral_codes FOR SELECT
  USING (true);

-- ── Referral Uses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_uses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referred_id)  -- each user can only be referred once
);

CREATE INDEX IF NOT EXISTS referral_uses_referrer_idx ON referral_uses(referrer_id);

ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read referrals they made or received"
  ON referral_uses FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Service can insert referral uses"
  ON referral_uses FOR INSERT
  WITH CHECK (true);

-- ── Add referred_by to profiles ────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Session Participants (Group Sessions V1) ───────────────────────────────────
DO $$ BEGIN
  CREATE TYPE participant_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS session_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        participant_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS session_participants_session_idx ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS session_participants_user_idx ON session_participants(user_id);

ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Session owner + invited user can read
CREATE POLICY "Participants can read their invites"
  ON session_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = invited_by
    OR auth.uid() IN (
      SELECT user_id FROM sessions WHERE id = session_id
    )
  );

-- Session owner can invite friends
CREATE POLICY "Session owner can invite participants"
  ON session_participants FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND auth.uid() IN (
      SELECT user_id FROM sessions WHERE id = session_id
    )
  );

-- Invited user can update their own status
CREATE POLICY "Invited user can accept or decline"
  ON session_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Session owner or invited user can delete
CREATE POLICY "Session owner or participant can remove"
  ON session_participants FOR DELETE
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT user_id FROM sessions WHERE id = session_id
    )
  );
