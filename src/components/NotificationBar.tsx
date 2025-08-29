import { Link } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageSettings';
import { useUserAuth } from '@/contexts/UserAuthContext';

const NotificationBar = () => {
  const settings = useHomepageSettings();
  const { isAuthenticated } = useUserAuth();

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