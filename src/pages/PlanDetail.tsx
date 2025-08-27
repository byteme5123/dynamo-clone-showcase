
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePlanBySlug } from '@/hooks/usePlans';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ArrowLeft, CreditCard, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBar from '@/components/NotificationBar';
import Navbar from '@/components/Navbar';
import FigmaFooter from '@/components/FigmaFooter';
import PayPalButton from '@/components/payment/PayPalButton';

const PlanDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { data: plan, isLoading, error } = usePlanBySlug(slug || '');

  if (error) {
    return <Navigate to="/plans" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NotificationBar />
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
        <FigmaFooter />
      </div>
    );
  }

  if (!plan) {
    return <Navigate to="/plans" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationBar />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/plans" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="space-y-6">
              {/* Plan Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{plan.name}</h1>
                  {plan.is_featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {plan.currency} {plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              {/* Plan Image */}
              {plan.image_url && (
                <Card>
                  <CardContent className="p-6">
                    <img
                      src={plan.image_url}
                      alt={plan.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Plan Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Plan Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.data_limit && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Data Allowance:</span>
                      <span className="font-medium">{plan.data_limit}</span>
                    </div>
                  )}
                  {plan.call_minutes && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Call Minutes:</span>
                      <span className="font-medium">{plan.call_minutes}</span>
                    </div>
                  )}
                  {plan.sms_limit && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">SMS Messages:</span>
                      <span className="font-medium">{plan.sms_limit}</span>
                    </div>
                  )}
                  {plan.validity_days && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Validity:</span>
                      <span className="font-medium">{plan.validity_days} days</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {plan.plan_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Coverage Areas */}
              {plan.countries && plan.countries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Coverage Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {plan.countries.map((country, index) => (
                        <Badge key={index} variant="secondary">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Purchase Section */}
            <div className="space-y-6">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Plan Features
                  </CardTitle>
                  <CardDescription>
                    Everything included with this plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No specific features listed for this plan.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Purchase This Plan
                  </CardTitle>
                  <CardDescription>
                    Secure payment powered by PayPal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Price Summary */}
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Plan Cost:</span>
                        <span className="font-medium">
                          {plan.currency} {plan.price}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">
                          {plan.currency} {plan.price}
                        </span>
                      </div>
                    </div>

                    {/* PayPal Payment */}
                    <PayPalButton
                      planId={plan.id}
                      amount={Number(plan.price)}
                      currency={plan.currency}
                      description={`${plan.name} - ${plan.description}`}
                    />

                    {/* Security Notice */}
                    <div className="text-xs text-muted-foreground text-center">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Your payment is processed securely by PayPal
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>
                    By purchasing this plan, you agree to our terms of service and privacy policy.
                  </p>
                  <p>
                    Plan activations are typically processed within 24 hours of payment confirmation.
                  </p>
                  <p>
                    Service availability may vary by location. Contact support for coverage questions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <FigmaFooter />
    </div>
  );
};

export default PlanDetail;
