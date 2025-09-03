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
    setResetPasswordData({ ...resetPasswordData, token: resetToken });
    setShowPasswordReset(true);
    setSuccess('Please enter your new password below.');
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
      // Verify and use the reset token to update password
      const { error } = await supabase.functions.invoke('reset-password', {
        body: {
          token: resetPasswordData.token,
          newPassword: resetPasswordData.password
        }
      });

      if (error) {
        throw error;
      }

      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setShowPasswordReset(false);
      setResetPasswordData({ password: '', confirmPassword: '', token: '' });
      toast({
        title: 'Password Reset',
        description: 'Your password has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. The link may be expired.');
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
                <CardTitle>Create New Password</CardTitle>
                <CardDescription>
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={resetPasswordData.password}
                      onChange={(e) =>
                        setResetPasswordData({ ...resetPasswordData, password: e.target.value })
                      }
                      required
                    />
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
                </form>
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