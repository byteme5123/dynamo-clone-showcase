import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useSessionPersistence = () => {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    // Log session persistence status for debugging
    if (!loading) {
      const sessionStatus = session ? 'active' : 'none';
      const userStatus = user ? 'authenticated' : 'not authenticated';
      
      console.log(`Session persistence check - Session: ${sessionStatus}, User: ${userStatus}`);
      console.log(`Session details:`, session ? {
        user_id: session.user?.id,
        expires_at: session.expires_at,
        access_token: session.access_token ? 'present' : 'missing'
      } : 'no session');
      
      // Store session backup in sessionStorage for recovery scenarios
      if (user && session) {
        sessionStorage.setItem('session_backup', JSON.stringify({
          user_id: user.id,
          email: user.email,
          timestamp: Date.now(),
          expires_at: session.expires_at
        }));
      } else {
        sessionStorage.removeItem('session_backup');
      }
    }
  }, [user, session, loading]);

  // Return session persistence info
  return {
    hasSession: !!session,
    hasUser: !!user,
    isLoading: loading,
    sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000) : null
  };
};