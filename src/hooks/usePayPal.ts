import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePayPalOrderParams {
  planId: string;
  amount: number;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
  userId?: string;
  customerEmail?: string;
}

interface CapturePayPalOrderParams {
  orderId: string;
}

export const useCreatePayPalOrder = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreatePayPalOrderParams) => {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
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
      const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: params,
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