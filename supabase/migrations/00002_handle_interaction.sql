CREATE OR REPLACE FUNCTION handle_interaction(
  p_user_id uuid,
  p_target_user_id uuid,
  p_action text
)
RETURNS boolean AS $$
DECLARE
  is_match boolean := false;
BEGIN
  -- Insert the interaction into the interactions table
  INSERT INTO public.interactions (user_id, target_user_id, action)
  VALUES (p_user_id, p_target_user_id, p_action);

  -- If the action is 'like', check for a mutual like
  IF p_action = 'like' THEN
    -- Check if the target user has already liked the current user
    IF EXISTS (
      SELECT 1
      FROM public.interactions
      WHERE user_id = p_target_user_id
        AND target_user_id = p_user_id
        AND action = 'like'
    ) THEN
      -- Mutual like exists, so it's a match!
      is_match := true;

      -- Insert the new match, ensuring not to create duplicates
      -- The user with the smaller ID is stored as user1_id to maintain consistency
      INSERT INTO public.matches (user1_id, user2_id)
      SELECT
        LEAST(p_user_id, p_target_user_id),
        GREATEST(p_user_id, p_target_user_id)
      ON CONFLICT (user1_id, user2_id) DO NOTHING;

    END IF;
  END IF;

  -- Return whether a match was made
  RETURN is_match;
END;
$$ LANGUAGE plpgsql;
