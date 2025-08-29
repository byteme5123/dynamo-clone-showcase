import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalSettings {
  id: string;
  environment: string;
  sandbox_client_id?: string;
  sandbox_client_secret?: string;
  live_client_id?: string;
  live_client_secret?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePayPalSettings = () => {
  return useQuery({
    queryKey: ['paypal-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paypal_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PayPalSettings | null;
    },
  });
};

export const useUpdatePayPalSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PayPalSettings> & { id?: string }) => {
      const { id, ...updateData } = data;
      
      if (id) {
        // Update existing settings
        const { error } = await supabase
          .from('paypal_settings')
          .update(updateData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('paypal_settings')
          .insert(updateData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal-settings'] });
      toast({
        title: 'Success',
        description: 'PayPal settings updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update PayPal settings',
        variant: 'destructive',
      });
    },
  });
};

export const useTestPayPalConnection = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: { clientId: string; clientSecret: string; environment: string }) => {
      // Test PayPal credentials by making a request to get access token
      const baseUrl = credentials.environment === 'live' 
        ? 'https://api.paypal.com'
        : 'https://api.sandbox.paypal.com';
      
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error('Invalid PayPal credentials');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'PayPal connection test successful',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Unable to connect to PayPal with provided credentials',
        variant: 'destructive',
      });
    },
  });
};