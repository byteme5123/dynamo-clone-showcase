-- Create email logs table for admin tracking
CREATE TABLE public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    order_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all email logs"
ON public.email_logs
FOR SELECT
USING (is_admin());

CREATE POLICY "Anyone can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX idx_email_logs_order_id ON public.email_logs(order_id) WHERE order_id IS NOT NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON public.email_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();