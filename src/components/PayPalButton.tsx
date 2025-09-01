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
      
      // Check if user is authenticated and get session token
      const sessionToken = localStorage.getItem('user_session_token');
      if (!sessionToken) {
        throw new Error('Please log in to make a purchase');
      }
      
      // Refresh session before creating order
      await refreshSession();

      // Create PayPal order with session token in return URL
      const result = await createOrderMutation.mutateAsync({
        planId,
        amount,
        currency: 'USD',
        returnUrl: `${window.location.origin}/payment-success?sessionToken=${sessionToken}`,
        cancelUrl: `${window.location.origin}/payment-cancel?sessionToken=${sessionToken}`,
        sessionToken,
      });

      if (result.approvalUrl) {
        console.log('Opening PayPal in new tab:', result.approvalUrl);
        // Store backup session data before opening PayPal
        const userData = localStorage.getItem('user_data');
        if (userData) {
          sessionStorage.setItem('user_data_backup', userData);
          sessionStorage.setItem('user_session_backup', sessionToken);
          console.log('Session backup stored before PayPal redirect');
        }
        
        // Open PayPal in new tab instead of redirect
        const paypalWindow = window.open(result.approvalUrl, '_blank');
        if (!paypalWindow) {
          // Fallback to redirect if popup is blocked
          console.log('Popup blocked, falling back to redirect');
          window.location.href = result.approvalUrl;
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
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