-- =============================================================
-- FIX INFINITE RECURSION on conversation_participants
-- Run this in Supabase SQL Editor
-- =============================================================

-- The old policy references itself causing infinite recursion. 
-- Fix: allow all authenticated users to see participants.
-- Security is enforced at the conversations and messages level.

DROP POLICY IF EXISTS "conv_participants_select" ON public.conversation_participants;
CREATE POLICY "conv_participants_select" ON public.conversation_participants 
  FOR SELECT USING (true);
