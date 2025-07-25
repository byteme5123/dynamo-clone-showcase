import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Translation {
  id: string;
  key: string;
  en: string;
  es: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useTranslationsData = () => {
  return useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;
      return data as Translation[];
    },
  });
};

export const useCreateTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (translation: Omit<Translation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('translations')
        .insert([translation])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: "Success",
        description: "Translation created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create translation",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Translation> & { id: string }) => {
      const { data, error } = await supabase
        .from('translations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: "Success",
        description: "Translation updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update translation",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTranslation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
      toast({
        title: "Success",
        description: "Translation deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete translation",
        variant: "destructive",
      });
    },
  });
};