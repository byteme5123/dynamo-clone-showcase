import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { useCapturePayPalOrder } from '@/hooks/usePayPal';
import { useUserAuth } from '@/contexts/UserAuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const captureOrderMutation = useCapturePayPalOrder();
  const { refreshSession } = useUserAuth();

  const token = searchParams.get('token'); // PayPal order ID
  const payerID = searchParams.get('PayerID');

  useEffect(() => {
    const capturePayment = async () => {
      if (token && payerID) {
        try {
          // Refresh session to ensure user stays logged in
          await refreshSession();
          
          const result = await captureOrderMutation.mutateAsync({ orderId: token });
          setPaymentDetails(result);
        } catch (error) {
          console.error('Error capturing payment:', error);
        }
      }
    };

    capturePayment();
  }, [token, payerID, refreshSession]);

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
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/plans">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Plans
                  </Link>
                </Button>
                <Button asChild>
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