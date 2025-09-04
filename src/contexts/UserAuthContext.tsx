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

interface UserAuthContextType {
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
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

// Password hashing utilities using Web Crypto API
const hashPassword = async (password: string): Promise<string> => {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Hash password with PBKDF2
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
  
  // Format: algorithm$iterations$salt$hash
  return `pbkdf2$10000$${saltHex}$${hashHex}`;
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    // Handle both old bcrypt hashes and new pbkdf2 hashes
    if (hash.startsWith('pbkdf2$')) {
      const parts = hash.split('$');
      if (parts.length !== 4) return false;
      
      const iterations = parseInt(parts[1]);
      const saltHex = parts[2];
      const storedHashHex = parts[3];
      
      // Convert salt from hex
      const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Hash the input password with the same salt and iterations
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
      // Handle legacy bcrypt hashes - for now just fail
      // TODO: In production, you might want to keep bcrypt for backward compatibility
      console.warn('Legacy bcrypt hash detected, authentication failed');
      return false;
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount only
    checkSession();
    
    // Set up automatic session refresh every 24 hours only
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
  }, []); // Remove user dependency to stop infinite loop

  const checkSession = async () => {
    try {
      const sessionToken = localStorage.getItem('user_session_token');
      
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      // Verify session is still valid with user data in single query
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
        setUser(sessionData.users as User);
        console.log('User session restored:', sessionData.users.email);
      } else {
        // Clear invalid session
        localStorage.removeItem('user_session_token');
        localStorage.removeItem('session_expires_at');
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('user_session_token');
      localStorage.removeItem('session_expires_at');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // Hash password using Web Crypto API (PBKDF2)
      const passwordHash = await hashPassword(password);

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
      const isValid = await verifyPassword(password, userData.password_hash);
      if (!isValid) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Create session with extended expiration
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days for payment flows

      await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      // Store session in localStorage only
      localStorage.setItem('user_session_token', sessionToken);
      localStorage.setItem('session_expires_at', expiresAt.toISOString());
      
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
      
      // Clear session data
      localStorage.removeItem('session_expires_at');
      
      setUser(null);
      
      // Redirect to homepage after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Always clear local state even if database update fails
      localStorage.removeItem('user_session_token');
      localStorage.removeItem('session_expires_at');
      setUser(null);
      // Redirect even on error
      window.location.href = '/';
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
        // Extend session expiration by 30 days
        const newExpiresAt = new Date();
        newExpiresAt.setTime(newExpiresAt.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        await supabase
          .from('user_sessions')
          .update({ 
            expires_at: newExpiresAt.toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('token', sessionToken);
          
        // Update local storage
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
      
      // Fetch latest user data
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
      refreshUserData,
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