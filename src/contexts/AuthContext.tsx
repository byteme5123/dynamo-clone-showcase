import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

interface AuthContextType {
  // User Authentication
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ data: any; error: any } | void>;
  refreshUserData: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  isAuthenticated: boolean;
  
  // Admin Authentication
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminSignIn: (email: string, password: string) => Promise<{ error: any }>;
  adminSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Admin user fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('fetchAdminUser error:', error);
      return null;
    }
  };

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('User profile fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('fetchUserProfile error:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and admin data in parallel
          try {
            const [profileData, adminData] = await Promise.all([
              fetchUserProfile(session.user.id),
              fetchAdminUser(session.user.id)
            ]);
            
            if (mounted) {
              setUserProfile(profileData);
              setAdminUser(adminData);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (mounted) {
              setUserProfile(null);
              setAdminUser(null);
            }
          }
        } else {
          setUserProfile(null);
          setAdminUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session immediately
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // If we have a session, the onAuthStateChange will handle the rest
        // If no session, set loading to false immediately
        if (!session && mounted) {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setAdminUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      return { error, needsVerification: !error };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign up failed' } };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: 'email' });
      return { error };
    } catch (error: any) {
      return { error: { message: error.message || 'Verification failed' } };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      return { error };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to resend verification' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } };
    }
  };

  const adminSignIn = async (email: string, password: string) => {
    try {
      // First sign in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return { error: authError || { message: 'Authentication failed' } };
      }

      // Check if user has admin privileges
      const adminData = await fetchAdminUser(authData.user.id);
      if (!adminData) {
        // Sign out immediately if not an admin
        await supabase.auth.signOut();
        return { error: { message: 'Access denied. Admin privileges required.' } };
      }

      // Update last login time
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Admin sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      // Clear all local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setAdminUser(null);
      
      // Clear any session storage
      sessionStorage.clear();
      
      // Sign out from Supabase (this will also trigger onAuthStateChange)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Successfully signed out');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const adminSignOut = async () => {
    await signOut();
  };

  const refreshSession = async () => {
    try {
      console.log('AuthContext: Refreshing session...');
      
      // First try to get the current session
      const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('AuthContext: Error getting current session:', sessionError);
        
        // Try to recover from stored session backup
        const sessionBackup = sessionStorage.getItem('session_backup');
        if (sessionBackup) {
          try {
            const backup = JSON.parse(sessionBackup);
            console.log('Attempting session recovery for user:', backup.user_id);
            
            // Check if backup is not expired
            if (backup.expires_at && backup.expires_at > Date.now() / 1000) {
              console.log('Session backup is still valid, attempting recovery...');
              // Force a new session check
              await supabase.auth.getSession();
            } else {
              console.log('Session backup has expired');
              sessionStorage.removeItem('session_backup');
            }
          } catch (parseError) {
            console.error('Session backup parse error:', parseError);
          }
        }
        return { data: null, error: sessionError };
      }
      
      if (currentSession?.session) {
        console.log('AuthContext: Current session found, updating state');
        setSession(currentSession.session);
        setUser(currentSession.session.user);
        
        // Fetch updated user profile
        if (currentSession.session.user) {
          await fetchUserProfile(currentSession.session.user.id);
        }
        
        return { data: currentSession, error: null };
      } else {
        // Try to refresh the session
        console.log('AuthContext: No current session, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('AuthContext: Error refreshing session:', refreshError);
          return { data: null, error: refreshError };
        }
        
        if (refreshData?.session) {
          console.log('AuthContext: Session refreshed successfully');
          setSession(refreshData.session);
          setUser(refreshData.session.user);
          
          // Fetch updated user profile
          if (refreshData.session.user) {
            await fetchUserProfile(refreshData.session.user.id);
          }
        }
        
        return { data: refreshData, error: refreshError };
      }
    } catch (error) {
      console.error('AuthContext: Session refresh error:', error);
      return { data: null, error };
    }
  };

  const refreshUserData = async () => {
    try {
      if (!user?.id) return;
      
      const profileData = await fetchUserProfile(user.id);
      if (profileData) {
        setUserProfile(profileData);
        console.log('User profile refreshed');
      }
    } catch (error) {
      console.error('User data refresh error:', error);
    }
  };

  const isAdmin = adminUser?.is_active && (adminUser?.role === 'admin' || adminUser?.role === 'super_admin');
  const isSuperAdmin = adminUser?.is_active && adminUser?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      // User auth
      user,
      session,
      userProfile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshSession,
      refreshUserData,
      verifyEmail,
      resendVerification,
      isAuthenticated: !!user,
      
      // Admin auth
      adminUser,
      isAdmin: !!isAdmin,
      isSuperAdmin: !!isSuperAdmin,
      adminSignIn,
      adminSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility hooks
export const useUserAuth = () => {
  const { user, loading, signUp, signIn, signOut, isAuthenticated, refreshUserData } = useAuth();
  return { user, loading, signUp, signIn, signOut, isAuthenticated, refreshUserData };
};

export const useAdminAuth = () => {
  const { adminUser, isAdmin, isSuperAdmin, adminSignIn, adminSignOut, loading } = useAuth();
  return { adminUser, isAdmin, isSuperAdmin, adminSignIn, adminSignOut, loading };
};