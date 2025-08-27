
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentSettings {
  id: string;
  environment: 'sandbox' | 'live';
  sandbox_client_id: string | null;
  sandbox_client_secret: string | null;
  live_client_id: string | null;
  live_client_secret: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      console.log('Fetching payment settings...');
      
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Payment settings fetch error:', error);
        throw error;
      }
      
      console.log('Fetched payment settings:', data);
      return data as PaymentSettings | null;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<PaymentSettings>) => {
      console.log('Updating payment settings:', settings);
      
      // First, try to get existing settings
      const { data: existing } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      let result;
      
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('payment_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('payment_settings')
          .insert({
            ...settings,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      console.log('Payment settings updated:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Payment settings have been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Update payment settings error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
