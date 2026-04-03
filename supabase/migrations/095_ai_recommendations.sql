-- Migration 095: AI-powered beer recommendations cache
-- Sprint 146 — The AI Sprint
-- Owner: Quinn (Infrastructure Engineer)

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  model_used text NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  tokens_used integer
);

CREATE INDEX idx_ai_recommendations_user_expires
  ON ai_recommendations(user_id, expires_at DESC);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendations
CREATE POLICY "Users can view their own recommendations"
  ON ai_recommendations FOR SELECT
  USING (user_id = auth.uid());

-- Service role manages all recommendations
CREATE POLICY "Service role can manage recommendations"
  ON ai_recommendations FOR ALL
  WITH CHECK (true);
