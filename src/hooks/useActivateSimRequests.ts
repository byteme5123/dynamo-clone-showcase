import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface ActivateSimRequest {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  sim_card_number: string;
  plan_preference?: string;
  id_document_url?: string;
  additional_notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useActivateSimRequests = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('activate-sim-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activate_sim_requests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['activate-sim-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['activate-sim-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activate_sim_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ActivateSimRequest[];
    },
  });
};

export const useUpdateActivateSimRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActivateSimRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('activate_sim_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activate-sim-requests'] });
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteActivateSimRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activate_sim_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activate-sim-requests'] });
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    },
  });
};