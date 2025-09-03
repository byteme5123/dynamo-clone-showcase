import { useEffect, useState } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';

export const useSessionMonitor = () => {
  const { user, refreshSession, signOut } = useUserAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkSessionExpiry = () => {
      const expiryTime = localStorage.getItem('session_expires_at');
      if (!expiryTime) return;

      const expiryDate = new Date(expiryTime);
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
  }, [user, signOut]);

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