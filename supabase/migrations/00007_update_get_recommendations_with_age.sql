-- Re-create the helper function just in case, as it's a dependency.
CREATE OR REPLACE FUNCTION count_common_elements(arr1 text[], arr2 text[])
RETURNS integer AS $$
DECLARE
  common_count integer := 0;
  elem text;
BEGIN
  IF arr1 IS NULL OR arr2 IS NULL THEN
    RETURN 0;
  END IF;
  
  FOREACH elem IN ARRAY arr1
  LOOP
    IF elem = ANY(arr2) THEN
      common_count := common_count + 1;
    END IF;
  END LOOP;
  RETURN common_count;
END;
$$ LANGUAGE plpgsql;

-- Main function to get recommendations, now including age
CREATE OR REPLACE FUNCTION get_recommendations(current_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  interests text[],
  age integer, -- Added age
  recommendation_score float
) AS $$
DECLARE
  current_user_location geography;
  max_distance float := 50000; -- 50km max distance for scoring
BEGIN
  -- Get the current user's location from the base profiles table
  SELECT location INTO current_user_location FROM public.profiles WHERE profiles.id = current_user_id;

  RETURN QUERY
  WITH user_interests AS (
    -- Get interests from the base profiles table
    SELECT interests FROM public.profiles WHERE profiles.id = current_user_id
  ),
  scores AS (
    SELECT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.bio,
      p.interests,
      p.age, -- Select age from the view
      -- Distance score (higher is better)
      (1 - (ST_Distance(current_user_location, p.location) / max_distance)) AS distance_score,
      -- Interest score (higher is better)
      count_common_elements(ui.interests, p.interests) AS interest_score
    FROM
      public.profiles_with_age p, user_interests ui -- Use the view here
    WHERE
      p.id != current_user_id
      AND p.location IS NOT NULL
      AND p.birth_date IS NOT NULL -- Ensure user has an age
      -- Exclude users the current user has already interacted with
      AND NOT EXISTS (
        SELECT 1 FROM public.interactions i
        WHERE i.user_id = current_user_id AND i.target_user_id = p.id
      )
      -- Exclude users that are already matches
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
    s.age, -- Return age
    -- Combine scores with weighting
    (s.distance_score * 0.6 + s.interest_score * 0.4) AS recommendation_score
  FROM
    scores s
  WHERE
    s.distance_score > 0 -- Only include users within the max_distance
  ORDER BY
    recommendation_score DESC
  LIMIT 20; -- Limit to 20 recommendations at a time

END;
$$ LANGUAGE plpgsql;
