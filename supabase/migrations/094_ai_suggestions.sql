-- Migration 094: AI promotion suggestions for brewery owners
-- Sprint 146 — The AI Sprint
-- Owner: Quinn (Infrastructure Engineer)

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'dismissed')),
  generated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  dismissed_at timestamptz,
  model_used text NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  tokens_used integer,
  cost_usd numeric(10,6),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_suggestions_brewery_status
  ON ai_suggestions(brewery_id, status);
CREATE INDEX idx_ai_suggestions_brewery_generated
  ON ai_suggestions(brewery_id, generated_at DESC);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Brewery admins can view their own suggestions
CREATE POLICY "Brewery admins can view their suggestions"
  ON ai_suggestions FOR SELECT
  USING (brewery_id IN (
    SELECT brewery_id FROM brewery_accounts
    WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
  ));

-- Brewery admins can update their own suggestions (accept/dismiss)
CREATE POLICY "Brewery admins can update their suggestions"
  ON ai_suggestions FOR UPDATE
  USING (brewery_id IN (
    SELECT brewery_id FROM brewery_accounts
    WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
  ));

-- Service role inserts (cron + API generation)
CREATE POLICY "Service role can insert suggestions"
  ON ai_suggestions FOR INSERT
  WITH CHECK (true);
