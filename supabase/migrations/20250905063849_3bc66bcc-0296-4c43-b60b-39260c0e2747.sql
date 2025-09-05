-- Migration: Complete Auth System Migration to Supabase Built-in Auth
-- This migration removes custom auth tables and updates all references to use auth.uid()

-- Step 1: Drop custom authentication tables (these will be replaced by Supabase auth)
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Update admin_users table to reference auth.users directly
-- First drop the existing foreign key constraint if it exists
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_user_id_fkey;

-- Add foreign key constraint to auth.users
ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Update orders table to use auth.uid() properly
-- Remove any existing RLS policies that reference the old users table
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new RLS policy for orders using auth.uid()
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  (customer_email IS NOT NULL AND customer_email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ))
);

-- Step 4: Update transactions table RLS policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (user_id = auth.uid());

-- Step 5: Update admin functions to work with auth.users
-- Update the admin check functions to work with auth.users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND role IN ('admin', 'super_admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND role = 'super_admin'
    );
$$;

CREATE OR REPLACE FUNCTION public.get_current_admin_user()
RETURNS admin_users
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT * FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Step 6: Remove custom verification functions (replaced by Supabase auth)
DROP FUNCTION IF EXISTS public.verify_user_email(text);
DROP FUNCTION IF EXISTS public.generate_verification_token(text);

-- Step 7: Create profiles table for additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Step 8: Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 9: Update orders and transactions to allow auth.uid() references
-- Update orders table foreign key
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update transactions table foreign key  
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;