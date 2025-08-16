-- Create storage buckets for image uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('coverage', 'coverage', true) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Logo images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their logo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their logo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Coverage images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload coverage images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their coverage uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their coverage uploads" ON storage.objects;

-- Create RLS policies for logo uploads
CREATE POLICY "Logo images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their logo uploads" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their logo uploads" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Create RLS policies for coverage image uploads
CREATE POLICY "Coverage images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'coverage');

CREATE POLICY "Authenticated users can upload coverage images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'coverage' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their coverage uploads" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'coverage' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their coverage uploads" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'coverage' AND auth.role() = 'authenticated');