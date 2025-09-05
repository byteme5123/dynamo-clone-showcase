import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useSessionMonitor = () => {
  const { session, refreshSession, signOut } = useAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;

    const checkSessionExpiry = () => {
      if (!session.expires_at) return;

      const expiryDate = new Date(session.expires_at * 1000); // Convert Unix timestamp to milliseconds
      const now = new Date();
      const timeLeft = expiryDate.getTime() - now.getTime();

      // Convert to minutes
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));
      setTimeUntilExpiry(minutesLeft);

      // Show warning 15 minutes before expiry
      if (minutesLeft <= 15 && minutesLeft > 0) {
        setSessionWarning(true);
      } else if (minutesLeft <= 0) {
        // Session expired - sign out
        console.log('Session expired - signing out');
        signOut();
      } else {
        setSessionWarning(false);
      }
    };

    // Check session status every minute
    const interval = setInterval(checkSessionExpiry, 60 * 1000);
    
    // Check immediately
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [session, signOut]);

  const extendSession = async () => {
    await refreshSession();
    setSessionWarning(false);
    console.log('Session extended by user');
  };

  return {
    sessionWarning,
    timeUntilExpiry,
    extendSession,
  };
};