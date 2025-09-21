import React from 'react';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useSafeAuth } from '@/contexts/AuthContext';

const SessionTracker: React.FC = () => {
  const { user } = useSafeAuth();
  useSessionPersistence();
  
  return null;
};

export default SessionTracker;