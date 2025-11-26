-- ============================================
-- FIX 500 ERROR - Remove Circular RLS Policy
-- ============================================

-- Drop the problematic admin policy that causes circular dependency
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Recreate it with a function to avoid recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new admin policy using the function
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (is_admin());

-- Also ensure the basic SELECT policy is first
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);
