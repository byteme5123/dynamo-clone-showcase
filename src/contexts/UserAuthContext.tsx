import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified: boolean;
  created_at: string;
}

interface UserAuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  verifyEmail: (token: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      let sessionToken = localStorage.getItem('user_session_token');
      
      // Fallback to sessionStorage if localStorage is empty
      if (!sessionToken) {
        sessionToken = sessionStorage.getItem('user_session_backup');
        if (sessionToken) {
          localStorage.setItem('user_session_token', sessionToken);
        }
      }
      
      if (!sessionToken) {
        // Try to restore from backup user data
        const backupData = sessionStorage.getItem('user_data_backup');
        if (backupData) {
          try {
            const userData = JSON.parse(backupData);
            setUser(userData);
            sessionStorage.removeItem('user_data_backup');
          } catch {
            // Ignore parse errors
          }
        }
        setLoading(false);
        return;
      }

      // Verify session is still valid
      const { data: session } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (session) {
        // Get user data
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user_id)
          .single();

        if (userData) {
          setUser(userData);
          // Update backup
          sessionStorage.setItem('user_data_backup', JSON.stringify(userData));
        }
      } else {
        // Clear invalid session
        localStorage.removeItem('user_session_token');
        sessionStorage.removeItem('user_session_backup');
        sessionStorage.removeItem('user_data_backup');
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('user_session_token');
      sessionStorage.removeItem('user_session_backup');
      sessionStorage.removeItem('user_data_backup');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
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
        // Don't fail signup if email fails
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
      const isValid = await bcrypt.compare(password, userData.password_hash);
      if (!isValid) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Create session with extended expiration
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 days for payment flows

      await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      // Store session with backup mechanisms
      localStorage.setItem('user_session_token', sessionToken);
      sessionStorage.setItem('user_session_backup', sessionToken);
      sessionStorage.setItem('user_data_backup', JSON.stringify(userData));
      setUser(userData);

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      const sessionToken = localStorage.getItem('user_session_token');
      if (sessionToken) {
        // Delete session from database
        await supabase
          .from('user_sessions')
          .delete()
          .eq('token', sessionToken);

        // Clear local storage
        localStorage.removeItem('user_session_token');
      }
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Always clear local state even if database update fails
      localStorage.removeItem('user_session_token');
      setUser(null);
    }
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
        // Extend session expiration
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 60);
        
        await supabase
          .from('user_sessions')
          .update({ expires_at: newExpiresAt.toISOString() })
          .eq('token', sessionToken);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      resendVerification,
      verifyEmail,
      refreshSession,
      isAuthenticated: !!user,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};