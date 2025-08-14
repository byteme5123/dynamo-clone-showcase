-- Create table for WirelessPBX content management
CREATE TABLE public.wireless_pbx_content (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    image_url TEXT,
    cta_text TEXT,
    cta_url TEXT,
    features JSONB,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wireless_pbx_content ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage wireless PBX content"
ON public.wireless_pbx_content
FOR ALL
USING (is_admin());

-- Create policy for public read access
CREATE POLICY "Anyone can view active wireless PBX content"
ON public.wireless_pbx_content
FOR SELECT
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wireless_pbx_content_updated_at
    BEFORE UPDATE ON public.wireless_pbx_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for all sections
INSERT INTO public.wireless_pbx_content (section, title, subtitle, content, display_order, features) VALUES 
('hero', 'Dynamo Wireless Mobile PBX', 'Transform your business communications with our cutting-edge Mobile PBX solution', 'Experience the future of mobile business communications', 1, '{"cta_text": "Get Started Today", "cta_url": "/contact"}'),
('intro', 'Revolutionary Mobile Communication', 'Experience the power of 5G-enabled communication', 'Dynamo Wireless Mobile PBX represents the future of business communications. Our advanced system seamlessly integrates traditional PBX functionality with modern mobile technology, providing your business with unparalleled flexibility and connectivity.', 1, '{"highlight": "5G Powered Network", "description": "Ultra-fast, ultra-reliable communications"}'),
('features', 'Advanced Features for Modern Business', 'Cutting-edge communication tools', 'Comprehensive suite of professional communication features', 1, '[{"icon": "Video", "title": "HD Video Conferencing", "description": "Connect with teams and clients through crystal-clear video calls"}, {"icon": "FileText", "title": "Call Recording & Analytics", "description": "Comprehensive call recording with detailed analytics and reporting"}, {"icon": "Headphones", "title": "24/7 Customer Support", "description": "Round-the-clock technical support for uninterrupted service"}, {"icon": "Hospital", "title": "Healthcare Integration", "description": "HIPAA-compliant communications for healthcare providers"}]'),
('services', 'Out of the Box Service Includes', 'Everything you need to get started with professional mobile communications', 'Complete communication solution ready to deploy', 1, '[{"icon": "Phone", "title": "Unlimited Local & Long Distance", "description": "Call anywhere without restrictions"}, {"icon": "Users", "title": "Multi-User Conference Calling", "description": "Host meetings with up to 50 participants"}, {"icon": "Shield", "title": "Enterprise Security", "description": "Bank-level encryption and security protocols"}, {"icon": "Settings", "title": "Custom Configuration", "description": "Tailored setup for your business needs"}, {"icon": "Clock", "title": "24/7 Uptime Monitoring", "description": "Continuous system monitoring and maintenance"}, {"icon": "Mic", "title": "Voicemail to Email", "description": "Receive voicemails directly in your inbox"}]'),
('locations', 'Dynamo Wireless Mobile-PBX can be used at:', 'Versatile communication solutions for every industry', 'Suitable for all business environments', 1, '[{"icon": "Building2", "label": "Corporate Offices", "description": "Enterprise communications"}, {"icon": "Hospital", "label": "Healthcare Facilities", "description": "HIPAA-compliant systems"}, {"icon": "GraduationCap", "label": "Educational Institutions", "description": "Campus-wide connectivity"}, {"icon": "Store", "label": "Retail Locations", "description": "Multi-location coordination"}, {"icon": "Briefcase", "label": "Professional Services", "description": "Client-focused communications"}, {"icon": "Home", "label": "Remote Workspaces", "description": "Work-from-home solutions"}]'),
('cta', 'Interested? Get a FREE Test Account!', 'Experience the power of Dynamo Wireless Mobile PBX with our risk-free trial', 'Start your journey with professional mobile communications', 1, '{"cta_text": "Start Your Free Trial", "cta_url": "/contact"}');