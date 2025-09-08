import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCapturePayPalOrder } from '@/hooks/usePayPal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentRecovery = () => {
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const captureOrderMutation = useCapturePayPalOrder();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const handleRecovery = async () => {
    if (!orderId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid PayPal Order ID',
        variant: 'destructive',
      });
      return;
    }

    if (!session || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to recover your payment',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('PaymentRecovery: Attempting to capture order:', orderId);
      
      const result = await captureOrderMutation.mutateAsync({ orderId: orderId.trim() });
      console.log('PaymentRecovery: Capture result:', result);
      
      if (result.success) {
        toast({
          title: 'Payment Recovered Successfully',
          description: 'Your payment has been processed and your plan activated!',
        });
        
        // Clean up any stored payment data
        sessionStorage.removeItem('payment_tracking');
        
        // Redirect to account after success
        setTimeout(() => {
          window.location.href = '/account?payment_success=true';
        }, 2000);
      } else {
        toast({
          title: 'Recovery Failed',
          description: result.error || 'Unable to recover payment. Please contact support.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('PaymentRecovery: Error:', error);
      toast({
        title: 'Recovery Error',
        description: error.message || 'Failed to recover payment. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Payment Recovery</CardTitle>
              <CardDescription className="text-center">
                If your payment got stuck during processing, you can try to recover it here using your PayPal Order ID.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use this tool only if your payment was completed on PayPal but didn't get processed in our system.
                  Check your PayPal account or email for the Order ID (starts with numbers and letters like "5BH03588XF162250B").
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderId">PayPal Order ID</Label>
                  <Input
                    id="orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., 5BH03588XF162250B"
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleRecovery}
                  disabled={isProcessing || captureOrderMutation.isPending || !orderId.trim()}
                  className="w-full"
                >
                  {isProcessing || captureOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Recovery...
                    </>
                  ) : (
                    'Recover Payment'
                  )}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p><strong>How to find your PayPal Order ID:</strong></p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Check your PayPal account transaction history</li>
                  <li>Look for confirmation emails from PayPal</li>
                  <li>The Order ID is usually a mix of numbers and letters</li>
                </ol>
              </div>

              {!user && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must be logged in to recover a payment. Please <a href="/auth" className="underline">log in</a> first.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentRecovery;