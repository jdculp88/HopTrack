-- Migration 059: Add barcode column to beers table
-- Sprint 89 — The Rolodex (F-008: Barcode Scanning Pilot)
-- Enables camera-based beer lookup by UPC/EAN barcode

ALTER TABLE beers ADD COLUMN IF NOT EXISTS barcode text;

-- Index for fast barcode lookups (most beers won't have one yet)
CREATE INDEX IF NOT EXISTS idx_beers_barcode ON beers (barcode) WHERE barcode IS NOT NULL;
