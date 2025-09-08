import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AuthDebugger: React.FC<{ show?: boolean }> = ({ show = false }) => {
  const { user, session, userProfile, adminUser, loading, isAuthenticated, isAdmin } = useAuth();

  if (!show) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm bg-background/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Loading:</span>
          <Badge variant={loading ? "destructive" : "secondary"}>
            {loading ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Authenticated:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Yes" : "No"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>User ID:</span>
          <span className="truncate max-w-20" title={user?.id}>
            {user?.id ? user.id.substring(0, 8) + "..." : "None"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Session:</span>
          <Badge variant={session ? "default" : "destructive"}>
            {session ? "Active" : "None"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Profile:</span>
          <Badge variant={userProfile ? "default" : "secondary"}>
            {userProfile ? "Loaded" : "None"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Admin:</span>
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "Yes" : "No"}
          </Badge>
        </div>
        {session && (
          <div className="flex items-center justify-between">
            <span>Expires:</span>
            <span className="text-xs">
              {session.expires_at 
                ? new Date(session.expires_at * 1000).toLocaleTimeString()
                : "Unknown"
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;