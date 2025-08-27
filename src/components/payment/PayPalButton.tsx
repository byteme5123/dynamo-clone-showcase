
import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  planId: string;
  amount: number;
  currency: string;
  description: string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  planId,
  amount,
  currency,
  description,
}) => {
  const [loading, setLoading] = useState(false);
  const { data: paymentSettings } = usePaymentSettings();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!paymentSettings) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading payment options...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Please sign in to purchase plans.</p>
      </div>
    );
  }

  const clientId = paymentSettings.environment === 'sandbox' 
    ? paymentSettings.sandbox_client_id 
    : paymentSettings.live_client_id;

  if (!clientId) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Payment system is not configured. Please contact support.</p>
      </div>
    );
  }

  const initialOptions = {
    clientId,
    currency,
    intent: 'capture' as const,
    components: 'buttons',
    enableFunding: 'card,paylater',
    disableFunding: '',
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      // Create transaction record first
      const transaction = await createTransaction.mutateAsync({
        user_id: user.id,
        plan_id: planId,
        amount,
        currency,
        status: 'pending',
        payment_method: 'paypal',
        paypal_order_id: null,
        paypal_transaction_id: null,
      });

      // For now, return a mock order ID since we don't have backend API endpoints
      // In production, this would call your backend API to create a PayPal order
      const mockOrderId = `ORDER_${Date.now()}`;
      
      // Update transaction with PayPal order ID
      await updateTransaction.mutateAsync({
        id: transaction.id,
        paypal_order_id: mockOrderId,
      });

      return mockOrderId;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to create payment order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data: any) => {
    setLoading(true);
    try {
      // In production, this would capture the payment via your backend
      const mockTransactionId = `TXN_${Date.now()}`;

      toast({
        title: 'Payment Successful!',
        description: 'Your plan has been activated successfully.',
      });

      // Redirect to success page
      window.location.href = `/payment/success?transaction=${mockTransactionId}`;
    } catch (error) {
      console.error('Error capturing payment:', error);
      toast({
        title: 'Payment Error',
        description: 'Payment could not be processed. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onError = async (err: any) => {
    console.error('PayPal error:', err);
    toast({
      title: 'Payment Error',
      description: 'An error occurred during payment. Please try again.',
      variant: 'destructive',
    });
  };

  const onCancel = () => {
    toast({
      title: 'Payment Cancelled',
      description: 'Your payment was cancelled.',
    });
  };

  const createCardOrder = async () => {
    setLoading(true);
    try {
      // Create transaction record for card payment
      const transaction = await createTransaction.mutateAsync({
        user_id: user.id,
        plan_id: planId,
        amount,
        currency,
        status: 'pending',
        payment_method: 'card',
        paypal_order_id: null,
        paypal_transaction_id: null,
      });

      // For now, return a mock order ID
      const mockOrderId = `CARD_ORDER_${Date.now()}`;
      
      // Update transaction with PayPal order ID
      await updateTransaction.mutateAsync({
        id: transaction.id,
        paypal_order_id: mockOrderId,
      });

      return mockOrderId;
    } catch (error) {
      console.error('Error creating card order:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to create payment order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PayPalScriptProvider options={initialOptions}>
        <div className="space-y-3">
          {/* PayPal Payment Button */}
          <div>
            <p className="text-sm font-medium mb-2">Pay with PayPal</p>
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              onCancel={onCancel}
              disabled={loading}
              style={{
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal',
              }}
            />
          </div>

          {/* Card Payment Button */}
          <div>
            <p className="text-sm font-medium mb-2">Pay with Credit/Debit Card</p>
            <PayPalButtons
              createOrder={createCardOrder}
              onApprove={onApprove}
              onError={onError}
              onCancel={onCancel}
              disabled={loading}
              style={{
                layout: 'vertical',
                color: 'black',
                shape: 'rect',
                label: 'pay',
              }}
              fundingSource="card"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Processing payment...</span>
          </div>
        )}
      </PayPalScriptProvider>

      <div className="text-xs text-muted-foreground">
        <p>• PayPal account holders can pay directly with their PayPal balance</p>
        <p>• Credit/Debit card payments are processed securely through PayPal</p>
        <p>• No PayPal account required for card payments</p>
      </div>
    </div>
  );
};

export default PayPalButton;
