-- Migration 036: Atomic XP increment RPC
-- Fixes race condition where two concurrent session-ends could lose XP (S30-025, S31-021)

CREATE OR REPLACE FUNCTION increment_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_new_level integer,
  p_is_first_visit boolean DEFAULT false,
  p_streak_updates jsonb DEFAULT null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  -- Atomic increment — no read-modify-write race condition
  UPDATE profiles
  SET
    xp = xp + p_xp_amount,
    level = GREATEST(level, p_new_level),
    unique_breweries = CASE
      WHEN p_is_first_visit THEN unique_breweries + 1
      ELSE unique_breweries
    END,
    current_streak = CASE
      WHEN p_streak_updates IS NOT NULL THEN (p_streak_updates->>'current_streak')::integer
      ELSE current_streak
    END,
    longest_streak = CASE
      WHEN p_streak_updates IS NOT NULL THEN GREATEST(longest_streak, (p_streak_updates->>'current_streak')::integer)
      ELSE longest_streak
    END,
    last_session_date = CASE
      WHEN p_streak_updates IS NOT NULL THEN (p_streak_updates->>'last_session_date')::date
      ELSE last_session_date
    END
  WHERE id = p_user_id
  RETURNING xp, level INTO v_new_xp, v_new_level;

  v_result := jsonb_build_object(
    'xp', v_new_xp,
    'level', v_new_level
  );

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION increment_xp TO authenticated;
