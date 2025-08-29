-- Fix search path for functions
CREATE OR REPLACE FUNCTION public.verify_user_email(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.generate_verification_token(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(32), 'base64');
  
  UPDATE public.users 
  SET verification_token = token,
      verification_token_expires = NOW() + INTERVAL '24 hours',
      updated_at = NOW()
  WHERE email = user_email;
  
  RETURN token;
END;
$$;