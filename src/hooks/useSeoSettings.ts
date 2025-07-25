import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SeoSetting {
  id: string;
  page_slug: string;
  meta_title: string;
  meta_description?: string;
  keywords?: string;
  og_image_url?: string;
  og_title?: string;
  og_description?: string;
  created_at: string;
  updated_at: string;
}

export const useSeoSettings = () => {
  return useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_slug');

      if (error) throw error;
      return data as SeoSetting[];
    },
  });
};

export const useSeoSettingBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['seo-setting', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SeoSetting | null;
    },
  });
};

export const useCreateSeoSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: Omit<SeoSetting, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('seo_settings')
        .insert([setting])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: "Success",
        description: "SEO setting created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create SEO setting",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSeoSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SeoSetting> & { id: string }) => {
      const { data, error } = await supabase
        .from('seo_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: "Success",
        description: "SEO setting updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update SEO setting",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSeoSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seo_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: "Success",
        description: "SEO setting deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete SEO setting",
        variant: "destructive",
      });
    },
  });
};