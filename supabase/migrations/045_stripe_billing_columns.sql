-- Migration 045: Add Stripe billing columns to breweries table
-- Required by: billing webhook, checkout API, BillingClient

ALTER TABLE breweries
  ADD COLUMN IF NOT EXISTS subscription_tier   text        NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id  text,
  ADD COLUMN IF NOT EXISTS trial_ends_at       timestamptz;

-- Index for webhook lookups by stripe customer
CREATE INDEX IF NOT EXISTS idx_breweries_stripe_customer_id
  ON breweries (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Existing brewery_accounts rows default to 'free' (handled by column default above)
