import React from 'react';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useAuth } from '@/contexts/AuthContext';

const SessionTracker: React.FC = () => {
  // Add a safety check to ensure we're within AuthProvider
  try {
    const { user } = useAuth();
    useSessionPersistence();
  } catch (error) {
    console.warn('SessionTracker: AuthProvider not available');
  }
  
  return null;
};

export default SessionTracker;