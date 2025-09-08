import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Payment cancelled by user');
    
    // Clean up payment tracking data
    sessionStorage.removeItem('payment_tracking');

    // Show cancellation message
    toast({
      title: 'Payment Cancelled',
      description: 'Your payment was cancelled. No charges were made.',
      variant: 'default',
    });

    // Redirect to plans page after a short delay
    const timer = setTimeout(() => {
      navigate('/plans');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, toast]);
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-foreground">Payment Cancelled</CardTitle>
                <CardDescription>
                  Your payment has been cancelled. No charges have been made to your account.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  <p>If you experienced any issues during the payment process, please contact our support team for assistance.</p>
                  <p className="mt-2 font-medium text-orange-600">Redirecting to plans in 3 seconds...</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/plans">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Plans
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/contact">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default PaymentCancel;