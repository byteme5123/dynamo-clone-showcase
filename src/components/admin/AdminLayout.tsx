import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  const { isAdmin, loading } = useAdminAuth();

  // Add timeout fallback for loading state
  const [forceLoad, setForceLoad] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setForceLoad(true);
      }
    }, 2000); // Force load after 2 seconds to prevent stuck states
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !forceLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;