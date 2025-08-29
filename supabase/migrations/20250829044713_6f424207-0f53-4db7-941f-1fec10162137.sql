-- Create PayPal settings table for managing sandbox and live credentials
CREATE TABLE public.paypal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL DEFAULT 'sandbox',
  sandbox_client_id TEXT,
  sandbox_client_secret TEXT,
  live_client_id TEXT,
  live_client_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table to track PayPal payment information
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  paypal_order_id TEXT UNIQUE,
  paypal_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.paypal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- PayPal settings policies
CREATE POLICY "Anyone can view PayPal settings" ON public.paypal_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage PayPal settings" ON public.paypal_settings
  FOR ALL USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (is_admin());

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can update orders" ON public.orders
  FOR UPDATE USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_paypal_settings_updated_at
  BEFORE UPDATE ON public.paypal_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial PayPal settings with provided sandbox credentials
INSERT INTO public.paypal_settings (
  environment,
  sandbox_client_id,
  sandbox_client_secret,
  is_active
) VALUES (
  'sandbox',
  'AX0hpoqkJHdoG3graFhlfx62yJfAhi6DUptvCL9zJKrK8o9At_gEEUmNj3zqMVmFPNlbqcFwZ45YbG5U',
  'EBY7JlDfMOAn_QASUFETsm4JN-iUYBOIKbIZwysO_goRWo0rVJHiOmegcI-Ap1OqkOcmG5YklBpSU_F-',
  true
);