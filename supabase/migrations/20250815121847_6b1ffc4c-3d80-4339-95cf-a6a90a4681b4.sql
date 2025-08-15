-- Add page_type field to hero_slides table
ALTER TABLE public.hero_slides 
ADD COLUMN page_type text NOT NULL DEFAULT 'home';

-- Add check constraint for page_type values
ALTER TABLE public.hero_slides 
ADD CONSTRAINT hero_slides_page_type_check 
CHECK (page_type IN ('home', 'about', 'wireless_pbx'));

-- Create index for better performance when filtering by page_type
CREATE INDEX idx_hero_slides_page_type ON public.hero_slides(page_type);

-- Insert dummy test slides for all three pages
INSERT INTO public.hero_slides (title, subtitle, image_url, cta_text, cta_url, page_type, display_order, is_active) VALUES
-- Home page slides (3 slides)
('Welcome to Dynamo Wireless', 'Experience the best mobile connectivity in Central America', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop', 'Get Started', '/plans', 'home', 1, true),
('Unlimited Plans Available', 'Choose from our flexible prepaid and postpaid options', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=600&fit=crop', 'View Plans', '/plans', 'home', 2, true),
('Fast 5G Network', 'Stay connected with our reliable high-speed network', 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=600&fit=crop', 'Learn More', '/coverage', 'home', 3, true),

-- About page slide (1 slide)
('About Dynamo Wireless', 'Leading mobile carrier connecting Central America', 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&h=600&fit=crop', 'Contact Us', '/contact', 'about', 1, true),

-- Wireless PBX page slide (1 slide)
('Wireless PBX Solutions', 'Advanced business communication systems for modern enterprises', 'https://images.unsplash.com/photo-1553484771-cc0d9b8c2b33?w=1200&h=600&fit=crop', 'Get Quote', '/contact', 'wireless_pbx', 1, true);