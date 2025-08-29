-- Enhance users table for authentication
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE;

-- Update RLS policies for users table to support authentication
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;

-- Create new RLS policies for authenticated users
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (id = auth.uid() OR is_admin());

CREATE POLICY "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

CREATE POLICY "Anyone can insert users for registration" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Update orders table to link with authenticated users
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Update transactions table to link with authenticated users  
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Create function to handle email verification
CREATE OR REPLACE FUNCTION public.verify_user_email(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION public.generate_verification_token(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
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