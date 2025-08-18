
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const newPlanImage = '/lovable-uploads/3a841a06-7552-4eaa-98cd-086aa058a533.png';

interface PlanCardProps {
  plan: any;
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const [isFeatureExpanded, setIsFeatureExpanded] = useState(false);

  console.log(`PlanCard ${plan.id}: isFeatureExpanded = ${isFeatureExpanded}`);

  return (
    <div className={`bg-card rounded-2xl shadow-lg hover-lift relative w-full max-w-[320px] sm:max-w-[280px] mx-auto transition-all duration-300 ${isFeatureExpanded ? 'z-[100] scale-105' : 'z-10'}`}>
      {/* Plan Image */}
      <div className="relative">
        <img
          src={plan.image_url || newPlanImage}
          alt={`${plan.name} SIM card package`}
          loading="eager"
          className="w-full h-64 sm:h-72 object-cover rounded-t-2xl"
        />
      </div>
      
      {/* Plan Name */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
        <h3 className="text-lg sm:text-xl font-bold font-poppins text-foreground text-center">
          {plan.name}
        </h3>
        <div className="text-xl sm:text-2xl font-bold font-poppins text-primary text-center mt-2">
          {plan.currency}{plan.price}/mo
        </div>
      </div>
      
      {/* Plan Content */}
      <div className="p-4 sm:p-6 pb-4 sm:pb-6">
        {/* Action Buttons */}
        <div className="space-y-3 relative">
          {/* See Plan Features - Collapsible */}
          <Collapsible 
            open={isFeatureExpanded}
            onOpenChange={setIsFeatureExpanded}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between font-poppins bg-card border-border text-foreground hover:bg-muted rounded-lg text-sm sm:text-base"
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
            
            {/* Features Content - Using relative positioning to avoid overlap */}
            <CollapsibleContent className="mt-3">
              <div className="bg-card border border-border rounded-lg p-3 sm:p-4 space-y-2 shadow-lg">
                {plan.features?.slice(0, 6).map((feature: string, index: number) => (
                  <div key={index} className="flex items-start text-xs sm:text-sm text-foreground leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Get the Plan - Navigate to Detail Page */}
          <Button 
            className="w-full font-bold font-poppins bg-card border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200 hover:shadow-md text-sm sm:text-base"
            asChild
          >
            <Link to={`/plans/${plan.slug}`}>
              Get the Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
