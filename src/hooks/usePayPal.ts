import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePayPalOrderParams {
  planId: string;
  amount: number;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}

interface CapturePayPalOrderParams {
  orderId: string;
}

export const useCreatePayPalOrder = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreatePayPalOrderParams) => {
      // Get JWT token from Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No auth session found for PayPal order creation');
        throw new Error('Please log in to make a purchase');
      }

      console.log('Creating PayPal order with JWT token');
      
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('PayPal order creation error:', error);
        throw new Error(error.message || 'Failed to create PayPal order');
      }
      
      console.log('PayPal order created successfully:', data);
      return data;
    },
    onError: (error: any) => {
      console.error('PayPal order creation failed:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create PayPal order',
        variant: 'destructive',
      });
    },
  });
};

export const useCapturePayPalOrder = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CapturePayPalOrderParams) => {
      // Get JWT token from Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Capture PayPal order with JWT token:', session?.access_token ? 'present' : 'missing');

      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderId: params.orderId },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {},
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully!',
        });
      } else {
        toast({
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to capture PayPal order',
        variant: 'destructive',
      });
    },
  });
};