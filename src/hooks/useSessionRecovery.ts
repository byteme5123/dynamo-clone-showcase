import { useAuth } from '@/contexts/AuthContext';

export const useSessionRecovery = () => {
  const { user, loading } = useAuth();

  // Session recovery is now handled automatically by the unified AuthContext
  // This hook is kept for backward compatibility but no longer performs any actions
  
  return { user, loading };
};