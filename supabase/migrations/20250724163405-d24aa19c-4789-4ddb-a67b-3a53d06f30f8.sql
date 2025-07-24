-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin');
CREATE TYPE public.plan_type AS ENUM ('prepaid', 'postpaid');

-- Create admin_users table
CREATE TABLE public.admin_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'admin',
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for admin role checking
CREATE OR REPLACE FUNCTION public.get_current_admin_user()
RETURNS public.admin_users AS $$
    SELECT * FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND role IN ('admin', 'super_admin')
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true 
        AND role = 'super_admin'
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for admin_users
CREATE POLICY "Admin users can view their own record"
    ON public.admin_users FOR SELECT
    USING (user_id = auth.uid() AND is_active = true);

CREATE POLICY "Super admins can view all admin users"
    ON public.admin_users FOR SELECT
    USING (public.is_super_admin());

CREATE POLICY "Super admins can update admin users"
    ON public.admin_users FOR UPDATE
    USING (public.is_super_admin());

CREATE POLICY "Super admins can insert admin users"
    ON public.admin_users FOR INSERT
    WITH CHECK (public.is_super_admin());

-- Create plans table
CREATE TABLE public.plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    plan_type public.plan_type NOT NULL DEFAULT 'prepaid',
    features JSONB,
    data_limit TEXT,
    call_minutes TEXT,
    sms_limit TEXT,
    validity_days INTEGER,
    countries TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on plans (public read, admin write)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
    ON public.plans FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage plans"
    ON public.plans FOR ALL
    USING (public.is_admin());

-- Create contact_forms table
CREATE TABLE public.contact_forms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_forms
ALTER TABLE public.contact_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact forms"
    ON public.contact_forms FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view and update contact forms"
    ON public.contact_forms FOR ALL
    USING (public.is_admin());

-- Create faqs table
CREATE TABLE public.faqs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQs"
    ON public.faqs FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage FAQs"
    ON public.faqs FOR ALL
    USING (public.is_admin());

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
    ON public.testimonials FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON public.plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_forms_updated_at
    BEFORE UPDATE ON public.contact_forms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Only create admin profile if user has admin metadata
    IF NEW.raw_user_meta_data ? 'is_admin' AND (NEW.raw_user_meta_data ->> 'is_admin')::boolean = true THEN
        INSERT INTO public.admin_users (
            user_id,
            role,
            first_name,
            last_name,
            is_active
        ) VALUES (
            NEW.id,
            COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'admin'),
            NEW.raw_user_meta_data ->> 'first_name',
            NEW.raw_user_meta_data ->> 'last_name',
            true
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for new admin users
CREATE TRIGGER on_auth_admin_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- Insert initial super admin user
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Insert into auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        role,
        aud,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change_token_current,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'admin@dynamowireless.com',
        crypt('DynamoAdmin2024!', gen_salt('bf')),
        now(),
        'authenticated',
        'authenticated',
        '',
        now(),
        '',
        now(),
        '',
        '',
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"is_admin": true, "role": "super_admin", "first_name": "Super", "last_name": "Admin"}',
        false,
        now(),
        now()
    ) RETURNING id INTO admin_user_id;

    -- Insert into admin_users
    INSERT INTO public.admin_users (
        user_id,
        role,
        first_name,
        last_name,
        is_active
    ) VALUES (
        admin_user_id,
        'super_admin',
        'Super',
        'Admin',
        true
    );
END $$;

-- Insert sample plans
INSERT INTO public.plans (name, slug, description, price, plan_type, features, data_limit, call_minutes, sms_limit, validity_days, countries, is_featured) VALUES
('Guatemala Basic', 'guatemala-basic', 'Perfect for short trips to Guatemala', 15.99, 'prepaid', '["Unlimited calls within Guatemala", "Free incoming calls", "Basic data package"]', '2GB', 'Unlimited', '100', 7, '["Guatemala"]', true),
('Honduras Connect', 'honduras-connect', 'Stay connected throughout Honduras', 18.99, 'prepaid', '["Unlimited local calls", "International calling credits", "High-speed data"]', '3GB', 'Unlimited', 'Unlimited', 14, '["Honduras"]', true),
('El Salvador Plus', 'el-salvador-plus', 'Premium connectivity for El Salvador', 22.99, 'prepaid', '["Unlimited calls and SMS", "Premium data speeds", "Roaming coverage"]', '5GB', 'Unlimited', 'Unlimited', 30, '["El Salvador"]', true),
('Central America Multi', 'central-america-multi', 'Coverage across multiple Central American countries', 49.99, 'prepaid', '["Multi-country coverage", "Unlimited calls", "High-speed data", "Premium support"]', '10GB', 'Unlimited', 'Unlimited', 30, '["Guatemala", "Honduras", "El Salvador", "Nicaragua", "Costa Rica"]', true);

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, display_order) VALUES
('How do I activate my SIM card?', 'You can activate your SIM card by visiting our activation page and following the step-by-step instructions. You''ll need your SIM card number and a valid form of payment.', 'Activation', 1),
('What countries are covered by Dynamo Wireless?', 'We provide coverage across Central America including Guatemala, Honduras, El Salvador, Nicaragua, and Costa Rica with expanding coverage.', 'Coverage', 2),
('Can I use my phone in multiple countries?', 'Yes! Our multi-country plans allow you to use your phone seamlessly across all covered Central American countries without additional roaming charges.', 'Plans', 3),
('How do I check my data usage?', 'You can check your data usage through our mobile app or by dialing *123# from your Dynamo Wireless number.', 'Usage', 4),
('What payment methods do you accept?', 'We accept all major credit cards, PayPal, and local payment methods in each country we serve.', 'Billing', 5);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, title, company, content, rating, is_featured, display_order) VALUES
('Maria Rodriguez', 'Travel Blogger', 'Wanderlust Central', 'Dynamo Wireless kept me connected throughout my entire Central America journey. The coverage was excellent and the prices were very reasonable.', 5, true, 1),
('Carlos Mendez', 'Business Owner', 'Import/Export LLC', 'As someone who travels frequently between Guatemala and Honduras for business, Dynamo Wireless has been a game-changer. No more worrying about roaming charges!', 5, true, 2),
('Ana Sofia Torres', 'Digital Nomad', null, 'The data speeds are impressive and the customer service is top-notch. I''ve recommended Dynamo Wireless to all my fellow digital nomads in the region.', 4, true, 3),
('Roberto Martinez', 'Tour Guide', 'Central America Adventures', 'My clients always ask about staying connected during their tours. Dynamo Wireless has become my go-to recommendation for reliable mobile service.', 5, false, 4);