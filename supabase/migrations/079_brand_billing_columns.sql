-- Migration 079: Brand Billing Columns — Sprint 121 (The Ledger)
-- Adds billing fields to brewery_brands for consolidated brand-level billing.
-- Zero impact on existing per-brewery billing.

ALTER TABLE brewery_brands
  ADD COLUMN IF NOT EXISTS subscription_tier  text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS trial_ends_at      timestamptz,
  ADD COLUMN IF NOT EXISTS billing_email      text;

-- Unique constraint + partial index for Stripe customer lookups
ALTER TABLE brewery_brands
  ADD CONSTRAINT brewery_brands_stripe_customer_id_key UNIQUE (stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_brewery_brands_stripe_customer_id
  ON brewery_brands (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
