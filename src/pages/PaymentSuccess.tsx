
import React, { useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ArrowRight, Loader2 } from 'lucide-react';
import NotificationBar from '@/components/NotificationBar';
import Navbar from '@/components/Navbar';
import FigmaFooter from '@/components/FigmaFooter';
import { format } from 'date-fns';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transaction');
  const { user, loading: authLoading } = useAuth();
  const { data: transactions, isLoading } = useUserTransactions(user?.id);

  const transaction = transactions?.find(t => t.id === transactionId);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!transactionId || !transaction) {
    return (
      <div className="min-h-screen bg-background">
        <NotificationBar />
        <Navbar />
        
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">Transaction not found</p>
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <FigmaFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationBar />
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your plan is now active.
          </p>
        </div>

        {/* Transaction Details */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Receipt for your plan purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Information */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Plan Details</h3>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium">{transaction.plan?.name || 'Wireless Plan'}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-lg">
                  ${Number(transaction.amount).toFixed(2)} {transaction.currency}
                </span>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="default">
                    {transaction.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="capitalize">{transaction.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction Date:</span>
                  <span>{format(new Date(transaction.created_at), 'PPP p')}</span>
                </div>
                {transaction.paypal_transaction_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono text-sm">
                      {transaction.paypal_transaction_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{user.first_name} {user.last_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Check Your Email</p>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email with your receipt and plan details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Access Your Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    View your active plans and transaction history in your dashboard.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Activate Your Service</p>
                  <p className="text-sm text-muted-foreground">
                    Follow the activation instructions sent to your email to start using your plan.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link to="/plans">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse More Plans
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Need help? <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
      
      <FigmaFooter />
    </div>
  );
};

export default PaymentSuccess;
