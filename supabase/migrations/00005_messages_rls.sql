-- Enable Row Level Security on the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view messages in their own matches." ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their own matches." ON public.messages;


-- ========== MESSAGES TABLE POLICIES ==========

-- 1. SELECT Policy: Users can only read messages from matches they are a part of.
CREATE POLICY "Users can view messages in their own matches."
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.matches
    WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- 2. INSERT Policy: Users can only insert messages into matches they are a part of, and as themselves.
CREATE POLICY "Users can insert messages in their own matches."
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  -- The sender must be the currently authenticated user
  auth.uid() = sender_id
  -- The user must be part of the match
  AND EXISTS (
    SELECT 1
    FROM public.matches
    WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- NOTE: We will not allow UPDATE or DELETE on messages from the client-side
-- to maintain the integrity of the chat history.
