import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';

const SessionWarning = () => {
  const { sessionWarning, timeUntilExpiry, extendSession } = useSessionMonitor();

  if (!sessionWarning || !timeUntilExpiry) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50 text-orange-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Session expires in {timeUntilExpiry} minutes</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={extendSession}
            className="ml-3"
          >
            Stay Logged In
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SessionWarning;