import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};

export const useFeaturedTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};