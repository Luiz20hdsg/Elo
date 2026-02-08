CREATE OR REPLACE FUNCTION get_matches(p_user_id uuid)
RETURNS TABLE (
  match_id bigint,
  other_user_id uuid,
  other_user_full_name text,
  other_user_avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id as match_id,
    -- Determine the other user's ID
    CASE
      WHEN m.user1_id = p_user_id THEN m.user2_id
      ELSE m.user1_id
    END AS other_user_id,
    -- Get the other user's profile information
    p.full_name AS other_user_full_name,
    p.avatar_url AS other_user_avatar_url
  FROM
    public.matches m
  JOIN
    public.profiles p ON p.id = (
      CASE
        WHEN m.user1_id = p_user_id THEN m.user2_id
        ELSE m.user1_id
      END
    )
  WHERE
    (m.user1_id = p_user_id OR m.user2_id = p_user_id);
END;
$$ LANGUAGE plpgsql;
