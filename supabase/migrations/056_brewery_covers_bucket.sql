-- Migration 056: Create brewery-covers storage bucket
-- Fixes "Bucket not found" error on menu upload (MenuUpload component)

INSERT INTO storage.buckets (id, name, public)
VALUES ('brewery-covers', 'brewery-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their brewery folder
CREATE POLICY "Authenticated users can upload brewery covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brewery-covers');

-- Allow authenticated users to update/replace their uploads
CREATE POLICY "Authenticated users can update brewery covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brewery-covers');

-- Allow public read access (menu images/PDFs shown on public brewery page)
CREATE POLICY "Public read access for brewery covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brewery-covers');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete brewery covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brewery-covers');
