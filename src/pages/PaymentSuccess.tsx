import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Download, User, Loader2 } from 'lucide-react';
import { useCapturePayPalOrder } from '@/hooks/usePayPal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const captureOrderMutation = useCapturePayPalOrder();
  const { user, session, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = searchParams.get('token'); // PayPal order ID
  const payerID = searchParams.get('PayerID');
  const sessionToken = searchParams.get('session_token');

  // Debug logging for URL parameters
  useEffect(() => {
    console.log('PaymentSuccess: URL parameters:', {
      token,
      payerID,
      sessionToken,
      fullURL: window.location.href,
      searchString: window.location.search
    });
  }, [token, payerID, sessionToken]);

  // Handle session restoration after PayPal redirect
  useEffect(() => {
    const restoreSession = async () => {
      if (loading) return; // Wait for initial auth check

      try {
        // If we have a session token from PayPal redirect, try to restore session
        if (sessionToken && !session) {
          console.log('Attempting session restoration after PayPal redirect');
          
          // Force session refresh to restore authentication
          await refreshSession();
          
          // Wait a bit for session to be restored
          setTimeout(() => {
            setAuthChecking(false);
          }, 2000);
        } else if (!sessionToken && !session && !loading) {
          // No session token and no session - user needs to log in
          setAuthError('Authentication required. Please log in to view your payment.');
          setAuthChecking(false);
        } else {
          // Either we have a session or we're still loading
          setAuthChecking(false);
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        setAuthError('Failed to restore session. Please log in again.');
        setAuthChecking(false);
      }
    };

    restoreSession();
  }, [loading, session, sessionToken, refreshSession]);

  useEffect(() => {
    const capturePayment = async () => {
      console.log('PaymentSuccess: capturePayment called', {
        authChecking,
        loading,
        authError,
        token,
        payerID,
        hasSession: !!session,
        hasUser: !!user
      });

      // Wait for auth check to complete
      if (authChecking || loading) {
        console.log('PaymentSuccess: Waiting for auth check...', { authChecking, loading });
        return;
      }
      
      // If there's an auth error, don't attempt payment capture
      if (authError) {
        console.log('PaymentSuccess: Auth error present, skipping capture:', authError);
        return;
      }
      
      if (token && payerID) {
        console.log('PaymentSuccess: Starting payment capture process...', { token, payerID });
        
        try {
          console.log('PaymentSuccess: Calling capture mutation for token:', token);
          
          const result = await captureOrderMutation.mutateAsync({ orderId: token });
          console.log('PaymentSuccess: Capture result received:', result);
          setPaymentDetails(result);
          
          if (result.success) {
            setShowRedirectMessage(true);
            console.log('PaymentSuccess: Payment captured successfully');
            
            toast({
              title: 'Payment Successful',
              description: 'Your plan has been activated successfully!',
            });
            
            // Clean up payment tracking data
            sessionStorage.removeItem('payment_tracking');
            
            // Redirect to account page
            setTimeout(() => {
              navigate('/account?payment_success=true');
            }, 3000);
          } else {
            console.error('PaymentSuccess: Capture failed, result:', result);
            toast({
              title: 'Payment Processing Error',
              description: 'Payment capture failed. Please contact support.',
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          console.error('PaymentSuccess: Error capturing payment:', error);
          
          toast({
            title: 'Payment Processing Error',
            description: 'There was an issue processing your payment. Please contact support.',
            variant: 'destructive',
          });
          
          setTimeout(() => {
            navigate('/account');
          }, 3000);
        }
      } else {
        console.log('PaymentSuccess: Missing required parameters', { token, payerID });
        if (!token) console.log('PaymentSuccess: Missing token parameter');
        if (!payerID) console.log('PaymentSuccess: Missing PayerID parameter');
        
        toast({
          title: 'Payment Error',
          description: 'Missing payment information. Please contact support with your transaction details.',
          variant: 'destructive',
        });
        
        setTimeout(() => {
          navigate('/plans');
        }, 5000);
      }
    };

    // Add a small delay to ensure all state is initialized
    const timer = setTimeout(capturePayment, 100);
    return () => clearTimeout(timer);
  }, [token, payerID, session, user, authChecking, authError, loading, navigate, toast, captureOrderMutation]);

  // Show loading state while checking authentication
  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth error state
  if (authError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-foreground">Authentication Required</CardTitle>
                <CardDescription>{authError}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  <p>Your session may have expired during the PayPal redirect. Please log in again to view your payment status.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/auth">
                      <User className="w-4 h-4 mr-2" />
                      Log In
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/plans">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Plans
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-foreground">Payment Successful!</CardTitle>
              <CardDescription>
                Thank you for your purchase. Your payment has been processed successfully.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {captureOrderMutation.isPending && (
                <div className="text-muted-foreground">
                  Processing your payment...
                </div>
              )}
              
              {paymentDetails && (
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Payment ID: {paymentDetails.paymentId}</div>
                    <div>Status: {paymentDetails.status}</div>
                    <div>Order ID: {token}</div>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p>You will receive a confirmation email shortly with your order details and activation instructions.</p>
              </div>
              
              {showRedirectMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <p className="font-medium">Redirecting to your account...</p>
                  <p className="text-sm">You will be automatically redirected to view your purchase in 3 seconds.</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/plans">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Plans
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/account">
                    <User className="w-4 h-4 mr-2" />
                    View My Account
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/activate-sim">
                    <Download className="w-4 h-4 mr-2" />
                    Activate SIM
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;