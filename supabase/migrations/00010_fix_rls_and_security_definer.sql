-- =====================================================
-- Fix: RLS policies for matches table
-- The previous "Block all client-side modifications on matches"
-- used FOR ALL which blocked SELECT as well. 
-- This migration removes that conflicting policy and adds
-- specific INSERT/UPDATE/DELETE block policies instead.
-- =====================================================

-- Drop the conflicting catch-all policy
DROP POLICY IF EXISTS "Block all client-side modifications on matches" ON public.matches;

-- Re-create the SELECT policy (in case it was overridden)
DROP POLICY IF EXISTS "Users can view their own matches." ON public.matches;
CREATE POLICY "Users can view their own matches."
ON public.matches FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Block direct INSERT from client (matches are created by handle_interaction function)
CREATE POLICY "Block client-side insert on matches"
ON public.matches FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block direct UPDATE from client
CREATE POLICY "Block client-side update on matches"
ON public.matches FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Block direct DELETE from client
CREATE POLICY "Block client-side delete on matches"
ON public.matches FOR DELETE
TO authenticated
USING (false);

-- =====================================================
-- Fix: handle_interaction must use SECURITY DEFINER
-- so it can INSERT into matches table bypassing RLS
-- =====================================================
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
    IF EXISTS (
      SELECT 1
      FROM public.interactions
      WHERE user_id = p_target_user_id
        AND target_user_id = p_user_id
        AND action = 'like'
    ) THEN
      is_match := true;

      INSERT INTO public.matches (user1_id, user2_id)
      SELECT
        LEAST(p_user_id, p_target_user_id),
        GREATEST(p_user_id, p_target_user_id)
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;

  RETURN is_match;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fix: get_recommendations also needs SECURITY DEFINER 
-- to access all profiles regardless of calling user's RLS
-- =====================================================
CREATE OR REPLACE FUNCTION get_recommendations(current_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  interests text[],
  age integer,
  recommendation_score float
) AS $$
DECLARE
  current_user_location geography;
  max_distance float := 50000;
BEGIN
  SELECT location INTO current_user_location FROM public.profiles WHERE profiles.id = current_user_id;

  RETURN QUERY
  WITH user_interests AS (
    SELECT p_inner.interests FROM public.profiles p_inner WHERE p_inner.id = current_user_id
  ),
  scores AS (
    SELECT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.bio,
      p.interests,
      EXTRACT(YEAR FROM AGE(p.birth_date))::integer AS age,
      CASE
        WHEN current_user_location IS NOT NULL AND p.location IS NOT NULL THEN
          (1 - LEAST(ST_Distance(current_user_location, p.location) / max_distance, 1.0))
        ELSE
          0.0
      END AS distance_score,
      count_common_elements(ui.interests, p.interests) AS interest_score
    FROM
      public.profiles p, user_interests ui
    WHERE
      p.id != current_user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.interactions i
        WHERE i.user_id = current_user_id AND i.target_user_id = p.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.matches m
        WHERE (m.user1_id = current_user_id AND m.user2_id = p.id)
           OR (m.user2_id = current_user_id AND m.user1_id = p.id)
      )
  )
  SELECT
    s.id,
    s.username,
    s.full_name,
    s.avatar_url,
    s.bio,
    s.interests,
    s.age,
    (COALESCE(s.distance_score, 0) * 0.6 + COALESCE(s.interest_score, 0) * 0.4)::float AS recommendation_score
  FROM
    scores s
  ORDER BY
    recommendation_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Fix: get_matches also needs SECURITY DEFINER
-- =====================================================
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
    CASE
      WHEN m.user1_id = p_user_id THEN m.user2_id
      ELSE m.user1_id
    END AS other_user_id,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Add RLS DELETE policy for profiles (needed for account deletion)
-- =====================================================
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;
CREATE POLICY "Users can delete their own profile."
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);
