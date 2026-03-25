-- ─────────────────────────────────────────────────────────────────────────────
-- Seed 005: User Avatars, Bios & Home Cities for Test Profiles
-- Polishes the 12 test users created in 003_test_activity.sql.
-- Safe to re-run (all plain UPDATE ... WHERE id = ...).
-- Run AFTER 003_test_activity.sql.
-- ─────────────────────────────────────────────────────────────────────────────
-- Avatar URLs use https://i.pravatar.cc/150?u=[email] — deterministic,
-- consistent per user, and human-photo quality for realistic demo data.
-- ─────────────────────────────────────────────────────────────────────────────

-- u01: Alex Chen — alex.chen@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=alex.chen@hoptrack.test',
  bio        = 'West Coast IPA evangelist and recovering software engineer. Moved to Austin for the food, stayed for the craft beer scene. Debug IPA changed my life and I''m not sorry about it.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000001';

-- u02: Marcus Johnson — marcus.j@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=marcus.j@hoptrack.test',
  bio        = 'Stout season is every season — I don''t make the rules. Backend dev by day, dark beer connoisseur by night. Currently accepting recommendations for any stout over 7% ABV.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000002';

-- u03: Priya Patel — priya.p@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=priya.p@hoptrack.test',
  bio        = 'Sour beer convert, no going back. If it doesn''t make my face do a thing, I''m not interested. Product manager by trade, professional tartness-seeker by calling.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000003';

-- u04: Derek Walsh — derek.w@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=derek.w@hoptrack.test',
  bio        = 'Weekend warrior driving up from Houston to explore the Austin craft scene. Will happily drive three hours for a truly great pint — and Pint & Pixel makes it worth the trip every time.',
  home_city  = 'Houston, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000004';

-- u05: Sam Rivera — sam.rivera@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=sam.rivera@hoptrack.test',
  bio        = 'Pilsner is the perfect beer and I will die on this hill. Crisp, clean, and wildly underappreciated by the craft beer crowd. UX designer with strong opinions about both pixels and pints.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000005';

-- u06: Linda Ko — linda.ko@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=linda.ko@hoptrack.test',
  bio        = 'Hefeweizen in summer, stout in winter, sour when I need to feel alive — that''s the code and I live by it. Austin lifer, tap-room regular, and the person who always suggests the brewery when picking a meeting spot.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000006';

-- u07: Tom Nguyen — tom.nguyen@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=tom.nguyen@hoptrack.test',
  bio        = 'DIPA or bust — life is too short for session beers. DevOps engineer who thinks 9%+ ABV is a feature, not a bug. San Antonio local making regular pilgrimages north for the Deploy Friday DIPA.',
  home_city  = 'San Antonio, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000007';

-- u08: Jessica Blake — jessica.b@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=jessica.b@hoptrack.test',
  bio        = 'Amber ales, good vibes, and a barstool at Pint & Pixel that I''m pretty sure has my name on it. I''ve been coming here long enough that the bartenders know my order. It''s the Debug IPA.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000008';

-- u09: Carlos Mendez — carlos.m@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=carlos.m@hoptrack.test',
  bio        = 'Relatively new to the craft beer world and honestly a little overwhelmed by all the styles. HopTrack is helping me figure out what I actually like — current answer: apparently sours and IPAs.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000009';

-- u10: Rachel Foster — rachel.f@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=rachel.f@hoptrack.test',
  bio        = 'Porter fanatic, full stop. Kernel Panic Porter is my spirit beer — smoky, robust, and slightly chaotic. Data scientist who applies rigorous methodology to ranking every dark beer in Austin.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000010';

-- u11: James OToole — james.ot@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=james.ot@hoptrack.test',
  bio        = 'Monthly trips down from Dallas to check in on the Austin beer scene — and Pint & Pixel is always stop one. There''s something about the Debug IPA on a Friday afternoon that makes the three-hour drive completely rational.',
  home_city  = 'Dallas, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000011';

-- u12: Nina Sharma — nina.s@hoptrack.test
UPDATE public.profiles
SET
  avatar_url = 'https://i.pravatar.cc/150?u=nina.s@hoptrack.test',
  bio        = 'Märzen season lasts all year in my heart, no matter what the calendar says. QA engineer who applies the same attention to detail to evaluating craft beer as she does to finding bugs — methodical, opinionated, and rarely wrong.',
  home_city  = 'Austin, TX'
WHERE id = 'cc000000-0000-0000-0000-000000000012';


-- ── Confirm ───────────────────────────────────────────────────────────────────
SELECT
  display_name,
  home_city,
  CASE WHEN avatar_url IS NOT NULL THEN 'avatar set' ELSE 'MISSING' END AS avatar_status,
  LEFT(bio, 60) || '...' AS bio_preview
FROM public.profiles
WHERE id IN (
  'cc000000-0000-0000-0000-000000000001',
  'cc000000-0000-0000-0000-000000000002',
  'cc000000-0000-0000-0000-000000000003',
  'cc000000-0000-0000-0000-000000000004',
  'cc000000-0000-0000-0000-000000000005',
  'cc000000-0000-0000-0000-000000000006',
  'cc000000-0000-0000-0000-000000000007',
  'cc000000-0000-0000-0000-000000000008',
  'cc000000-0000-0000-0000-000000000009',
  'cc000000-0000-0000-0000-000000000010',
  'cc000000-0000-0000-0000-000000000011',
  'cc000000-0000-0000-0000-000000000012'
)
ORDER BY display_name;
