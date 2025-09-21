import { Link } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBar = () => {
  const settings = useHomepageSettings();
  
  // Safe auth hook usage with fallback
  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    console.warn('NotificationBar: AuthProvider not available, using fallback');
  }

  // Fallback values if settings aren't loaded yet
  const notificationText = settings?.notificationText || 'Get up to 25% off when you purchase a 3 month plan!';
  const accountLink = isAuthenticated ? '/account' : '/auth';
  const activateLink = settings?.notificationActivateLink || '/activate';
  const accountText = isAuthenticated ? 'My Account' : 'Sign In';
  const activateText = settings?.notificationActivateText || 'Activate';

  return (
    <div className="notification-bar h-10 px-4 flex items-center justify-center text-sm">
      <div className="text-white text-center">
        {notificationText}
      </div>
      <div className="hidden md:flex space-x-4 absolute right-4">
        <Link 
          to={accountLink}
          className="text-white hover:underline"
        >
          {accountText}
        </Link>
        <Link 
          to={activateLink}
          className="text-white hover:underline"
        >
          {activateText}
        </Link>
      </div>
    </div>
  );
};

export default NotificationBar;