import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCreatePayPalOrder } from '@/hooks/usePayPal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  planId: string;
  amount: number;
  planName: string;
  className?: string;
}

const PayPalButton = ({ planId, amount, planName, className }: PayPalButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrderMutation = useCreatePayPalOrder();
  const { session, user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Starting PayPal payment flow for plan:', planId);
      
      // Check if user is authenticated using Supabase session
      if (!session || !user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to make a purchase',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }
      
      const currentUrl = window.location.origin;
      const sessionToken = session.access_token;
      const returnUrl = `${currentUrl}/payment-success?session_token=${sessionToken}`;
      const cancelUrl = `${currentUrl}/payment-cancel?session_token=${sessionToken}`;

      console.log('Creating PayPal order...');
      const result = await createOrderMutation.mutateAsync({
        planId,
        amount,
        currency: 'USD',
        returnUrl,
        cancelUrl,
      });

      if (result.approvalUrl) {
        console.log('Redirecting to PayPal:', result.approvalUrl);
        
        // Store payment tracking info (Supabase handles session persistence automatically)
        sessionStorage.setItem('payment_tracking', JSON.stringify({
          orderId: result.orderId || result.id,
          planId,
          planName,
          amount,
          currency: 'USD',
          timestamp: Date.now(),
          userId: user.id
        }));
        
        // Open PayPal in new tab as requested
        const paypalWindow = window.open(result.approvalUrl, '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
        
        // Focus the new window
        if (paypalWindow) {
          paypalWindow.focus();
          
          // Listen for payment success messages from popup
          const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'PAYPAL_PAYMENT_SUCCESS') {
              console.log('Payment success received in main window:', event.data);
              toast({
                title: 'Payment Successful!',
                description: 'Your payment has been processed. Redirecting to your account...',
              });
              
              // Clean up
              window.removeEventListener('message', handleMessage);
              
              // Redirect after a short delay
              setTimeout(() => {
                window.location.href = '/account?payment_success=true';
              }, 1500);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          // Clean up if popup is closed without completing payment
          const checkClosed = setInterval(() => {
            if (paypalWindow.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
              setIsProcessing(false);
            }
          }, 1000);
          
        } else {
          // Fallback if popup was blocked
          toast({
            title: 'Popup Blocked',
            description: 'Please allow popups and try again, or manually open the PayPal link.',
            variant: 'destructive',
          });
        }
        
        // Reset processing state since popup is now handling the flow
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to start payment process',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={isProcessing || createOrderMutation.isPending}
      size="xl" 
      className={`w-full md:w-auto ${className}`}
    >
      {isProcessing || createOrderMutation.isPending ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Buy Now with PayPal
        </>
      )}
    </Button>
  );
};

export default PayPalButton;