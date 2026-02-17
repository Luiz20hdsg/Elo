-- Add birth_date to profiles table
ALTER TABLE public.profiles
ADD COLUMN birth_date DATE;

-- Create a view to calculate age
CREATE OR REPLACE VIEW public.profiles_with_age AS
SELECT
  *,
  EXTRACT(YEAR FROM AGE(birth_date)) AS age
FROM
  public.profiles;