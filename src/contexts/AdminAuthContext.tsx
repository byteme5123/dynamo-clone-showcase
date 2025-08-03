
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  first_name?: string;
  last_name?: string;
  is_active: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
      setError(null);
      
      // Use the database function to fetch admin user
      const { data, error } = await supabase
        .rpc('get_admin_user_by_id', { target_user_id: userId });

      if (error) {
        console.error('Error fetching admin user:', error);
        setError('Failed to fetch admin user data');
        return null;
      }

      // The RPC returns an array, get the first item
      const adminData = data && data.length > 0 ? data[0] : null;
      
      if (!adminData) {
        setError('User is not an admin');
        return null;
      }

      return adminData;
    } catch (error) {
      console.error('Error in fetchAdminUser:', error);
      setError('Failed to verify admin status');
      return null;
    }
  };

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (event: string, session: Session | null) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setError(null);

      if (session?.user) {
        // Fetch admin user data
        const adminData = await fetchAdminUser(session.user.id);
        
        if (isMounted) {
          setAdminUser(adminData as AdminUser);
          
          if (adminData && event === 'SIGNED_IN') {
            // Update last login in background
            updateLastLogin(session.user.id);
          }
        }
      } else {
        if (isMounted) {
          setAdminUser(null);
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        handleAuthChange('INITIAL_SESSION', session);
      }
    });

    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3000); // Reduced to 3 seconds

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign in';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setAdminUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const isAdmin = adminUser?.is_active && (adminUser?.role === 'admin' || adminUser?.role === 'super_admin');
  const isSuperAdmin = adminUser?.is_active && adminUser?.role === 'super_admin';

  return (
    <AdminAuthContext.Provider value={{
      user,
      adminUser,
      session,
      loading,
      error,
      signIn,
      signOut,
      isAdmin: !!isAdmin,
      isSuperAdmin: !!isSuperAdmin,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
