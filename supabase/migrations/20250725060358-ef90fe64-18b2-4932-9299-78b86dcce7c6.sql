
-- Create a function to fetch admin user by user_id with explicit parameter
-- This bypasses RLS timing issues by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_admin_user_by_id(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  role app_role,
  first_name text,
  last_name text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_login_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    au.id,
    au.user_id,
    au.role,
    au.first_name,
    au.last_name,
    au.is_active,
    au.created_at,
    au.updated_at,
    au.last_login_at
  FROM public.admin_users au
  WHERE au.user_id = target_user_id 
    AND au.is_active = true;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_user_by_id(uuid) TO authenticated;
