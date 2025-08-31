import { useEffect } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';

export const useSessionRecovery = () => {
  const { user, loading } = useUserAuth();

  useEffect(() => {
    // Check for session recovery after external redirect
    const handleSessionRecovery = async () => {
      if (!loading && !user) {
        // Check for backup session data
        const backupToken = sessionStorage.getItem('user_session_backup');
        const backupData = sessionStorage.getItem('user_data_backup');
        
        if (backupToken && backupData) {
          try {
            // Restore session token to localStorage
            localStorage.setItem('user_session_token', backupToken);
            
            // Trigger session check
            window.location.reload();
          } catch (error) {
            console.error('Session recovery error:', error);
            // Clean up on error
            sessionStorage.removeItem('user_session_backup');
            sessionStorage.removeItem('user_data_backup');
          }
        }
      }
    };

    // Run recovery check after component mount
    const timer = setTimeout(handleSessionRecovery, 1000);
    return () => clearTimeout(timer);
  }, [loading, user]);

  return { user, loading };
};