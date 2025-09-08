import React from 'react';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

const SessionTracker: React.FC = () => {
  useSessionPersistence(); // This will handle session persistence tracking
  return null; // This component doesn't render anything
};

export default SessionTracker;