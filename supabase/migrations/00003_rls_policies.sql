-- Enable Row Level Security (RLS) on the tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own interactions." ON public.interactions;
DROP POLICY IF EXISTS "Users can only see their own interactions." ON public.interactions;
DROP POLICY IF EXISTS "Users can view their own matches." ON public.matches;
DROP POLICY IF EXISTS "Block all client-side modifications on matches" ON public.matches;


-- ========== PROFILES TABLE POLICIES ==========

-- 1. SELECT Policy: Authenticated users can see all profiles.
CREATE POLICY "Users can view all profiles."
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. UPDATE Policy: Users can only update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ========== INTERACTIONS TABLE POLICIES ==========

-- 1. INSERT Policy: A user can only insert an interaction for themselves.
CREATE POLICY "Users can insert their own interactions."
ON public.interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. SELECT Policy: Users can only see their own 'like'/'dislike' actions.
-- This is generally not required for the app to function, but it's good practice
-- to prevent users from scraping interaction data.
CREATE POLICY "Users can only see their own interactions."
ON public.interactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);


-- ========== MATCHES TABLE POLICIES ==========

-- 1. SELECT Policy: A user can only see matches that include them.
CREATE POLICY "Users can view their own matches."
ON public.matches FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 2. BLOCK Policy: Block INSERT, UPDATE, DELETE from the client.
-- Matches should only be created via the `handle_interaction` function, which has elevated rights.
-- This prevents a user from creating a match manually.
CREATE POLICY "Block all client-side modifications on matches"
ON public.matches FOR ALL
TO public
USING (false)
WITH CHECK (false);
