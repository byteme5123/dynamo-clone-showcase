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
      // Use the session token from params first, then fallback to localStorage
      const sessionToken = params.sessionToken || localStorage.getItem('user_session_token');
      
      console.log('Capturing PayPal order:', params.orderId);
      console.log('Session token available:', sessionToken ? 'yes' : 'no');
      
      const requestBody = {
        orderId: params.orderId,
        sessionToken,
      };

      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: requestBody,
      });

      if (error) {
        console.error('Capture error response:', error);
        throw new Error(error.message || 'Failed to capture PayPal order');
      }
      
      console.log('Capture response:', data);
      return data;
    },
    // Remove toast notifications from here to avoid duplicates
    // The PaymentSuccess component will handle success/error messaging
  });
};