-- Remove old tables and functions that are no longer needed after migrating to Supabase auth

-- Drop user_sessions table as we now use Supabase's built-in session management
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Drop the old verification functions as we now use Supabase's built-in email verification
DROP FUNCTION IF EXISTS public.verify_user_email(text);
DROP FUNCTION IF EXISTS public.generate_verification_token(text);