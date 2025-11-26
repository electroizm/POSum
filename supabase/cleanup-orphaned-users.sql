-- ============================================
-- CLEANUP ORPHANED AUTH USERS
-- ============================================
-- This script removes users from auth.users who don't have
-- a corresponding profile in public.users

-- WARNING: This will permanently delete users from auth.users
-- Only run this if you're sure you want to remove these users

-- First, let's see which users will be deleted (preview)
SELECT
  au.id,
  au.email,
  au.created_at,
  'No profile in public.users' as reason
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- If you're happy with the preview above, uncomment and run this to delete them:
/*
DELETE FROM auth.users
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
);
*/

-- Alternative: Instead of deleting, you can create missing profiles
-- Uncomment this to create profiles for orphaned auth users:
/*
INSERT INTO public.users (id, email, name, role, created_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
  'user' as role,
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/
