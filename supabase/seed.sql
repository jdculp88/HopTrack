-- HopTrack Achievement Seed Data
-- Run this after schema.sql to populate the achievements table.
-- Matches definitions in lib/achievements/definitions.ts exactly.

INSERT INTO achievements (key, name, description, icon, tier, category, badge_color, xp_reward) VALUES

  -- ── Explorer ─────────────────────────────────────────────────────────────
  ('first_step',         'First Step',         'Log your very first check-in.',                              '🍺',  'bronze',   'explorer', '#CD7F32', 50),
  ('local_legend',       'Local Legend',       'Check in 10 times at a brewery in your home city.',         '🏠',  'silver',   'explorer', '#C0C0C0', 100),
  ('road_warrior',       'Road Warrior',       'Check in at breweries in 5 different cities.',               '🚗',  'silver',   'explorer', '#C0C0C0', 100),
  ('state_hopper',       'State Hopper',       'Check in at breweries in 3+ states.',                       '🗺️', 'gold',     'explorer', '#FFD700', 200),
  ('brewery_tourist_10', 'Brewery Tourist',    'Visit 10 unique breweries.',                                '🏗️', 'bronze',   'explorer', '#CD7F32', 50),
  ('craft_pilgrim_25',   'Craft Pilgrim',      'Visit 25 unique breweries.',                                '⛺',  'silver',   'explorer', '#C0C0C0', 100),
  ('craft_pilgrim_50',   'Craft Pilgrim II',   'Visit 50 unique breweries.',                                '⛺',  'gold',     'explorer', '#FFD700', 200),
  ('craft_pilgrim_100',  'Craft Pilgrim III',  'Visit 100 unique breweries.',                               '⛺',  'platinum', 'explorer', '#E5E4E2', 500),

  -- ── Variety ───────────────────────────────────────────────────────────────
  ('style_student', 'Style Student', 'Try 5 different beer styles.',                                                                          '📚', 'bronze', 'variety', '#CD7F32', 50),
  ('style_scholar', 'Style Scholar', 'Try 10 different beer styles.',                                                                         '🎓', 'silver', 'variety', '#C0C0C0', 100),
  ('style_master',  'Style Master',  'Try all major styles: IPA, Stout, Lager, Sour, Porter, Wheat, Pale Ale, Belgian, Saison, and Amber.',   '🏆', 'gold',   'variety', '#FFD700', 200),
  ('hop_head',      'Hop Head',      'Log 20 IPAs.',                                                                                          '🌿', 'silver', 'variety', '#C0C0C0', 100),
  ('dark_side',     'Dark Side',     'Log 10 stouts or porters.',                                                                             '🌑', 'bronze', 'variety', '#CD7F32', 50),
  ('sour_patch',    'Sour Patch',    'Log 10 sours.',                                                                                         '🍋', 'bronze', 'variety', '#CD7F32', 50),
  ('low_and_slow',  'Low & Slow',    'Try 5 session beers under 4.5% ABV.',                                                                   '🐢', 'bronze', 'variety', '#CD7F32', 50),
  ('high_flyer',    'High Flyer',    'Try 3 beers over 10% ABV.',                                                                             '🚀', 'silver', 'variety', '#C0C0C0', 100),

  -- ── Quantity ──────────────────────────────────────────────────────────────
  ('getting_started', 'Getting Started', 'Log 5 total check-ins.',   '🌱', 'bronze',   'quantity', '#CD7F32', 50),
  ('regular',         'Regular',         'Log 25 check-ins.',        '🪑', 'bronze',   'quantity', '#CD7F32', 50),
  ('enthusiast',      'Enthusiast',      'Log 100 check-ins.',       '⭐', 'silver',   'quantity', '#C0C0C0', 100),
  ('veteran',         'Veteran',         'Log 250 check-ins.',       '🎖️','gold',     'quantity', '#FFD700', 200),
  ('legend',          'Legend',          'Log 500 check-ins.',       '👑', 'platinum', 'quantity', '#E5E4E2', 500),

  -- ── Social ────────────────────────────────────────────────────────────────
  ('better_together', 'Better Together', 'Log a check-in with a friend.',                     '🤝', 'bronze', 'social', '#CD7F32', 50),
  ('crew_outing',     'Crew Outing',     'Check in with 3 or more friends at once.',           '👥', 'silver', 'social', '#C0C0C0', 100),
  ('friend_magnet',   'Friend Magnet',   'Have 10 friends on the app.',                        '🧲', 'silver', 'social', '#C0C0C0', 100),
  ('trendsetter',     'Trendsetter',     'Be the first of your friends to visit a brewery.',   '🔭', 'gold',   'social', '#FFD700', 200),

  -- ── Time ──────────────────────────────────────────────────────────────────
  ('weekend_warrior', 'Weekend Warrior', 'Check in on 4 consecutive weekends.',              '📅', 'silver', 'time', '#C0C0C0', 100),
  ('oktoberfest',     'Oktoberfest',     'Log 5 check-ins in October.',                      '🥨', 'silver', 'time', '#C0C0C0', 100),
  ('new_years_hop',   'New Year''s Hop', 'Log your first check-in of the year.',             '🎆', 'bronze', 'time', '#CD7F32', 50),
  ('day_tripper',     'Day Tripper',     'Log 5 check-ins in a single day — brewery crawl!', '🚌', 'gold',   'time', '#FFD700', 200),
  ('streak_master',   'Streak Master',   'Check in at least once per week for 4 consecutive weeks.', '🔥', 'gold', 'time', '#FFD700', 200),

  -- ── Quality ───────────────────────────────────────────────────────────────
  ('critics_choice',  'Critic''s Choice', 'Give a 5-star rating to 5 different beers.',                             '⭐', 'bronze', 'quality', '#CD7F32', 50),
  ('high_standards',  'High Standards',   'Maintain an average rating above 4.0 after 20+ check-ins.',              '🎯', 'silver', 'quality', '#C0C0C0', 100),
  ('photographer',    'Photographer',     'Add photos to 10 check-ins.',                                            '📸', 'bronze', 'quality', '#CD7F32', 50),
  ('wordsmith',       'Wordsmith',        'Write comments on 20 check-ins.',                                        '✍️','silver', 'quality', '#C0C0C0', 100)

ON CONFLICT (key) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  tier        = EXCLUDED.tier,
  category    = EXCLUDED.category,
  badge_color = EXCLUDED.badge_color,
  xp_reward   = EXCLUDED.xp_reward;
