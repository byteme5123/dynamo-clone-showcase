import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { usePlans } from '@/hooks/usePlans';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, X, Globe, Zap, Phone, MessageCircle, Wifi } from 'lucide-react';
import simCardImage from '@/assets/dynamo-plan-card.png';

type PlanType = 'domestic' | 'special';

const FigmaPlansSection = () => {
  const { t } = useTranslation();
  const { data: plans, isLoading, error } = usePlans();
  const [activeTab, setActiveTab] = useState<PlanType>('domestic');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Filter plans based on active tab
  const filteredPlans = plans?.filter(plan => {
    if (activeTab === 'domestic') {
      return plan.plan_type === 'prepaid' || plan.plan_type === 'postpaid';
    } else {
      // For special plans, look for international or special keywords in name/features
      return plan.name.toLowerCase().includes('special') || 
             plan.name.toLowerCase().includes('international') ||
             plan.features?.some((f: string) => 
               f.toLowerCase().includes('international') || 
               f.toLowerCase().includes('special')
             );
    }
  }) || [];

  // Get network icons based on plan features
  const getNetworkIcons = (plan: any) => {
    const icons = [];
    if (plan.features?.some((f: string) => f.toLowerCase().includes('5g'))) {
      icons.push(<Zap key="5g" className="w-4 h-4 text-primary" />);
    }
    if (plan.features?.some((f: string) => f.toLowerCase().includes('talk') || f.toLowerCase().includes('call'))) {
      icons.push(<Phone key="phone" className="w-4 h-4 text-secondary" />);
    }
    if (plan.features?.some((f: string) => f.toLowerCase().includes('text') || f.toLowerCase().includes('sms'))) {
      icons.push(<MessageCircle key="text" className="w-4 h-4 text-secondary" />);
    }
    if (plan.features?.some((f: string) => f.toLowerCase().includes('international') || f.toLowerCase().includes('roaming'))) {
      icons.push(<Globe key="international" className="w-4 h-4 text-accent" />);
    }
    if (plan.features?.some((f: string) => f.toLowerCase().includes('hotspot') || f.toLowerCase().includes('wifi'))) {
      icons.push(<Wifi key="wifi" className="w-4 h-4 text-accent" />);
    }
    return icons;
  };

  // Extract data amount from plan name or features
  const getDataAmount = (plan: any) => {
    const nameMatch = plan.name.match(/(\d+)(GB|MB)/i);
    if (nameMatch) return nameMatch[0];
    
    const featureMatch = plan.features?.find((f: string) => f.match(/(\d+)(GB|MB)/i));
    if (featureMatch) {
      const match = featureMatch.match(/(\d+)(GB|MB)/i);
      return match ? match[0] : 'N/A';
    }
    return 'UNLIMITED';
  };

  const handleDropdownToggle = (planId: string) => {
    setOpenDropdown(openDropdown === planId ? null : planId);
  };

  if (isLoading && !plans) {
    return (
      <section className="py-20 md:py-20 lg:py-20" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[34px] font-bold font-poppins text-foreground mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-muted-foreground text-base mb-8">
              Get more data for less with our flexible plans. No contracts, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-lg">
                <Skeleton className="w-full h-48 mb-4 rounded-lg" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-10 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-10 w-full rounded-lg mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-20 lg:py-20" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-[34px] font-bold font-poppins text-foreground mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-base text-destructive">
              Error loading plans. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-20 lg:py-20" style={{ backgroundColor: 'hsl(var(--plans-background))' }}>
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-[34px] font-bold font-poppins text-foreground mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-muted-foreground text-base mb-8">
            Get more data for less with our flexible plans. No contracts, no hidden fees.
          </p>

          {/* Plan Type Toggle */}
          <div className="inline-flex bg-card rounded-lg p-1 shadow-sm mb-8">
            <button
              onClick={() => setActiveTab('domestic')}
              className={`px-6 py-3 rounded-lg font-medium font-poppins transition-all duration-300 ${
                activeTab === 'domestic'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Domestic Plans
            </button>
            <button
              onClick={() => setActiveTab('special')}
              className={`px-6 py-3 rounded-lg font-medium font-poppins transition-all duration-300 ${
                activeTab === 'special'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Special Plans
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredPlans.slice(0, 6).map((plan) => (
            <div
              key={plan.id}
              className="bg-card rounded-2xl shadow-lg hover-lift relative w-full max-w-[280px] mx-auto"
            >
              {/* Plan Image */}
              <div className="relative">
                <img
                  src={plan.image_url || simCardImage}
                  alt={`${plan.name} SIM card package`}
                  loading="lazy"
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
              </div>
              
              {/* Plan Content */}
              <div className="p-6">
                {/* Pricing */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-3xl font-bold font-poppins text-primary">
                      {plan.currency}{plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                </div>

                {/* UNLIMITED Talk & Text Bar */}
                <div className="bg-primary text-primary-foreground text-center py-2 px-4 rounded-lg mb-3">
                  <span className="text-sm font-bold font-poppins">UNLIMITED Talk & Text</span>
                </div>

                {/* Data Amount - Yellow on Red */}
                <div className="bg-primary text-center py-3 px-4 rounded-lg mb-4 relative">
                  <span 
                    className="text-2xl font-bold font-poppins"
                    style={{ color: 'hsl(var(--primary-yellow))' }}
                  >
                    {getDataAmount(plan)}
                  </span>
                </div>

                {/* Network Icons */}
                <div className="flex justify-center gap-3 mb-6">
                  {getNetworkIcons(plan)}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* See Plan Features - Collapsible */}
                  <Collapsible 
                    open={openDropdown === plan.id}
                    onOpenChange={() => handleDropdownToggle(plan.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between font-poppins bg-card border-border text-foreground hover:bg-muted rounded-lg"
                      >
                        See Plan Features
                        {openDropdown === plan.id ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="bg-muted rounded-lg p-4 space-y-2">
                        {plan.features?.slice(0, 6).map((feature: string, index: number) => (
                          <div key={index} className="flex items-start text-sm text-foreground leading-relaxed">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Get the Plan - Modal Trigger */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full font-bold font-poppins bg-card border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200 hover:shadow-md"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        Get the Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-card">
                      <div className="relative">
                        <DialogClose className="absolute right-0 top-0 p-2">
                          <X className="h-4 w-4" />
                        </DialogClose>
                        
                        {selectedPlan && (
                          <div className="pt-8">
                            {/* Plan Image */}
                            <img
                              src={selectedPlan.image_url || simCardImage}
                              alt={`${selectedPlan.name} SIM card package`}
                              className="w-full h-48 object-cover rounded-lg mb-6"
                            />
                            
                            {/* Plan Details */}
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold font-poppins text-foreground mb-2">
                                {selectedPlan.name}
                              </h3>
                              <div className="text-3xl font-bold font-poppins text-primary mb-4">
                                {selectedPlan.currency}{selectedPlan.price}/mo
                              </div>
                              {selectedPlan.description && (
                                <p className="text-muted-foreground mb-6">
                                  {selectedPlan.description}
                                </p>
                              )}
                            </div>

                            {/* Features List */}
                            <div className="mb-8">
                              <h4 className="font-semibold font-poppins text-foreground mb-4">Plan Features:</h4>
                              <div className="space-y-3">
                                {selectedPlan.features?.map((feature: string, index: number) => (
                                  <div key={index} className="flex items-start text-sm text-foreground">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Buy Now Button */}
                            <Button 
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-poppins py-6 text-lg rounded-lg"
                              asChild
                            >
                              {selectedPlan.external_link ? (
                                <a href={selectedPlan.external_link} target="_blank" rel="noopener noreferrer">
                                  Buy Now
                                </a>
                              ) : (
                                <Link to={`/plans/${selectedPlan.slug}`}>
                                  Buy Now
                                </Link>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FigmaPlansSection;