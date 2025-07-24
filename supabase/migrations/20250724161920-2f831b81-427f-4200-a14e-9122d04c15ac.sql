-- First, let's recreate the is_admin function to ensure it works correctly
DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Add logging to help debug
  RAISE LOG 'Checking admin status for user_id: %', user_id;
  
  -- Return true if user exists in admin_users table and is active
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id 
    AND is_active = true
  );
END;
$$;

-- Let's also create a more robust function to get admin user details
CREATE OR REPLACE FUNCTION public.get_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  user_id uuid,
  role text,
  first_name text,
  last_name text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  last_login_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE LOG 'Getting admin user details for user_id: %', user_id;
  
  RETURN QUERY
  SELECT a.id, a.user_id, a.role, a.first_name, a.last_name, 
         a.is_active, a.created_at, a.updated_at, a.last_login_at
  FROM public.admin_users a
  WHERE a.user_id = get_admin_user.user_id 
  AND a.is_active = true;
END;
$$;