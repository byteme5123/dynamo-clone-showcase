import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SessionManager = () => {
  useEffect(() => {
    // Clear any conflicting session data on app start
    const clearStaleData = () => {
      // Remove old session backups that might conflict
      const sessionBackup = sessionStorage.getItem('session_backup');
      if (sessionBackup) {
        try {
          const backup = JSON.parse(sessionBackup);
          const isExpired = backup.expires_at && backup.expires_at < Date.now() / 1000;
          if (isExpired) {
            sessionStorage.removeItem('session_backup');
          }
        } catch {
          sessionStorage.removeItem('session_backup');
        }
      }
    };

    clearStaleData();

    // Handle browser storage events to sync sessions across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('supabase.auth.token')) {
        // Refresh the current session when storage changes
        supabase.auth.getSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null;
};

export default SessionManager;