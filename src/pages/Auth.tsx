import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn, isAuthenticated } = useAuth();

  // Form state
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [resetEmail, setResetEmail] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Handle Supabase auth callbacks on page load
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if this is a password reset callback
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (accessToken && refreshToken && type === 'recovery') {
        console.log('Password recovery callback detected');
        setShowPasswordReset(true);
        setSuccess('Please enter your new password below.');
        
        // Set the session with the tokens from URL
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Session error:', error);
          setError('Failed to verify reset link. Please try again.');
        }
      } else if (type === 'signup') {
        // Handle email confirmation
        const { error } = await supabase.auth.getSession();
        if (!error) {
          setSuccess('Email confirmed successfully! You can now sign in.');
          toast({
            title: 'Email Confirmed',
            description: 'Your email has been verified. You can now sign in.',
          });
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, toast]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(signInData.email, signInData.password);

    if (error) {
      if (error.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(error.message || 'Sign in failed. Please try again.');
      }
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      signUpData.email,
      signUpData.password,
      signUpData.firstName,
      signUpData.lastName
    );

    if (error) {
      if (error.message?.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(error.message || 'Sign up failed. Please try again.');
      }
    } else {
      setSuccess('Account created! Please check your email for a confirmation link.');
      toast({
        title: 'Account Created',
        description: 'Please check your email for a confirmation link.',
      });
    }

    setIsLoading(false);
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!resetEmail) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        setError(error.message || 'Failed to send reset email');
      } else {
        setSuccess('Password reset email sent! Please check your inbox.');
        toast({
          title: 'Reset Email Sent',
          description: 'Please check your email for password reset instructions.',
        });
      }
    } catch (error: any) {
      setError('Failed to send password reset email. Please try again.');
    }

    setIsLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (resetPasswordData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: resetPasswordData.password
      });

      if (error) {
        setError(error.message || 'Failed to update password');
      } else {
        setSuccess('Password updated successfully! You can now sign in.');
        setShowPasswordReset(false);
        setResetPasswordData({ password: '', confirmPassword: '' });
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully updated.',
        });
        
        // Clear URL parameters and redirect to sign in
        window.history.replaceState({}, document.title, '/auth');
      }
    } catch (error: any) {
      setError('Failed to update password. Please try again.');
    }

    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!signInData.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signInData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        setError(error.message || 'Failed to send confirmation email');
      } else {
        setSuccess('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      setError('Failed to send confirmation email. Please try again.');
    }

    setIsLoading(false);
  };

  // Show password reset form if we're in recovery mode
  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Update Password</CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={resetPasswordData.password}
                    onChange={(e) => setResetPasswordData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Dynamo Wireless</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="link"
                      onClick={async () => {
                        if (!signInData.email) {
                          setError('Please enter your email address first');
                          return;
                        }
                        setIsLoading(true);
                        setError('');
                        try {
                          const { error } = await supabase.functions.invoke('send-password-reset', {
                            body: { email: signInData.email }
                          });
                          if (error) {
                            setError(error.message || 'Failed to send reset email');
                          } else {
                            setSuccess('Password reset link sent! Please check your email.');
                            toast({
                              title: 'Reset Email Sent',
                              description: 'Please check your email for password reset instructions.',
                            });
                          }
                        } catch (error: any) {
                          setError('Failed to send password reset email. Please try again.');
                        }
                        setIsLoading(false);
                      }}
                      disabled={isLoading}
                      className="text-sm p-0 h-auto"
                    >
                      Forgot Password?
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendConfirmation}
                      disabled={isLoading}
                      className="text-sm"
                    >
                      Resend confirmation email
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create password (8+ characters)"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>

            </Tabs>

            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;