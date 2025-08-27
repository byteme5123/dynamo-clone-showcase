
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
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as PaymentSettings;
    },
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<PaymentSettings>) => {
      const { data, error } = await supabase
        .from('payment_settings')
        .update(settings)
        .eq('is_active', true)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Payment settings have been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update payment settings.',
        variant: 'destructive',
      });
    },
  });
};
