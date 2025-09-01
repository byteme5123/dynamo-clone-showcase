import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePayPalOrderParams {
  planId: string;
  amount: number;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
  sessionToken?: string;
}

interface CapturePayPalOrderParams {
  orderId: string;
  sessionToken?: string;
}

export const useCreatePayPalOrder = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreatePayPalOrderParams) => {
      const sessionToken = localStorage.getItem('user_session_token');
      
      if (!sessionToken) {
        console.error('No session token found for PayPal order creation');
        throw new Error('Please log in to make a purchase');
      }

      console.log('Creating PayPal order with session token:', sessionToken.substring(0, 8) + '...');
      
      // Pass session token in request body instead of Authorization header
      const requestBody = {
        ...params,
        sessionToken,
      };

      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: requestBody,
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
      const sessionToken = localStorage.getItem('user_session_token');
      
      // Pass session token in request body instead of Authorization header
      const requestBody = {
        ...params,
        sessionToken,
      };
      
      console.log('Capture PayPal order with session token:', sessionToken ? 'present' : 'missing');

      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: requestBody,
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