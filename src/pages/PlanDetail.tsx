import { useParams, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import { usePlanBySlug, usePlans } from '@/hooks/usePlans';
import PromoBanner from '@/components/PromoBanner';
import Navbar from '@/components/Navbar';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';

const PlanDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'quarterly'>('monthly');
  
  const { data: plan, isLoading, isError } = usePlanBySlug(slug || '');
  const { data: allPlans } = usePlans();
  
  // Get related plans from the same countries or type
  const relatedPlans = allPlans?.filter(p => 
    p.id !== plan?.id && 
    (p.plan_type === plan?.plan_type || 
     (plan?.countries && p.countries && p.countries.some(c => plan.countries.includes(c))))
  ).slice(0, 4) || [];

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (isError || !plan) {
    return <Navigate to="/plans" replace />;
  }

  const currentPrice = plan.price; // Simplified for now - quarterly pricing can be added later
  const savings = 0; // Simplified for now

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/plans" className="hover:text-foreground">Plans</Link>
          <span>/</span>
          <span className="text-foreground">{plan.name}</span>
        </nav>
      </div>

      {/* Product Overview Section */}
      <section className="py-8 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Product Image */}
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={plan.image_url || '/lovable-uploads/3a841a06-7552-4eaa-98cd-086aa058a533.png'} 
                  alt={plan.name}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
                <div className="absolute top-4 left-4 space-y-2">
                  <Badge variant="default" className="bg-green-600 text-white">
                    4G/5G High Speed
                  </Badge>
                  <Badge variant="secondary">
                    No Annual Contract
                  </Badge>
                </div>
                {plan.plan_type === 'domestic' && (
                  <div className="absolute bottom-4 right-4">
                    <div className="flex space-x-1">
                      <span className="text-xs bg-background px-2 py-1 rounded shadow">🇺🇸</span>
                      <span className="text-xs bg-background px-2 py-1 rounded shadow">🇲🇽</span>
                      <span className="text-xs bg-background px-2 py-1 rounded shadow">🇨🇦</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {plan.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-foreground">
                    {plan.currency}{currentPrice}
                  </div>
                  <span className="text-muted-foreground">/ month</span>
                </div>

                {/* Duration Toggle - Simplified for now */}
              </div>

              {/* Buy Now Button */}
              <Button size="xl" className="w-full md:w-auto" asChild>
                {plan.external_link ? (
                  <a href={plan.external_link} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now
                  </a>
                ) : (
                  <Link to="/activate-sim">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now
                  </Link>
                )}
              </Button>

              {/* Plan Type and Countries */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Type: {plan.plan_type}</div>
                {plan.countries && plan.countries.length > 0 && (
                  <div>Countries: {plan.countries.join(', ')}</div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                *Fees are not included in the listed price
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Description Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="additional">Additional Information</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="max-w-4xl">
                <h3 className="text-2xl font-semibold mb-4">Plan Features</h3>
                <div className="space-y-3">
                  {plan.features?.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="mt-8">
              <div className="max-w-4xl">
                <h3 className="text-2xl font-semibold mb-4">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Network Technology</h4>
                    <p className="text-muted-foreground mb-4">
                      {plan.plan_type === 'domestic' ? '5G/4G LTE' : '4G LTE'} network with nationwide coverage
                    </p>
                    
                    <h4 className="font-semibold mb-2">Data Allowance</h4>
                    <p className="text-muted-foreground mb-4">{plan.data_limit || 'Unlimited'}</p>
                    
                    <h4 className="font-semibold mb-2">Contract Terms</h4>
                    <p className="text-muted-foreground">No annual contract required</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Coverage Area</h4>
                    <p className="text-muted-foreground mb-4">
                      {plan.plan_type === 'domestic' 
                        ? 'United States, Mexico, and Canada' 
                        : `${plan.countries?.join(', ') || 'International'} with calling to US/Canada`
                      }
                    </p>
                    
                    <h4 className="font-semibold mb-2">Device Compatibility</h4>
                    <p className="text-muted-foreground mb-4">
                      Compatible with most unlocked smartphones and devices
                    </p>
                    
                    <h4 className="font-semibold mb-2">Activation</h4>
                    <p className="text-muted-foreground">
                      Instant activation with SIM card installation
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="max-w-4xl">
                <h3 className="text-2xl font-semibold mb-4">Customer Reviews</h3>
                <div className="text-center py-12">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to review this plan and help other customers make their decision.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Write a Review
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Related Products</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPlans.map((relatedPlan) => (
              <Card key={relatedPlan.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-4">
                  <img 
                    src={relatedPlan.image_url || '/lovable-uploads/3a841a06-7552-4eaa-98cd-086aa058a533.png'} 
                    alt={relatedPlan.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <CardTitle className="text-lg">{relatedPlan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {relatedPlan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold">{relatedPlan.currency}{relatedPlan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <Link to={`/plans/${relatedPlan.slug}`}>
                    <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-white">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
      <MobileBottomBar />
    </div>
  );
};

export default PlanDetail;