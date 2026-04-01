-- Migration 065: Force PostgREST schema cache reload
-- Resolves BL-005: menu_image_url not recognized by PostgREST
-- Also ensures mug_clubs + mug_club_members are in the cache

NOTIFY pgrst, 'reload schema';
