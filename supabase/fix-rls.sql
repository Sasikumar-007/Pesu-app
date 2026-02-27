-- =============================================================
-- RLS FIX SCRIPT - Run this in Supabase SQL Editor
-- This drops and recreates all RLS policies to fix message sending
-- =============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;
DROP POLICY IF EXISTS "conv_participants_select" ON public.conversation_participants;
DROP POLICY IF EXISTS "conv_participants_insert" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
DROP POLICY IF EXISTS "user_status_select" ON public.user_status;
DROP POLICY IF EXISTS "user_status_upsert" ON public.user_status;
DROP POLICY IF EXISTS "user_status_update" ON public.user_status;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- Recreate Profiles policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Recreate Conversations policies
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  )
);
CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT WITH CHECK (true);

-- Recreate Conversation Participants policies
CREATE POLICY "conv_participants_select" ON public.conversation_participants FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid()
  )
);
CREATE POLICY "conv_participants_insert" ON public.conversation_participants FOR INSERT WITH CHECK (true);

-- Recreate Messages policies (THIS IS THE KEY FIX)
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

-- Recreate User Status policies
CREATE POLICY "user_status_select" ON public.user_status FOR SELECT USING (true);
CREATE POLICY "user_status_upsert" ON public.user_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_status_update" ON public.user_status FOR UPDATE USING (auth.uid() = user_id);
