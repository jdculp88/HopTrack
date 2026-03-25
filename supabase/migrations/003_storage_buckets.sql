-- Migration 003: Supabase Storage — beer-photos + brewery-covers buckets
-- Run: supabase db push  OR  npm run db:migrate

-- ─────────────────────────────────────────────
-- Create storage buckets
-- ─────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'beer-photos',
    'beer-photos',
    true,
    5242880,  -- 5 MB per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'brewery-covers',
    'brewery-covers',
    true,
    10485760, -- 10 MB per file
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- RLS policies: beer-photos
-- Anyone can view (public bucket). Only authenticated users can upload.
-- Users can only delete their own uploads.
-- ─────────────────────────────────────────────

CREATE POLICY "beer_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'beer-photos');

CREATE POLICY "beer_photos_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'beer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "beer_photos_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'beer-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─────────────────────────────────────────────
-- RLS policies: brewery-covers
-- Anyone can view. Only verified brewery admins can upload/delete.
-- ─────────────────────────────────────────────

CREATE POLICY "brewery_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brewery-covers');

CREATE POLICY "brewery_covers_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brewery-covers'
    AND EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE user_id = auth.uid()
        AND brewery_id = (storage.foldername(name))[1]::uuid
    )
  );

CREATE POLICY "brewery_covers_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brewery-covers'
    AND EXISTS (
      SELECT 1 FROM public.brewery_accounts
      WHERE user_id = auth.uid()
        AND brewery_id = (storage.foldername(name))[1]::uuid
    )
  );
