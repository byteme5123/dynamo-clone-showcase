-- Fix security vulnerability: Remove public SELECT access from sensitive tables
-- and ensure only admins can read customer personal information

-- First, drop any existing policies that might allow public SELECT access
DROP POLICY IF EXISTS "Anyone can view activate SIM requests" ON public.activate_sim_requests;
DROP POLICY IF EXISTS "Anyone can view contact forms" ON public.contact_forms;
DROP POLICY IF EXISTS "Public can view activate SIM requests" ON public.activate_sim_requests;
DROP POLICY IF EXISTS "Public can view contact forms" ON public.contact_forms;

-- Ensure only admins can read activate_sim_requests (highly sensitive SIM activation data)
CREATE POLICY "Only admins can view activate SIM requests" 
ON public.activate_sim_requests 
FOR SELECT 
USING (is_admin());

-- Ensure only admins can read contact_forms (contains customer personal information)  
CREATE POLICY "Only admins can view contact forms"
ON public.contact_forms
FOR SELECT 
USING (is_admin());

-- Verify the existing INSERT policies are still in place for public form submissions
-- (These should already exist but adding them for safety)
DO $$
BEGIN
    -- Check if INSERT policy exists for activate_sim_requests
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activate_sim_requests' 
        AND cmd = 'INSERT' 
        AND with_check = 'true'
    ) THEN
        CREATE POLICY "Anyone can insert activate SIM requests" 
        ON public.activate_sim_requests 
        FOR INSERT 
        WITH CHECK (true);
    END IF;

    -- Check if INSERT policy exists for contact_forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contact_forms' 
        AND cmd = 'INSERT' 
        AND with_check = 'true'
    ) THEN
        CREATE POLICY "Anyone can insert contact forms" 
        ON public.contact_forms 
        FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;