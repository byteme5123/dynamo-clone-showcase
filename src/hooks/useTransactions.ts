
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string | null;
  paypal_transaction_id: string | null;
  paypal_order_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  plan?: {
    name: string;
    slug: string;
  };
  user?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const useUserTransactions = (userId?: string) => {
  return useQuery({
    queryKey: ['transactions', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          plan:plans(name, slug),
          user:users(email, first_name, last_name)
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!userId,
  });
};

export const useAllTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          plan:plans(name, slug),
          user:users(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction created',
        description: 'Transaction has been recorded successfully.',
      });
    },
    onError: (error) => {
      console.error('Transaction creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transaction.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
