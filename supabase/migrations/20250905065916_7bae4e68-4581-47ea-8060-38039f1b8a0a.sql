-- Create profiles for existing auth users that don't have profiles yet
INSERT INTO public.profiles (id, first_name, last_name)
SELECT 
  au.id, 
  au.raw_user_meta_data ->> 'first_name' as first_name,
  au.raw_user_meta_data ->> 'last_name' as last_name
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;