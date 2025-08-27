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
  plan_type: 'domestic' | 'special';
  data_limit: string;
  call_minutes: string;
  sms_limit: string;
  validity_days: number;
  countries: string[];
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  image_url?: string;
  external_link?: string;
  created_at: string;
  updated_at: string;
}

// Core plan fetching function with better error handling
const fetchPlans = async (activeOnly: boolean = true) => {
  console.log(`Fetching plans (activeOnly: ${activeOnly})`);
  
  try {
    let query = supabase
      .from('plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Plans fetch error:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} plans:`, data);
    
    // Convert features from Json to string[] for frontend use
    const processedPlans = data?.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
      countries: Array.isArray(plan.countries) ? plan.countries : []
    })) as Plan[] || [];

    console.log('Processed plans:', processedPlans);
    return processedPlans;
  } catch (error) {
    console.error('Error in fetchPlans:', error);
    throw error;
  }
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans', 'active'],
    queryFn: () => fetchPlans(true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ['plans', 'all'],
    queryFn: () => fetchPlans(false),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      console.log(`Fetching plan by id: ${id}`);
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Plan fetch error:', error);
        throw error;
      }
      
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
        countries: Array.isArray(data.countries) ? data.countries : []
      } as Plan;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePlanBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['plan', 'slug', slug],
    queryFn: async () => {
      console.log(`Fetching plan by slug: ${slug}`);
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Plan by slug fetch error:', error);
        throw error;
      }
      
      return {
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
        countries: Array.isArray(data.countries) ? data.countries : []
      } as Plan;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) => {
      const dbData = {
        ...planData,
        features: planData.features,
        countries: planData.countries
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
      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });
    },
    onError: (error) => {
      console.error('Create plan error:', error);
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
      const dbData = {
        ...planData,
        features: planData.features,
        countries: planData.countries
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
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
      });
    },
    onError: (error) => {
      console.error('Update plan error:', error);
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
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Delete plan error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      });
    },
  });
};
