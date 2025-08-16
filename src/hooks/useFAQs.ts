import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  display_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFAQs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FAQ[];
    },
  });
};

export const useFAQsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['faqs', 'category', category],
    queryFn: async () => {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FAQ[];
    },
  });
};