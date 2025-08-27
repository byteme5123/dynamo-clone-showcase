
import React, { useEffect, useState } from 'react';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalButtonProps {
  planId: string;
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  planId,
  amount,
  currency = 'USD',
  description,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { data: paymentSettings } = usePaymentSettings();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!paymentSettings || scriptLoaded) return;

    const script = document.createElement('script');
    const clientId = paymentSettings.environment === 'sandbox' 
      ? paymentSettings.sandbox_client_id 
      : paymentSettings.live_client_id;

    if (!clientId) {
      console.error('PayPal client ID not configured');
      setLoading(false);
      return;
    }

    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&components=buttons,funding-eligibility`;
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
      setLoading(false);
      renderPayPalButton();
    };

    script.onerror = () => {
      console.error('PayPal SDK failed to load');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [paymentSettings, scriptLoaded]);

  const renderPayPalButton = () => {
    if (!window.paypal || !user) return;

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) return;

    // Clear existing buttons
    paypalButtonContainer.innerHTML = '';

    window.paypal.Buttons({
      fundingSource: window.paypal.FUNDING.PAYPAL,
      
      createOrder: async (data: any, actions: any) => {
        try {
          // Create transaction record
          const transaction = await createTransaction.mutateAsync({
            user_id: user.id,
            plan_id: planId,
            amount,
            currency,
            status: 'pending',
            payment_method: 'paypal',
          });

          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toString(),
                currency_code: currency,
              },
              description,
              custom_id: transaction.id,
            }],
            application_context: {
              brand_name: 'Dynamo Wireless',
              landing_page: 'NO_PREFERENCE',
              user_action: 'PAY_NOW',
            },
          });
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          toast({
            title: 'Error',
            description: 'Failed to create payment order.',
            variant: 'destructive',
          });
          throw error;
        }
      },

      onApprove: async (data: any, actions: any) => {
        try {
          const order = await actions.order.capture();
          const transactionId = order.purchase_units[0].custom_id;

          // Update transaction with PayPal details
          await updateTransaction.mutateAsync({
            id: transactionId,
            paypal_order_id: order.id,
            paypal_transaction_id: order.purchase_units[0].payments.captures[0].id,
            status: 'completed',
          });

          toast({
            title: 'Payment Successful!',
            description: 'Your payment has been processed successfully.',
          });

          onSuccess?.(transactionId);
          navigate(`/payment/success?transaction=${transactionId}`);
        } catch (error) {
          console.error('Error capturing PayPal payment:', error);
          toast({
            title: 'Payment Error',
            description: 'There was an error processing your payment.',
            variant: 'destructive',
          });
          onError?.(error);
        }
      },

      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({
          title: 'Payment Error',
          description: 'There was an error with PayPal payment.',
          variant: 'destructive',
        });
        onError?.(err);
      },

      onCancel: (data: any) => {
        toast({
          title: 'Payment Cancelled',
          description: 'Your payment was cancelled.',
        });
      },
    }).render('#paypal-button-container');

    // Render card payment button
    window.paypal.Buttons({
      fundingSource: window.paypal.FUNDING.CARD,
      
      createOrder: async (data: any, actions: any) => {
        try {
          const transaction = await createTransaction.mutateAsync({
            user_id: user.id,
            plan_id: planId,
            amount,
            currency,
            status: 'pending',
            payment_method: 'card',
          });

          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toString(),
                currency_code: currency,
              },
              description,
              custom_id: transaction.id,
            }],
          });
        } catch (error) {
          console.error('Error creating card payment order:', error);
          throw error;
        }
      },

      onApprove: async (data: any, actions: any) => {
        try {
          const order = await actions.order.capture();
          const transactionId = order.purchase_units[0].custom_id;

          await updateTransaction.mutateAsync({
            id: transactionId,
            paypal_order_id: order.id,
            paypal_transaction_id: order.purchase_units[0].payments.captures[0].id,
            status: 'completed',
          });

          toast({
            title: 'Payment Successful!',
            description: 'Your payment has been processed successfully.',
          });

          onSuccess?.(transactionId);
          navigate(`/payment/success?transaction=${transactionId}`);
        } catch (error) {
          console.error('Error capturing card payment:', error);
          onError?.(error);
        }
      },

      onError: onError,
      onCancel: (data: any) => {
        toast({
          title: 'Payment Cancelled',
          description: 'Your payment was cancelled.',
        });
      },
    }).render('#paypal-card-button-container');
  };

  useEffect(() => {
    if (scriptLoaded && user) {
      renderPayPalButton();
    }
  }, [scriptLoaded, user, planId, amount]);

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-4">Please sign in to continue with payment</p>
        <button 
          onClick={() => navigate('/auth/login')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading payment options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-muted-foreground text-sm">
          Pay securely with PayPal or your credit/debit card
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">Pay with PayPal</p>
          <div id="paypal-button-container"></div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Pay with Credit/Debit Card</p>
          <div id="paypal-card-button-container"></div>
        </div>
      </div>
    </div>
  );
};

export default PayPalButton;
