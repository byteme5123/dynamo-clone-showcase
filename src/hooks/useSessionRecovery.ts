import { useUserAuth } from '@/contexts/UserAuthContext';

export const useSessionRecovery = () => {
  const { user, loading } = useUserAuth();
  
  // Simple passthrough - main session recovery is handled in UserAuthContext
  return { user, loading };
};