-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid()::text = id::text);

-- Allow anyone to insert during registration (needed for signup flow)
CREATE POLICY "Anyone can register"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Only allow users to delete their own account
CREATE POLICY "Users can delete their own account"
ON public.users
FOR DELETE
USING (auth.uid()::text = id::text);