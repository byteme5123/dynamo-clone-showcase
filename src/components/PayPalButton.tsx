import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useCreatePayPalOrder } from '@/hooks/usePayPal';
import { useUserAuth } from '@/contexts/UserAuthContext';

interface PayPalButtonProps {
  planId: string;
  amount: number;
  planName: string;
  className?: string;
}

const PayPalButton = ({ planId, amount, planName, className }: PayPalButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const createOrderMutation = useCreatePayPalOrder();
  const { refreshSession } = useUserAuth();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Starting PayPal payment flow for plan:', planId);
      
      // Check if user is authenticated
      const sessionToken = localStorage.getItem('user_session_token');
      if (!sessionToken) {
        throw new Error('Please log in to make a purchase');
      }
      
      // Refresh and extend session before payment
      console.log('Refreshing session before payment...');
      await refreshSession();
      
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/payment-success`;
      const cancelUrl = `${currentUrl}/payment-cancel`;

      console.log('Creating PayPal order...');
      const result = await createOrderMutation.mutateAsync({
        planId,
        amount,
        currency: 'USD',
        returnUrl,
        cancelUrl,
      });

      if (result.approvalUrl) {
        console.log('Redirecting to PayPal in same tab:', result.approvalUrl);
        
        // Store comprehensive backup session data and payment info
        const userData = localStorage.getItem('user_data');
        if (userData) {
          sessionStorage.setItem('user_data_backup', userData);
          sessionStorage.setItem('user_session_backup', sessionToken);
          console.log('Session backup stored before PayPal redirect');
        }
        
        // Store payment tracking info
        sessionStorage.setItem('payment_tracking', JSON.stringify({
          orderId: result.orderId || result.id,
          planId,
          planName,
          amount,
          currency: 'USD',
          timestamp: Date.now(),
          sessionToken,
          returnUrl: '/account' // Where to redirect after payment
        }));
        
        // Open PayPal in new tab/window
        const paypalWindow = window.open(result.approvalUrl, 'paypal_checkout', 'width=1024,height=768,scrollbars=yes,resizable=yes');
        
        // Monitor the PayPal window and session
        const checkPayPalWindow = setInterval(() => {
          if (paypalWindow?.closed) {
            clearInterval(checkPayPalWindow);
            setIsProcessing(false);
            console.log('PayPal window closed - user returned to main site');
            
            // Refresh session when user returns
            refreshSession();
            
            // Check if payment was completed by looking for URL params
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Payment error:', error);
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