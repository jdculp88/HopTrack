-- ============================================================================
-- Migration 073: Brand Role Propagation Support
-- Sprint 115 — The Brand
-- ============================================================================
-- Adds propagated_from_brand flag to brewery_accounts to distinguish
-- brand-inherited access from direct grants. Enables clean removal when
-- a location leaves a brand.
-- ============================================================================

-- ─── Add propagation flag to brewery_accounts ───────────────────────────────
ALTER TABLE brewery_accounts
  ADD COLUMN IF NOT EXISTS propagated_from_brand boolean NOT NULL DEFAULT false;

-- Index for cleanup queries (find all propagated rows for a given brewery)
CREATE INDEX IF NOT EXISTS idx_brewery_accounts_propagated
  ON brewery_accounts (brewery_id) WHERE propagated_from_brand = true;

-- ─── Create brand-logos storage bucket ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload brand logos
CREATE POLICY "brand_logos_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');

-- Allow public read for brand logos
CREATE POLICY "brand_logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');

-- Allow owners to update/delete their uploads
CREATE POLICY "brand_logos_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "brand_logos_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
