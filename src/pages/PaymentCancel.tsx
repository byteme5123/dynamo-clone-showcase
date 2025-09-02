import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Restore session from backup if available
    const backupToken = sessionStorage.getItem('user_session_backup');
    const backupData = sessionStorage.getItem('user_data_backup');
    
    if (backupToken && backupData) {
      localStorage.setItem('user_session_token', backupToken);
      console.log('Session restored from backup after payment cancellation');
    }

    // Clean up payment tracking data
    sessionStorage.removeItem('payment_tracking');
    sessionStorage.removeItem('user_session_backup');
    sessionStorage.removeItem('user_data_backup');

    // Always redirect to account page in same tab after a short delay
    const timer = setTimeout(() => {
      navigate('/account');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);
  return (
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
                <p className="mt-2 font-medium text-orange-600">Redirecting to your account in 3 seconds...</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/plans">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Plans
                  </Link>
                </Button>
                <Button asChild>
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
  );
};

export default PaymentCancel;