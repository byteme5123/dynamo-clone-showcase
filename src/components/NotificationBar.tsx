import { Link, useNavigate } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { useSafeAuth } from '@/contexts/AuthContext';
import { LogOut, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NotificationBar = () => {
  const settings = useHomepageSettings();
  const { isAuthenticated } = useSafeAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fallback values if settings aren't loaded yet
  const notificationText = settings?.notificationText || 'Get up to 25% off when you purchase a 3 month plan!';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logged out successfully',
        description: 'You have been signed out of your account.',
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="notification-bar h-10 px-4 flex items-center justify-center text-sm">
      <div className="text-white text-center">
        {notificationText}
      </div>
      <div className="hidden md:flex items-center space-x-4 absolute right-4">
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="text-white hover:underline flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="text-white hover:underline flex items-center gap-1"
          >
            <LogIn className="w-3 h-3" />
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;