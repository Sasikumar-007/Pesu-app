-- =============================================================
-- FIX MISSING PROFILES & RECREATE TRIGGER
-- Run this in Supabase SQL Editor
-- =============================================================

-- Step 1: Insert missing profiles for any auth users that don't have one
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data ->> 'full_name', au.email, 'User'),
    COALESCE(au.raw_user_meta_data ->> 'avatar_url', NULL)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 2: Insert missing user_status for any profiles that don't have one
INSERT INTO public.user_status (user_id, is_online, last_seen)
SELECT p.id, FALSE, NOW()
FROM public.profiles p
LEFT JOIN public.user_status us ON p.id = us.user_id
WHERE us.user_id IS NULL;

-- Step 3: Recreate the trigger function to ensure it works for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_status (user_id, is_online, last_seen)
  VALUES (NEW.id, FALSE, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
