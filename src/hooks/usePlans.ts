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

const fetchPlans = async (): Promise<Plan[]> => {
  console.log('🔄 [FETCH] Starting fetchPlans...');
  
  try {
    console.log('🔄 [FETCH] Calling supabase.from("plans")...');
    
    const query = supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    console.log('🔄 [FETCH] Query created, executing...');
    
    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
    });
    
    const queryPromise = query;
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    console.log('🔄 [FETCH] Query completed');
    console.log('📊 [FETCH] Data:', data);
    console.log('📊 [FETCH] Error:', error);

    if (error) {
      console.error('❌ [FETCH] Supabase error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    if (!data) {
      console.warn('⚠️ [FETCH] No data returned');
      return [];
    }
    
    console.log(`✅ [FETCH] Successfully fetched ${data.length} plans`);
    
    const processedPlans = data.map(plan => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
      countries: Array.isArray(plan.countries) ? plan.countries : []
    })) as Plan[];

    console.log('✅ [FETCH] Plans processed successfully');
    return processedPlans;
    
  } catch (error) {
    console.error('💥 [FETCH] Fetch error:', error);
    
    // Try a simpler query as fallback
    try {
      console.log('🔄 [FALLBACK] Trying fallback query...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('plans')
        .select('id, name, slug, description, price, currency, plan_type, is_active')
        .eq('is_active', true)
        .limit(10);
      
      if (fallbackError) {
        console.error('❌ [FALLBACK] Fallback also failed:', fallbackError);
        throw fallbackError;
      }
      
      console.log('✅ [FALLBACK] Fallback succeeded with basic data');
      return (fallbackData || []).map(plan => ({
        ...plan,
        features: [],
        countries: [],
        data_limit: '',
        call_minutes: '',
        sms_limit: '',
        validity_days: 30,
        is_featured: false,
        display_order: 0,
        created_at: '',
        updated_at: ''
      })) as Plan[];
      
    } catch (fallbackError) {
      console.error('💥 [FALLBACK] Both queries failed');
      throw error; // Throw original error
    }
  }
};

export const usePlans = () => {
  console.log('🏁 [HOOK] usePlans hook called');
  
  const result = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      console.log('🏁 [HOOK] Query function executing...');
      const plans = await fetchPlans();
      console.log('🏁 [HOOK] Query function completed with:', plans.length, 'plans');
      return plans;
    },
    staleTime: 0, // Always fetch fresh data for debugging
    gcTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      console.log(`🔄 [HOOK] Retry ${failureCount} for:`, error?.message);
      return failureCount < 1; // Only retry once
    },
    retryDelay: 2000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    networkMode: 'always', // Always try to fetch
    enabled: true, // Always enabled
  });
  
  console.log('🏁 [HOOK] Query result:', {
    isLoading: result.isLoading,
    isPending: result.isPending,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
    dataLength: result.data?.length || 0
  });
  
  return result;
};

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ['plans', 'all'],
    queryFn: async () => {
      console.log('🔄 Fetching all plans for admin...');
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Admin plans fetch error:', error);
        throw error;
      }
      
      return data?.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
        countries: Array.isArray(plan.countries) ? plan.countries : []
      })) as Plan[] || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      console.log(`🔄 Fetching plan by id: ${id}`);
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Plan fetch error:', error);
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
      console.log(`🔄 Fetching plan by slug: ${slug}`);
      
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Plan by slug fetch error:', error);
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
