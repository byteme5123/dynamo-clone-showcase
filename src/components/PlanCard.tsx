
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const newPlanImage = '/lovable-uploads/3a841a06-7552-4eaa-98cd-086aa058a533.png';

interface PlanCardProps {
  plan: any;
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isFeatureExpanded, setIsFeatureExpanded] = useState(false);

  console.log(`PlanCard ${plan.id}: isFeatureExpanded = ${isFeatureExpanded}`);

  return (
    <div className="bg-card rounded-2xl shadow-lg hover-lift relative w-full max-w-[280px] mx-auto">
      {/* Plan Image */}
      <div className="relative">
        <img
          src={plan.image_url || newPlanImage}
          alt={`${plan.name} SIM card package`}
          loading="lazy"
          className="w-full h-72 object-cover rounded-t-2xl"
        />
      </div>
      
      {/* Plan Content */}
      <div className="p-6">
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* See Plan Features - Collapsible */}
          <Collapsible 
            open={isFeatureExpanded}
            onOpenChange={setIsFeatureExpanded}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between font-poppins bg-card border-border text-foreground hover:bg-muted rounded-lg"
                onClick={() => {
                  console.log(`Plan ${plan.id}: Toggling features from ${isFeatureExpanded} to ${!isFeatureExpanded}`);
                  setIsFeatureExpanded(!isFeatureExpanded);
                }}
              >
                See Plan Features
                {isFeatureExpanded ? 
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
                      src={selectedPlan.image_url || newPlanImage}
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
  );
};

export default PlanCard;
