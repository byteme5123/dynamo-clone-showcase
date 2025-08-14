import { Link } from 'react-router-dom';

const NotificationBar = () => {
  return (
    <div className="notification-bar h-10 px-4 flex items-center justify-between text-sm">
      <div className="text-white">
        Get up to 25% off when you purchase a 3 month plan!
      </div>
      <div className="hidden md:flex space-x-4">
        <Link 
          to="/account" 
          className="text-white hover:underline"
        >
          My Account
        </Link>
        <Link 
          to="/activate" 
          className="text-white hover:underline"
        >
          Activate
        </Link>
      </div>
    </div>
  );
};

export default NotificationBar;