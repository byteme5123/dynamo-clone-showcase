import { useEffect } from 'react';
import { useSafeAuth } from '@/contexts/AuthContext';

export const useSessionPersistence = () => {
  const { user, session, loading } = useSafeAuth();

  useEffect(() => {
    // Simple session logging without excessive storage operations
    if (!loading) {
      const sessionStatus = session ? 'active' : 'none';
      const userStatus = user ? 'authenticated' : 'not authenticated';
      
      console.log(`Session: ${sessionStatus}, User: ${userStatus}`);
      
      // Only store essential session info, avoid conflicts with Supabase's storage
      if (user && session && session.expires_at) {
        const expiryTime = session.expires_at * 1000;
        if (expiryTime > Date.now()) {
          sessionStorage.setItem('user_session_valid', 'true');
        } else {
          sessionStorage.removeItem('user_session_valid');
        }
      } else {
        sessionStorage.removeItem('user_session_valid');
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