import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as HeroSlide[];
    },
  });
};

export const useAdminHeroSlides = () => {
  return useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as HeroSlide[];
    },
  });
};

export const useCreateHeroSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .insert([slide])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast({
        title: "Success",
        description: "Hero slide created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create hero slide",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateHeroSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast({
        title: "Success",
        description: "Hero slide updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update hero slide",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteHeroSlide = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      toast({
        title: "Success",
        description: "Hero slide deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete hero slide",
        variant: "destructive",
      });
    },
  });
};