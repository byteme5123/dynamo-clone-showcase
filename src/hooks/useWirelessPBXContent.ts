import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface WirelessPBXContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  features?: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWirelessPBXContent = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['wireless-pbx-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wireless_pbx_content')
        .select('*')
        .eq('is_active', true)
        .order('section')
        .order('display_order');
      
      if (error) throw error;
      return data as WirelessPBXContent[];
    },
  });

  // Set up real-time subscription
  React.useEffect(() => {
    const channel = supabase
      .channel('wireless-pbx-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wireless_pbx_content'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['wireless-pbx-content'] });
          queryClient.invalidateQueries({ queryKey: ['admin-wireless-pbx-content'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useWirelessPBXSection = (section: string) => {
  return useQuery({
    queryKey: ['wireless-pbx-content', section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wireless_pbx_content')
        .select('*')
        .eq('section', section)
        .eq('is_active', true)
        .order('display_order')
        .maybeSingle();
      
      if (error) throw error;
      return data as WirelessPBXContent | null;
    },
  });
};

export const useAdminWirelessPBXContent = () => {
  return useQuery({
    queryKey: ['admin-wireless-pbx-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wireless_pbx_content')
        .select('*')
        .order('section')
        .order('display_order');
      
      if (error) throw error;
      return data as WirelessPBXContent[];
    },
  });
};

export const useCreateWirelessPBXContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (content: Omit<WirelessPBXContent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('wireless_pbx_content')
        .insert([content])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireless-pbx-content'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wireless-pbx-content'] });
      toast({
        title: "Content created successfully",
        description: "Your wireless PBX content has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWirelessPBXContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WirelessPBXContent> & { id: string }) => {
      const { data, error } = await supabase
        .from('wireless_pbx_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireless-pbx-content'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wireless-pbx-content'] });
      toast({
        title: "Content updated successfully",
        description: "Your wireless PBX content has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteWirelessPBXContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wireless_pbx_content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireless-pbx-content'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wireless-pbx-content'] });
      toast({
        title: "Content deleted successfully",
        description: "Your wireless PBX content has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting content",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};