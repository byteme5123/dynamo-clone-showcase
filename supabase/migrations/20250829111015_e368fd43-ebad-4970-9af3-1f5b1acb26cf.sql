-- Fix the generate_verification_token function to use correct random function
CREATE OR REPLACE FUNCTION public.generate_verification_token(user_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
$function$