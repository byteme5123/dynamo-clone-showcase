-- Add external link field to plans table for "Choose this plan" button
ALTER TABLE public.plans 
ADD COLUMN external_link TEXT;

-- Create some dummy data for admin sections if missing
INSERT INTO public.hero_slides (title, subtitle, image_url, cta_text, cta_url, display_order) 
VALUES 
  ('Welcome to Dynamo Wireless', 'Your trusted telecom partner', '/src/assets/slider-1.jpg', 'Get Started', '/plans', 1),
  ('Best Coverage Nationwide', 'Stay connected wherever you go', '/src/assets/slider-2.jpg', 'View Coverage', '/coverage', 2),
  ('Affordable International Plans', 'Connect with the world', '/src/assets/slider-3.jpg', 'See Plans', '/plans', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.testimonials (name, content, company, title, rating, display_order) 
VALUES 
  ('Maria Rodriguez', 'Excellent service and great coverage!', 'Tech Corp', 'CEO', 5, 1),
  ('John Smith', 'Affordable international plans that actually work.', 'Global Inc', 'Manager', 5, 2),
  ('Ana Garcia', 'Customer service is outstanding!', 'StartupXYZ', 'Founder', 4, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category, display_order) 
VALUES 
  ('How do I activate my SIM card?', 'You can activate your SIM card by filling out our online activation form or visiting one of our stores.', 'Activation', 1),
  ('What countries are covered?', 'We provide coverage in Central America including Guatemala, Honduras, and El Salvador.', 'Coverage', 2),
  ('How can I check my balance?', 'Dial *111# to check your current balance and data usage.', 'Account', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_settings (key, value, type, category, description) 
VALUES 
  ('site_title', 'Dynamo Wireless', 'text', 'general', 'Main site title'),
  ('contact_email', 'info@dynamowireless.com', 'email', 'contact', 'Main contact email'),
  ('phone_number', '+502 1234-5678', 'text', 'contact', 'Main phone number'),
  ('address', 'Guatemala City, Guatemala', 'text', 'contact', 'Company address')
ON CONFLICT DO NOTHING;

INSERT INTO public.translations (key, en, es, category) 
VALUES 
  ('welcome', 'Welcome', 'Bienvenido', 'general'),
  ('plans', 'Plans', 'Planes', 'navigation'),
  ('contact', 'Contact', 'Contacto', 'navigation'),
  ('about', 'About', 'Acerca', 'navigation')
ON CONFLICT DO NOTHING;

INSERT INTO public.seo_settings (page_slug, meta_title, meta_description, keywords) 
VALUES 
  ('home', 'Dynamo Wireless - Central America Telecom', 'Leading telecom provider in Central America offering affordable mobile and data plans', 'telecom, mobile, Guatemala, Honduras, El Salvador'),
  ('plans', 'Mobile Plans - Dynamo Wireless', 'Choose from our affordable prepaid and postpaid mobile plans', 'mobile plans, prepaid, postpaid, telecom'),
  ('contact', 'Contact Us - Dynamo Wireless', 'Get in touch with our customer service team', 'contact, support, customer service')
ON CONFLICT DO NOTHING;