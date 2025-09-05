-- Fix orders and transactions RLS policies to ensure users can see their data
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

-- Create comprehensive policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (
  user_id = auth.uid() OR 
  customer_email = (SELECT email FROM public.users WHERE id::text = auth.uid()::text)
);

-- Create comprehensive policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
FOR SELECT USING (
  user_id = auth.uid()
);

-- Ensure user_sessions table has proper RLS
CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
FOR ALL USING (user_id = auth.uid());

-- Check that all required tables have RLS enabled
DO $$
BEGIN
  -- Enable RLS on user_sessions if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'user_sessions' 
    AND relrowsecurity = true
  ) THEN
    ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;