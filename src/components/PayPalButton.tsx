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
        console.log('Redirecting to PayPal:', result.approvalUrl);
        // Store backup session data before redirect
        const userData = localStorage.getItem('user_data');
        if (userData) {
          sessionStorage.setItem('user_data_backup', userData);
          sessionStorage.setItem('user_session_backup', sessionToken);
          console.log('Session backup stored before PayPal redirect');
        }
        
        // Redirect to PayPal for payment
        window.location.href = result.approvalUrl;
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