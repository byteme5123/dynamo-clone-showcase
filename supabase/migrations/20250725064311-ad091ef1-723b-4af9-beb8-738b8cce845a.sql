-- Create hero slides table for homepage carousel
CREATE TABLE public.hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  cta_text text,
  cta_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for hero slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for hero slides
CREATE POLICY "Anyone can view active hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hero slides" 
ON public.hero_slides 
FOR ALL 
USING (is_admin());

-- Create activate SIM requests table
CREATE TABLE public.activate_sim_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone_number text NOT NULL,
  sim_card_number text NOT NULL,
  plan_preference text,
  id_document_url text,
  additional_notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for activate SIM requests
ALTER TABLE public.activate_sim_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for activate SIM requests
CREATE POLICY "Anyone can insert activate SIM requests" 
ON public.activate_sim_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage activate SIM requests" 
ON public.activate_sim_requests 
FOR ALL 
USING (is_admin());

-- Create translations table for multilingual content
CREATE TABLE public.translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  en text NOT NULL,
  es text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for translations
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations
CREATE POLICY "Anyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage translations" 
ON public.translations 
FOR ALL 
USING (is_admin());

-- Create SEO settings table
CREATE TABLE public.seo_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug text NOT NULL UNIQUE,
  meta_title text NOT NULL,
  meta_description text,
  keywords text,
  og_image_url text,
  og_title text,
  og_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for SEO settings
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for SEO settings
CREATE POLICY "Anyone can view SEO settings" 
ON public.seo_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage SEO settings" 
ON public.seo_settings 
FOR ALL 
USING (is_admin());

-- Create site settings table (key-value format)
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  type text NOT NULL DEFAULT 'text', -- text, url, email, phone, boolean, json
  category text DEFAULT 'general',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for site settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site settings
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_admin());

-- Create storage buckets for media library
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('hero-images', 'hero-images', true),
  ('plan-images', 'plan-images', true),
  ('logos', 'logos', true),
  ('seo-images', 'seo-images', true),
  ('documents', 'documents', false);

-- Create storage policies for public buckets
CREATE POLICY "Anyone can view public images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id IN ('hero-images', 'plan-images', 'logos', 'seo-images'));

CREATE POLICY "Admins can upload to all buckets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update all files" 
ON storage.objects 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete all files" 
ON storage.objects 
FOR DELETE 
USING (is_admin());

-- Create storage policy for documents (private)
CREATE POLICY "Admins can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND is_admin());

-- Add triggers for updated_at columns
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activate_sim_requests_updated_at
  BEFORE UPDATE ON public.activate_sim_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON public.translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();