import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';
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
  const { signUp, signIn, verifyEmail, resendVerification, isAuthenticated } = useUserAuth();

  // Form state
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
    token: '',
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Handle email verification and password reset on page load
  useEffect(() => {
    const token = searchParams.get('token');
    const resetToken = searchParams.get('reset_token');
    
    if (token) {
      handleEmailVerification(token);
    } else if (resetToken) {
      handlePasswordResetToken(resetToken);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailVerification = async (token: string) => {
    try {
      setIsLoading(true);
      const { error } = await verifyEmail(token);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Email verified successfully! You can now sign in.');
        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully!',
        });
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signIn(signInData.email, signInData.password);

    if (error) {
      setError(error.message);
      if (error.message.includes('verify your email')) {
        // Show resend verification option
      }
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      });
      navigate('/account');
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (signUpData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    const { error, needsVerification } = await signUp(
      signUpData.email,
      signUpData.password,
      signUpData.firstName,
      signUpData.lastName
    );

    if (error) {
      setError(error.message);
    } else if (needsVerification) {
      setSuccess(
        'Account created successfully! Please check your email for a verification link.'
      );
      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account.',
      });
    }

    setIsLoading(false);
  };

  const handlePasswordResetToken = async (resetToken: string) => {
    setIsLoading(true);
    setError('');
    
    console.log('Processing reset token:', resetToken.substring(0, 8) + '...');
    
    try {
      // Create a simple token validation endpoint call
      const { data, error: validationError } = await supabase
        .from('users')
        .select('id, email')
        .eq('reset_token', resetToken)
        .gt('reset_token_expires', new Date().toISOString())
        .maybeSingle();

      console.log('Token validation result:', { data, validationError });

      if (validationError) {
        console.error('Token validation database error:', validationError);
        setError('Failed to validate reset token. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.log('Token not found or expired');
        setError('Invalid or expired reset link. Please request a new password reset.');
        setIsLoading(false);
        return;
      }

      console.log('Valid token found for user:', data.email);
      
      // Token is valid, show the reset form
      setResetPasswordData({ ...resetPasswordData, token: resetToken });
      setShowPasswordReset(true);
      setSuccess('Please enter your new password below.');
    } catch (error: any) {
      console.error('Token validation error:', error);
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
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
      console.log('Submitting password reset with token:', resetPasswordData.token.substring(0, 8) + '...');
      
      // Verify and use the reset token to update password
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          token: resetPasswordData.token,
          newPassword: resetPasswordData.password
        }
      });

      console.log('Password reset response:', { data, error });

      if (error) {
        console.error('Password reset API error:', error);
        // Show more specific error messages from backend
        if (error.message?.includes('Invalid or expired')) {
          setError('Your reset link has expired. Please request a new password reset.');
        } else if (error.message?.includes('8 characters')) {
          setError('Password must be at least 8 characters long.');
        } else if (error.message?.includes('Server configuration')) {
          setError('Server configuration error. Please contact support.');
        } else if (error.message?.includes('Database connection')) {
          setError('Database connection issue. Please try again in a moment.');
        } else {
          // Display backend error details if available
          const errorDetails = error.details ? ` (${error.details})` : '';
          setError(error.message || `Failed to reset password. Please try again.${errorDetails}`);
        }
        return;
      }

      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setShowPasswordReset(false);
      setResetPasswordData({ password: '', confirmPassword: '', token: '' });
      toast({
        title: 'Password Reset Success',
        description: 'Your password has been updated. Redirecting to sign in...',
      });
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('Failed to reset password. Please try again or request a new reset link.');
    }

    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!signInData.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    const { error } = await resendVerification(signInData.email);
    
    if (error) {
      setError('Failed to send verification email');
    } else {
      setSuccess('Verification email sent! Please check your inbox.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Dynamo Wireless</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
        </div>

        {/* Show verification success */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Show errors */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
            {error.includes('verify your email') && (
              <Button
                variant="link"
                size="sm"
                onClick={handleResendVerification}
                disabled={isLoading}
                className="mt-2 h-auto p-0 text-primary"
              >
                Resend verification email
              </Button>
            )}
          </Alert>
        )}

        <Card>
          {showPasswordReset ? (
            <div>
              <CardHeader>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>
                  {resetPasswordData.token ? 
                    'Enter your new password below' : 
                    'Enter your email address to receive a password reset link'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetPasswordData.token ? (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password (minimum 8 characters)"
                        value={resetPasswordData.password}
                        onChange={(e) =>
                          setResetPasswordData({ ...resetPasswordData, password: e.target.value })
                        }
                        required
                        minLength={8}
                      />
                      {resetPasswordData.password && resetPasswordData.password.length < 8 && (
                        <p className="text-sm text-destructive">Password must be at least 8 characters long</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <Input
                        id="confirm-new-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={resetPasswordData.confirmPassword}
                        onChange={(e) =>
                          setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })
                        }
                        required
                      />
                      {resetPasswordData.confirmPassword && 
                       resetPasswordData.password !== resetPasswordData.confirmPassword && (
                        <p className="text-sm text-destructive">Passwords do not match</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowPasswordReset(false);
                        setResetPasswordData({ password: '', confirmPassword: '', token: '' });
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setIsLoading(true);
                      setError('');
                      
                      const formData = new FormData(e.currentTarget);
                      const email = formData.get('reset-email') as string;
                      
                      if (!email) {
                        setError('Please enter your email address');
                        setIsLoading(false);
                        return;
                      }

                      try {
                        const { error } = await supabase.functions.invoke('send-password-reset', {
                          body: { email }
                        });

                        if (error) {
                          throw error;
                        }

                        setSuccess('If an account with that email exists, we\'ve sent a password reset link.');
                        toast({
                          title: "Reset Link Sent",
                          description: "Check your email for the password reset link.",
                        });
                      } catch (error: any) {
                        console.error('Password reset request error:', error);
                        setError('Failed to send reset email. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input
                          id="reset-email"
                          name="reset-email"
                          type="email"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Reset Link...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </form>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowPasswordReset(false);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

            <TabsContent value="signin">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData({ ...signInData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary p-0"
                      onClick={() => setShowPasswordReset(true)}
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Create a new account to get started with our services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        placeholder="First name"
                        value={signUpData.firstName}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        placeholder="Last name"
                        value={signUpData.lastName}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            </Tabs>
          )}
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;