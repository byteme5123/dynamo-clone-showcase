-- Fix critical RLS issues identified by linter

-- Enable RLS on all tables that should have it
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

-- Check which tables in public schema don't have RLS enabled
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
    SELECT tablename 
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE c.relrowsecurity = true 
    AND t.schemaname = 'public'
);

-- Update functions to have proper search_path
CREATE OR REPLACE FUNCTION public.verify_user_email(token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.users 
  SET email_verified = TRUE, 
      verification_token = NULL,
      verification_token_expires = NULL,
      updated_at = NOW()
  WHERE verification_token = token 
    AND verification_token_expires > NOW()
    AND email_verified = FALSE;
    
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_verification_token(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  token TEXT;
BEGIN
  -- Use gen_random_uuid() and encode it properly
  token := encode(decode(replace(gen_random_uuid()::text, '-', ''), 'hex'), 'base64');
  
  UPDATE public.users 
  SET verification_token = token,
      verification_token_expires = NOW() + INTERVAL '24 hours',
      updated_at = NOW()
  WHERE email = user_email;
  
  RETURN token;
END;
$function$;