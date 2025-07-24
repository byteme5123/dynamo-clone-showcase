-- Phase 1: Create missing tables for admin dashboard

-- Create admin_users table for role-based access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create translations table for multilingual content
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  section TEXT NOT NULL,
  en TEXT,
  es TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, section)
);

-- Create site_settings table for global configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'json', 'boolean', 'number', 'image')),
  section TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seo_settings table for per-page SEO
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_library table for file management
CREATE TABLE public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  caption TEXT,
  folder TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table for admin actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance existing tables with multilingual and admin fields

-- Add multilingual support to plans
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS name_es TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS description_es TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'domestic' CHECK (category IN ('domestic', 'international'));
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add multilingual support to faqs
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS question_es TEXT;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS answer_es TEXT;
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add multilingual support to testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS content_es TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add admin fields to slider_images
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS title_es TEXT;
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS subtitle_es TEXT;
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS button_text_es TEXT;
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.slider_images ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add multilingual support to site_content
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS value_es TEXT;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies for admin_users
CREATE POLICY "Admins can view all admin users" ON public.admin_users
FOR SELECT USING (public.is_admin());

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- RLS Policies for translations
CREATE POLICY "Public can view translations" ON public.translations
FOR SELECT USING (true);

CREATE POLICY "Admins can manage translations" ON public.translations
FOR ALL USING (public.is_admin());

-- RLS Policies for site_settings
CREATE POLICY "Public can view site settings" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
FOR ALL USING (public.is_admin());

-- RLS Policies for seo_settings
CREATE POLICY "Public can view SEO settings" ON public.seo_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings
FOR ALL USING (public.is_admin());

-- RLS Policies for media_library
CREATE POLICY "Public can view public media" ON public.media_library
FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all media" ON public.media_library
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage media" ON public.media_library
FOR INSERT, UPDATE, DELETE USING (public.is_admin());

-- RLS Policies for activity_logs
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (true);

-- Update existing table policies for admin access
DROP POLICY IF EXISTS "Public can create contact forms" ON public.contact_forms;
CREATE POLICY "Public can create contact forms" ON public.contact_forms
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact forms" ON public.contact_forms
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update contact forms" ON public.contact_forms
FOR UPDATE USING (public.is_admin());

-- Update plans policies
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
CREATE POLICY "Public can view active plans" ON public.plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.plans
FOR ALL USING (public.is_admin());

-- Update faqs policies
DROP POLICY IF EXISTS "Public can view active FAQs" ON public.faqs;
CREATE POLICY "Public can view active FAQs" ON public.faqs
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs
FOR ALL USING (public.is_admin());

-- Update testimonials policies
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
CREATE POLICY "Public can view active testimonials" ON public.testimonials
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
FOR ALL USING (public.is_admin());

-- Update slider_images policies
DROP POLICY IF EXISTS "Public can view active slider images" ON public.slider_images;
CREATE POLICY "Public can view active slider images" ON public.slider_images
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage slider images" ON public.slider_images
FOR ALL USING (public.is_admin());

-- Update site_content policies
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content" ON public.site_content
FOR SELECT USING (true);

CREATE POLICY "Admins can manage site content" ON public.site_content
FOR ALL USING (public.is_admin());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
BEFORE UPDATE ON public.seo_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at
BEFORE UPDATE ON public.media_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial site settings
INSERT INTO public.site_settings (key, value, type, section, description) VALUES
('site_title', 'Dynamo Wireless', 'text', 'general', 'Main site title'),
('support_email', 'support@dynamowireless.com', 'text', 'contact', 'Support email address'),
('support_phone', '+1-800-DYNAMO', 'text', 'contact', 'Support phone number'),
('business_hours', '9:00 AM - 8:00 PM EST', 'text', 'contact', 'Business hours'),
('company_address', '123 Main St, City, State 12345', 'text', 'contact', 'Company address'),
('currency', 'USD', 'text', 'general', 'Site currency'),
('facebook_url', '', 'text', 'social', 'Facebook page URL'),
('twitter_url', '', 'text', 'social', 'Twitter profile URL'),
('instagram_url', '', 'text', 'social', 'Instagram profile URL'),
('linkedin_url', '', 'text', 'social', 'LinkedIn page URL'),
('youtube_url', '', 'text', 'social', 'YouTube channel URL'),
('google_analytics_id', '', 'text', 'tracking', 'Google Analytics tracking ID'),
('facebook_pixel_id', '', 'text', 'tracking', 'Facebook Pixel ID');

-- Insert initial SEO settings for existing pages
INSERT INTO public.seo_settings (page_slug, meta_title, meta_description) VALUES
('home', 'Dynamo Wireless - Unlimited Nationwide Plans', 'Get unlimited nationwide mobile plans with Dynamo Wireless. Fast 5G coverage across Central America.'),
('about', 'About Dynamo Wireless - Your Mobile Partner', 'Learn about Dynamo Wireless and our commitment to providing reliable mobile services.'),
('plans', 'Mobile Plans - Dynamo Wireless', 'Choose from our affordable mobile plans with unlimited data and nationwide coverage.'),
('contact', 'Contact Dynamo Wireless - Get Support', 'Contact our support team for help with your mobile service questions and account management.'),
('activate', 'Activate Your SIM - Dynamo Wireless', 'Activate your Dynamo Wireless SIM card and start using your mobile service today.');

-- Create storage buckets for admin media management
INSERT INTO storage.buckets (id, name, public) VALUES 
('admin-media', 'admin-media', true),
('plan-images', 'plan-images', true),
('slider-images', 'slider-images', true),
('brand-assets', 'brand-assets', true);

-- Create storage policies for admin media
CREATE POLICY "Admins can upload admin media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'admin-media' AND 
  public.is_admin()
);

CREATE POLICY "Admins can update admin media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'admin-media' AND 
  public.is_admin()
);

CREATE POLICY "Admins can delete admin media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'admin-media' AND 
  public.is_admin()
);

CREATE POLICY "Public can view admin media" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-media');

-- Apply similar policies for other buckets
CREATE POLICY "Admins can upload plan images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'plan-images' AND 
  public.is_admin()
);

CREATE POLICY "Public can view plan images" ON storage.objects
FOR SELECT USING (bucket_id = 'plan-images');

CREATE POLICY "Admins can upload slider images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'slider-images' AND 
  public.is_admin()
);

CREATE POLICY "Public can view slider images" ON storage.objects
FOR SELECT USING (bucket_id = 'slider-images');

CREATE POLICY "Admins can upload brand assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brand-assets' AND 
  public.is_admin()
);

CREATE POLICY "Public can view brand assets" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');