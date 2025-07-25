import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  type: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category')
        .order('key');

      if (error) throw error;
      return data as SiteSetting[];
    },
  });
};

export const useSiteSettingByKey = (key: string) => {
  return useQuery({
    queryKey: ['site-setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SiteSetting | null;
    },
  });
};

export const useCreateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('site_settings')
        .insert([setting])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "Success",
        description: "Site setting created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create site setting",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SiteSetting> & { id: string }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "Success",
        description: "Site setting updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update site setting",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "Success",
        description: "Site setting deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete site setting",
        variant: "destructive",
      });
    },
  });
};