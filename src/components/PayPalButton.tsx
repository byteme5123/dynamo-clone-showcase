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
    if (isProcessing || createOrderMutation.isPending) return; // Prevent double-click
    
    setIsProcessing(true);
    
    try {
      console.log('Starting PayPal payment flow for plan:', planId);
      
      // Check if user is authenticated
      if (!session || !user) {
        console.log('User not authenticated, redirecting to login');
        toast({
          title: 'Login Required',
          description: 'Please log in to purchase a plan',
          variant: 'destructive',
        });
        
        // Store plan info and redirect to login
        sessionStorage.setItem('redirect_after_login', window.location.pathname);
        sessionStorage.setItem('pending_purchase', JSON.stringify({ planId, planName, amount }));
        
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
        return;
      }
      
      const currentUrl = window.location.origin;
      const sessionToken = session.access_token;
      const returnUrl = `${currentUrl}/payment-success?session_token=${sessionToken}`;
      const cancelUrl = `${currentUrl}/payment-cancel?session_token=${sessionToken}`;

      console.log('Creating PayPal order with amount:', amount);
      
      const result = await createOrderMutation.mutateAsync({
        planId,
        amount,
        currency: 'USD',
        returnUrl,
        cancelUrl,
      });

      if (result.approvalUrl) {
        console.log('PayPal order created successfully, opening payment window');
        
        // Store payment tracking info
        sessionStorage.setItem('payment_tracking', JSON.stringify({
          orderId: result.orderId || result.id,
          planId,
          planName,
          amount,
          currency: 'USD',
          timestamp: Date.now(),
          userId: user.id
        }));
        
        // Open PayPal in a new window/tab
        const paypalWindow = window.open(
          result.approvalUrl, 
          'PayPal Payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        if (paypalWindow) {
          paypalWindow.focus();
          
          toast({
            title: 'Opening PayPal',
            description: 'Complete your payment in the PayPal window',
          });
          
          // Listen for payment completion from popup
          const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'PAYPAL_PAYMENT_SUCCESS') {
              console.log('Payment completed successfully');
              window.removeEventListener('message', handleMessage);
              
              toast({
                title: 'Payment Successful! 🎉',
                description: 'Redirecting to your account...',
              });
              
              setTimeout(() => {
                window.location.href = '/account?payment_success=true';
              }, 1500);
            } else if (event.data.type === 'PAYPAL_PAYMENT_ERROR') {
              console.error('Payment error:', event.data.error);
              window.removeEventListener('message', handleMessage);
              setIsProcessing(false);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          // Monitor popup closure
          const checkClosed = setInterval(() => {
            if (paypalWindow.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              
              // Check if payment was completed
              const tracking = sessionStorage.getItem('payment_tracking');
              if (tracking) {
                console.log('Popup closed, checking payment status...');
                toast({
                  title: 'Payment Window Closed',
                  description: 'If you completed the payment, please check your account.',
                });
              }
            }
          }, 500);
          
          // Reset processing state since popup handles the rest
          setIsProcessing(false);
          
        } else {
          // Popup blocked - fallback to same tab
          console.warn('Popup blocked, redirecting in same tab');
          toast({
            title: 'Opening PayPal',
            description: 'Redirecting to PayPal for payment...',
          });
          
          setTimeout(() => {
            window.location.href = result.approvalUrl;
          }, 1000);
        }
      } else {
        throw new Error('Failed to create PayPal order');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to start payment. Please try again.',
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