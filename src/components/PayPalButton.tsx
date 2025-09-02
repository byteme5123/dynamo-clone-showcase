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
        console.log('Opening PayPal in new tab:', result.approvalUrl);
        
        // Ensure session is fully extended before payment
        const extendedExpiresAt = new Date();
        extendedExpiresAt.setDate(extendedExpiresAt.getDate() + 60); // 60 days
        
        // Store comprehensive backup session data and payment info
        const userData = localStorage.getItem('user_data');
        if (userData) {
          sessionStorage.setItem('user_data_backup', userData);
          sessionStorage.setItem('user_session_backup', sessionToken);
          sessionStorage.setItem('session_expires_backup', extendedExpiresAt.toISOString());
          console.log('Enhanced session backup stored before PayPal redirect');
        }
        
        // Store payment tracking info with extended data
        sessionStorage.setItem('payment_tracking', JSON.stringify({
          orderId: result.orderId || result.id,
          planId,
          planName,
          amount,
          currency: 'USD',
          timestamp: Date.now(),
          sessionToken
        }));
        
        // Open PayPal in new tab (not popup) - removing window features opens in new tab
        const paypalWindow = window.open(result.approvalUrl, '_blank');
        
        // Set up message listener for payment completion
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== currentUrl) return;
          
          if (event.data?.type === 'PAYMENT_SUCCESS') {
            console.log('Payment completed successfully');
            // Refresh user session and data without full page reload
            refreshSession();
            setIsProcessing(false);
            // Close PayPal tab if still open
            if (paypalWindow && !paypalWindow.closed) {
              paypalWindow.close();
            }
            // Redirect to account page to see updated data
            window.location.href = '/account';
          } else if (event.data?.type === 'PAYMENT_CANCELLED') {
            console.log('Payment was cancelled');
            setIsProcessing(false);
            // Close PayPal tab if still open
            if (paypalWindow && !paypalWindow.closed) {
              paypalWindow.close();
            }
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Cleanup listener if window is closed manually
        if (paypalWindow) {
          const checkClosed = setInterval(() => {
            if (paypalWindow.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
              setIsProcessing(false);
            }
          }, 1000);
        }
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