import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Download, User, Loader2 } from 'lucide-react';
import { useCapturePayPalOrder } from '@/hooks/usePayPal';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const captureOrderMutation = useCapturePayPalOrder();
  const { user, isAuthenticated, checkSession } = useUserAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const token = searchParams.get('token'); // PayPal order ID
  const payerID = searchParams.get('PayerID');
  const sessionToken = searchParams.get('sessionToken');

  // Process payment immediately - handle session recovery within the capture
  useEffect(() => {
    let isCancelled = false;
    
    const processPayment = async () => {
      // Validate required parameters
      if (!token) {
        toast({
          title: 'Payment Error',
          description: 'No payment token found',
          variant: 'destructive'
        });
        navigate('/plans');
        return;
      }

      // Prevent multiple concurrent capture attempts
      if (captureOrderMutation.isPending) {
        return;
      }

      try {
        console.log('Processing payment for token:', token);
        
        // Recover session if we have a session token
        if (sessionToken && !isAuthenticated) {
          console.log('Recovering session from PayPal redirect');
          localStorage.setItem('user_session_token', sessionToken);
          try {
            await checkSession();
          } catch (sessionError) {
            console.warn('Session recovery failed:', sessionError);
          }
        }
        
        // Get session token for capture
        const finalSessionToken = sessionToken || localStorage.getItem('user_session_token');
        console.log('Capturing payment with session token:', finalSessionToken ? 'present' : 'missing');
        
        const result = await captureOrderMutation.mutateAsync({ 
          orderId: token,
          sessionToken: finalSessionToken
        });
        
        if (isCancelled) return;
        
        setPaymentDetails(result);
        
        if (result.success) {
          // Invalidate all related queries to refresh data
          await queryClient.invalidateQueries({ queryKey: ['user-orders'] });
          await queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
          await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
          
          toast({
            title: 'Payment Successful!',
            description: 'Your payment has been processed and your plan is now active.',
          });

          // Redirect to account immediately
          navigate('/account?payment_success=true');
        } else {
          toast({
            title: 'Payment Processing Issue',
            description: 'Payment was processed but there may be a delay in activation.',
            variant: 'destructive'
          });
          navigate('/account');
        }
      } catch (error: any) {
        if (isCancelled) return;
        
        console.error('Error processing payment:', error);
        
        // Handle specific PayPal errors
        if (error.message?.includes('already captured') || error.message?.includes('Order already processed')) {
          toast({
            title: 'Payment Already Processed',
            description: 'This payment has already been completed.',
          });
          navigate('/account');
          return;
        }
        
        toast({
          title: 'Payment Error',
          description: error.message || 'Failed to process payment',
          variant: 'destructive'
        });
        
        // If authentication fails, redirect to login with payment info
        if (error.message?.includes('authentication') || error.message?.includes('login')) {
          navigate(`/auth?returnUrl=/payment-success?token=${token}&PayerID=${payerID}`);
        } else {
          // For other errors, try to redirect to account anyway
          setTimeout(() => navigate('/account'), 2000);
        }
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    };

    processPayment();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [token, payerID, sessionToken]); // Remove complex dependencies that cause infinite loops

  // Don't show login prompt - let payment processing handle everything

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
              </div>
              <CardTitle className="text-2xl text-foreground">
                {isProcessing ? 'Processing Payment...' : 'Payment Successful!'}
              </CardTitle>
              <CardDescription>
                {isProcessing 
                  ? 'Please wait while we process your payment...'
                  : 'Thank you for your purchase. Your payment has been processed successfully.'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {paymentDetails && (
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-mono">{paymentDetails.paymentId?.slice(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default">{paymentDetails.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono">{token?.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!isProcessing && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>You will receive a confirmation email shortly with your order details and activation instructions.</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                    <p className="font-medium">Redirecting to your account...</p>
                    <p className="text-sm">You will be redirected to view your purchase shortly.</p>
                  </div>
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