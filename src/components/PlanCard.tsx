
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

  const toggleFeatures = () => {
    setIsFeatureExpanded(!isFeatureExpanded);
    console.log(`Plan ${plan.id}: Toggling features from ${isFeatureExpanded} to ${!isFeatureExpanded}`);
  };

  return (
    <div className={`bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative w-full h-full flex flex-col ${isFeatureExpanded ? 'z-40' : 'z-10'}`}>
      {/* Plan Image */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={plan.image_url || newPlanImage}
          alt={`${plan.name} SIM card package`}
          loading="eager"
          className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      {/* Plan Name & Price */}
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-xl font-bold font-poppins text-foreground text-center mb-2">
          {plan.name}
        </h3>
      </div>
      
      {/* Plan Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Action Buttons */}
        <div className="space-y-3 mt-auto">
          {/* See Plan Features - Collapsible */}
          <Collapsible 
            open={isFeatureExpanded}
            onOpenChange={setIsFeatureExpanded}
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between font-poppins bg-background border-border text-foreground hover:bg-muted/50 rounded-lg text-base py-3 transition-colors duration-200"
                onClick={toggleFeatures}
              >
                See Plan Features
                {isFeatureExpanded ? 
                  <ChevronUp className="w-4 h-4 transition-transform duration-200" /> : 
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                }
              </Button>
            </CollapsibleTrigger>
            
            {/* Features Content */}
            <CollapsibleContent className="overflow-hidden">
              <div className="mt-3 bg-background border border-border/50 rounded-lg p-4 space-y-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
                {plan.features?.slice(0, 6).map((feature: string, index: number) => (
                  <div key={index} className="flex items-start text-sm text-foreground leading-relaxed">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
                {plan.features && plan.features.length > 6 && (
                  <div className="text-xs text-muted-foreground/70 text-center pt-2 border-t border-border/30">
                    +{plan.features.length - 6} more features
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Get the Plan Button */}
          <Button 
            className="w-full font-bold font-poppins bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 hover:shadow-md py-3 text-base group"
            asChild
          >
            <Link to={`/plans/${plan.slug}`}>
              Get the Plan
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
