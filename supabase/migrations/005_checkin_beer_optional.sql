-- REQ-013: Decouple brewery check-in from beer logging
-- beer_id is now optional — users can check in to a brewery without logging a specific beer
ALTER TABLE public.checkins
  ALTER COLUMN beer_id DROP NOT NULL;
