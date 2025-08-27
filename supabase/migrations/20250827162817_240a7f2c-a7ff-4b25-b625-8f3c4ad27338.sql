
-- Create users table for authentication
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  paypal_transaction_id TEXT,
  paypal_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, cancelled
  payment_method TEXT, -- paypal, card
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment settings table for admin configuration
CREATE TABLE public.payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT DEFAULT 'sandbox', -- sandbox, live
  sandbox_client_id TEXT,
  sandbox_client_secret TEXT,
  live_client_id TEXT,
  live_client_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user sessions table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Anyone can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- RLS policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Anyone can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all transactions" ON public.transactions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true
  ));

-- RLS policies for payment settings
CREATE POLICY "Only admins can manage payment settings" ON public.payment_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Anyone can view payment settings" ON public.payment_settings
  FOR SELECT USING (true);

-- RLS policies for user sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_verification_token ON public.users(verification_token);
CREATE INDEX idx_users_reset_token ON public.users(reset_token);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_paypal_order_id ON public.transactions(paypal_order_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Create trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default payment settings
INSERT INTO public.payment_settings (environment, sandbox_client_id, sandbox_client_secret)
VALUES ('sandbox', 'AX0hpoqkJHdoG3graFhlfx62yJfAhi6DUptvCL9zJKrK8o9At_gEEUmNj3zqMVmFPNlbqcFwZ45YbG5U', 'EBY7JlDfMOAn_QASUFETsm4JN-iUYBOI');
