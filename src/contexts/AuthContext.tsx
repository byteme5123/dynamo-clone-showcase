import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified: boolean;
  created_at: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  first_name?: string;
  last_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  // User Authentication
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  verifyEmail: (token: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAuthenticated: boolean;
  
  // Admin Authentication
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminSignIn: (email: string, password: string) => Promise<{ error: any }>;
  adminSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Password hashing utilities using Web Crypto API
const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 10000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `pbkdf2$10000$${saltHex}$${hashHex}`;
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    if (hash.startsWith('pbkdf2$')) {
      const parts = hash.split('$');
      if (parts.length !== 4) return false;
      
      const iterations = parseInt(parts[1]);
      const saltHex = parts[2];
      const storedHashHex = parts[3];
      
      const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      
      const computedHashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return computedHashHex === storedHashHex;
    } else {
      console.warn('Legacy bcrypt hash detected, authentication failed');
      return false;
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminUser = async (userId: string): Promise<AdminUser | null> => {
    try {
      // Use single optimized query
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

  useEffect(() => {
    // Check for existing session on mount only
    checkSession();
    
    // Set up automatic session refresh every 24 hours
    const sessionRefreshInterval = setInterval(() => {
      const sessionToken = localStorage.getItem('user_session_token');
      if (sessionToken) {
        refreshSession();
        console.log('Daily session refresh');
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return () => {
      clearInterval(sessionRefreshInterval);
    };
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const sessionToken = localStorage.getItem('user_session_token');
      
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      // Single optimized query for session with user data
      const { data: sessionData } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users (*)
        `)
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (sessionData && sessionData.users) {
        const userData = sessionData.users as User;
        setUser(userData);
        
        // Check if user is also an admin (non-blocking but wait for it)
        const adminData = await fetchAdminUser(userData.id);
        if (adminData) {
          setAdminUser(adminData);
        }
        
        console.log('User session restored:', userData.email);
      } else {
        // Clear invalid session
        localStorage.removeItem('user_session_token');
        localStorage.removeItem('session_expires_at');
        setUser(null);
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('user_session_token');
      localStorage.removeItem('session_expires_at');
      setUser(null);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const passwordHash = await hashPassword(password);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          email_verified: false,
        })
        .select()
        .single();

      if (userError) {
        if (userError.code === '23505') {
          return { error: { message: 'Email already exists' } };
        }
        return { error: userError };
      }

      // Generate verification token and send email
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: { email, firstName }
      });

      if (emailError) {
        console.error('Email send error:', emailError);
      }

      return { error: null, needsVerification: true };
    } catch (error: any) {
      return { error: { message: error.message || 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError || !userData) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Check if email is verified
      if (!userData.email_verified) {
        return { error: { message: 'Please verify your email before signing in' } };
      }

      // Check password
      const isValid = await verifyPassword(password, userData.password_hash);
      if (!isValid) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Create session with extended expiration
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

      await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      localStorage.setItem('user_session_token', sessionToken);
      localStorage.setItem('session_expires_at', expiresAt.toISOString());
      
      setUser(userData);

      // Check if user is admin (non-blocking)
      setTimeout(() => {
        fetchAdminUser(userData.id).then(setAdminUser);
      }, 0);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } };
    }
  };

  const adminSignIn = async (email: string, password: string) => {
    try {
      // Get user by email first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError || !userData) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Check if email is verified
      if (!userData.email_verified) {
        return { error: { message: 'Please verify your email before signing in' } };
      }

      // Check password
      const isValid = await verifyPassword(password, userData.password_hash);
      if (!isValid) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Check admin status FIRST
      const adminData = await fetchAdminUser(userData.id);
      if (!adminData) {
        return { error: { message: 'Access denied. Admin privileges required.' } };
      }

      // Now create session since we know user is an admin
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

      await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      localStorage.setItem('user_session_token', sessionToken);
      localStorage.setItem('session_expires_at', expiresAt.toISOString());
      
      // Set both user and admin data
      setUser(userData);
      setAdminUser(adminData);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Admin sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      const sessionToken = localStorage.getItem('user_session_token');
      if (sessionToken) {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('token', sessionToken);
      }
      
      localStorage.removeItem('user_session_token');
      localStorage.removeItem('session_expires_at');
      
      setUser(null);
      setAdminUser(null);
      
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('user_session_token');
      localStorage.removeItem('session_expires_at');
      setUser(null);
      setAdminUser(null);
      window.location.href = '/';
    }
  };

  const adminSignOut = async () => {
    await signOut();
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { email }
      });
      return { error };
    } catch (error: any) {
      return { error: { message: error.message || 'Failed to send verification email' } };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_user_email', { token });
      
      if (error || !data) {
        return { error: { message: 'Invalid or expired verification token' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Verification failed' } };
    }
  };

  const refreshSession = async () => {
    try {
      const sessionToken = localStorage.getItem('user_session_token');
      if (sessionToken) {
        const newExpiresAt = new Date();
        newExpiresAt.setTime(newExpiresAt.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        await supabase
          .from('user_sessions')
          .update({ 
            expires_at: newExpiresAt.toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('token', sessionToken);
          
        localStorage.setItem('session_expires_at', newExpiresAt.toISOString());
        
        console.log('Session refreshed, new expiry:', newExpiresAt.toISOString());
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      if (!user?.id) return;
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('User data refresh error:', error);
        return;
      }

      if (userData) {
        setUser(userData);
        console.log('User data refreshed:', userData.email);
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
      loading,
      signUp,
      signIn,
      signOut,
      resendVerification,
      verifyEmail,
      refreshSession,
      refreshUserData,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility hooks
export const useUserAuth = () => {
  const context = useAuth();
  return {
    user: context.user,
    loading: context.loading,
    signUp: context.signUp,
    signIn: context.signIn,
    signOut: context.signOut,
    resendVerification: context.resendVerification,
    verifyEmail: context.verifyEmail,
    refreshSession: context.refreshSession,
    refreshUserData: context.refreshUserData,
    isAuthenticated: context.isAuthenticated,
  };
};

export const useAdminAuth = () => {
  const context = useAuth();
  return {
    user: context.user,
    adminUser: context.adminUser,
    session: null, // Deprecated - session management is now internal
    loading: context.loading,
    signIn: context.adminSignIn,
    signOut: context.adminSignOut,
    isAdmin: context.isAdmin,
    isSuperAdmin: context.isSuperAdmin,
  };
};