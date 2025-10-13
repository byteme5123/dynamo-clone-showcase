import { useHomepageSettings } from '@/hooks/useHomepageSettings';

const PromoBanner = () => {
  const settings = useHomepageSettings();

  // Fallback values if settings aren't loaded yet
  const notificationText = settings?.notificationText || 'Get up to 25% off when you purchase a 3 month plan!';

  return (
    <div className="notification-bar h-10 px-4 flex items-center justify-center text-sm">
      <div className="text-white text-center">
        {notificationText}
      </div>
    </div>
  );
};

export default PromoBanner;