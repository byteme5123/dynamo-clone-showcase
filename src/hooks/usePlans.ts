
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  plan_type: 'prepaid' | 'postpaid';
  data_limit: string;
  call_minutes: string;
  sms_limit: string;
  validity_days: number;
  countries: string[];
  features: string[]; // This will be converted to/from JSON in the database
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  image_url?: string;
  external_link?: string;
  created_at: string;
  updated_at: string;
}

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Convert features from Json to string[] for frontend use
      return data.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
        countries: Array.isArray(plan.countries) ? plan.countries : []
      })) as Plan[];
    },
  });
};

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Convert features from Json to string[] for frontend use
      return data.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
        countries: Array.isArray(plan.countries) ? plan.countries : []
      })) as Plan[];
    },
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Convert features from Json to string[] for frontend use
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
        countries: Array.isArray(data.countries) ? data.countries : []
      } as Plan;
    },
    enabled: !!id,
  });
};

export const usePlanBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['plan-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Convert features from Json to string[] for frontend use
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
        countries: Array.isArray(data.countries) ? data.countries : []
      } as Plan;
    },
    enabled: !!slug,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
      // Convert features and countries arrays to proper format for database
      const dbData = {
        ...planData,
        features: planData.features, // Keep as array - Supabase will convert to jsonb
        countries: planData.countries // Keep as array - Supabase will convert to array
      };

      const { data, error } = await supabase
        .from('plans')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create plan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...planData }: Partial<Plan> & { id: string }) => {
      // Convert features and countries arrays to proper format for database
      const dbData = {
        ...planData,
        features: planData.features, // Keep as array - Supabase will convert to jsonb
        countries: planData.countries // Keep as array - Supabase will convert to array
      };

      const { data, error } = await supabase
        .from('plans')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update plan',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      });
    },
  });
};
