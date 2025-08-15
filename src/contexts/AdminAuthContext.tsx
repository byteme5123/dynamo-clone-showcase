
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

  const fetchAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
      // Use the database function to fetch admin user
      const { data, error } = await supabase
        .rpc('get_admin_user_by_id', { target_user_id: userId });

      if (error) {
        console.error('RPC error, trying direct query:', error);
        
        // Single fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (fallbackError) {
          console.error('Direct query failed:', fallbackError);
          return null;
        }

        return fallbackData;
      }

      // The RPC returns an array, so we need to get the first item
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('fetchAdminUser error:', error);
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
    let loadingTimeout: NodeJS.Timeout;

    const handleAuthChange = (event: string, session: Session | null) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {        
        // Fetch admin user data and update state
        fetchAdminUser(session.user.id).then(adminData => {
          if (isMounted) {
            setAdminUser(adminData as AdminUser);
            setLoading(false);
            
            if (adminData && event === 'SIGNED_IN') {
              // Update last login in background without blocking
              setTimeout(() => updateLastLogin(session.user.id), 0);
            }
          }
        }).catch(() => {
          if (isMounted) {
            setAdminUser(null);
            setLoading(false);
          }
        });
      } else {
        if (isMounted) {
          setAdminUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session only once
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        handleAuthChange('INITIAL_SESSION', session);
      }
    }).catch(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    // Shorter timeout to prevent stuck states
    loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3000); // Reduced to 3 seconds

    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []); // Remove loading dependency

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = adminUser?.is_active && (adminUser?.role === 'admin' || adminUser?.role === 'super_admin');
  const isSuperAdmin = adminUser?.is_active && adminUser?.role === 'super_admin';

  return (
    <AdminAuthContext.Provider value={{
      user,
      adminUser,
      session,
      loading,
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
