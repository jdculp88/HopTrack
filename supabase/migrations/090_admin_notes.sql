-- Migration 090: Add admin_notes column to breweries for superadmin notes
-- Sprint 140 — The Bridge

ALTER TABLE breweries ADD COLUMN IF NOT EXISTS admin_notes text;
