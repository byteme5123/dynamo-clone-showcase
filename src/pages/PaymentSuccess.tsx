import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Download, User } from 'lucide-react';
import { useCapturePayPalOrder } from '@/hooks/usePayPal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const captureOrderMutation = useCapturePayPalOrder();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = searchParams.get('token'); // PayPal order ID
  const payerID = searchParams.get('PayerID');

  useEffect(() => {
    const capturePayment = async () => {
      if (token && payerID) {
        try {
          console.log('Capturing payment for token:', token);
          
          // Verify user is still authenticated
          if (!session || !user) {
            toast({
              title: 'Authentication Error',
              description: 'Please log in again to complete your payment',
              variant: 'destructive',
            });
            navigate('/auth');
            return;
          }
          
          const result = await captureOrderMutation.mutateAsync({ orderId: token });
          setPaymentDetails(result);
          
          if (result.success) {
            setShowRedirectMessage(true);
            console.log('Payment captured successfully');
            
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
          }
        } catch (error: any) {
          console.error('Error capturing payment:', error);
          
          toast({
            title: 'Payment Processing Error',
            description: 'There was an issue processing your payment. Please contact support.',
            variant: 'destructive',
          });
          
          setTimeout(() => {
            navigate('/account');
          }, 3000);
        }
      }
    };

    capturePayment();
  }, [token, payerID, session, user, navigate, toast]);

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
};

export default PaymentSuccess;