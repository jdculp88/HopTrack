-- Migration 010: Add new achievements for beer styles + streaks
-- These are the definitions only — users earn them via session-end API checks

INSERT INTO achievements (key, name, description, icon, tier, category, badge_color, xp_reward)
VALUES
  ('wheat_king', 'Wheat King', 'Log 10 wheat beers (Wheat, Hefeweizen, Witbier).', '🌾', 'bronze', 'variety', '#CD7F32', 50),
  ('lager_legend', 'Lager Legend', 'Log 10 lagers (Lager, Pilsner, Kolsch, Helles).', '🍺', 'bronze', 'variety', '#CD7F32', 50),
  ('seven_day_streak', '7-Day Streak', 'Log a session 7 days in a row. Dedication!', '🔥', 'silver', 'time', '#C0C0C0', 100),
  ('thirty_day_streak', '30-Day Streak', 'Log a session 30 days in a row. Legendary commitment.', '🔥', 'gold', 'time', '#FFD700', 200)
ON CONFLICT (key) DO NOTHING;
