-- ============================================================================
-- Migration 017: Domestic beer achievements (REQ-016)
-- Sprint 16 (S16-010)
-- ============================================================================

INSERT INTO achievements (key, name, description, icon, tier, category, badge_color, xp_reward)
VALUES
  (
    'domestic_drinker',
    'Domestic Drinker',
    'Log 5 domestic-style beers (Lager, Pilsner, Cream Ale, Blonde Ale).',
    '🏈',
    'bronze',
    'variety',
    '#CD7F32',
    25
  ),
  (
    'domestic_devotee',
    'Domestic Devotee',
    'Log 20 domestic-style beers (Lager, Pilsner, Cream Ale, Blonde Ale).',
    '🇺🇸',
    'silver',
    'variety',
    '#C0C0C0',
    100
  )
ON CONFLICT (key) DO NOTHING;
