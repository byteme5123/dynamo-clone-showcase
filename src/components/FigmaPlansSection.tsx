
import { useTranslation } from '@/hooks/useTranslation';
import { usePlans } from '@/hooks/usePlans';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import PlanCard from '@/components/PlanCard';
import PlanFilter from '@/components/PlanFilter';
import { filterPlansByType } from '@/utils/planFilters';

type PlanType = 'domestic' | 'special';

const FigmaPlansSection = () => {
  const { t } = useTranslation();
  const { data: plans, isLoading, error } = usePlans();
  const [activeTab, setActiveTab] = useState<PlanType>('domestic');

  console.log('FigmaPlansSection: plans data:', plans);
  console.log('FigmaPlansSection: isLoading:', isLoading);
  console.log('FigmaPlansSection: error:', error);

  // Filter plans based on active tab
  const filteredPlans = filterPlansByType(plans || [], activeTab);
  
  console.log('FigmaPlansSection: filteredPlans:', filteredPlans);
  console.log('FigmaPlansSection: activeTab:', activeTab);
  console.log('FigmaPlansSection: filteredPlans length:', filteredPlans?.length);

  // Show loading state when data is loading OR when we have no filtered plans yet
  if (isLoading || (!plans && !error)) {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
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
    console.error('FigmaPlansSection: Error loading plans:', error);
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
          <PlanFilter activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 md:gap-16 lg:gap-20 max-w-7xl mx-auto">
          {filteredPlans && filteredPlans.length > 0 ? (
            filteredPlans.slice(0, 6).map((plan) => (
              <div key={plan.id} className="flex justify-center mb-8">
                <PlanCard
                  plan={plan}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                {activeTab === 'special' 
                  ? 'No special plans available at the moment.' 
                  : 'No plans available at the moment.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FigmaPlansSection;
