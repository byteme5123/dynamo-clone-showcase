import { useAuth } from '@/contexts/AuthContext';

export const useSessionRecovery = () => {
  const { user, loading } = useAuth();

  // Session recovery is now handled automatically by Supabase's built-in auth
  // This hook is kept for backward compatibility
  
  return { user, loading };
};