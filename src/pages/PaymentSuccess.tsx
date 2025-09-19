import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Download, User, Loader2, AlertCircle } from 'lucide-react';
import { useCapturePayPalOrder } from '@/hooks/usePayPal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const captureOrderMutation = useCapturePayPalOrder();
  const { user, session, loading, refreshSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = searchParams.get('token'); // PayPal order ID
  const payerID = searchParams.get('PayerID');
  const sessionToken = searchParams.get('session_token');

  // Simplified payment capture with better error handling
  useEffect(() => {
    const capturePayment = async () => {
      console.log('PaymentSuccess: Starting capture process', { token, payerID, sessionToken });
      
      // Check if we have the required PayPal parameters
      if (!token || !payerID) {
        console.error('PaymentSuccess: Missing required PayPal parameters', { token, payerID });
        setError('Invalid payment information. Please contact support.');
        setProcessing(false);
        return;
      }

      try {
        // If we have a session token but no current session, try to restore it
        if (sessionToken && !session && !loading) {
          console.log('PaymentSuccess: Attempting session restoration');
          await refreshSession();
          // Give some time for session to be restored
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('PaymentSuccess: Capturing PayPal order', token);
        
        // Capture the payment
        const result = await captureOrderMutation.mutateAsync({ orderId: token });
        console.log('PaymentSuccess: Capture result', result);
        
        setPaymentDetails(result);
        
        if (result.success) {
          console.log('PaymentSuccess: Payment captured successfully');
          
          toast({
            title: 'Payment Successful!',
            description: 'Your plan has been activated and a confirmation email has been sent.',
          });
          
          // Clean up payment tracking data
          sessionStorage.removeItem('payment_tracking');
          
          // Redirect to account page after a short delay
          setTimeout(() => {
            navigate('/account?payment_success=true', { replace: true });
          }, 2000);
          
        } else {
          console.error('PaymentSuccess: Payment capture failed', result);
          setError('Payment verification failed. Please contact support with your order details.');
          
          toast({
            title: 'Payment Processing Issue',
            description: 'Your payment may have been processed, but verification failed. Please check your account or contact support.',
            variant: 'destructive',
          });
        }
        
      } catch (error: any) {
        console.error('PaymentSuccess: Error during capture', error);
        setError('An error occurred while processing your payment. Please contact support.');
        
        toast({
          title: 'Payment Processing Error',
          description: 'There was an issue verifying your payment. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setProcessing(false);
      }
    };

    // Start capture process immediately
    capturePayment();
  }, [token, payerID, sessionToken, session, loading, refreshSession, captureOrderMutation, navigate, toast]);

  // Show processing state
  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground mb-2">Processing your payment...</p>
            <p className="text-sm text-muted-foreground">Please don't close this window</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-foreground">Payment Processing Issue</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  <p>If you were charged, please contact support with the following information:</p>
                  <div className="mt-2 p-3 bg-muted rounded-lg text-left">
                    <p><strong>Order ID:</strong> {token}</p>
                    <p><strong>PayPal Payer ID:</strong> {payerID}</p>
                    <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/account">
                      <User className="w-4 h-4 mr-2" />
                      Check My Account
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

  // Show success state
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
                Your payment has been processed and your plan is now active.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {paymentDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2 text-green-800">Payment Confirmation</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    {paymentDetails.paymentId && <div>Payment ID: {paymentDetails.paymentId}</div>}
                    <div>Order ID: {token}</div>
                    <div>Status: Completed</div>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p>✅ A confirmation email has been sent to your registered email address</p>
                <p>✅ Your plan is now active and ready to use</p>
                <p>✅ You can view your purchase details in your account</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                <p className="font-medium">Redirecting to your dashboard...</p>
                <p className="text-sm">You will be automatically redirected in a moment.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/account">
                    <User className="w-4 h-4 mr-2" />
                    View My Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/activate-sim">
                    <Download className="w-4 h-4 mr-2" />
                    Activate SIM
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/plans">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse More Plans
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